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
  pzpServer       = require("./pzp_peerTLSServer"),
  session         = require("./session") ;

var webinos = require('webinos')(__dirname);
var log    = webinos.global.require(webinos.global.util.location, "lib/logging.js")(__filename);
var content = webinos.global.require(webinos.global.util.location, "lib/content.js");
var wrtServer;

if(process.platform == "android") {
  try {
    wrtServer = require("bridge").load("org.webinos.app.wrt.channel.WebinosSocketServerImpl", exports);
  } catch(e) {
    log.error("exception attempting to open wrt server " + e);
  }
}
var PzpWSS = function() {
  "use strict";
  var connectedWebApp = {}; // List of connected apps i.e session with browser
  var sessionWebApp   = 0;
  var wsServer        = "";
  var self            = this;
  var sessionId;
  var pzhId;
  var ports = {};
  var address;
  var csr;
  var messageHandler;

  function prepMsg(from, to, status, message) {
    var msg = {"type" : "prop",
      "from" : from,
      "to"   : to,
      "payload":{"status":status,
        "message":message}};
    self.sendConnectedApp(to, msg);
  }

  function wsServerMsg(message) {
    for (var key in connectedWebApp) {
      if (connectedWebApp.hasOwnProperty(key) && connectedWebApp[key].status === "") {
        prepMsg(sessionId, connectedWebApp[key], "info", message);
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
      log.error(err);
    }
    if(invalidSchemaCheck) {
      // For debug purposes, we only print a message about unrecognized packet,
      // in the final version we should throw an error.
      // Currently there is no a formal list of allowed packages and throw errors
      // would prevent the PZP from working
      log.error("msg schema is not valid " + JSON.stringify(msg));
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
      if( sessionId !== "undefined") {
        messageHandler.onMessageReceived(msg, msg.to);
      }
    }
  }

  function wsClose(connection, reason) {
    if (connectedWebApp[connection.id]) {
      delete connectedWebApp[connection.id];
      log.info("web client disconnected: " + connection.id + " due to " + reason);
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
        sendAuthStatusToApp(parsed.query.cmd, parsed.query.pzhid, parsed.query.authCode, parsed.query.connected);
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
      log.info("listening on port "+ports.pzp_web_webSocket  + " and hostname "+address);
      return callback(true);
    });
  }

  function startHttpServer(callback){
    var self = this;
    var httpserver = http.createServer(function(request, response) {
      log.info("received request for " + request.url);
      response.writeHead(404);
      response.end();
    });

    httpserver.on("error", function(err) {
      if (err.code === "EADDRINUSE") {
        // BUG why make up a port ourselves?
        // Response: not making port, doing it automatically instead of throwing error .., if user wants different ports they can do themselves at startup
        ports.pzp_webSocket = parseInt(ports.pzp_webSocket, 10) +1;
        log.error("address in use, now trying port " + ports.pzp_webSocket);
        httpserver.listen(ports.pzp_webSocket, address);
      } else {
        return callback(fasle, err);
      }
    });

    httpserver.listen(ports.pzp_webSocket, address, function() {
      log.info("listening on port "+ports.pzp_webSocket + " and hostname "+address);
      return callback(true, httpserver);
    });
  }

  function startAndroidWRT() {
    if(wrtServer) {
      wrtServer.listener = function(connection) {
        log.info("connection accepted and adding proxy connection methods.");
        connection.socket = { pause: function(){}, resume: function(){} };
        connection.sendUTF = connection.send;

        connectedApp(connection);

        connection.listener = {
          onMessage: function(ev)   { wsMessage(connection, ev.data); },
          onClose: function()       { wsClose(connection); },
          onError: function(reason) { log.error(reason); }
        };
      };
    }
  }

  function connectedApp(connection) {
    var appId, tmp, payload, connectedPzhIds = [],  connectedPzpIds= [], key;
    self.connectInfo(connectedPzpIds, connectedPzhIds);
    if (connection) {
      appId = sessionId+ "/"+ sessionWebApp;
      sessionWebApp  += 1;
      connectedWebApp[appId] = connection;
      connection.id = appId; // this appId helps in while deleting socket connection has ended

      payload = { "pzhId": pzhId, "connectedPzp": connectedPzpIds, "connectedPzh": connectedPzhIds};
      prepMsg(sessionId, appId, "registeredBrowser", payload);
    } else {
      for (key in connectedWebApp) {
        if (connectedWebApp.hasOwnProperty(key)) {
          tmp = connectedWebApp[key];
          key = sessionId+ "/" + key.split("/")[1];
          connectedWebApp[key] = tmp;
          payload = {"pzhId":pzhId,"connectedPzp": connectedPzpIds,"connectedPzh": connectedPzhIds};
          prepMsg(sessionId, key, "registeredBrowser", payload);
        }
      }
    }
  }

  function autoEnrollment(query) {
    var payload, sendAdd;
    var cmd = query.payload.status;
    var to = query.to;
    var from = query.from;
    var value = query.payload.message;
    if (to && to.split('/')) {
      sendAdd = to.split('/')[0];
    } else {
      sendAdd = to;
    }
    if(cmd === "authStatus") {
      sendAuthStatusToApp(cmd, from, value.authCode, value.connected);
    } else if (cmd === "authenticate") {
      payload = { "type":"prop", "to": to, "from":from,
        "payload": {
          "status"    :cmd,
          "message": {
            "provider"  :value,
            "returnPath": "localhost:"+ ports.pzp_web_webSocket+"/client/client.html"
          }
        }
      }
    } else if (cmd === "login" || cmd === "registerPzh") {
      payload = { "type":"prop", "to": to, "from":from,
        "payload": {
          "status" :cmd
        }
      }
    } else if (cmd === "enrollPzp") {
      payload = { "type":"prop", "to": to, "from":sessionId,
        "payload": {
          "status":cmd,
          "message": {
            "csr"   : csr,
            "authCode": value
          }
        }
      }
    }
    var options = {
      host: sendAdd,
      port: ports.provider_webServer,
      path: '/index.html?cmd=pzpEnroll',
      method: 'POST',
      headers: {
        'Content-Length': JSON.stringify(payload).length
      }
    };

    var req = https.request(options, function(res) {
      res.on('data', function(data) {
        var msg = JSON.parse(data.toString());
        if (msg.payload && msg.payload.status ==="signedCert") {
          self.enrolledPzp(msg.from, msg.to, msg.payload.message.clientCert, msg.payload.message.masterCert, msg.payload.message.masterCrl);
        } else if (msg.payload && msg.payload.status === "authStatus"){
          sendAuthStatusToApp(msg.payload.status, msg.from, msg.payload.message.authCode, msg.payload.message.connected);
        } else if (msg.payload && (msg.payload.status === "login" || msg.payload.status === "authenticate")){
          connectedWebApp[msg.to].sendUTF(JSON.stringify(msg));
        }
      });
    });

    req.on('error', function(err) {
      log.error(err);
    });

    req.write(JSON.stringify(payload));
    req.end();
  }

 function sendAuthStatusToApp(cmd, to, value, status ) {
    var appId,
      msg = { type: "prop",
      from: sessionId,
      payload : {
        "status"     : cmd,
        "connected"  : status ,
        "pzhId"   : to,
        "authCode": value
      }
    };
    setTimeout(function() {
      for (appId in connectedWebApp) {
        msg.to = appId;
        connectedWebApp[appId].sendUTF(JSON.stringify(msg));
      }
    }, 1000);
  }

  this.startWebSocketServer = function(ipzhId, isessionId, iaddress, iports, icsr,imessageHandler, callback) {
    address   = iaddress;
    pzhId     = ipzhId;
    sessionId = isessionId;
    ports     = iports;
    csr       = icsr;
    messageHandler = imessageHandler;

    startWebSocket(function(status, value) {
      if (status) {
        startHttpServer(function(status, value){
          if(status){
            if (wrtServer){
              startAndroidWRT();
            }  else {
              wsServer = new WebSocketServer({
                httpServer: value,
                autoAcceptConnections: true
              });

              wsServer.on("connect", function(connection) {
                log.info("connection accepted.");
                connectedApp(connection);
                connection.on("message", function(message) { wsMessage(connection, message.utf8Data); });
                connection.on("close", function(reason, description) { wsClose(connection, description) });
              });
            }
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
      var buf = session.common.jsonStr2Buffer(jsonString);
      log.info('send to '+ address + ' message ' + jsonString );
      connectedWebApp[address].socket.pause();
      connectedWebApp[address].sendUTF(jsonString);
      connectedWebApp[address].socket.resume();
    } else {
      log.error("unknown destination " + address );
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
