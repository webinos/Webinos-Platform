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
var log    = webinos.global.require(webinos.global.util.location, "lib/logging.js")(__filename);

var PzhConnecting = function() {
  function add_CA_CRL(caList, crlList) {
    var myKey;
    caList.push(config.cert.internal.master.cert);
    crlList.push(config.crl);

    for ( myKey in config.cert.external) {
      if(config.cert.external.hasOwnProperty(myKey)) {
        caList.push(config.cert.external[myKey].cert);
        crlList.push(config.cert.external[myKey].crl);
      }
    }
  }

  function setClientParams (config, to, key){
    var caList = [], crlList = [];
    add_CA_CRL(caList, crlList);
    return {
      key : key,
      cert: config.cert.internal.conn.cert,
      ca  : caList,
      crl : crlList,
      servername: to
    };
  }

  function sendFoundService(validMsgObj){
    var services = discovery.getAllServices(validMsgObj.from);
    var msg =     msg = {"type"  : "prop",
      "from" : sessionId,
      "to"   : validMsgObj.from,
      "payload" : {"status" : "foundServices", "message" : services}};
    msg.payload.id = validMsgObj.payload.message.id;
    sendMessage(msg, validMsgObj.from);
    log.info("sent " + (services && services.length) || 0 + " Webinos Services from this rpc handler.");
  }

  function processMsg (self, buffer){
    session.common.readJson(self, buffer, function(obj) {
      session.common.processedMsg(self, obj, function(validMsgObj) {
        log.info("received message from peer pzh " + JSON.stringify(validMsgObj));
        if(validMsgObj.type === 'prop' && validMsgObj.payload.status === 'foundServices') {
          log.info('received message about available remote services.');
          self.serviceListener && self.serviceListener(validMsgObj.payload);
        } // information sent by connecting PZP about services it supports. These details are then used by findServices
        else if(validMsgObj.type === "prop" && validMsgObj.payload.status === "registerServices") {
          log.info("receiving Webinos services from pzp or pzh...");
          self.discovery.addRemoteServiceObjects(validMsgObj.payload.message);
        } // Send findServices information to connected PZP..
        else if(validMsgObj.type === "prop" && validMsgObj.payload.status === "findServices") {
          log.info("trying to send webinos services from this RPC handler to " + validMsgObj.from + "...");
          sendFoundService(validMsgObj);
        } else {
          self.messageHandler.onMessageReceived(validMsgObj, validMsgObj.to);
        }
      });
    });
  }

  function register_rpc_messaging(self, connPzhId, connPzh) {
    self.connectedPzh[connPzhId] = {socket : connPzh};

    msg = self.messageHandler.registerSender(sessionId, connPzhId);
    self.sendMessage(msg, connPzhId);

    var services = self.discovery.getAllServices();
    var msg = prepMsg(sessionId, connPzhId, "registerServices", services);
    self.sendMessage(msg, connPzhId);
  }

  this.sendCertificate = function(to, sessionId, serverName, webServerPort, masterCert, masterCrl, callback) {
    "use strict";
    var options, self = this,
      payload = {
        to  : to,
        from: serverName,
        payload: {
          status: "sendCert" ,
          cert: masterCert,
          crl : masterCrl
        }
      };

    options= {
      host: to.split('/')[0],
      port: webServerPort,
      path: "/main.html?cmd=transferCert",
      method:"POST",
      headers: { 'Content-Length': JSON.stringify(payload).length}
    };
    log.addId(sessionId);
    log.info("pzh to pzh connection initiated");

    var req = https.request(options, function(res) {
      res.on('data', function(data) {
        var parse = JSON.parse(data);
        if (parse.payload && parse.payload.status === "receiveCert") {
          log.info("pzh to pzh receive certificate");
          self.addExternalCert(parse.from, parse, null,function(serverName, options){
            self.refreshCert(serverName, options);
            //callback({to: parse.to, cmd: 'pzhPzh', payload:true});
            self.connectOtherPZH(to, callback);
          });

        } else if (parse.payload.status === "error") {
          log.error(parse.payload.message);
          callback({to: parse.to, cmd: 'pzhPzh', payload: parse.payload.message});
        }
      });
    });
    req.on('error', function(err) {
      log.error(err);
    });
    req.write(JSON.stringify(payload));
    req.end();
  };

  this.connectOtherPZH = function(to, callback) {
    "use strict";
    var serverName =to.split("/")[0], config = this.config, self = this;
    log.info("connecting other pzh "+to);
    config.fetchKey(config.cert.internal.conn.key_id, function(status, key) {
      try {
        if (status) {
          var connPzh, options = setClientParams(to, config, key);
          connPzh = tls.connect(config.userPref.ports.provider, serverName, options, function() {
            log.info("connection status : "+connPzh.authorized);
            if(connPzh.authorized) {
              var connPzhId, msg;
              try {
                var text = connPzh.getPeerCertificate().subject.CN;
                connPzhId = decodeURIComponent(text);
                connPzhId = connPzhId.split(":")[1];
                log.info("connected to " + connPzhId);
              } catch (err) {
                self.log.error("reading common name of pzh certificate " + err);
                return;
              }
              try {
                if(config.cert.external.hasOwnProperty(to)) {
                  register_rpc_messaging(connPzhId, connPzh);
                  log.info("sent msg to register local services with pzh");
                  callback({cmd:'pzhPzh', to: config.metaData.serverName, payload:connPzh.authorized});
                }
              } catch (err1) {
                log.error("could not add pzh in the list " + err1);
                return;
              }
            } else {
              callback({cmd:'pzhPzh', to: config.metaData.serverName, payload:connPzh.authorized});
              log.info("connection authorization Failed");
            }

            connPzh.on("data", function(buffer) {
              try {
                connPzh.pause();
                processMsg(buffer);
              } catch (err) {
                log.error("exception in processing recieved message " + err);
              } finally {
                connPzh.resume();
              }
            });

            connPzh.on("error", function(err) {
              log.error(err);
            });

            connPzh.on("end", function() {
              log.info("pzh end");
            });
          });
        }
      } catch (err) {
        log.error("connecting other pzh failed in setting configuration " + err);
        return callback(false, "connect other pzh failed");
      }
    });
  }
};
module.exports = PzhConnecting;
