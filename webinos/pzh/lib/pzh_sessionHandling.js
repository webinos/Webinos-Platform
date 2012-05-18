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
* @description session_pzh.js starts Pzh and handle communication with a messaging 
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
    var log            = webinos.global.require(webinos.global.pzp.location, "lib/session").common.debugPzh;
    var session        = webinos.global.require(webinos.global.pzp.location, "lib/session");
    var rpc            = webinos.global.require(webinos.global.rpc.location, "lib/rpc");
    var MessageHandler = webinos.global.require(webinos.global.manager.messaging.location, "lib/messagehandler").MessageHandler;
    var RPCHandler     = rpc.RPCHandler;
    var authcode       = require("./pzh_authcode");
    var farm           = require("./pzh_farm");
  } catch (err) {
    console.log("[ERROR] Webinos modules missing, please check webinos installation" + err);
    return;
  }
}

/**
* @description Creates a new Pzh object
* @constructor
*/
var Pzh = function (modules) {
  this.sessionId    = ""; /** Holds PZH Session Id */
  this.config       = {};/** Holds PZH Configuration particularly certificates */
  this.connectedPzh = {};/** Holds Connected PZH information such as IP address, port and socket */
  this.connectedPzp = {};/** Holds connected PZP information such as IP address and socket connection */
  this.rpcHandler = new RPCHandler();// Handler for remote method calls.
  this.messageHandler = new MessageHandler(this.rpcHandler);// handler of all things message
  this.rpcHandler.loadModules(modules);// load specified modules
  this.expecting;    // Set by authcode directly
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
    log(this.sessionId, "INFO", "Prep message failed");
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
  var buf = new Buffer(4 + jsonString.length, 'utf8');
  buf.writeUInt32LE(jsonString.length, 0);
  buf.write(jsonString, 4);

  log(self.sessionId, 'INFO', '[PZH -'+ self.sessionId+'] Send to '+ address + ' Message ' + jsonString);
  
  try {
    if (self.connectedPzh.hasOwnProperty(address)) {
      self.connectedPzh[address].socket.pause();
      self.connectedPzh[address].socket.write(buf);
      self.connectedPzh[address].socket.resume();
    } else if (self.connectedPzp.hasOwnProperty(address)) {
      self.connectedPzp[address].socket.pause();
      self.connectedPzp[address].socket.write(buf);
      self.connectedPzp[address].socket.resume();
    } else if( typeof conn !== "undefined" ) {
      conn.pause();
      conn.write(buf);
      conn.resume();
    } else {// It is similar to PZP connecting to PZH but instead it is PZH to PZH connection
      log(self.sessionId, 'INFO', '[PZH -'+ self.sessionId+'] Client ' + address + ' is not connected');
    }
  } catch(err) {
    log(self.sessionId, 'ERROR', '[PZH -'+ self.sessionId+'] Exception in sending packet ' + err);
  }
};

/**
* @description Responsible for adding PZH and PZP. It also is responsible for registering with message handler and dessimenating information about connected PZP"s to other PZP
* @param {Object} self: PZH instance
* @param {Object} conn: Connection object when any new connection is accepted.
*/
Pzh.prototype.handleConnectionAuthorization = function (self, conn) {
  var msg;
  /**
  * Allows PZP to connect if it has proper QRCode
  */
  if(conn.authorized === false) {
    log(self.sessionId, "INFO", "[PZH -"+self.sessionId+"] Connection NOT authorised at PZH");
    /**
    * @descriptpzhion: If this is a new PZP, we allow if it has proper QRCode
    */
    self.expecting.isExpected(function(expected) {
      if (!expected || conn.authorizationError !== "UNABLE_TO_GET_CRL"){
        //we"re not expecting anything - disallow.
        log(self.sessionId, "INFO", "Ending connect: " + conn.authorizationError);
        conn.socket.end();
      } else {
        log(self.sessionId, "INFO","Continuing connect - expected: " + conn.authorizationError);
      }
    });
  }

  /**
  * PZP/PZH connecting with proper certificate at both ends
  */
  if(conn.authorized) {
    var cn, data;
    log(self.sessionId, 'INFO', '[PZH-'+self.sessionId+'] Connection authorised at PZH');
    try {
      // Get peer certificate details from the certiicate
      cn = conn.getPeerCertificate().subject.CN;
      var text = decodeURIComponent(cn);
      data = text.split(':');
    } catch(err) {
      log(self.sessionId, 'ERROR', '[PZH-'+self.sessionId+'] Exception in reading common name of peer PZH certificate ' + err);
      return;
    }
    /**
      * Connecting PZH details are fetched from the certiciate and then information is stored in internal structures of PZH
      */
    if(data[0] === 'Pzh' ) {
      var  pzhId, otherPzh = [], myKey;
      try {
        pzhId = data[1];
      } catch (err1) {
        log(self.sessionId, 'ERROR', '[PZH -'+self.sessionId+'] Pzh information in certificate is in unrecognized format ' + err1);
        return;
      }

      log(self.sessionId, "INFO", "[PZH -"+self.sessionId+"] PZH "+pzhId+" Connected");
      if(!self.connectedPzh.hasOwnProperty(pzhId)) {
        
      }
      /**
       * Authorized PZP session handling
       */
    } else if(data[0] === "Pzp" ) {
      var sessionId, err1;
      try {
        sessionId = self.sessionId+"/"+data[1];
      } catch(err1) {
        log(self.sessionId, "ERROR ","[PZH  -" + self.sessionId + "] Exception in reading common name of PZP certificate " + err1);
        return;
      }
      log(self.sessionId, "INFO", "[PZH -"+self.sessionId+"] PZP "+sessionId+" Connected");

      // Used for communication purpose. Address is used as PZP might have different IP addresses
      self.connectedPzp[sessionId] = {"socket": conn,  "address": conn.socket.remoteAddress};

      // Register PZP with message handler
      msg = self.messageHandler.registerSender(self.sessionId, sessionId);
      self.sendMessage(msg, sessionId);
    }
    farm.pzhWI.updateList(self);
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
    log(this.sessionId, 'ERROR', '[PZH] Exception in processing recieved message ' + err);
  } finally {
    conn.resume();
  }
};

