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
* Copyright 2011 Alexander Futasz, Fraunhofer FOKUS
*******************************************************************************/
/**
* @author <a href="mailto:habib.virji@samsung.com">Habib Virji</a>
* @description webinos_pzh.js starts Pzh and handle communication with a messaging
* manager. It is also responsible for loading rpc modules.
*/

/**
* Node modules used by Pzh
*/
var tls = require("tls"),
fs = require("fs"),
path = require("path"),
crypto = require("crypto"),
util = require("util");

if (typeof exports !== "undefined") {
  try {
    var webinos        = require("webinos")(__dirname);
    var session        = webinos.global.require(webinos.global.pzp.location, "lib/session");
    var rpc            = webinos.global.require(webinos.global.rpc.location);
    var Registry       = webinos.global.require(webinos.global.rpc.location, "lib/registry").Registry;
    var Discovery      = webinos.global.require(webinos.global.api.service_discovery.location, "lib/rpc_servicedisco").Service;
    var MessageHandler = webinos.global.require(webinos.global.manager.messaging.location, "lib/messagehandler").MessageHandler;
    var RPCHandler     = rpc.RPCHandler;
    var authcode       = require("./pzh_authcode");
    var farm           = require("./pzh_farm");
  } catch (err) {
    console.log("webinos modules missing, please check webinos installation" + err);
    return;
  }
}

/**
* @description Creates a new Pzh object
* @constructor
*/
var Pzh = function () {
  this.sessionId    = ""; /** Holds PZH Session Id */
  this.config       = {};/** Holds PZH Configuration particularly certificates */
  this.connectedPzh = {};/** Holds Connected PZH information such as IP address, port and socket */
  this.connectedPzp = {};/** Holds connected PZP information such as IP address and socket connection */
  this.expecting;    // Set by authcode directly
  this.log;
};

/**
* @description A generic function used to set message parameter
* @param {String} from Source address
* @param {String} to Destination address
* @param {String} status This is a message type, different types are used as per message
* @param {String|Object} message This could be a string or an object
* @returns {Object} Message to be sent
*/
Pzh.prototype.prepMsg = function (from, to, status, message) {
  var msg = null;
  if (from === null || to === null || status === null || message === null) {
    self.log.error("prep message failed");
  } else {
    msg = {"type"  : "prop",
    "from" : from,
    "to"   : to,
    "payload" : {"status" : status, "message" : message}};
  }
  return msg;
};

/**
* @description It searches for correct PZP by looking in connectedPzp and connectedPzh.
* As we are using objects, they need to be stringify to be processed at other end of the socket
* @param {Object} message Message to be send forward
* @param {String} address Destination session id
* @param {Object} conn This is used in special cases, especially when Pzh and Pzp are not connected.
*/
Pzh.prototype.sendMessage = function (message, address, conn) {
  var self = this;

  var jsonString = JSON.stringify(message);
  var buf = session.common.jsonStr2Buffer(jsonString);

  self.log.info("send to "+ address + " message " + jsonString);

  try {
    if (self.connectedPzh.hasOwnProperty(address)) {
    // If it is connected to pzh it will land here
      self.connectedPzh[address].socket.pause();
      self.connectedPzh[address].socket.write(buf);
      self.connectedPzh[address].socket.resume();
    } else if (self.connectedPzp.hasOwnProperty(address)) {
      self.connectedPzp[address].socket.pause();
      self.connectedPzp[address].socket.write(buf);
      self.connectedPzp[address].socket.resume();
    } else if(self.config.otherCert.hasOwnProperty(address)) {
      // We are not connected to this pzh but we have certificate exchange
      var pzhConnect = new pzh_connecting(self);
      pzhonnect.connectOtherPZH(address, function() {
        self.connectedPzh[address].socket.write(buf);
      });
    } else if( typeof conn !== "undefined" ) {
      conn.pause();
      conn.write(buf);
      conn.resume();
    } else {// It is similar to PZP connecting to PZH but instead it is PZH to PZH connection
      self.log.info("client " + address + " is not connected");
    }
  } catch(err) {
    self.log.error("exception in sending packet " + err);
  }
};

