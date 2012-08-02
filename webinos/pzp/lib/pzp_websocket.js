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

/**
 * Handles websocket connection with browser. This ends is connection with PZP.
 */

var http = require("http"),
  url = require("url"),
  path = require("path"),
  fs = require("fs"),
  WebSocketServer = require("websocket").server;

var webinos        = require("webinos")(__dirname);
var session        = require("./session");
var log            = new session.common.debug("pzp_websocket");
var rpc            = webinos.global.require(webinos.global.rpc.location, "lib/rpc");
var global         = session.configuration

var wrtServer;
var id;

if(process.platform == "android") {
  try {
    wrtServer = require("bridge").load("org.webinos.app.wrt.channel.WebinosSocketServerImpl", exports);
  } catch(e) {
    log.error("exception attempting to open wrt server " + e);
  }
}

exports.startPzpWebSocketServer = function(pzp, config, callback) {
  function getContentType(uri) {
    var contentType = "text/plain";
    switch (uri.substr(uri.lastIndexOf("."))) {
      case ".js":
        contentType = "application/x-javascript";
        break;
      case ".html":
        contentType = "text/html";
        break;
      case ".css":
        contentType = "text/css";
        break;
      case ".jpg":
        contentType = "image/jpeg";
        break;
      case ".png":
        contentType = "image/png";
        break;
      case ".gif":
        contentType = "image/gif";
        break;
    }
    return {"Content-Type": contentType};
  }

  var cs = http.createServer(function(request, response) {
    var parsed = url.parse(request.url, true);
    if (parsed.query) {
      switch(parsed.query.cmd){
      // PZP Auto-Enrollment
      // PZH Existing - Third Message
      // PZH New      - Third/Fifth Message
        case "auth-status":
          var msg = { type: "prop", from: pzp.sessionId, to: "",
            payload : {
              "status": "auth-status",
              "message": parsed.query.status,
              "pzhid" : parsed.query.pzhid,
              "authCode": parsed.query.auth_code
            }
          };
          setTimeout(function() {
            for (var appId in pzp.connectedWebApp) {
              msg.to = appId;
              pzp.connectedWebApp[appId].sendUTF(JSON.stringify(msg));
            }
          }, 3000);
        break;
      }
    }

      var uri = parsed.pathname;
      var filename = path.join(__dirname, "../../test/", uri);

      fs.stat(filename, function(err, stats) {
        if(err) {
          response.writeHead(404, {"Content-Type": "text/plain"});
          response.write("404 Not Found\n");
          response.end();
          return;
        }
        if (stats.isDirectory()) {
          filename = path.join(filename, "/client/client.html");
        }
        fs.readFile(filename, "binary", function(err, file) {
          if(err) {
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(err + "\n");
            response.end();
            return;
          }
          response.writeHead(200, getContentType(filename));
          response.write(file, "binary");
          response.end();
        });
      });

  });

  cs.on("error", function(err) {
    if (err.code === "EADDRINUSE") {
      session.configuration.pzpWebServerPort = parseInt(session.configuration.pzpWebServerPort, 10) + 1;
      cs.listen(session.configuration.pzpWebServerPort, pzp.address);
    }
  });

  cs.listen(session.configuration.pzpWebServerPort, pzp.address, function(){
    log.info("listening on port "+session.configuration.pzpWebServerPort + " and hostname "+pzp.address);
  });

  var httpserver = http.createServer(function(request, response) {
    log.info("received request for " + request.url);
    response.writeHead(404);
    response.end();
  });

  httpserver.on("error", function(err) {
    if (err.code === "EADDRINUSE") {
      // BUG why make up a port ourselves?
      // Response: not making port, doing it automatically instead of throwing error .., if user wants different ports they can do themselves at startup
      session.configuration.pzpHttpServerPort = parseInt(session.configuration.pzpHttpServerPort, 10) +1;
      log.error("address in use, now trying port " + session.configuration.pzpHttpServerPort);
      httpserver.listen(session.configuration.pzpHttpServerPort, pzp.address);
    }
  });

  httpserver.listen(session.configuration.pzpHttpServerPort, pzp.address, function() {
    log.info("listening on port "+session.configuration.pzpHttpServerPort + " and hostname "+pzp.address);
    callback("startedWebSocketServer");
  });

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
      if(msg.payload.status === "disconnectPzp") {
        if( typeof pzp !== "undefined" && typeof pzp.sessionId !== "undefined") {
          if(pzp.connectedPzp.hasOwnProperty(pzp.sessionId)) {
            pzp.connectedPzp[pzp.sessionId].socket.end();
            pzp.wsServerMsg("Pzp "+pzp.sessionId+" closed");
          }
        }
      }
      else if(msg.payload.status === "registerBrowser") {
        pzp.connectedApp(connection);
      }
      /***** PZP auto-enrollment message exchanges*****/
      // PZH Existing - First Message
      // PZH New      - First Message
      else if (msg.payload.status==="login"){
        connectPzh(pzp, msg.payload.status, msg.from, msg.payload.to);
      }
      // PZH Existing - Second Message
      // PZH New      - Second Message
      else if (msg.payload.status==="authenticate-google"){
        connectPzh(pzp, msg.payload.status, msg.from, msg.payload.to);
      }
      else if (msg.payload.status==="authenticate-yahoo") {
        connectPzh(pzp, msg.payload.status, msg.from, msg.payload.to);
      }
      // PZH Existing - Fourth Message
      // PZH New      - Sixth Message
      else if (msg.payload.status==="enrollPzp") {
        // This message is sent to pzh websocket over temp websocket connection
        connectPzh(pzp, msg.payload.status, msg.from, msg.payload.pzhid, msg.payload.authCode);
      }
      // PZH Existing --
      // PZH New      - Fourth Message
      else if (msg.payload.status === "registerPzh") {
        connectPzh(pzp, msg.payload.status, msg.from, msg.payload.pzhid);
      }

      // PZH Existing - Fifth Message
      // PZH New      - Seventh Message

      /***** End of PZP auto-enrollment ******/
    } else {
      if( typeof pzp !== "undefined" && typeof pzp.sessionId !== "undefined") {
        pzp.messageHandler.onMessageReceived(msg, msg.to);
      }
    }
  }

  function wsClose(connection, reason) {
    log.info(reason);
    if (pzp.connectedWebApp[connection.id]) {
      delete pzp.connectedWebApp[connection.id];
      log.info("web client disconnected: " + connection.id);
    }
  }

  if(wrtServer) {
    wrtServer.listener = function(connection) {
      log.info("connection accepted and adding proxy connection methods.");
      connection.socket = { pause: function(){}, resume: function(){} };
      connection.sendUTF = connection.send;

      pzp.connectedApp(connection);

      connection.listener = {
        onMessage: function(ev) { wsMessage(connection, ev.data); },
        onClose: function() { wsClose(connection); },
        onError: function(reason) { log.info("onError(): " + reason); }
      };

    };
  }
  var wsServer = new WebSocketServer({
    httpServer: httpserver,
    autoAcceptConnections: true
  });

  wsServer.on("connect", function(connection) {
    log.info("connection accepted.");
    pzp.connectedApp(connection);
    connection.on("message", function(message) { wsMessage(connection, message.utf8Data); });
    connection.on("close", function(reason, description) { wsClose(connection, description) });
  });
};
var https = require('https');

