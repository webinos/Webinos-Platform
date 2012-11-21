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
  url = require("url"),
  path = require("path"),
  util = require("util"),
  fs = require("fs"),
  child_process= require("child_process").exec,
  os = require("os"),
  https = require('https'),
  WebSocketServer = require("websocket").server,
  session = require("./session");

var webinos = require("find-dependencies")(__dirname);
var logger = webinos.global.require(webinos.global.util.location, "lib/logging.js")(__filename) || console;
var content = webinos.global.require(webinos.global.util.location, "lib/content.js");

var wrtServer;

if (process.platform == "android") {
  try {
    wrtServer = require("bridge").load("org.webinos.app.wrt.channel.WebinosSocketServerImpl", exports);
  } catch (e) {
    logger.error("exception attempting to open wrt server " + e);
  }
}
var PzpWSS = function(_parent) {
  "use strict";
  var connectedWebApp = {}; // List of connected apps i.e session with browser
  var sessionWebApp   = 0;
  var wsServer        = "";
  var self            = this;
  var parent          = _parent;


  function prepMsg(from, to, status, message) {
    "use strict";
    return {
      "type": "prop",
        "from": from,
        "to": to,
        "payload": {
        "status": status,
          "message": message
      }
    };
  }

  function getConnectedPzp() {
    "use strict";
    return Object.keys(parent.pzp_state.connectedPzp);
  }

  function getConnectedPzh(){
    return Object.keys(parent.pzp_state.connectedPzh);
  }

  function getVersion(callback) {
    "use strict";
    var version;
    if (os.platform().toLowerCase() !== "android") {
      child_process("git describe", function(error, stderr, stdout){
        if(!error){
          callback(stderr);
        } else {
          callback("v0.7"); // Change this or find another way of reading git describe for android
        }
      })
    } else {
      callback("v0.7");
    }

  }

  function getWebinosLog (type, callback) {
    "use strict";
    logger.fetchLog(type, "Pzp", parent.config.metaData.friendlyName, function(data) {
      callback(data);
    });
  }

  function wsServerMsg(message) {
    for (var key in connectedWebApp) {
      if (connectedWebApp.hasOwnProperty(key) && connectedWebApp[key].status === "") {
        var msg = prepMsg(parent.pzp_state.sessionId, connectedWebApp[key], "info", message);
        self.sendConnectedApp(to, msg);
      }
    }
  }

  function wsMessage(connection, origin, utf8Data) {
    //schema validation
    var msg = JSON.parse(utf8Data);
    var invalidSchemaCheck = true;
    try {
      invalidSchemaCheck = session.schema.checkSchema(msg);
    } catch (err) {
      logger.error(err);
    }
    if (invalidSchemaCheck) {
      // For debug purposes, we only print a message about unrecognized packet,
      // in the final version we should throw an error.
      // Currently there is no a formal list of allowed packages and throw errors
      // would prevent the PZP from working
      logger.error("msg schema is not valid " + JSON.stringify(msg));
    } else {
      // schema check is false, so validation is ok
      //log("DEBUG",  "[PZP WSServer]: msg schema is valid " + JSON.stringify(msg));
    }
    // Each message is forwarded back to Message Handler to forward rpc message
    if (msg.type === "prop") {
      if (msg.payload.status === "registerBrowser") {
        connectedApp(connection);
      }
      else if (msg.payload.status === "setFriendlyName") {
        parent.changeFriendlyName(msg.payload.value);
      }
      else if (msg.payload.status === "getFriendlyName") {
        var msg1 = prepMsg(parent.pzp_state.sessionId, msg.from, "friendlyName", parent.config.metaData.friendlyName);
        self.sendConnectedApp(msg.from, msg1);
      }
      else if (msg.payload.status === "infoLog") {
        getWebinosLog("info", function(value) {
          msg1 = prepMsg(parent.pzp_state.sessionId, msg.from, "infoLog", value);
          self.sendConnectedApp(msg.from, msg1);
        });
      }
      else if (msg.payload.status === "errorLog") {
        getWebinosLog("error", function(value) {
          msg1 = prepMsg(parent.pzp_state.sessionId, msg.from, "errorLog", value);
          self.sendConnectedApp(msg.from, msg1);
        });
      }
      else if (msg.payload.status === "webinosVersion") {
        getVersion(function(value){
          var msg2 = prepMsg(parent.pzp_state.sessionId, msg.from, "webinosVersion", value);
          self.sendConnectedApp(msg.from, msg2);
        });
      }
      else {
        autoEnrollment(msg, origin, function(status){
          if(!status){
            var msg2 = prepMsg(parent.pzp_state.sessionId, msg.from, "error", "failed connecting to pzh provider");
            self.sendConnectedApp(msg.from, msg2);
          }
        });
      }
    }
    else {
      parent.webinos_manager.messageHandler.onMessageReceived(msg, msg.to);
    }
  }

  function wsClose(connection, reason) {
    if (connectedWebApp[connection.id]) {
      delete connectedWebApp[connection.id];
      logger.log("web client disconnected: " + connection.id + " due to " + reason);
    }
  }

  function handleRequest(uri, req, res) {
      /**
       * Expose the current communication channel websocket port using this virtual file.
       * This code must have the same result with the widgetServer.js used by wrt
       * webinos\common\manager\widget_manager\lib\ui\widgetServer.js
       */
      if (uri == "/webinosConfig.json"){
          var jsonReply = {
              websocketPort : parent.config.userPref.ports.pzp_webSocket
          };
          res.writeHead(200, {"Content-Type": "application/json"});
          res.write(JSON.stringify(jsonReply));
          res.end();
          return;
      }

    var documentRoot = path.join(__dirname, "../../../web_root/");
    var filename = path.join(documentRoot, uri);

    content.sendFile(res, documentRoot, filename, "testbed/client.html");

  }

  function startHttpServer(callback) {
    var self = this;
    var httpserver = http.createServer(function (request, response) {
      var parsed = url.parse(request.url, true);
      if (parsed.query && parsed.query.cmd === "authStatus") {
        setTimeout(function () {
          sendAuthStatusToApp(parsed.query.pzhid, parsed.query.authCode, parsed.query.connected);
        }, 3000);
      }
      handleRequest(parsed.pathname, request, response);
    });

    httpserver.on("error", function(err) {
      if (err.code === "EADDRINUSE") {
        parent.config.userPref.ports.pzp_webSocket = parseInt(parent.config.userPref.ports.pzp_webSocket, 10) +1;
        logger.error("address in use, now trying port " + parent.config.userPref.ports.pzp_webSocket);
        httpserver.listen(parent.config.userPref.ports.pzp_webSocket, "localhost");
      } else {
        return callback(false, err);
      }
    });

    httpserver.on("listening",function() {
      logger.log("httpServer listening at port " + parent.config.userPref.ports.pzp_webSocket+ " and hostname localhost");
      return callback(true, httpserver);
   });
   httpserver.listen(parent.config.userPref.ports.pzp_webSocket, "localhost");
  }

  function startAndroidWRT() {
    if (wrtServer) {
      wrtServer.listener = function (connection) {
        logger.log("connection accepted and adding proxy connection methods.");
        connection.socket = {
          pause: function () {},
          resume: function () {}
        };
        connection.sendUTF = connection.send;

        connectedApp(connection);

        connection.listener = {
          onMessage: function (ev) {
            wsMessage(connection, "android", ev.data);
          },
          onClose: function () {
            wsClose(connection);
          },
          onError: function (reason) {
            logger.error(reason);
          }
        };
      };
    }
  }

  function connectedApp(connection) {
    var appId, tmp, payload, key, msg, msg2;
    if (connection) {
      appId = parent.pzp_state.sessionId+ "/"+ sessionWebApp;
      sessionWebApp  += 1;
      connectedWebApp[appId] = connection;
      connection.id = appId; // this appId helps in while deleting socket connection has ended

      payload = { "pzhId": parent.config.metaData.pzhId, "connectedPzp": getConnectedPzp(), "connectedPzh": getConnectedPzh()};
      msg = prepMsg(parent.pzp_state.sessionId, appId, "registeredBrowser", payload);
      self.sendConnectedApp(appId, msg);

      if(Object.keys(connectedWebApp).length == 1 ) {
        getVersion(function(value){
          msg2 = prepMsg(parent.pzp_state.sessionId, appId, "webinosVersion", value);
          self.sendConnectedApp(appId, msg2);
        });
      }

      self.sendConnectedApp(appId, msg);
    } else {
      for (key in connectedWebApp) {
        if (connectedWebApp.hasOwnProperty(key)) {
          tmp = connectedWebApp[key];
          /*if (key.split("/") && key.split("/").length > 2)
            break;
          key = parent.pzp_state.sessionId+ "/" + key.split("/")[1];
          tmp.id = key;
          connectedWebApp[key] = tmp;*/
          payload = {"pzhId": parent.config.metaData.pzhId, "connectedPzp":  getConnectedPzp(),"connectedPzh":  getConnectedPzh()};
          msg = prepMsg(parent.pzp_state.sessionId, key, "update", payload);
          self.sendConnectedApp(key, msg);
        }
      }
    }
  }

  function handleData(data){
    var msg = JSON.parse(data);
    if (msg.payload && msg.payload.status ==="signedCert") {
      parent.enrollPzp.register(msg.from, msg.payload.message.clientCert, msg.payload.message.masterCert, msg.payload.message.masterCrl);
    } else if (msg.payload && msg.payload.status === "authStatus"){
      sendAuthStatusToApp(msg.from, msg.payload.message.authCode, msg.payload.message.connected);
    } else if (msg.payload && (msg.payload.status === "login" || msg.payload.status === "authenticate") && connectedWebApp[msg.to]) {
      connectedWebApp[msg.to].sendUTF(JSON.stringify(msg));
    }
  }


  function autoEnrollment(query, origin, callback) {
    var msg, sendAdd;
    var cmd = query.payload.status;
    var to = query.to;
    var from = query.from;
    var value = query.payload.message;

    var originUrl = url.parse(origin);
    if (originUrl.hostname !== "localhost" && originUrl.hostname !== "127.0.0.1") {
      logger.error("Autoenrolment request from non-local origin: " + originUrl.hostname);
      return;
    }

    if (to && to.split('_')) {
      sendAdd = to.split('_')[0];
    } else {
      sendAdd = to;
    }

    if (cmd === "authStatus") {
      sendAuthStatusToApp(from, value.authCode, value.connected);
    } else if (cmd === "authenticate") {
      msg = prepMsg(from, to, "authenticate", {"provider": value, "returnPath": "localhost:"+ parent.config.userPref.ports.pzp_webSocket+"/testbed/client.html"});
    } else if (cmd === "login" || cmd === "registerPzh") {
      msg = prepMsg(from, to, cmd);
    } else if (cmd === "enrollPzp") {
      msg = prepMsg(parent.pzp_state.sessionId, to, "enrollPzp", {"csr": parent.config.cert.internal.conn.csr, "authCode": value});
    }
    if(msg) {
      var options = {
        host: sendAdd,
        port: parent.config.userPref.ports.provider_webServer,
        path: '/index.html?cmd=pzpEnroll',
        method: 'POST',
        headers: {
          'Content-Length': JSON.stringify(msg).length
        }
      };

      var req = https.request(options, function (res) {
        res.on('data', function (data) {
          handleData(data);
        });
      });

      req.on('connect', function(){
        callback(true);
      });

      req.on('error', function (err) {
        callback(false);
        logger.error(err);
      });

      req.write(JSON.stringify(msg));
      req.end();
    }
  }

 function sendAuthStatusToApp(to, value, status ) {
    var appId, msg = prepMsg(parent.pzp_state.sessionId, "", "authStatus", {connected: status, pzhId: to, authCode: decodeURIComponent(value)});
    for (appId in connectedWebApp) {
      if (connectedWebApp.hasOwnProperty(appId)) {
        msg.to = appId;
        connectedWebApp[appId].sendUTF(JSON.stringify(msg));
      }
    }
  }

  function approveRequest(request) {
    var requestor = request.host.split(":")[0]; // don't care about port.
    return (requestor === "localhost" || requestor === "127.0.0.1");
  }

  this.startWebSocketServer = function(_callback) {
    startHttpServer(function(status, value){
      if(status){
        if (wrtServer){
          startAndroidWRT();
        }
        wsServer = new WebSocketServer({
          httpServer: value,
          autoAcceptConnections: false
        });
        logger.addId(parent.config.metaData.webinosName);
        wsServer.on("request", function(request) {
          logger.log("Request for a websocket, origin: " + request.origin + ", host: " + request.host);
          if (approveRequest(request)) {
            var connection = request.accept();
            logger.log("Request accepted");
            connectedApp(connection);
            connection.on("message", function(message) { wsMessage(connection, request.origin, message.utf8Data); });
            connection.on("close", function(reason, description) { wsClose(connection, description) });
          } else {
            logger.error("Failed to accept websocket connection: " + "wrong host or origin");
          }
        });

        return _callback(true);
      } else {
        return _callback(false, err);
      }
    });
  };

  this.sendConnectedApp= function(address, message){
    if (address && message){
      if (connectedWebApp.hasOwnProperty(address)){
        var jsonString = JSON.stringify(message);
        logger.log('send to '+ address + ' message ' + jsonString );
        connectedWebApp[address].socket.pause();
        connectedWebApp[address].sendUTF(jsonString);
        connectedWebApp[address].socket.resume();
      } else {
        logger.error("unknown destination " + address );
      }
    } else {
        logger.error("message or address is missing");
    }
  };
  this.updateApp = function() {
    connectedApp();
  };
  this.pzhDisconnected = function(){
    var key;
    for (key in connectedWebApp) {
      if (connectedWebApp.hasOwnProperty(key)) {
        var msg = prepMsg(parent.pzp_state.sessionId, key, "pzhDisconnected", "pzh disconnected");
        self.sendConnectedApp(key, msg);
      }
    }
  }
};

module.exports = PzpWSS;