Pzh.prototype.handlePzpAuthorization = function(data, conn) {
  var sessionId, err, self = this;
  try {
    sessionId = self.sessionId+"/"+data[1];
  } catch(err) {
    self.log.error("exception in reading common name of pzp certificate " + err);
    return;
  }
  self.log.info("pzp "+sessionId+"  connected");

  // Used for communication purpose. Address is used as PZP might have different IP addresses
  self.connectedPzp[sessionId] = {"socket": conn,  "address": conn.socket.remoteAddress};

  // Register PZP with message handler
  msg = self.messageHandler.registerSender(self.sessionId, sessionId);
  self.sendMessage(msg, sessionId);
  {
    self.sendPzhUpdate();
  }
  {
    //farm.pzhWI.updateList(self);
  }
}

Pzh.prototype.handlePzhAuthorization = function(data, conn) {
  var self = this;
  var  pzhId, otherPzh = [], msg, localServices;
  try {
    pzhId = data[1];
  } catch (err) {
    self.log.error("pzh information in certificate is in unrecognized format " + err1);
    return;
  }

  self.log.info("pzh " + pzhId+" connected");
  self.connectedPzh[pzhId] = {"socket": conn,  "address": conn.socket.remoteAddress};
  // Register PZP with message handler
  {
    msg = self.messageHandler.registerSender(self.sessionId, pzhId);
    self.sendMessage(msg, pzhId);
  }
  {
    var services = self.discovery.getAllServices();
    var msg = self.prepMsg(self.sessionId, pzhId, "registerServices", services);
    self.sendMessage(msg, pzhId);
    self.log.info("sent " + (services && services.length) || 0 + " webinos services to " + pzhId);
  }
  {
    self.sendPzhUpdate();
  }
  {
    //farm.pzhWI.updateList(self);
  }
}
/**
* @description Responsible for adding PZH and PZP. It also is responsible for registering with message handler and dessimenating information about connected PZP"s to other PZP
* @param {Object} self: PZH instance
* @param {Object} conn: Connection object when any new connection is accepted.
*/
Pzh.prototype.handleConnectionAuthorization = function (conn) {
  var self = this;
  var msg;
  /**
  * Allows PZP to connect if it has proper QRCode
  */
  if(conn.authorized === false) {
    self.log.info(" connection NOT authorised at pzh");
    /**
    * @description: If this is a new PZP, we allow if it has proper QRCode
    */
    self.expecting.isExpected(function(expected) {
      if (!expected || conn.authorizationError !== "UNABLE_TO_GET_CRL" ){
        //we"re not expecting anything - disallow.
        self.log.info("ending connect: " + conn.authorizationError);
        conn.socket.end();
      } else {
        self.log.info("continuing connect - expected: " + conn.authorizationError);
      }
    });
  }

  /**
  * PZP/PZH connecting with proper certificate at both ends
  */
  if(conn.authorized) {
    var text, cn, data;
    self.log.info("connection authorised at pzh");
    try {
      // Get peer certificate details from the certiicate
      cn = conn.getPeerCertificate().subject.CN;
      text = decodeURIComponent(cn);
      data = text.split(":");
    } catch(err) {
      self.log.error("exception in reading common name of peer pzh certificate " + err);
      return;
    }

    if(data[0] === "Pzh" ) {
      self.handlePzhAuthorization(data, conn);
    } else if(data[0] === "Pzp" ) {
      self.handlePzpAuthorization(data, conn);
    }

  }
};

/**
  * @description: Calls processmsg to handle incoming message to PZH. This is called by PZH Farm
  * @param {Object} conn: Socket connection details of client socket ..
  * @param {Buffer} buffer: Incoming data received from other PZH or PZP
  */
Pzh.prototype.handleData = function(conn, buffer) {
  var self = this;

  try {
    conn.pause();
    session.common.readJson(self, buffer, function(obj) {
      self.processMsg(conn, obj);
    });
  } catch (err) {
    self.log.error("exception in processing recieved message " + err);
  } finally {
    conn.resume();
  }
};


Pzh.prototype.sendPzhUpdate = function () {
  var self = this;
  var otherPzh = [], status;
  for(var i in  self.connectedPzh) {
    if (self.connectedPzh.hasOwnProperty(i)) {
      otherPzh.push({name: i});
    }
  }
  // Send message to all connected pzp"s about new pzp that has joined in
  for(var i in self.connectedPzp) {
    if (self.connectedPzp.hasOwnProperty(i)) {
      var msg = self.prepMsg(self.sessionId, i, "pzhUpdate", otherPzh);
      self.sendMessage(msg, i);
    }
  }
}

