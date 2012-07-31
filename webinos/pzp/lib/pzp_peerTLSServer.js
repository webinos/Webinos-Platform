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
* @description: Handles connection with other PZP and starts PZP
*/
var tls   = require("tls");
var session = require("./session");
var log     = new session.common.debug("pzp_server");
var global  = session.configuration;

var PzpServer = function() {

}

PzpServer.prototype.startServer = function (parent, callback) {
  var self = this;
  session.configuration.fetchKey(parent.config.own.key_id, function(key) {
    // Read server configuration for creating TLS connection
    var certConfig = {
      key:  key,
      cert: parent.config.own.cert,
      ca:   parent.config.master.cert,
      crl:  parent.config.master.crl,
      requestCert: true,
      rejectUnauthorized: true
    };

    var server = tls.createServer(certConfig, function (conn) {
      var cn, clientSessionId;
      /* If connection is authorized:
      * SessionId is generated for PZP. Currently it is PZH"s name and
      * PZP"s CommonName and is stored in form of PZH/PZP.
      * registerClient of message manager is called to store PZP as client of PZH
      * Connected_client list is sent to connected PZP. Message sent is with payload
      * of form {status:"Auth", message:parent.connected_client} and type as prop.
      */
      if (conn.authorized) {
        var text = decodeURIComponent(conn.getPeerCertificate().subject.CN);
        var cn = text.split(":")[1];

        clientSessionId = parent.config.pzhId + "/"+ cn; //parent.pzhId + "/" +cn;
        log.info("client authenticated " + clientSessionId) ;

        if (parent.mode === global.modes[1] || parent.mode === global.modes[3]) {
          parent.mode = global.modes[3];
        } else {
          parent.mode = global.modes[2];
        }

        parent.state = global.states[2];

        if(typeof parent.connectedPzp[clientSessionId] !== "undefined") {
          parent.connectedPzp[clientSessionId].socket = conn;
          parent.connectedPzp[clientSessionId].state  = global.states[2];
        }
          var msg = parent.messageHandler.registerSender(parent.sessionId, clientSessionId);
          parent.sendMessage(msg, clientSessionId);
          parent.connectedApp();
      }

      conn.on("data", function (buffer) {
        try{
          session.common.readJson(self, buffer, function(obj) {
            session.common.processedMsg(self, obj, function(validMsgObj) {
              if(validMsgObj.type === "prop" && validMsgObj.payload.status === "findServices") {
                log.info("trying to send Webinos Services from this RPC handler to " + validMsgObj.from + "...");
                var services = parent.discovery.getAllServices(validMsgObj.from);
                var msg = {"type":"prop", "from":parent.sessionId, "to":validMsgObj.from, "payload":{"status":"foundServices", "message":services}};
                msg.payload.id = validMsgObj.payload.message.id;
                parent.sendMessage(msg, validMsgObj.from);
                log.info("sent " + (services && services.length) || 0 + " Webinos Services from this RPC handler.");
              } else if(validMsgObj.type === "prop" && validMsgObj.payload.status === "foundServices") {
                log.info("received message about available remote services.");
                parent.serviceListener && parent.serviceListener(validMsgObj.payload);
              } else if (validMsgObj.type === "prop" && validMsgObj.payload.status === "pzpDetails") {
                if(parent.connectedPzp[validMsgObj.from]) {
                  parent.connectedPzp[validMsgObj.from].port = validMsgObj.payload.message;
                } else {
                  log.info("received pzp details from entity which is not registered : " + validMsgObj.from);
                }
              } else {
                parent.messageHandler.onMessageReceived( validMsgObj, validMsgObj.to);
              }
            });
          });
        } catch(err) {
          log.error(err);
        }
      });

      conn.on("end", function () {
        log.info("connection end");
        var status = true;
        for (var key in self.connectedPzp) {
          if (parent.connectedPzp[key].state === global.states[2]) {
            status = false;
            break;
          }
        }

        if(status) {// No pzp is connected directly
          if (parent.mode === global.modes[3] || parent.mode === global.modes[1]) {
            parent.mode = global.modes[1];
          } else if (parent.mode === global.modes[2]) {
            parent.state = global.states[0];
          }
        }

        for (var key in parent.connectedPzp) {
          if (parent.connectedPzp[key].socket === conn){
            delete parent.connectedPzp[key];
          }
        }
        log.info('mode '+ parent.mode + ' state '+parent.state);
        parent.connectedApp();
      });

      // It calls removeClient to remove PZP from connected_client and connectedPzp.
      conn.on("close", function() {
        log.info("socket closed");
      });

      conn.on("error", function(err) {
        parent.connectedPzp[self.peerSessionId].state = global.states[3];
        var status = true;

        for (var key in self.connectedPzp) {
          if (parent.connectedPzp[key].state === global.states[2]) {
            status = false;
            break;
          }
        }

        if(status) {// No pzp is connected directly
          if (parent.mode === global.modes[3] || parent.mode === global.modes[1]) {
            parent.mode = global.modes[1];
          } else if (parent.mode === global.modes[2]) {
            parent.state = global.states[0];
          }
        }

        for (var key in parent.connectedPzp) {
          if (parent.connectedPzp[key].socket === conn){
            delete parent.connectedPzp[key];
            parent.connectedApp();
          }
        }
        log.info('mode '+ parent.mode + ' state '+parent.state);
      });
    });

    server.on("error", function (err) {
      if (err.code === "EADDRINUSE") {
        log.error("address in use, trying next available port ... ");
        session.configuration.pzpServerPort = parseInt(session.configuration.pzpServerPort, 10) + 1;
        server.listen(session.configuration.pzpServerPort, parent.pzpAddress);
      }
    });

    server.on("listening", function () {
      log.info("listening as server on port :" + session.configuration.pzpServerPort);
      callback.call(parent, "started");
    });

    server.listen(session.configuration.pzpServerPort);
  });
};

module.exports = PzpServer;
