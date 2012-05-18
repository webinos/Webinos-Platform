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
var log            = require("./session").common.debug;
var session        = require("./session");
var rpc            = webinos.global.require(webinos.global.rpc.location, "lib/rpc");
var wrtServer;

if(process.platform == "android") {
  try {
    wrtServer = require("bridge").load("org.webinos.app.wrt.channel.WebinosSocketServerImpl", exports);
  } catch(e) {
    log("ERROR", "PZP pzp_websocket.js: exception attempting to open wrt server " + e);
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
      var uri = url.parse(request.url).pathname;
      var filename = path.join(__dirname, "../../test/", uri);
      fs.stat(filename, function(err, stats) {
        if(err) {
          response.writeHead(404, {"Content-Type": "text/plain"});
          response.write("404 Not Found\n");
          response.end();
          return;
        }
        if (stats.isDirectory()) {
          filename = path.join(filename, "index.html");
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
        cs.listen(session.configuration.pzpWebServerPort, config.pzpHost);
      }
    });

    cs.listen(session.configuration.pzpWebServerPort, config.pzpHost, function(){
      log("INFO",  "[PZP WebServer]: Listening on port "+session.configuration.pzpWebServerPort);
    });

    var httpserver = http.createServer(function(request, response) {
      log("INFO",  "[PZP WSServer]: Received request for " + request.url);
      response.writeHead(404);
      response.end();
    });

    httpserver.on("error", function(err) {
      log("ERROR",  "[PZP WSServer]: got error " + err);
      if (err.code === "EADDRINUSE") {
        // BUG why make up a port ourselves?
        // Response: not making port, doing it automatically instead of throwing error .., if user wants different ports they can do themselves at startup
        session.configuration.pzpHttpServerPort = parseInt(session.configuration.pzpHttpServerPort, 10) +1;
        log("ERROR",  "[PZP WSServer]: address in use, now trying port " + session.configuration.pzpHttpServerPort);
        httpserver.listen(session.configuration.pzpHttpServerPort, config.pzpHost);
      }
    });

    httpserver.listen(session.configuration.pzpHttpServerPort, config.pzpHost, function() {
      log("INFO",  "[PZP WSServer]: Listening on port "+session.configuration.pzpHttpServerPort + " and hostname "+config.pzpHost);
      callback("startedWebSocketServer");
    });

    function wsMessage(connection, utf8Data) {
      //schema validation
      var msg = JSON.parse(utf8Data);

      var invalidSchemaCheck = true;
      try {
        invalidSchemaCheck = session.schema.checkSchema(msg);

      } catch (err) {
        log("ERROR", "[PZP WSServer]: " + err);
      }
      if(invalidSchemaCheck) {
        // For debug purposes, we only print a message about unrecognized packet,
        // in the final version we should throw an error.
        // Currently there is no a formal list of allowed packages and throw errors
        // would prevent the PZP from working
        log("ERROR",  "[PZP WSServer]: msg schema is not valid " + JSON.stringify(msg));
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
    } else {
      if( typeof pzp !== "undefined" && typeof pzp.sessionId !== "undefined") {
        pzp.messageHandler.onMessageReceived(msg, msg.to);
      }
    }
  }

  function wsClose(connection) {
    log("INFO",  "[PZP WSServer]: Peer disconnected.");
  }

  if(wrtServer) {
    wrtServer.listener = function(connection) {
      log("INFO",  "[PZP WSServer]: Connection accepted.");
      log("INFO",  "[PZP WSServer]: adding proxy connection methods.");
      connection.socket = { pause: function(){}, resume: function(){} };
      connection.sendUTF = connection.send;

      pzp.connectedApp(connection);

      connection.listener = {
        onMessage: function(ev) { wsMessage(connection, ev.data); },
        onClose: function() { wsClose(connection); },
        onError: function(reason) { log("INFO",  "[PZP WSServer]: onError(): " + reason); }
      };
    };
  }
  var wsServer = new WebSocketServer({
    httpServer: httpserver,
    autoAcceptConnections: true
  });

  wsServer.on("connect", function(connection) {
    log("INFO",  "[PZP WSServer]: Connection accepted.");
    pzp.connectedApp(connection);
    connection.on("message", function(message) { wsMessage(connection, message.utf8Data); });
    connection.on("close", wsClose);
  });
};