Pzh.prototype.sendPzpUpdate = function (sessionId, conn, port) {
  // Fetch details about connected pzp"s
  // Information to be sent includes address, id and indication which is a newPZP joining
  var self = this;
  var otherPzp = [];
  for(var i in  self.connectedPzp) {
    if (self.connectedPzp.hasOwnProperty(i)) {
      // Special case for new pzp
      if (i === sessionId) {
        self.connectedPzp[i].port = port;
        otherPzp.push({name: i, address:self.connectedPzp[i].address, port: port, newPzp: true});
      } else {
        otherPzp.push({name: i, address:self.connectedPzp[i].address, port: self.connectedPzp[i].port, newPzp: false});
      }
    }
  }
  // Send message to all connected pzp"s about new pzp that has joined in
  for(var i in self.connectedPzp) {
    if (self.connectedPzp.hasOwnProperty(i)) {
      var msg = self.prepMsg(self.sessionId, i, "pzpUpdate", otherPzp);
      self.sendMessage(msg, i);
    }
  }
}
/**
* @description: Sets PZH URL id for storing information about QRCode
* @param {function} cb: Callback to return result
*/
Pzh.prototype.getMyUrl = function(cb) {
  cb.call(this, this.config.serverName);
}

/**
* @description: Adds new PZP certificate. This is trigered by client, which sends its csr certificate and PZH signs certificate and return backs.
* @param {Object} parse: It its is an object holding received message.
*/
Pzh.prototype.addNewPZPCert = function (parse, cb) {
  var self = this;
  try {
  // Check QRCode if it is valid ..
    self.expecting.isExpectedCode(parse.payload.message.code, function(expected) {
      if (expected) {
        // Sign certificate based on received csr from client.
        // Also includes master key and master certificate for signing the certificate
        session.configuration.signedCert(parse.payload.message.csr, self.config, parse.from, 2, function(config) { // pzp = 2
            // unset expected QRCode
          self.expecting.unsetExpected(function() {
            // Send signed certificate and master certificate to PZP
            var payload = {"clientCert": config.signedCert[parse.from], "masterCert":self.config.master.cert};
            var msg = self.prepMsg(self.sessionId, parse.from, "signedCert", payload);
            // update configuration with signed certificate details ..
            cb.call(self, null, msg);
          });
        });
      } else {
        // Fail message
        var payload = {};
        var msg = self.prepMsg(self.sessionId, parse.from, "failedCert", payload);
        self.log.info("failed to create client certificate: not expected code, please generate via PZH");
        cb.call(self, null, msg);
      }
    });
  } catch (err) {
    self.log.error("error signing client certificate" + err);
    cb.call(self, "Could not create client certificate");
  }
};

/**
 * @description process incoming messages, message of type prop are only received while session is established. Rest of the time it is usually RPC messages
 * @param {Object} conn: It is used in special scenarios, when PZP is not connected and we need to send response back
 * @param {Object} msgObj: A message object received from other PZH or PZP.
 */
Pzh.prototype.processMsg = function(conn, msgObj) {
  var self = this;
  session.common.processedMsg(self, msgObj, function(validMsgObj) {
    self.log.info("received message" + JSON.stringify(validMsgObj));
    // Message sent by PZP connecting first time based on this message it generates client certificate
    if(validMsgObj.type === "prop" && validMsgObj.payload.status === "clientCert" ) {
      self.addNewPZPCert(validMsgObj, function(err, msg) {
        if (err !== null) {
          self.log.error(err);
          return;
        } else {
          self.sendMessage(msg, validMsgObj.from, conn);
          conn.socket.end();
        }
      });
    }
    else if (validMsgObj.type === "prop" && validMsgObj.payload.status === "pzpDetails") {
      self.log.info("receiving details from pzp...");
      self.sendPzpUpdate(validMsgObj.from, conn, validMsgObj.payload.message);
    }
    // information sent by connecting PZP about services it supports. These details are then used by findServices
    else if(validMsgObj.type === "prop" && validMsgObj.payload.status === "registerServices") {
      self.log.info("receiving Webinos services from pzp...");
      this.discovery.addRemoteServiceObjects(validMsgObj.payload.message);
    }
    // Send findServices information to connected PZP..
    else if(validMsgObj.type === "prop" && validMsgObj.payload.status === "findServices") {
      self.log.info("trying to send webinos services from this RPC handler to " + validMsgObj.from + "...");
      var services = this.discovery.getAllServices(validMsgObj.from);
      var msg = self.prepMsg(self.sessionId, validMsgObj.from, "foundServices", services);
      msg.payload.id = validMsgObj.payload.message.id;
      self.sendMessage(msg, validMsgObj.from);
      self.log.info("sent " + (services && services.length) || 0 + " Webinos Services from this rpc handler.");
    }
    // Message is forwarded to Messaging manager
    else {
      try {
        self.messageHandler.onMessageReceived(validMsgObj, validMsgObj.to);
      } catch (err2) {
        self.log.error("error message sending to messaging " + err2);
        return;
      }
    }
  });
};

