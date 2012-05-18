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

var session = require("./session");
var logs    = session.common.debug;
var global  = session.configuration;

var PzpClient = function() {
  this.sessionId;
  this.peerSessionId;
};

PzpClient.prototype.connectOtherPZP = function (parent, msg) {
  var self = this;
  self.sessionId = parent.sessionId;

  session.configuration.fetchKey(parent.config.own.key_id, function(key) {
    var options = {
        key:  key,
        cert: parent.config.own.cert,
        crl:  parent.config.master.crl,
        ca:   parent.config.master.cert
    };

    client = tls.connect(msg.port, msg.address, options, function () {
      if (client.authorized) {
      self.peerSessionId = msg.name;
      logs("INFO", "[PZP Client-" + self.sessionId + "]: Authorized & Connected to PZP: " + msg.address + " name = " + msg.name);

      if (parent.mode === global.modes[3] || parent.mode === global.modes[1] ) {
        parent.mode   = global.modes[3];
      } else {
        parent.mode   = global.modes[2];
      }
      parent.state = global.states[2];

      // Updating at two places as parent.state should tell you at least one is connected in peer mode
      // The process whole connectedPzp to find which is and which is not connected
      parent.connectedPzp[msg.name].state  = global.states[2]
      parent.connectedPzp[msg.name].socket = client;

      var msg1 = parent.messageHandler.registerSender(self.sessionId, msg.name);
      parent.sendMessage(msg1, msg.name);

      } else {
        logs("INFO", "[PZP Client-" + self.sessionId + "]: Connection failed, first connect with PZH ");
      }
    });

    client.on("data", function (buffer) {
      try {
        client.pause();
        session.common.readJson(self, buffer, function(obj) {
          session.common.processedMsg(self, obj, function(validMsgObj) {
            if(validMsgObj.type === "prop" && validMsgObj.payload.status === "foundServices") {
              logs("INFO", "[PZP Client-"+self.sessionId+"]: Received message about available remote services.");
              parent.serviceListener && parent.serviceListener(validMsgObj.payload);
            } else {
              parent.messageHandler.onMessageReceived(validMsgObj, validMsgObj.to);
            }
          });
        });
        client.resume();
      } catch (err) {
        logs("ERROR", "[PZP Client-" + self.sessionId + "]: Exception" + err);
      }
    });

    client.on("end", function () {
      logs("INFO", "[PZP Client-" + self.sessionId + "]: Connection terminated");
      parent.connectedPzp[self.peerSessionId].state = global.states[3];
      if (parent.mode === global.modes[2]) {
        parent.state = global.states[0];
      }
        
      if (parent.mode === global.modes[3]) {
        var status = true;
        for (var key in self.connectedPzp) {
          if(parent.connectedPzp[key].state === global.states[2]) {
            status = false;
            break;
          }
        }
        if (status) {
          parent.mode = global.modes[1];
        }
      } else {
        parent.mode = global.modes[1]; // Go back in hub mode
      }
      parent.connectedPzp[self.peerSessionId].state = global.states[0];
      logs('INFO','[PZP Client-'+ self.sessionId+'] Mode '+ parent.mode + ' State '+parent.state);

    });

    client.on("error", function (err) {
      logs("ERROR", "[PZP Client-" + self.sessionId + "]:  " + err);
      parent.connectedPzp[self.peerSessionId].state = global.states[3];
      if (parent.mode === global.modes[2]) {
        parent.state = global.states[0];
      }
        
      if (parent.mode === global.modes[3]) {
        var status = true;
        for (var key in self.connectedPzp) {
          if(parent.connectedPzp[key].state === global.states[2]) {
            status = false;
            break;
          }
        }
        if (status) {
          parent.mode = global.modes[1];
        }
      } else {
        parent.mode = global.modes[1]; // Go back in hub mode
      }
      parent.connectedPzp[self.peerSessionId].state = global.states[0];
      logs('INFO','[PZP Client-'+ self.sessionId+'] Mode '+ self.mode + ' State '+self.state);
    });

    client.on("close", function () {
      logs("INFO", "[PZP Client-" + self.sessionId + "]:  Connection closed by PZP Server");
    });
  });
};

module.exports = PzpClient;