Pzh.prototype.sendPzpUpdate = function (sessionId, conn, port) {
  // Fetch details about connected pzp"s
  // Information to be sent includes address, id and indication which is a newPZP joining
  var self = this;
  // Fetch details about connected pzp"s
  // Information to be sent includes address, id and indication which is a newPZP joining
  var otherPzp = [], status;
  for(var i in  self.connectedPzp) {
    if (self.connectedPzp.hasOwnProperty(i)) {
      // Special case for new pzp
      if (i === sessionId) {
        status = true;
      } else {
        status = false;
      }
      otherPzp.push({name: i, address:self.connectedPzp[i].address, port: port, newPzp: status});
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
  cb.call(this, this.config.servername);
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
        log(self.sessionId, "INFO", "[PZH -"+self.sessionId+"] Failed to create client certificate: not expected code, please generate via PZH");
        cb.call(self, null, msg);
      }
    });
  } catch (err) {
    log(self.sessionId, "ERROR ", "[PZH -"+self.sessionId+"] Error Signing Client Certificate" + err);
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
    log(self.sessionId, 'DEBUG', '[PZH -'+self.sessionId+'] Received message' + JSON.stringify(validMsgObj));
    // Message sent by PZP connecting first time based on this message it generates client certificate
    if(validMsgObj.type === 'prop' && validMsgObj.payload.status === 'clientCert' ) {
      self.addNewPZPCert(validMsgObj, function(err, msg) {
        if (err !== null) {
          log(self.sessionId, 'INFO', err);
          return;
        } else {
          self.sendMessage(msg, validMsgObj.from, conn);
          conn.socket.end();
        }
      });
    }
    else if (validMsgObj.type === "prop" && validMsgObj.payload.status === "pzpDetails") {
      log(self.sessionId, "INFO", "[PZH -"+ self.sessionId+"] Receiving details from PZP...");
      self.sendPzpUpdate(validMsgObj.from, conn, validMsgObj.payload.message);
    }
    // information sent by connecting PZP about services it supports. These details are then used by findServices 
    else if(validMsgObj.type === "prop" && validMsgObj.payload.status === 'registerServices') {
      log(self.sessionId, 'INFO', '[PZH -'+ self.sessionId+'] Receiving Webinos Services from PZP...');
      self.rpcHandler.addRemoteServiceObjects(validMsgObj.payload.message);
    }   
    // Send findServices information to connected PZP..
    else if(validMsgObj.type === "prop" && validMsgObj.payload.status === 'findServices') {
      log(self.sessionId, 'INFO', '[PZH -'+ self.sessionId+'] Trying to send Webinos Services from this RPC handler to ' + validMsgObj.from + '...');
      var services = self.rpcHandler.getAllServices(validMsgObj.from);
      var msg = self.prepMsg(self.sessionId, validMsgObj.from, 'foundServices', services);
      msg.payload.id = validMsgObj.payload.message.id;
      self.sendMessage(msg, validMsgObj.from);
      log(self.sessionId, 'INFO', '[PZH -'+ self.sessionId+'] Sent ' + (services && services.length) || 0 + ' Webinos Services from this RPC handler.');
    }
    // Message is forwarded to Messaging manager
    else {
      try {
        self.messageHandler.onMessageReceived(validMsgObj, validMsgObj.to);
      } catch (err2) {
        log(self.sessionId, 'ERROR', '[PZH -'+ self.sessionId+'] Error Message Sending to Messaging ' + err2);
        return;
      }
    }
  }); 
};

Pzh.prototype.setMessageHandler = function() {
  var self = this;
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
exports.addPzh = function ( uri, modules, callback) {
  if (typeof farm.server === "undefined" || farm.server === null) {
    log(null, "ERROR", "[PZH] Farm is not running, please startFarm");
    callback(false);
  } else {
    if (typeof uri === "undefined" || uri === "null" || typeof modules === "undefined" || modules === "null" ){
      log(null, "ERROR","PZH could not be started as one of the details are missing ");
      callback(false);
    } else {
      var name = uri.split("/")[1];
      var instance  = new Pzh(modules);

      authcode.createAuthCounter(function (res) {
        instance.expecting = res;
      });
      session.configuration.setConfiguration(name, "Pzh", uri, function(config, conn_key) {
        instance.config    = config;
        instance.sessionId = name ; 
        instance.modules   = modules;     // modules loaded in pzh
        instance.config.serverName = uri; // pzh servername
        farm.pzhs[uri] = instance;
        farm.config.pzhs[uri] = modules;
        // Certificate parameters that will be added in SNI context of farm
        var options = {
          key  : conn_key,
          cert : config.own.cert,
          ca   : [config.master.cert],
          crl  : [config.master.crl],
          requestCert: true,
          rejectUnauthorized: false
        };
        instance.setMessageHandler();
        // RPC instance getting PZH session id
        instance.rpcHandler.setSessionId(instance.sessionId);

        if (typeof farm.server === "undefined" || farm.server === null) {
          log(instance.sessionId, "ERROR", "[PZH -"+ instance.sessionId+"] Farm is not running, please startFarm");
        } else {
          // This adds SNI context to existing running PZH server
          farm.server.addContext(uri, options);
        }

        session.configuration.storeConfig(farm.config, function() {
          callback(true, instance);
        });
      });
    }
  }
}

