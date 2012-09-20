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

var tls   = require("tls");
var webinos     = require("webinos")(__dirname);
var log         = webinos.global.require(webinos.global.util.location, "lib/logging.js")(__filename);

var PzpClient = function() {
  this.peerSessionId = "";
};

PzpClient.prototype.setMode = function() {
  if (this.mode === this.modes[1] || this.mode === this.modes[3] ) {
    this.mode = this.modes[3];
  } else {
    this.mode = this.modes[2];
  }
  this.state  = this.states[2];
};

PzpClient.prototype.connectOtherPZP = function (msg) {
  var self = this;
  self.config.fetchKey(self.config.cert.internal.conn.key_id, function(key) {
    var options = {
      key:  key,
      cert: self.config.cert.internal.conn.cert,
      crl:  self.config.crl,
      ca:   self.config.cert.intenrnal.master.cert
    };

    client = tls.connect(msg.port, msg.address, options, function () {
      if (client.authorized) {
        self.peerSessionId = msg.name;
        log.info("authorized & connected to PZP: " + msg.address + " name = " + msg.name);
        self.setMode();
        // Updating at two places as self.state should tell you at least one is connected in peer mode
        // The process whole connectedPzp to find which is and which is not connected
        self.connectedPzp[msg.name].state  = self.states[2]
        self.connectedPzp[msg.name].socket = client;

        var msg1 = self.messageHandler.registerSender(self.sessionId, msg.name);
        self.sendMessage(msg1, msg.name);

        self.connectedApp();

      } else {
        log.info("connection failed, first connect with PZH ");
      }
    });

    client.on("data", function (buffer) {
      try {
        client.pause();
        session.common.readJson(self, buffer, function(obj) {
          session.common.processedMsg(self, obj, function(validMsgObj) {
            if(validMsgObj.type === "prop" && validMsgObj.payload.status === "foundServices") {
              log.info("received message about available remote services.");
              self.serviceListener && self.serviceListener(validMsgObj.payload);
            } else if(validMsgObj.type === "prop" && validMsgObj.payload.status === "findServices") {
                log.info("trying to send Webinos Services from this RPC handler to " + validMsgObj.from + "...");
                var services = self.discovery.getAllServices(validMsgObj.from);
                var msg = {"type":"prop", "from":self.sessionId, "to":validMsgObj.from, "payload":{"status":"foundServices", "message":services}};
                msg.payload.id = validMsgObj.payload.message.id;
                self.sendMessage(msg, validMsgObj.from);
                log.info("sent " + (services && services.length) || 0 + " Webinos Services from this RPC handler.");
              }else {
              self.messageHandler.onMessageReceived(validMsgObj, validMsgObj.to);
            }
          });
        });
        client.resume();
      } catch (err) {
       log.error(err);
      }
    });

    client.on("end", function () {
      log.info("connection terminated");
      if(typeof self.connectedPzp[self.peerSessionId] !== "undefined")
        self.connectedPzp[self.peerSessionId].state = global.states[3];
      if (self.mode === global.modes[2]) {
        self.state = global.states[0];
      }

      if (self.mode === global.modes[3]) {
        var status = true;
        for (var key in self.connectedPzp) {
          if(self.connectedPzp[key].state === global.states[2]) {
            status = false;
            break;
          }
        }
        if (status) {
          self.mode = global.modes[1];
        }
      } else {
        self.mode = global.modes[1]; // Go back in hub mode
      }
      if(typeof self.connectedPzp[self.peerSessionId] !== "undefined") {
        delete self.connectedPzp[self.peerSessionId].state;
        self.connectedApp();
      }

      log.info('mode '+ self.mode + ' state '+self.state);

    });

    client.on("error", function (err) {
      log.error(err);
      if(typeof self.connectedPzp[self.peerSessionId] !== "undefined") {
        self.connectedPzp[self.peerSessionId].state = global.states[3];
      }
      if (self.mode === global.modes[2] ) {
        self.state = global.states[0];
      }

      if (self.mode === global.modes[3] || self.mode === global.modes[1] ) {
        var status = true;
        for (var key in self.connectedPzp) {
          if(self.connectedPzp[key].state === global.states[2]) {
            status = false;
            break;
          }
        }
        if (status) {
          self.mode = global.modes[1];
        }
      } else {
        self.mode = global.modes[1]; // Go back in hub mode
      }
      if(typeof self.connectedPzp[self.peerSessionId] !== "undefined") {
        delete self.connectedPzp[self.peerSessionId];
        self.connectedApp();
      }
      log.info('mode '+ self.mode + ' state '+self.state);

    });

    client.on("close", function () {
      log.info("connection closed by PZP Server");
    });
  });
};

module.exports = PzpClient;