Pzh.prototype.setMessageHandler = function() {
  var self = this;
  self.messageHandler = new MessageHandler(self.rpcHandler);// handler of all things message
  var messageHandlerSend = function (message, address, object) {
    "use strict";
    object.sendMessage(message, address);
  };
  // Setting message handler to work with pzh instance
  self.messageHandler.setGetOwnId(self.sessionId);
  self.messageHandler.setObjectRef(self);
  self.messageHandler.setSendMessage(messageHandlerSend);
  self.messageHandler.setSeparator("/");
}
/**
* @description: ADDs PZH in a farm ..
* @param {string} uri: pzh url you want to add .. assumption it is of form pzh.webinos.org/nick
* @param {object} modules: modules that will be supported on PZH
* @param {function} callback: returns instance of PZH
*/
Pzh.prototype.addPzh = function ( uri, modules, callback) {
  var self = this;
  self.log = new session.common.debug("pzh_session");
  if (typeof farm.server === "undefined" || farm.server === null) {
    self.log.error("farm is not running, please run webinos_pzh");
    callback(false);
  } else {
    if (typeof uri === "undefined" || uri === "null" || typeof modules === "undefined" || modules === "null" ){
      self.log.error("pzh could not be started as one of the details are missing");
      callback(false);
    } else {
      var name = uri.split("/")[1];

      if (name === farm.config.name) {
        self.log.error("farm name and pzh name appears to be same , please either login with different userid");
        callback(false);
        return;
      }

      authcode.createAuthCounter(function (res) {
        self.expecting = res;
      });
      session.configuration.setConfiguration(name, "Pzh", uri, null, function(config, conn_key) {
        self.config    = config;
        self.sessionId = name ;
        self.log.addId(self.sessionId);
        var caList = [], crlList = [];

        caList.push(config.master.cert);
        crlList.push(config.master.crl);
        for ( key in config.otherCert) {
          if(config.otherCert.hasOwnProperty(key)) {
            caList.push(config.otherCert[key].cert);
            crlList.push(config.otherCert[key].crl);
          }
        }
        // Certificate parameters that will be added in SNI context of farm
        var options = {
          key  : conn_key,
          cert : config.own.cert,
          ca   : caList,
          crl  : crlList,
          requestCert: true,
          rejectUnauthorized: false
        };

        self.registry     = new Registry();
        self.rpcHandler   = new RPCHandler(undefined, self.registry); // Handler for remote method calls.
        self.discovery    = new Discovery(self.rpcHandler, [self.registry]);
        self.registry.registerObject(self.discovery);
        self.registry.loadModules(modules, self.rpcHandler); // load specified modules
        self.rpcHandler.setSessionId(self.sessionId);
        self.setMessageHandler();
        var pzh_connecting = require('./pzh_connecting.js');
        for (var key in self.config.otherCert) {
          if (!self.connectedPzh[key]) {
            var pzhConnect = new pzh_connecting(self);
            pzhConnect.connectOtherPZH(key, function(status) {
              self.log.info("connected to " + key);
            });
          }
        }

        if (typeof farm.server === "undefined" || farm.server === null) {
          self.log.error("farm is not running, please run webinos_pzh");
        } else {
          // This adds SNI context to existing running PZH server
          farm.server.addContext(uri, options);
        }

        callback(true, self);
      });
    }
  }
}

module.exports = Pzh;
