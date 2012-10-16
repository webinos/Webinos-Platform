/*******************************************************************************
*  Code contributed to the webinos project
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
* Copyright 2011 Habib Virji, Samsung Electronics (UK) Ltd
*******************************************************************************/

var http = require("http"),
  url    = require("url"),
  path   = require("path"),
  util   = require("util"),
  fs     = require("fs"),
  https  = require('https'),
  WebSocketServer = require("websocket").server,
  session         = require("./session") ;

var webinos = require("find-dependencies")(__dirname);
var logger  = webinos.global.require(webinos.global.util.location, "lib/logging.js")(__filename) || console;
var content = webinos.global.require(webinos.global.util.location, "lib/content.js");

var wrtServer;

if(process.platform == "android") {
  try {
    wrtServer = require("bridge").load("org.webinos.app.wrt.channel.WebinosSocketServerImpl", exports);
  } catch(e) {
    logger.error("exception attempting to open wrt server " + e);
  }
}
var PzpWSS = function() {
  "use strict";
  var connectedWebApp = {}; // List of connected apps i.e session with browser
  var sessionWebApp   = 0;
  var wsServer        = "";
  var sessionId;
  var pzhId;
  var ports = {};
  var address;
  var csr;
  var self            = this;

  function prepMsg(from, to, status, message) {
    return {"type" : "prop",
      "from" : from,
      "to"   : to,
      "payload":{"status":status,
        "message":message}};
  }
  function wsServerMsg(message) {
    for (var key in connectedWebApp) {
      if (connectedWebApp.hasOwnProperty(key) && connectedWebApp[key].status === "") {
        prepMsg(sessionId, connectedWebApp[key], "info", message);
        self.sendConnectedApp(to, msg);
      }
    }
  }
  function wsMessage(connection, utf8Data) {
    //schema validation
    var msg = JSON.parse(utf8Data);
    var invalidSchemaCheck = true;
    try {
      invalidSchemaCheck = session.schema.checkSchema(msg);
    } catch (err) {
      logger.error(err);
    }
    if(invalidSchemaCheck) {
      // For debug purposes, we only print a message about unrecognized packet,
      // in the final version we should throw an error.
      // Currently there is no a formal list of allowed packages and throw errors
      // would prevent the PZP from working
      logger.error("msg schema is not valid " + JSON.stringify(msg));
    }
    else {
      // schema check is false, so validation is ok
      //log("DEBUG",  "[PZP WSServer]: msg schema is valid " + JSON.stringify(msg));
    }
    // Each message is forwarded back to Message Handler to forward rpc message
    if(msg.type === "prop" ) {
      if(msg.payload.status === "registerBrowser") {
        connectedApp(connection);
      } else {
        autoEnrollment(msg);
      }
    } else {
      self.messageHandler.onMessageReceived(msg, msg.to);
    }
  }
  function wsClose(connection, reason) {
    if (connectedWebApp[connection.id]) {
      delete connectedWebApp[connection.id];
      logger.log("web client disconnected: " + connection.id + " due to " + reason);
    }
  }
  function handleRequest(uri, req, res) {
    var filename = path.join(__dirname, "../../test/", uri);

    fs.stat(filename, function(err, stats) {
      if(err) {
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.write("404 Not Found\n");
        res.end();
        return;
      }
      if (stats.isDirectory()) {
        filename = path.join(filename, "/client/client.html");
      }
      fs.readFile(filename, "binary", function(err, file) {
        if(err) {
          res.writeHead(500, {"Content-Type": "text/plain"});
          res.write(err + "\n");
          res.end();
          return;
        }
        res.writeHead(200, content.getContentType(filename));
        res.write(file, "binary");
        res.end();
      });
    });
  }
  function startWebSocket(callback){
    var self = this;
    var cs = http.createServer(function(request, response) {
      var parsed = url.parse(request.url, true);
      if (parsed.query && parsed.query.cmd === "authStatus") {
        setTimeout(function(){
          sendAuthStatusToApp(parsed.query.pzhid, parsed.query.authCode, parsed.query.connected);
        }, 3000);
      }
      handleRequest(parsed.pathname, request, response);
    });

    cs.on("error", function(err) {
      if (err.code === "EADDRINUSE") {
        ports.pzp_web_webSocket = parseInt(ports.pzp_web_webSocket , 10) + 1;
        cs.listen(ports.pzp_web_webSocket , address);
      } else {
        return callback(false, err);
      }

    });

    cs.listen(ports.pzp_web_webSocket, address, function(){
      logger.log("webSocket server listening on port "+ports.pzp_web_webSocket  + " and hostname "+address);
      return callback(true);
    });
  }
  function startHttpServer(callback){
    var self = this;
    var httpserver = http.createServer(function(request, response) {
      logger.log("received request for " + request.url);
      response.writeHead(404);
      response.end();
    });

    httpserver.on("error", function(err) {
      if (err.code === "EADDRINUSE") {
        ports.pzp_webSocket = parseInt(ports.pzp_webSocket, 10) +1;
        logger.error("address in use, now trying port " + ports.pzp_webSocket);
        httpserver.listen(ports.pzp_webSocket, address);
      } else {
        return callback(false, err);
      }
    });

	httpserver.on("listening",function() {
      logger.log("httpServer listening at port " + ports.pzp_webSocket + " and hostname " + address);
      return callback(true, httpserver);
	});
	
    httpserver.listen(ports.pzp_webSocket, address);
  }
  function startAndroidWRT() {
    if(wrtServer) {
      wrtServer.listener = function(connection) {
        logger.log("connection accepted and adding proxy connection methods.");
        connection.socket = { pause: function(){}, resume: function(){} };
        connection.sendUTF = connection.send;

        connectedApp(connection);

        connection.listener = {
          onMessage: function(ev)   { wsMessage(connection, ev.data); },
          onClose: function()       { wsClose(connection); },
          onError: function(reason) { logger.error(reason); }
        };
      };
    }
  }
  function connectedApp(connection) {
    var appId, tmp, payload, connectedPzhIds = [],  connectedPzpIds= [], key, msg;
    connectedPzpIds = self.getConnectedPzp();
    connectedPzhIds = self.getConnectedPzh();
    if (connection) {
      appId = sessionId+ "/"+ sessionWebApp;
      sessionWebApp  += 1;
      connectedWebApp[appId] = connection;
      connection.id = appId; // this appId helps in while deleting socket connection has ended

      payload = { "pzhId": pzhId, "connectedPzp": connectedPzpIds, "connectedPzh": connectedPzhIds};
      msg = prepMsg(sessionId, appId, "registeredBrowser", payload);
      self.sendConnectedApp(appId, msg);
    } else {
      for (key in connectedWebApp) {
        if (connectedWebApp.hasOwnProperty(key)) {
          tmp = connectedWebApp[key];
          if (key.split("/").length > 2)
            break;
          key = sessionId+ "/" + key.split("/")[1];
          tmp.id = key;
          connectedWebApp[key] = tmp;
          payload = {"pzhId":sessionId.split("/")[0],"connectedPzp": connectedPzpIds,"connectedPzh": connectedPzhIds};
          msg = prepMsg(sessionId, key, "registeredBrowser", payload);
          self.sendConnectedApp(key, msg);
        }
      }
    }
  }
  function handleData(data){
    var msg = JSON.parse(data);
    if (msg.payload && msg.payload.status ==="signedCert") {
      self.enrolledPzp(msg.from, msg.to, msg.payload.message.clientCert, msg.payload.message.masterCert, msg.payload.message.masterCrl);
    } else if (msg.payload && msg.payload.status === "authStatus"){
      sendAuthStatusToApp(msg.from, msg.payload.message.authCode, msg.payload.message.connected);
    } else if (msg.payload && (msg.payload.status === "login" || msg.payload.status === "authenticate") && connectedWebApp[msg.to]){
      connectedWebApp[msg.to].sendUTF(JSON.stringify(msg));
    }
  }
  function autoEnrollment(query) {
    var msg, sendAdd;
    var cmd = query.payload.status;
    var to = query.to;
    var from = query.from;
    var value = query.payload.message;

    if (to && to.split('_')) {
      sendAdd = to.split('_')[0];
    } else {
      sendAdd = to;
    }

    if(cmd === "authStatus") {
      sendAuthStatusToApp(from, value.authCode, value.connected);
    } else if (cmd === "authenticate") {
      msg = prepMsg(from, to, "authenticate", {"provider": value, "returnPath": "localhost:"+ ports.pzp_web_webSocket+"/client/client.html"});
    } else if (cmd === "login" || cmd === "registerPzh") {
      msg = prepMsg(from, to, cmd );
    } else if (cmd === "enrollPzp") {
      msg = prepMsg(sessionId, to, "enrollPzp", {"csr": csr, "authCode": value});
    }

    var options = {
      host: sendAdd,
      port: ports.provider_webServer,
      path: '/index.html?cmd=pzpEnroll',
      method: 'POST',
      headers: {
        'Content-Length': JSON.stringify(msg).length
      }
    };

    var req = https.request(options, function(res) {
      res.on('data', function(data) {
        handleData(data);
      });
    });

    req.on('error', function(err) {
      logger.error(err);
    });

    req.write(JSON.stringify(msg));
    req.end();
  }

 function sendAuthStatusToApp(to, value, status ) {
    var appId, msg = prepMsg(sessionId, "", "authStatus", {connected: status, pzhId: to, authCode: decodeURIComponent(value)});
    for (appId in connectedWebApp) {
      if (connectedWebApp.hasOwnProperty(appId)){
        msg.to = appId;
        connectedWebApp[appId].sendUTF(JSON.stringify(msg));
      }
    }
  }
  this.startWebSocketServer = function(_pzhId, _sessionId, _address, _ports, _csr, callback) {
    address   = _address;
    pzhId     = _pzhId;
    sessionId = _sessionId;
    ports     = _ports;
    csr       = _csr;

    startWebSocket(function(status, value) {
      if (status) {
        startHttpServer(function(status, value){
          if(status){
            if (wrtServer){
              startAndroidWRT();
            }
            wsServer = new WebSocketServer({
              httpServer: value,
              autoAcceptConnections: true
            });

            wsServer.on("connect", function(connection) {
              logger.log("connection accepted.");
              connectedApp(connection);
              connection.on("message", function(message) { wsMessage(connection, message.utf8Data); });
              connection.on("close", function(reason, description) { wsClose(connection, description) });
            });

            return callback(true);
          } else {
            return callback(false, err);
          }
        });
      } else {
        return callback(false, err);
      }
    });
  };

  this.sendConnectedApp= function(address, message) {
    if (connectedWebApp.hasOwnProperty(address)){
      var jsonString = JSON.stringify(message);
      logger.log('send to '+ address + ' message ' + jsonString );
      connectedWebApp[address].socket.pause();
      connectedWebApp[address].sendUTF(jsonString);
      connectedWebApp[address].socket.resume();
    } else {
      logger.error("unknown destination " + address );
    }
  };
  this.updateApp = function(inputSessionId) {
    if (inputSessionId) {
      sessionId = inputSessionId;
    }
    connectedApp();
  }
};

module.exports = PzpWSS;
