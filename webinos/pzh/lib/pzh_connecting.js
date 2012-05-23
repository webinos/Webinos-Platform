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

var pzhConnecting = exports;

var path      = require("path");
var http      = require("http");
var tls       = require("tls");

var webinos = require("webinos")(__dirname);
var session = webinos.global.require(webinos.global.pzp.location, "lib/session");
var log     = new session.common.debug("pzh_connect");

// this is for connecting when PZH is in same farm
pzhConnecting.connectOtherPZH = function(pzh, server, callback) {
  "use strict";
  var self = pzh, options;
  var serverName;
  if (server.split("/")) {
    serverName = server.split("/")[0];
  } else {
    serverName = server;
  }
  
  log.info("connect Other PZH - "+serverName);
  
  session.configuration.fetchKey(self.config.conn.key_id, function(key_id) {
    try {
      var caList = [], crlList = [];
      caList.push(self.config.master.cert);
      crlList.push(self.config.master.crl);
      
      for (var myKey in self.config.otherCert) {
        if (self.config.otherCert[myKey] !== "undefined" && myKey === server) {
          caList.push(self.config.otherCert[myKey].cert);
          crlList.push(self.config.otherCert[myKey].crl);
        }
      }
      //No CRL support yet, as this is out-of-zone communication.  TBC.
      options = {
        key : key_id ,
        cert: self.config.conn.cert,
        ca  : caList,
        crl : crlList,
        servername: server};

    } catch (err) {
      log.error("connecting other Pzh failed in setting configuration " + err);
      return;
    }
    
    var connPzh = tls.connect(config.pzhPort, serverName, options, function() {
      log.info("connection Status : "+connPzh.authorized);
      if(connPzh.authorized) {
        var connPzhId, msg;
        try {
          var text = connPzh.getPeerCertificate().subject.CN;
          connPzhId = decodeURIComponent(text);
          connPzhId = connPzhId.split(":")[1];
          log.info("connected to " + connPzhId);
        } catch (err) {
          log.error("reading common name of peer certificate " + err);
          return;
        }
        try {
          if(self.config.otherCert.hasOwnProperty(server)) {
            self.connectedPzh[connPzhId] = {socket : connPzh};
            msg = self.messageHandler.registerSender(self.sessionId, connPzhId);
            self.sendMessage(msg, connPzhId);
            callback(connPzh.authorized);
          }
        } catch (err1) {
          log.error("could not add PZH in the list " + err1);
          return;
        }
      } else {
        callback(connPzh.authorized);
        log.info("connection authorization Failed");
      }

      connPzh.on("data", function(data) {
        utils.processedMsg(self, data, function(parse){
          try {
            self.messageHandler.onMessageReceived(parse, parse.to);
          } catch (err) {
            log.error("sending message to messaging " + err);
          }
        });
      });

      connPzh.on("error", function(err) {
        log.error(err);
      });

      connPzh.on("close", function() {
        log.info("closed");
      });

      connPzh.on("end", function() {
        log.info("Peer Pzh End");
      });
    });
  });
};
