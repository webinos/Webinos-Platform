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
var tls      = require("tls");
var util     = require("util");

var webinos  = require("webinos")(__dirname);
var log      = webinos.global.require(webinos.global.util.location, "lib/logging.js")(__filename);

var pzpLocal = require("./pzp_local.js");

var PzpServer = function() {
  pzpLocal.call(this);
};

util.inherits(PzpServer, pzpLocal);

PzpServer.prototype.startServer = function (callback) {
  var self = this, server;
  self.config.fetchKey(self.config.cert.internal.conn.key_id, function(key) {
    // Read server configuration for creating TLS connection
    var certConfig = {
      key:  key,
      cert: self.config.cert.internal.conn.cert,
      ca:   self.config.cert.internal.master.cert,
      crl:  self.config.crl,
      requestCert: true,
      rejectUnauthorized: true
    };

    self.tlsServer = tls.createServer(certConfig, function (conn) {
      var cn, clientSessionId;
      if (conn.authorized) {
        var text = decodeURIComponent(conn.getPeerCertificate().subject.CN);
        cn = text.split(":")[1];

        clientSessionId = self.config.metaData.pzhId + "/"+ cn; //self.pzhId + "/" +cn;
        log.info("client authenticated " + clientSessionId) ;

        if (self.mode === self.modes[1] || self.mode === self.modes[3]) {
          self.mode = self.modes[3];
        } else {
          self.mode = self.modes[2];
        }

        self.state = self.states[2];

        if(typeof self.connectedPzp[clientSessionId] !== "undefined") {
          self.connectedPzp[clientSessionId].socket = conn;
          self.connectedPzp[clientSessionId].state  = self.states[2];
        }
          var msg = self.messageHandler.registerSender(self.sessionId, clientSessionId);
          self.sendMessage(msg, clientSessionId);
          self.connectedApp();
      }

      conn.on("data", function (buffer) {
        try{
          session.common.readJson(self, buffer, function(obj) {
            session.common.processedMsg(self, obj, function(validMsgObj) {
              if(validMsgObj.type === "prop" && validMsgObj.payload.status === "findServices") {
                log.info("trying to send Webinos Services from this RPC handler to " + validMsgObj.from + "...");
                var services = self.discovery.getAllServices(validMsgObj.from);
                var msg = {"type":"prop", "from":self.sessionId, "to":validMsgObj.from, "payload":{"status":"foundServices", "message":services}};
                msg.payload.id = validMsgObj.payload.message.id;
                self.sendMessage(msg, validMsgObj.from);
                log.info("sent " + (services && services.length) || 0 + " Webinos Services from this RPC handler.");
              } else if(validMsgObj.type === "prop" && validMsgObj.payload.status === "foundServices") {
                log.info("received message about available remote services.");
                self.serviceListener && self.serviceListener(validMsgObj.payload);
              } else if (validMsgObj.type === "prop" && validMsgObj.payload.status === "pzpDetails") {
                if(self.connectedPzp[validMsgObj.from]) {
                  self.connectedPzp[validMsgObj.from].port = validMsgObj.payload.message;
                } else {
                  log.info("received pzp details from entity which is not registered : " + validMsgObj.from);
                }
              } else {
                self.messageHandler.onMessageReceived( validMsgObj, validMsgObj.to);
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
          if (self.connectedPzp[key].state === self.states[2]) {
            status = false;
            break;
          }
        }

        if(status) {// No pzp is connected directly
          if (self.mode === self.modes[3] || self.mode === self.modes[1]) {
            self.mode = self.modes[1];
          } else if (self.mode === self.modes[2]) {
            self.state = self.states[0];
          }
        }

        for (var key in self.connectedPzp) {
          if (self.connectedPzp[key].socket === conn){
            delete self.connectedPzp[key];
          }
        }
        log.info('mode '+ self.mode + ' state '+self.state);
        self.connectedApp();
      });

      // It calls removeClient to remove PZP from connected_client and connectedPzp.
      conn.on("close", function() {
        log.info("socket closed");
      });

      conn.on("error", function(err) {
        self.connectedPzp[self.peerSessionId].state = self.states[3];
        var status = true;

        for (var key in self.connectedPzp) {
          if (self.connectedPzp[key].state === self.states[2]) {
            status = false;
            break;
          }
        }

        if(status) {// No pzp is connected directly
          if (self.mode === self.modes[3] || self.mode === self.modes[1]) {
            self.mode = self.modes[1];
          } else if (self.mode === self.modes[2]) {
            self.state = self.states[0];
          }
        }

        for (var key in self.connectedPzp) {
          if (self.connectedPzp[key].socket === conn){
            delete self.connectedPzp[key];
            self.connectedApp();
          }
        }
        log.info('mode '+ self.mode + ' state '+self.state);
      });
    });

    self.tlsServer.on("error", function (err) {
      if (err.code === "EADDRINUSE") {
        log.error("address in use, trying next available port ... ");
        self.config.userPref.ports.pzp_tlsServer = parseInt(self.config.userPref.ports.pzp_tlsServer, 10) + 1;
        server.listen(self.config.userPref.ports.pzp_tlsServer);
      }
    });

    self.tlsServer.on("listening", function () {
      log.info("listening as server on port :" + self.config.userPref.ports.pzp_tlsServer);
      callback.call(self, "started");
    });

    self.tlsServer.listen(self.config.userPref.ports.pzp_tlsServer);
  });
};

module.exports = PzpServer;
