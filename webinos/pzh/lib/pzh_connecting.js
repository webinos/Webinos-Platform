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
* Copyright 2011 Habib Virji Samsung Electronics (UK) Ltd
*******************************************************************************/

/*
 * Handles connection with other PZH
 */

var path      = require("path");
var https     = require("https");
var tls       = require("tls");
var crypto    = require("crypto");

var webinos = require("webinos")(__dirname);
var session = webinos.global.require(webinos.global.pzp.location, "lib/session");
var farm    = require('./pzh_farm');

var PzhConnecting = function(parent) {
  this.sessionId = parent.sessionId;
  this.parent    = parent;
  this.log       = new session.common.debug("pzh_connect");
  this.log.addId(this.sessionId);
};

// this is for connecting when PZH is in same farm
PzhConnecting.prototype.connectOtherPZH = function(to, callback) {
  "use strict";
  var self = this, options;
  var serverName;
  if (to.split("/")) {
    serverName = to.split("/")[0];
  } else {
    serverName = to;
  }

  self.log.info("connecting other pzh "+to);

  session.configuration.fetchKey(self.parent.config.own.key_id, function(key_id) {
    try {
      var caList = [], crlList = [];
      caList.push(self.parent.config.master.cert);
      crlList.push(self.parent.config.master.crl);

      for (var myKey in self.parent.config.otherCert) {
        if (self.parent.config.otherCert[myKey] !== "undefined" && myKey === to) {
          caList.push(self.parent.config.otherCert[myKey].cert);
          crlList.push(self.parent.config.otherCert[myKey].crl);
        }
      }
      //No CRL support yet, as this is out-of-zone communication.  TBC.
      options = {
        key : key_id ,
        cert: self.parent.config.own.cert,
        ca  : caList,
        crl : crlList,
        servername: to};

    } catch (err) {
      self.log.error("connecting other pzh failed in setting configuration " + err);
      return;
    }

    var connPzh = tls.connect(session.configuration.pzhPort, serverName, options, function() {
      self.log.info("connection status : "+connPzh.authorized);
      if(connPzh.authorized) {
        var connPzhId, msg;
        try {
          var text = connPzh.getPeerCertificate().subject.CN;
          connPzhId = decodeURIComponent(text);
          connPzhId = connPzhId.split(":")[1];
          self.log.info("connected to " + connPzhId);
        } catch (err) {
          self.log.error("reading common name of pzh certificate " + err);
          return;
        }
        try {
          if(self.parent.config.otherCert.hasOwnProperty(to)) {
            {
              self.parent.connectedPzh[connPzhId] = {socket : connPzh};
              msg = self.parent.messageHandler.registerSender(self.sessionId, connPzhId);
              self.parent.sendMessage(msg, connPzhId);
            }
            {
              var services = self.parent.discovery.getAllServices();
              var msg = self.parent.prepMsg(self.sessionId, connPzhId, "registerServices", services);
              self.parent.sendMessage(msg, connPzhId);
              self.log.info("sent msg to register local services with pzh");
            }
            callback({cmd:'pzhPzh', to: self.parent.config.serverName, payload:connPzh.authorized});
          }
        } catch (err1) {
          self.log.error("could not add pzh in the list " + err1);
          return;
        }
      } else {
        callback({cmd:'pzhPzh', to: self.parent.config.serverName, payload:connPzh.authorized});
        self.log.info("connection authorization Failed");
      }

      connPzh.on("data", function(buffer) {
        try {
          connPzh.pause();
          session.common.readJson(self, buffer, function(obj) {
            session.common.processedMsg(self, obj, function(validMsgObj) {
              self.log.info("received message" + JSON.stringify(validMsgObj));
              if(validMsgObj.type === 'prop' && validMsgObj.payload.status === 'foundServices') {
                self.log.info('received message about available remote services.');
                self.parent.serviceListener && self.parent.serviceListener(validMsgObj.payload);
              } // information sent by connecting PZP about services it supports. These details are then used by findServices
              else if(validMsgObj.type === "prop" && validMsgObj.payload.status === "registerServices") {
                self.log.info("receiving Webinos services from pzp or pzh...");
                self.parent.discovery.addRemoteServiceObjects(validMsgObj.payload.message);
              } // Send findServices information to connected PZP..
              else if(validMsgObj.type === "prop" && validMsgObj.payload.status === "findServices") {
                self.log.info("trying to send webinos services from this RPC handler to " + validMsgObj.from + "...");
                var services = self.parent.discovery.getAllServices(validMsgObj.from);
                var msg = self.parent.prepMsg(self.sessionId, validMsgObj.from, "foundServices", services);
                msg.payload.id = validMsgObj.payload.message.id;
                self.parent.sendMessage(msg, validMsgObj.from);
                self.log.info("sent " + (services && services.length) || 0 + " Webinos Services from this rpc handler.");
              } else {
                self.parent.messageHandler.onMessageReceived(validMsgObj, validMsgObj.to);
              }
            });
          });
        } catch (err) {
          self.log.error("exception in processing recieved message " + err);
        } finally {
          connPzh.resume();
        }
      });

      connPzh.on("error", function(err) {
        self.log.error(err);
      });

      connPzh.on("close", function() {
        self.log.info("closed");
      });

      connPzh.on("end", function() {
        self.log.info("pzh end");
      });
    });
  });
};
/**
 * initiates pzh to pzh certificate exchange
 * @instance: current pzh instance
 * @to: receiving pzh url
 **/
PzhConnecting.prototype.sendCertificate = function(to, callback) {
  "use strict";
  var self = this;
  this.log       = new session.common.debug("pzh_connect");
  this.log.addId(this.sessionId);
  self.log.info("pzh to pzh connection initiated");
  var payload = {cmd: "sendCert" ,
    name: self.parent.config.serverName,
    to: to,
    cert: self.parent.config.master.cert,
    crl: self.parent.config.master.crl};
  var options = { };
  options.host   = to.split('/')[0];
  options.port   = session.configuration.webServerPort;
  options.path   = "/main.html?cmd=transferCert";
  options.method = "POST";
  options.headers = { 'Content-Length': JSON.stringify(payload).length  };
  var req = https.request(options, function(res) {
    res.on('data', function(data) {
      var parse = JSON.parse(data);
      if (parse.cmd === "receiveCert") {
        self.log.info("pzh to pzh receive certificate");
        self.parent.config.otherCert[to] = { cert: parse.cert, crl: parse.crl};
        self.parent.options.ca.push(self.parent.config.otherCert[to].cert);
        self.parent.options.crl.push(self.parent.config.otherCert[to].crl);
        farm.server._contexts.some(function(elem) {
          if (self.parent.config.serverName.match(elem[0]) !== null) {
            elem[1] =  crypto.createCredentials(self.parent.options).context;
          }
        });
        session.configuration.storeConfig(self.parent.config, function() {
          self.connectOtherPZH(to, callback);
        });
      }
    });
  });
  req.on('error', function(err) {
    self.log.error(err);
  });
  req.write(JSON.stringify(payload));
  req.end();
};


module.exports = PzhConnecting;