function connectPzh(pzp, cmd, from, to, authCode) {
  var self = pzp, path, payload;
  path = '/index.html?cmd=pzpEnroll';
  if (cmd === "authenticate-google" || cmd === "authenticate-yahoo") {
    payload = {"cmd": cmd,
                "id":from,
                "ipAddress": self.connectingAddress,
                "httpport":  global.pzpWebServerPort,
                "returnPath":"client/client.html"};
  } else if (cmd === "login") {
    payload = {"cmd": cmd};
  } else if (cmd === "enrollPzp") {
    payload = {"cmd": cmd,
      "id": self.sessionId,
      "to": to,
      "csr": self.config.csr,
      "authCode": authCode};
    to = to.split('/')[0];
  } else if (cmd === "registerPzh") {
    payload = {"cmd": cmd,
    "id": self.sessionId,
    "to": to};
    to = to.split('/')[0];
  }

  var options = {
    host: to,
    port: global.webServerPort,
    path: path,
    method: 'POST',
    headers: {
      'Content-Length': JSON.stringify(payload).length
    }
  };


  var req = https.request(options, function(res) {
    res.on('data', function(data) {
      var msg = JSON.parse(data.toString());
      console.log(msg);
      if (msg.payload && msg.payload.status ==="signedCert") {
        // This message come from PZH web server over websocket
        log.info("pzp writing certificates data ");
        self.config.own.cert    = msg.payload.message.clientCert;
        self.config.master.cert = msg.payload.message.masterCert;
        self.config.pzhId = msg.from;
        self.config.serverName = msg.payload.pzhid;
        global.storeConfig(self.config, function() {
          self.mode  = global.modes[1]; // Moved from Virgin mode to hub mode
          self.sessionId = self.config.pzhId+ '/' + self.config.name;
          self.state = global.states[0];
          global.fetchKey(self.config.own.key_id, function(conn_key) {
            self.connect(conn_key, null, null, self.config.serverName.split('/')[0], function(result) {
              self.update(function(result) {
                log.info("pzp connection status " + result);
              });
            });
          });
        });
      } else if (msg.payload && msg.payload.status === "auth-status"){
        var msgSend = { type: "prop", from: self.sessionId, to: "",
            payload : {
              "status"  : "auth-status",
              "message" : msg.payload.message,
              "pzhid"   : msg.payload.pzhid,
              "authCode": msg.payload.authCode
            }
          };
            for (var appId in self.connectedWebApp) {
              msgSend.to = appId;
              self.connectedWebApp[appId].sendUTF(JSON.stringify(msgSend));
            }

      } else {
      // Send Login Page/Prompt Message to WRT
        self.connectedWebApp[from].sendUTF(JSON.stringify(msg));
      }
    });
  });


  req.on('error', function(err) {
    log.error(err);
  });

  req.write(JSON.stringify(payload));
  req.end();
  // Send response of login back to pzh web server
};
