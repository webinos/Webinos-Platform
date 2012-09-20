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
    var log            = webinos.global.require(webinos.global.util.location, "lib/logging.js")(__filename);
    var authcode       = require("./pzh_authcode");
    var pzh_other      = require("./pzh_connecting");
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
  pzh_other.call(this);
  var sessionId    = ""; /** Holds PZH Session Id */
  var connectedPzp = {};/** Holds connected PZP information such as IP address and socket connection */
  this.expecting;    // Set by authcode directly

  var config      = {};/** Holds PZH Configuration particularly certificates */
  var connectedPzh= {};
  var messageHandler;
  var discovery;
  var rpcHandler;

  var self = this;
  /**
   * @description A generic function used to set message parameter
   * @param {String} from Source address
   * @param {String} to Destination address
   * @param {String} status This is a message type, different types are used as per message
   * @param {String|Object} message This could be a string or an object
   * @returns {Object} Message to be sent
   */
  function prepMsg (from, to, status, message) {
    var msg = null;
    if (from === null || to === null || status === null || message === null) {
      log.error("prep message failed");
    } else {
      msg = {"type"  : "prop",
        "from" : from,
        "to"   : to,
        "payload" : {"status" : status, "message" : message}};
    }
    return msg;
  }

  /**
   *
   */
  function sendMessage(message, address, conn) {
    var jsonString = JSON.stringify(message);
    var buf = session.common.jsonStr2Buffer(jsonString);

    log.info("send to "+ address + " message " + jsonString);

    try {
      if (connectedPzh.hasOwnProperty(address)) {
        // If it is connected to pzh it will land here
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
        log.info("client " + address + " is not connected");
      }
    } catch(err) {
      log.error("exception in sending packet " + err);
    }
  }

  function setMessageHandler() {
    messageHandler = new MessageHandler(rpcHandler);// handler of all things message
    var messageHandlerSend = function (message, address, object) {
      "use strict";
      object.sendMessage(message, address);
    };
    // Setting message handler to work with pzh instance
    messageHandler.setGetOwnId(sessionId);
    messageHandler.setObjectRef(this);
    messageHandler.setSendMessage(messageHandlerSend);
    messageHandler.setSeparator("/");
  }

  function sendServices(validMsgObj){
    var services = discovery.getAllServices(validMsgObj.from);
    var msg = prepMsg(sessionId, validMsgObj.from, "foundServices", services);
    msg.payload.id = validMsgObj.payload.message.id;
    sendMessage(msg, validMsgObj.from);
    log.info("sent " + (services && services.length) || 0 + " Webinos Services from this rpc handler.");
  }


  function initializeRPC(){
    var registry;
    registry     = new Registry();
    rpcHandler   = new RPCHandler(undefined, registry); // Handler for remote method calls.
    discovery    = new Discovery(rpcHandler, [registry]);

    registry.registerObject(discovery);
    registry.loadModules(config.defaultService, rpcHandler); // load specified modules
    rpcHandler.setSessionId(sessionId);
  }
  function storeData(user) {
    config.userData.name     = user.username;
    config.userData.email    = user.email;
    config.userData.country  = user.country;
    config.userData.image    = user.image;
    config.storeUserData(config.userData, function(status) {
      if(status){
        log.info("stored user data ")
      } else {
        log.error("failed saving pzh user data");
      }
    });
  }

  function sendPzhUpdate () {
    var otherPzh = [], status, i, msg;
    for(i in  connectedPzh) {
      if (connectedPzh.hasOwnProperty(i)) {
        otherPzh.push({name: i});
      }
    }
    // Send message to all connected pzp"s about new pzp that has joined in
    for(i in connectedPzp) {
      if (connectedPzp.hasOwnProperty(i)) {
        msg = prepMsg(sessionId, i, "pzhUpdate", otherPzh);
        sendMessage(msg, i);
      }
    }
  }

  function sendPzpUpdate (connSessionId, conn, port) {
    // Fetch details about connected pzp"s
    // Information to be sent includes address, id and indication which is a newPZP joining
    var otherPzp = [], i, msg;
    for(i in  connectedPzp) {
      if (connectedPzp.hasOwnProperty(i)) {
        // Special case for new pzp
        if (i === connSessionId) {
          connectedPzp[i].port = port;
          otherPzp.push({name: i, address:connectedPzp[i].address, port: port, newPzp: true});
        } else {
          otherPzp.push({name: i, address:connectedPzp[i].address, port: connectedPzp[i].port, newPzp: false});
        }
      }
    }
    // Send message to all connected pzp"s about new pzp that has joined in
    for(i in connectedPzp) {
      if (connectedPzp.hasOwnProperty(i)) {
        msg = prepMsg(sessionId, i, "pzpUpdate", otherPzp);
        sendMessage(msg, i);
      }
    }
  }

  function handlePzpAuthorization(data, conn) {
    var err, pzpId;
    pzpId = sessionId+"/"+data[2];

    log.info("pzp "+pzpId+"  connected");

    // Used for communication purpose. Address is used as PZP might have different IP addresses
    connectedPzp[pzpId] = {"socket": conn,  "address": conn.socket.remoteAddress};

    // Register PZP with message handler
    msg = messageHandler.registerSender(sessionId, pzpId);
    sendMessage(msg, pzpId);
    sendPzpUpdate();
  }

  function handlePzhAuthorization(data, conn) {
    var self = this;
    var  pzhId, otherPzh = [], msg, localServices;
    pzhId = data[1];

    log.info("pzh " + pzhId+" connected");
    self.connectedPzh[pzhId] = {"socket": conn,  "address": conn.socket.remoteAddress};
    // Register PZP with message handler
    msg = self.messageHandler.registerSender(self.sessionId, pzhId);
    self.sendMessage(msg, pzhId);

    var services = self.discovery.getAllServices();
    msg = self.prepMsg(self.sessionId, pzhId, "registerServices", services);
    sendMessage(msg, pzhId);

    log.info("sent " + (services && services.length) || 0 + " webinos services to " + pzhId);
    sendPzhUpdate();
  }



  /**
   * @description process incoming messages, message of type prop are only received while session is established. Rest of the time it is usually RPC messages
   * @param {Object} conn: It is used in special scenarios, when PZP is not connected and we need to send response back
   * @param {Object} msgObj: A message object received from other PZH or PZP.
   */
  function processMsg (conn, msgObj) {
    session.common.processedMsg(this, msgObj, function(validMsgObj) {
      log.info("received message" + JSON.stringify(validMsgObj));
      // Message sent by PZP connecting first time based on this message it generates client certificate
      if(validMsgObj.type === "prop" && validMsgObj.payload.status === "clientCert" ) {
        self.addNewPZPCert(validMsgObj, function(err, msg) {
          if (err !== null) {
            log.error(err);
            return;
          } else {
            sendMessage(msg, validMsgObj.from, conn);
            conn.socket.end();
          }
        });
      }
      else if (validMsgObj.type === "prop" && validMsgObj.payload.status === "pzpDetails") {
        log.info("receiving details from pzp...");
        sendPzpUpdate(validMsgObj.from, conn, validMsgObj.payload.message);
      }
      // information sent by connecting PZP about services it supports. These details are then used by findServices
      else if(validMsgObj.type === "prop" && validMsgObj.payload.status === "registerServices") {
        log.info("receiving Webinos services from pzp...");
        discovery.addRemoteServiceObjects(validMsgObj.payload.message);
      }
      // Send findServices information to connected PZP..
      else if(validMsgObj.type === "prop" && validMsgObj.payload.status === "findServices") {
        log.info("trying to send webinos services from this RPC handler to " + validMsgObj.from + "...");
        sendServices(validMsgObj);
      }
      // Message is forwarded to Messaging manager
      else {
        try {
          messageHandler.onMessageReceived(validMsgObj, validMsgObj.to);
        } catch (err2) {
          log.error("error message sending to messaging " + err2);
          return;
        }
      }
    });
  }
  /**
   * @description: Calls processmsg to handle incoming message to PZH. This is called by PZH Farm
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
      log.error("exception in processing recieved message " + err);
    } finally {
      conn.resume();
    }
  };

  function connectOtherPzh() {
    var key;
    for (key in config.cert.external) {
      if (!connectedPzh[key]) {
        this.connectOtherPZH(key, function(status, errorDetails) {
          if (!status) {
            log.error("connecting to pzh " + key + " failed - due to" + errorDetails);
          } else {
            log.info("connected to " + key);
          }
        });
      }
    }
  }

  function setOptions(value) {
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
    return {
      key  : value,
      cert : config.cert.internal.conn.cert,
      ca   : caList,
      crl  : crlList,
      requestCert: true,
      rejectUnauthorized: false
    };
  }

  this.addExternalCert = function(to, parse, res, callback) {
    if (!config.cert.external.hasOwnProperty(to)) {
      config.cert.external[to] = { cert: parse.payload.cert, crl: parse.payload.crl};
      config.storeCertificate(config.cert.external,"external", function(status, value) {
        if(status) {
          log.info("stored " + to + "in the external certificate list");
        } else {
          log.error("failed storing " + to + "in the external certificate list");
        }
      });
    }
    if (config.trustedList.pzh.indexOf(to) === -1) {
      config.trustedList.pzh.push(to);
      config.storeTrustedList(config.trustedList, function(status, value){
        if(status) {
          log.info("stored " + to + "in the trusted list");
        } else {
          log.error("failed storing " + to + "in the trusted list");
        }
      });
    }
    config.fetchKey(config.cert.internal.conn.key_id, function(status, value) {
      if (status) {
        if (res){
          var payload = {
            from: config.metaData.serverName,
            to: parse.to,
            payload: {
              status: "receiveCert",
              cert: config.cert.internal.master.cert,
              crl:  config.crl
            }
          };

          res.write(JSON.stringify(payload));
          res.end()
          return callback (config.metaData.serverName, setOptions(value));
        }
      } else {
        log.error("failed fetching keys");
      }
    });
  };
  /**
   * @description: Adds new PZP certificate. This is trigered by client, which sends its csr certificate and PZH signs certificate and return backs.
   * @param {Object} parse: It its is an object holding received message.
   */
  this.addNewPZPCert = function(parse, callback) {
    try {
      // Check QRCode if it is valid ..
      self.expecting.isExpectedCode(parse.payload.message.code, function(expected) {
        if (expected) {
          // Sign certificate based on received csr from client.
          // Also includes master key and master certificate for signing the certificate
          config.generateSignedCertificate(parse.payload.message.csr, 2, function(status, value) { // pzp = 2
            // unset expected QRCode
            if (status) {
              config.cert.internal.signedCert[parse.from] = value;
              self.expecting.unsetExpected(function() {
                config.storeCertificate(config.cert.internal, "internal", function(status, value){
                  // Send signed certificate and master certificate to PZP
                  var payload = {"clientCert": config.cert.internal.signedCert[parse.from], "masterCert":config.cert.internal.master.cert, "masterCrl": config.crl};
                  var msg = prepMsg(config.metaData.serverName, parse.from, "signedCert", payload);
                  // update configuration with signed certificate details ..
                  if(config.trustedList.pzp.indexOf(parse.from) === -1) {
                    config.trustedList.pzp.push(parse.from);
                    config.storeTrustedList(config.trustedList, function(){
                      log.info("stored pzp "+parse.from +" into the trusted list");
                    });
                  }
                  callback(true, msg);
                });
              });
            } else {
              callback(false, value);
            }
          });
        } else {
          callback(false, "failed to create client certificate: not expected code, please generate via PZH");// Fail message
        }
      });
    } catch (err) {
      log.error("error signing client certificate" + err);
      callback("false", "Could not create client certificate");
    }
  }
  // BELOW ARE PUBLIC API EXPOSED BY THE PZH \\
  /**
   * @description: Sets PZH URL id for storing information about QRCode
   * @param {function} cb: Callback to return result
   */
  this.getMyUrl = function(cb) {
    cb.call(this, config.metaData.serverName);
  };
  /**
   *
   * @param callback
   */
  this.listZoneDevices = function(callback) {
    "use strict";
    var result = {pzps: [], pzhs: []}, myKey;
    for (myKey=0; myKey < config.trustedList.pzp.length; myKey = myKey + 1){
      if (connectedPzp.hasOwnProperty(config.trustedList.pzp[myKey])){
        result.pzps.push({id: config.trustedList.pzp[myKey], cname: sessionId + "/"+config.trustedList.pzh[myKey], isConnected: true});
      } else {
        result.pzps.push({id: config.trustedList.pzp[myKey], cname: sessionId + "/"+config.trustedList.pzp[myKey], isConnected: false});
      }
    }
    for (myKey=0; myKey < config.trustedList.pzh.length; myKey = myKey + 1){
      if (connectedPzh.hasOwnProperty(config.trustedList.pzh[myKey])){
        result.pzhs.push({id: config.trustedList.pzh[myKey], cname: config.trustedList.pzh[myKey], isConnected: true});
      } else {
        result.pzhs.push({id: config.trustedList.pzh[myKey], cname: config.trustedList.pzh[myKey], isConnected: false});
      }
    }
    callback({to: config.metaData.serverName, cmd:"listDevices", payload:result});
  };
  /**
   *
   * @param callback
   */
  this.listPzp = function(callback) {
    var result = {signedCert: [], revokedCert: []}, myKey;
    for (myKey in config.cert.internal.signedCert){
      if (connectedPzp.hasOwnProperty(myKey)){
        result.signedCert.push({id: myKey, cname: sessionId + "/"+myKey, isConnected: true});
      } else {
        result.signedCert.push({id: myKey, cname: sessionId + "/"+myKey, isConnected: false});
      }
    }
    for (myKey in config.cert.internal.revokedCert){
      result.revokedCert.push({id: myKey, cname: sessionId + "/"+myKey, isConnected:"" })
    }
    callback({to: config.metaData.serverName, cmd:"listPzp", payload:result});
  };

  this.addOtherZoneCert = function (to, callback) {
    // temp solution till we decide how to trigger
    if (to && to.split('/')) {
      if (config.cert.external.hasOwnProperty(to)) {
        callback({cmd:'pzhPzh', to: config.metaData.serverName, payload: "already connected"});
      } else {
        this.sendCertificate(to, sessionId, config.metaData.serverName, config.userPref.ports.provider_webServer, config.cert.internal.master.cert, config.crl, callback);
      }
    } else {
      callback({cmd:'pzhPzh', to: config.metaData.serverName, payload: "connecting address is wrong"});
    }
  };
  /**
   *
   * @param callback
   */
  this.fetchUserData = function(callback) {
    callback( {to: config.metaData.serverName,
      cmd: "userDetails",
      payload: {
        email     : config.userData.email,
        country   : config.userData.country,
        image     : config.userData.image,
        name      : config.userData.name,
        servername: config.metaData.serverName
      }
    });
  };

  /**
   *
   * @param callback
   */
  this.fetchLogs = function(type, callback){
    log.fetchLog(type, config.metaData.webinosType, config.metaData.friendlyName, function(data) {
      var payload
      if (type === "error") {
        payload = {to: config.metaData.serverName, cmd:"crashLog", payload:data};
      } else {
        payload = {to: config.metaData.serverName, cmd:"infoLog", payload:data};
      }
      callback(payload);
    });
  };
 /**
   * @description: ADDs PZH in a farm ..
   * @param {string} uri: pzh url you want to add .. assumption it is of form pzh.webinos.org/nick
   * @param {object} modules: modules that will be supported on PZH
   * @param {function} callback: returns instance of PZH
   */
  this.addPzh = function (friendlyName, uri, user, callback) {
    var options;
    authcode.createAuthCounter(function (res) {
     self.expecting = res;
    });
    config = new session.configuration();
    config.setConfiguration(friendlyName, "Pzh", uri, function (status, value) {
      if (status) {
        sessionId = uri.split("/")[1];
        log.addId(sessionId);
        initializeRPC();
        setMessageHandler();
        connectOtherPzh();
        options = setOptions(value);
        if(typeof user !== "undefined" && user !== "") {
          storeData(user);
        }
        return callback(true, options, uri);
      } else {
        return callback(false, value);
      }
    });
  };
  /**
   * @description Responsible for adding PZH and PZP. It also is responsible for registering with message handler and dessimenating information about connected PZP"s to other PZP
   * @param {Object} conn: Connection object when any new connection is accepted.
   */
  this.handleConnectionAuthorization = function(conn) {
    // Allows PZP to connect if it has proper QRCode
    if(conn.authorized === false) {
      log.info(" connection NOT authorised at pzh");
      //If this is a new PZP, we allow if it has proper QRCode
      self.expecting.isExpected(function(expected) {
        if (!expected || conn.authorizationError !== "UNABLE_TO_GET_CRL" ){
          //we"re not expecting anything - disallow.
          log.info("ending connect: " + conn.authorizationError);
          conn.socket.end();
        } else {
          log.info("continuing connect - expected: " + conn.authorizationError);
        }
      });
    }

    if(conn.authorized) {// PZP/PZH connecting with proper certificate at both ends
      var cn;
      log.info("connection authorised at pzh");
      try {
        cn = conn.getPeerCertificate().subject.CN;// Get peer common name from the certiicate
        cn = decodeURIComponent(cn);
        cn = cn.split(":");
      } catch(err) {
        log.error("exception in reading common name of peer pzh certificate " + err);
        return;
      }

      if(cn[0] === "Pzh" ) {
        handlePzhAuthorization(cn, conn);
      } else if(cn[0] === "Pzp" ) {
        handlePzpAuthorization(cn, conn);
      }
    }
  };
  this.getSessionId = function(){
    return sessionId;
  }

};

util.inherits(Pzh, pzh_other);
module.exports = Pzh;
