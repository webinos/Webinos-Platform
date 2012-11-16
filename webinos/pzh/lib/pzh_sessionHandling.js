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
var tls = require("tls"),
  fs = require("fs"),
  path = require("path"),
  crypto = require("crypto"),
  util = require("util");

if (typeof exports !== "undefined") {
  try {
    var webinos        = require("find-dependencies")(__dirname);
    var session        = webinos.global.require(webinos.global.pzp.location, "lib/session");
    var rpc            = webinos.global.require(webinos.global.rpc.location);
    var Registry       = webinos.global.require(webinos.global.rpc.location, "lib/registry").Registry;
    var Discovery      = webinos.global.require(webinos.global.api.service_discovery.location, "lib/rpc_servicedisco").Service;
    var MessageHandler = webinos.global.require(webinos.global.manager.messaging.location, "lib/messagehandler").MessageHandler;
    var RPCHandler     = rpc.RPCHandler;
    var logging        = webinos.global.require(webinos.global.util.location, "lib/logging.js") || console;
    var authcode       = require("./pzh_authcode");
    var pzh_pzh        = require("../web/pzh_pzh_certificateExchange");
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
  "use strict";
  var sessionId    = ""; // Holds PZH Session Id
  var connectedPzp = {};// Holds connected PZP information such as IP address and socket connection
  var logger;
  var config      = {};// Holds PZH Configuration particularly certificates
  var connectedPzh= {};
  var messageHandler;
  // TODO: REMOVE ALL THIS PUBLIC VARIABLES
  this.listenerMap= {}; // holds listeners/callbacks, mostly for pzh internal api
  this.discovery;
  this.registry;
  this.rpcHandler;
  this.expecting;        // Set by authcode directly
  this.modules;         // holds startup modules
  var self = this;

  /**
   * prepares prop message to send between entities in webinos framework
   * @param from
   * @param to
   * @param status
   * @param message
   * @return {Object}
   */
  function prepMsg (from, to, status, message) {
    return {"type"  : "prop",
        "from" : from,
        "to"   : to,
        "payload" : {"status" : status, "message" : message}
    };
  }
  /**
   * Sends the message over socket to connected endpoints
   * @param message
   * @param address
   * @param conn
   */
  function sendMessage(message, address, conn) {
    var jsonString = JSON.stringify(message);
    var buf = session.common.jsonStr2Buffer(jsonString);

    logger.log("send to "+ address + " message " + jsonString);

    try {
      if (connectedPzh.hasOwnProperty(address)) {// If it is connected to pzh it will land here
        connectedPzh[address].socket.pause();
        connectedPzh[address].socket.write(buf);
        connectedPzh[address].socket.resume();
      } else if (connectedPzp.hasOwnProperty(address)) {
        connectedPzp[address].socket.pause();
        connectedPzp[address].socket.write(buf);
        connectedPzp[address].socket.resume();
      } else if( typeof conn !== "undefined" ) {
        conn.pause();
        conn.write(buf);
        conn.resume();
      } else {// It is similar to PZP connecting to PZH but instead it is PZH to PZH connection
        logger.log("client " + address + " is not connected");
      }
    } catch(err) {
      logger.error("exception in sending packet " + err);
    }
  }
  function sendMsgAllPzp(_cmd, _msg){
    var msg, i;
    // Send message to all connected pzp"s about new pzp that has joined in
    for(i in connectedPzp) {
      if (connectedPzp.hasOwnProperty(i)) {
        msg = prepMsg(sessionId, i, _cmd, _msg);
        sendMessage(msg, i);
      }
    }
  }

   /**
   *
   */
  function initializeRPC(){

    self.registry     = new Registry();
    self.rpcHandler   = new RPCHandler(undefined, self.registry); // Handler for remote method calls.
    self.discovery    = new Discovery(self.rpcHandler, [self.registry]);
    self.registry.registerObject(self.discovery);
    self.registry.loadModules(config.serviceCache, self.rpcHandler); // load specified modules
    self.rpcHandler.setSessionId(sessionId);
  }
  /**
   *
   */
  function setMessageHandler_RPC() {
    initializeRPC();
    messageHandler = new MessageHandler(self.rpcHandler);// handler of all things message
    var messageHandlerSend = function (message, address, object) {
      "use strict";
      sendMessage(message, address);
    };
    // Setting message handler to work with pzh instance
    messageHandler.setGetOwnId(sessionId);
    messageHandler.setObjectRef(this);
    messageHandler.setSendMessage(messageHandlerSend);
    messageHandler.setSeparator("/");
  }
  /**
   * Send services to other connected pzh
   * @param validMsgObj
   */
  function sendFoundServices(validMsgObj){
    var services = self.discovery.getAllServices(validMsgObj.from);
    var msg = prepMsg(sessionId, validMsgObj.from, "foundServices", services);
    msg.payload.id = validMsgObj.payload.message.id;
    sendMessage(msg, validMsgObj.from);
    logger.log("sent " + (services && services.length) || 0 + " Webinos Services from this rpc handler.");
  }

  /**
   *
   * @param user
   */
  function storeUserData(user) {
    if (config.userData && config.userData.name !== user.username) {
      config.userData.name     = user.username;
      config.userData.email    = user.email;
      config.userData.country  = user.country;
      config.userData.image    = user.image;
    }
  }

  /**
   *
   */
  function sendPzhUpdate () {
    var otherPzh = [], status, i, msg;
    for(i in  connectedPzh) {
      if (connectedPzh.hasOwnProperty(i)) {
        otherPzh.push({name: i});
      }
    }
    sendMsgAllPzp("pzhUpdate", otherPzh);
  }
  /**
   * Fetch details about connected pzp"s.  Information to be sent includes address, id and indication which is a newPZP joining
   * @param connSessionId
   * @param port
   */
  function sendPzpUpdate (connSessionId, port) {
    var otherPzp = [], i;
    for(i in  connectedPzp) {
      if (connectedPzp.hasOwnProperty(i)) {
        if (i === connSessionId) {        // Special case for new pzp
          connectedPzp[i].port = port;
          otherPzp.push({name: i, address:connectedPzp[i].address, port: port, newPzp: true});
        } else {
          otherPzp.push({name: i, address:connectedPzp[i].address, port: connectedPzp[i].port, newPzp: false});
        }
      }
    }
    sendMsgAllPzp("pzpUpdate", otherPzp);
  }
  /**
   *
   * @return {Object}
   */
  function setOptions(callback) {
    config.fetchKey(config.cert.internal.conn.key_id, function(status, value){
      if(status){
        var caList = [], crlList = [], key;

        caList.push(config.cert.internal.master.cert);
        crlList.push(config.crl);

        for ( key in config.cert.external) {
          if(config.cert.external.hasOwnProperty(key)) {
            caList.push(config.cert.external[key].cert);
            crlList.push(config.cert.external[key].crl);
          }
        }
        // Certificate parameters that will be added in SNI context of farm
        callback(true, {
          key  : value,
          cert : config.cert.internal.conn.cert,
          ca   : caList,
          crl  : crlList,
          requestCert: true,
          rejectUnauthorized: true
        });
      } else {
        callback(false, {});
      }
    });
  }
  /**
   *
   * @param pzpId
   * @param conn
   */
  function handlePzpAuthorization(pzpId, conn) {
    var err, msg;
    pzpId = config.metaData.serverName + "/" + pzpId;
    logger.log("pzp "+pzpId+"  connected");
    connectedPzp[pzpId] = {"socket": conn,  "address": conn.socket.remoteAddress};
    conn.id = pzpId;
    msg = messageHandler.registerSender(sessionId, pzpId);
    sendMessage(msg, pzpId);
    sendPzpUpdate(pzpId);
  }
  /**
   *
   * @param pzhId
   * @param conn
   */
  function handlePzhAuthorization(pzhId, conn) {
    var  otherPzh = [], msg, localServices;
    if (!connectedPzh.hasOwnProperty(pzhId)) {
      logger.log("pzh " + pzhId+" connected");
      connectedPzh[pzhId] = {"socket": conn,  "address": conn.socket.remoteAddress};
      conn.id = pzhId;

      msg = messageHandler.registerSender(config.metaData.serverName, pzhId);
      sendMessage(msg, pzhId);

      localServices = self.discovery.getAllServices();
      msg = prepMsg(config.metaData.serverName, pzhId, "registerServices", {services:localServices, from:config.metaData.serverName});
      sendMessage(msg, pzhId);

      logger.log("sent " + (localServices && localServices.length) || 0 + " webinos services to " + pzhId);
      sendPzhUpdate();
    } else {
      logger.log("pzh -" + pzhId + " already connected");
    }
  }

  /**
   * Process incoming messages, message of type prop are only received while session is established. Rest of the time it
   * is usually RPC messages
   * @param {Object} conn: It is used in special scenarios, when PZP is not connected and we need to send response back
   * @param {Object} msgObj: A message object received from other PZH or PZP.
   */
  function processMsg (conn, msgObj) {
    session.common.processedMsg(this, msgObj, function(validMsgObj) {
      logger.log("received message" + JSON.stringify(validMsgObj));
      if(validMsgObj.type === "prop" && validMsgObj.payload.status === "clientCert" ) {
        self.addNewPZPCert(validMsgObj, function(err, msg) { // Message sent by PZP connecting first time based on this message it generates client certificate
          sendMessage(msg, validMsgObj.from, conn);
          conn.socket.end();
        });
      } else if (validMsgObj.type === "prop" && validMsgObj.payload.status === "pzpDetails") {
        logger.log("receiving details from pzp...");
        sendPzpUpdate(validMsgObj.from, conn, validMsgObj.payload.message);
      } else if(validMsgObj.type === "prop" && validMsgObj.payload.status === "registerServices") {
        logger.log("receiving Webinos services from pzh/pzp..."); // information sent by connecting PZP about services it supports. These details are then used by findServices
        self.discovery.addRemoteServiceObjects(validMsgObj.payload.message);
      } else if(validMsgObj.type === "prop" && validMsgObj.payload.status === "findServices") {
        logger.log("trying to send webinos services from this RPC handler to " + validMsgObj.from + "...");
        sendFoundServices(validMsgObj);
      } else if(validMsgObj.type === "prop" && validMsgObj.payload.status === "unregServicesReply") {
        logger.log("receiving initial modules from pzp...");
        if (!validMsgObj.payload.id) {
          logger.error("cannot find callback");
          return;
        }
        self.listenerMap[validMsgObj.payload.id](validMsgObj.payload.message);
        delete self.listenerMap[validMsgObj.payload.id];
      } else { // Message is forwarded to Messaging manager
        try {
          messageHandler.onMessageReceived(validMsgObj, validMsgObj.to);
        } catch (err2) {
          logger.error("error message sending to messaging " + err2.message);
        }
      }
    });
  }
  /**
   *
   */
  function connectOtherPzh(){
    var key;
    setOptions(function(status, options) {
      for (key = 0; key <  config.trustedList.pzh.length; key = key + 1) {
        if (!connectedPzh.hasOwnProperty(config.trustedList.pzh[key])) {
          connectOtherPZH(config.trustedList.pzh[key], options, config.userPref.ports.provider,
          function(status, errorDetails) {
            if (!status) {
              logger.error("connecting to pzh failed - due to" + errorDetails);
            }
          });
        }
      }
    });
  }

  function connectOtherPZH (to, options, port, callback) {
    try {
      var connPzh, serverName = to.split("_")[0];
      options.servername = to;
      connPzh = tls.connect(port, serverName, options, function() {
        logger.log("connection status : "+connPzh.authorized);
        if(connPzh.authorized) {
          logger.log("connected to " + to);
          handlePzhAuthorization(to, connPzh);
         } else {
          logger.error("connection authorization Failed - "+connPzh.authorizationError);
        }
        if (callback) {callback({cmd:'pzhPzh', to: config.metaData.serverName, payload:connPzh.authorized});}
      });
      connPzh.on("data", function(buffer) {
        self.handleData(connPzh, buffer);
      });
      connPzh.on("error", function(err) {
        logger.error(err.message);
      });
     connPzh.on("end", function() {
        self.removeRoute(connPzh.id);
     });
  } catch (err) {
     logger.error("connecting other pzh failed in setting configuration " + err);
     callback(false, err);
   }
 }

  /**
   * This is a function on receiving end in PZH - PZH certificate exchange.
   * @param parse
   * @param callback
   */
  this.addExternalCert = function(parse, callback) {
    if (!config.cert.external.hasOwnProperty(parse.from)) {
      config.cert.external[parse.from] = { cert: parse.payload.message.cert, crl: parse.payload.message.crl};
      config.storeCertificate(config.cert.external,"external");
    }
    if (config.trustedList.pzh.indexOf(parse.from) === -1) {
      config.trustedList.pzh.push(parse.from);
      config.storeTrustedList(config.trustedList);
    }
    setOptions(function(status, options){
      if (status) {
        return callback (config.metaData.serverName, options, config.cert.internal.master.cert, config.crl);
      } else {
        return callback();
      }
    });
  };

  this.addOtherZoneCert = function(from, fetchPzh, refreshCert, callback) {
    if(config.trustedList.pzh.indexOf(from) !== -1) {
      callback({to: config.metaData.serverName, cmd: 'pzhPzh', payload: "PZH already connected"})
    } else if (from === config.metaData.serverName) {
      callback({to: config.metaData.serverName, cmd: 'pzhPzh', payload: "Trying to connect own PZH"})
    } else {
      pzh_pzh.sendCertificate(from, config.metaData.serverName, config.userPref.ports.provider_webServer, config.userPref.ports.provider,
        config.cert.internal.master.cert, config.crl,fetchPzh, refreshCert, connectOtherPZH, callback);
    }
  };
  /**
   * Calls processmsg to handle incoming message to PZH. This is called by PZH provider
   * @param {Object} conn: Socket connection details of client socket ..
   * @param {Buffer} buffer: Incoming data received from other PZH or PZP
   */
  this.handleData=function(conn, buffer) {
    try {
      conn.pause();
      session.common.readJson(this, buffer, function(obj) {
        processMsg(conn, obj);
      });
    } catch (err) {
      logger.error("exception in processing received message " + err);
    } finally {
      conn.resume();
    }
  };
  /**
   * Responsible for adding PZH and PZP. It also is responsible for registering wit
   * h message handler and disseminating information about connected PZP"s to other PZP
   * @param {Object} conn: Connection object when any new connection is accepted.
   */
  this.handleConnectionAuthorization = function(conn) {
    if(conn.authorized === false) {// Allows PZP to connect if it has proper QRCode
      logger.log(" connection NOT authorised at pzh - " +  conn.authorizationError);
      conn.socket.end();
    }

    if(conn.authorized) {// PZP/PZH connecting with proper certificate at both ends
      var cn;
      logger.log("connection authorised at pzh");
      try {
        cn = decodeURIComponent(conn.getPeerCertificate().subject.CN);// Get peer common name from the certificate
        cn = cn.split(":");
      } catch(err) {
        logger.error("exception in reading common name of peer pzh certificate " + err);
        return;
      }

      if(cn[0] === "Pzh" ) {
        cn = conn.getPeerCertificate().subjectaltname.split(":");
        handlePzhAuthorization(cn[1], conn);
      } else if(cn[0] === "Pzp" ) {
        handlePzpAuthorization(cn[1], conn);
      }
    }
  };
  this.revokeCert = function(pzpid, refreshCert, callback) {
    var index, pzpCert = config.cert.internal.signedCert[pzpid];
    config.revokeClientCert(pzpCert, function(status, crl) {
      if (status) {
        logger.log("revocation success! " + pzpid + " should not be able to connect anymore ");
        config.crl = crl;
        delete config.cert.internal.signedCert[pzpid] ;
        index = config.trustedList.pzp.indexOf(pzpid) ;
        config.trustedList.pzp.splice(index,1);
        config.cert.internal.revokedCert[pzpid] = crl;
        config.storeAll();
        if (connectedPzp[pzpid]){
          connectedPzp[pzpid].socket.end();
          delete connectedPzp[pzpid];
        }
        setOptions(function(status, options){
          if(status){
            refreshCert(config.metaData.serverName, options);
          }
        });
        callback({cmd:"revokePzp", to:config.metaData.serverName, payload: pzpid});
      }
    });
  };

  this.removeRoute = function(id) {
    if (connectedPzp.hasOwnProperty(id)) {
      messageHandler.removeRoute(id, config.metaData.serverName);
      delete connectedPzp[id];
    }
    if (connectedPzh.hasOwnProperty(id)) {
      messageHandler.removeRoute(id, config.metaData.serverName);
      delete connectedPzh[id];
    }
  };
  /**
   * Adds new PZP certificate. This is triggered by client, which sends its csr certificate and PZH signs
   * certificate and return backs.
   * @param {Object} parse It its is an object holding received message.
   */
  this.addNewPZPCert = function(parse, callback) {
    try {
      var msg;
      var pzpId = sessionId +"/"+ parse.from;
      if (config.cert.internal.revokedCert[pzpId]) {
        msg =prepMsg(config.metaData.serverName,pzpId, "error", "pzp was previously revoked");
        callback(false, msg);
        return
      }
      self.expecting.isExpectedCode(parse.payload.message.code, function(expected) { // Check QRCode if it is valid ..
        if (expected) {
          config.generateSignedCertificate(parse.payload.message.csr, 2, function(status, value) { // Sign certificate based on received csr from client.// pzp = 2
            if (status) { // unset expected QRCode
              config.cert.internal.signedCert[pzpId] = value;
              self.expecting.unsetExpected(function() {
                config.storeCertificate(config.cert.internal, "internal");
                if(config.trustedList.pzp.indexOf(pzpId) === -1) {// update configuration with signed certificate details ..
                  config.trustedList.pzp.push(pzpId);
                  config.storeTrustedList(config.trustedList);
                }
                var payload = {"clientCert": config.cert.internal.signedCert[pzpId], "masterCert":config.cert.internal.master.cert, "masterCrl": config.crl};// Send signed certificate and master certificate to PZP
                msg = prepMsg(config.metaData.serverName, pzpId, "signedCert", payload);
                callback(true, msg);
              });
            } else {
              msg =prepMsg(config.metaData.serverName, parse.from, "error", value);
              callback(false, msg);
            }
          });
        } else {
          msg =prepMsg(config.metaData.serverName, parse.from, "error", "not expecting new pzp");
          callback(false, msg);// Fail message
        }
      });
    } catch (err) {
      logger.error("error signing client certificate" + err);
      msg =prepMsg(config.metaData.serverName, parse.from, "error", err.message);
      callback(false, msg);
    }
  };
  /**
   * ADDs PZH in a provider
   * @param friendlyName this name is used for creating configuration
   * @param uri pzh url you want to add, assumption it is of form pzh.webinos.org/bob@webinos.org
   * @param user details of the owner of the PZH
   * @param callback returns instance of PZH
   */
  this.addLoadPzh = function (friendlyName, uri, user, callback) {
    var options;
    logger = new logging(__filename); // log is initialized in order to show log as per sessions
    authcode.createAuthCounter(function (res) {
      self.expecting = res;
    });
    config = new session.configuration();
    storeUserData(user);
    config.setConfiguration(friendlyName, "Pzh", uri, function (status, value) {
      if (status) {
        sessionId = uri;
        logger.addId(sessionId);
        setMessageHandler_RPC();
        connectOtherPzh();
        setOptions(function(status, options) {
          if (status) {
            return callback(true, options, uri);
          }
        });
      } else {
        return callback(false, value);
      }
    });
  };

  /**
   * TEMP Solution to get register/unregister working:
   * @param data
   * @param id
   */
  this.sendMessage = function(data, id) {
    sendMessage(data, id);
  };
  this.getInitModules = function() {
    return config.serviceCache;
  };
  this.addMsgListener = function (callback) {
    var id = (parseInt((1 + Math.random()) * 0x10000)).toString(16).substr(1);
    this.listenerMap[id] = callback;
    return id;
  };
  this.getConnectedPzp = function() {
    var myKey, pzps = [];
    for (myKey=0; myKey < config.trustedList.pzp.length; myKey = myKey + 1){
      if (connectedPzp.hasOwnProperty(config.trustedList.pzp[myKey])){
        pzps.push({id: config.trustedList.pzp[myKey].split("/")[1], url: config.trustedList.pzp[myKey], isConnected: true});
      } else {
        pzps.push({id: config.trustedList.pzp[myKey].split("/")[1], url: config.trustedList.pzp[myKey], isConnected: false});
      }
    }
    return pzps;
  };
  this.getConnectedPzh = function() {
    var pzhs = [], myKey;
    for (myKey=0; myKey < config.trustedList.pzh.length; myKey = myKey + 1){
      if (connectedPzh.hasOwnProperty(config.trustedList.pzh[myKey])){
        pzhs.push({id: config.trustedList.pzh[myKey].split("_")[1], url: config.trustedList.pzh[myKey], isConnected: true});
      } else {
        pzhs.push({id: config.trustedList.pzh[myKey].split("_")[1], url: config.trustedList.pzh[myKey], isConnected: false});
      }
    }
    pzhs.push({id: config.metaData.serverName.split("_")[1] + " (Your Pzh)", url: config.metaData.serverName, isConnected: true});
    return pzhs;
  };
  this.getRevokedCert = function(){
    var revokedCert = [], myKey;
    for (myKey in config.cert.internal.revokedCert){
      if (config.cert.internal.revokedCert.hasOwnProperty(myKey)){
        revokedCert.push({id: myKey, url: myKey, isConnected: false});
      }
    }
    return revokedCert;
  };
  this.getUserDetails = function(){
    return config.userData;
  };
  this.getSessionId = function() {
    return config.metaData.serverName;
  };
  this.getFriendlyName = function() {
    return config.metaData.friendlyName;
  };
};

module.exports = Pzh;
