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
 * @description It starts Pzp and handle communication with web socket server.
 * Websocket server allows starting Pzh and Pzp via a web browser
 */
var path = require("path"),
  tls  = require("tls"),
  fs   = require("fs"),
  os   = require("os"),
  util = require("util");


var webinos       = require("webinos")(__dirname);
var session       = require("./session");
var log           = webinos.global.require(webinos.global.util.location, "lib/logging.js")(__filename);
var rpc           = webinos.global.require(webinos.global.rpc.location);
var Registry      = webinos.global.require(webinos.global.rpc.location, "lib/registry").Registry;
var Discovery     = webinos.global.require(webinos.global.api.service_discovery.location, "lib/rpc_servicedisco").Service;
var context_manager= webinos.global.require(webinos.global.manager.context_manager.location);
var MessageHandler = webinos.global.require(webinos.global.manager.messaging.location, "lib/messagehandler").MessageHandler;
var RPCHandler     = rpc.RPCHandler;

var pzpWebSocket  = require("./pzp_websocket");

var Pzp = function () {
  "use strict";
  pzpWebSocket.call(this);
  // TODO: better to have get functions instead of exposing them
  this.states          = ["NOT_CONNECTED", "CONNECTING", "CONNECTED", "DISCONNECTING"];
  this.modes           = ["VIRGIN", "HUB", "PEER"];
  this.state           = this.states[0]; // State is applicable for hub mode but for peer mode, we need to check individually
  this.mode            = this.modes[0]; //  3 modes a pzp can be, for peer mode, each PZP needs to be checked if it is connected
  var connectedPzh    = {}; // Stores PZH server details
  var connectedPzp    = {}; // Stores connected PZP information
  var address         = "localhost";
  var sessionId;
  var config;
  var self = this;
  // variable used by rpc and message handler
  // TODO these variables are directly set by service discovery does not look right
  this.serviceListener;  // For a single callback to be registered via addRemoteServiceListener.
  this.registry;
  this.rpcHandler;
  this.discovery;
  this.messageHandler;


  /** description: It is responsible for sending message to correct entity. It checks if message is
   * for Apps connected via WebSocket server. It forwards message to the correct
   * WebSocket self or else message is send to PZH or else to connect PZP server or self
   * @param message to be sent forward
   * @param address to forward message
   */
  function prepMsg(from, to, status, message) {
    var msg = {"type" : "prop",
      "from" : from,
      "to"   : to,
      "payload":{"status":status,
        "message":message}};
    self.sendMessage(msg, to);

  }
  function  initializeRPC_Message(loadModules) {
    self.registry       = new Registry();
    self.rpcHandler     = new RPCHandler(self, self.registry); // Handler for remote method calls.
    self.discovery      = new Discovery(self.rpcHandler, [self.registry]);
    self.registry.registerObject(self.discovery);
    self.registry.loadModules(loadModules, self.rpcHandler); // load specified modules
    self.messageHandler = new MessageHandler(self.rpcHandler); // handler for all things message
  }

  function setupMessage_RPCHandler () {
    var send = function (message, address, object) {
      "use strict";
      object.sendMessage(message, address);
    };
    self.rpcHandler.setSessionId(sessionId);
    self.messageHandler.setGetOwnId(sessionId);
    self.messageHandler.setObjectRef(self);
    self.messageHandler.setSendMessage(send);
    self.messageHandler.setSeparator("/");
  }


  function checkMode() {
    // Check if it is virgin mode
    if (config && (config.cert.internal.master.cert || config.metaData.serverName)) {
      self.mode = self.modes[1]; // Hub mode
    } else {
      self.mode  = self.modes[0]; // Virgin mode
    }
    self.state = self.states[0];
  }
  function cleanUp(pzhId){
    var key;
    if (pzhId) {
      self.messageHandler.removeRoute(pzhId, sessionId);
      for (key in connectedPzh) {
        if (connectedPzh.hasOwnProperty(key))
          delete connectedPzh[key];
      }
      self.updateApp();
    }
    self.state = self.states[0];
  }

  function sendUpdateMsg(pzhId, cmd, msg) {
    var i;
    if (cmd === "pzpUpdate") {
      for (i in msg) {
        if (msg.hasOwnProperty(i) && sessionId !== msg[i].name && connectedPzp[msg[i].name]) {
          if(msg[i].newPzp )  {
            var client = new pzpClient();
            client.connectOtherPZP(msg[i]);
          }
        }
      }
    } else if (cmd === "pzhUpdate") {
      for (i in msg) {
        if (msg.hasOwnProperty(i) && pzhId !== msg[i].name) {
          connectedPzh[msg[i].name] = {};
        }
      }
    }
    self.updateApp();
  }

  this.sendMessage = function(message, address) {
    var jsonString = JSON.stringify(message);
    var buf = session.common.jsonStr2Buffer(jsonString);
    log.info('send to '+ address + ' message ' + jsonString +' and mode '+ self.mode + ' state '+ self.state);

    try {
     if (connectedPzp.hasOwnProperty(address) && connectedPzp[address].state === self.states[2]) {
        connectedPzp[address].socket.pause();
        connectedPzp[address].socket.write(buf);
        connectedPzp[address].socket.resume();
      } else if(connectedPzh.hasOwnProperty(address) && self.state === self.states[2] && self.mode === self.modes[1]){
        connectedPzh[address].pause();
        connectedPzh[address].write(buf);
        connectedPzh[address].resume();
      } else { // sending to the app
        self.sendConnectedApp(address, message);
      }
    } catch (err) {
      log.error("sending send message"+ err);
    }
  };
  function setConnParam(conn_key) {
    if (self.mode === self.modes[1]) { // Hub Mode
      return{
        key : conn_key,
        cert: config.cert.internal.conn.cert,
        //crl : config.crl,
        ca  : config.cert.internal.master.cert,
        servername: config.metaData.serverName
      };
    } else {
      return {
        key : conn_key,
        cert: config.cert.internal.conn.cert,
        servername: config.metaData.serverName
      };
    }
  }
  function authenticated(instance, pzhId, callback) {
    if(!connectedPzp.hasOwnProperty(sessionId)) {
      //log.info("connected to pzh & authenticated");
      if (!config.metaData.pzhId) {
        config.metaData.pzhId= pzhId;
        config.storeMetaData(config.metaData, function(status, value) {
          if (status) {
            log.info("successfully updated metadata with pzhId");
          }
        });
      }
      sessionId = config.metaData.pzhId+ '/' + config.metaData.webinosName;
      self.state     = self.states[2];

      connectedPzh[config.metaData.pzhId] = instance;

      setupMessage_RPCHandler();

      var msg = self.messageHandler.registerSender(sessionId, pzhId);
      self.sendMessage(msg, pzhId);

      var localServices = self.discovery.getRegisteredServices();
      prepMsg(sessionId, config.metaData.pzhId, "registerServices", localServices);
      log.info("sent msg to register local services with pzh");

      return callback(true, "pzp " + sessionId+ " connected to "+ pzhId);
    } else {
      return callback(false, "pzh already connected");
    }
  }
  function unauthenticated( conn, pzhId, code, callback) {
    try{
      log.info("not authenticated " +conn.authorizationError);
      if(conn.authorizationError === 'CERT_NOT_YET_VALID') {
        return callback(false,"possible clock difference between PZH and your PZP, try updating time and try again" )
      }
      if (!config.metaData && conn) {
        var msg = {"type" : "prop", "from" : sessionId, "to": pzhId,
          "payload": {"status": "clientCert",
            "message": {csr: config.cert.internal.conn.csr, code: code}
          }
        };
        var jsonString = JSON.stringify(msg);
        var buf = session.common.jsonStr2Buffer(jsonString);
        conn.write(buf);
      }
    } catch(err) {
      conn.socket.end();
      return callback(false, "failed sending client certificate to the PZH" );
    }
  }
  function handleAuthorization(pzpClient, code, callback) {
    log.info("connection to pzh status: " + pzpClient.authorized );
    //log.info("reusing session : " + pzpClient.isSessionReused());
    var pzhId = decodeURIComponent(pzpClient.getPeerCertificate().subject.CN);
    pzhId = pzhId.split(":")[1];

    if(pzpClient.authorized) {
      authenticated( pzpClient, pzhId, callback);
    } else {
      unauthenticated(pzpClient, pzhId, code, callback);
    }
  }
  /**
   * Add callback to be used when PZH sends message about other remote
   * services being available. This is used by the RPCHandler to receive
   * other found services.
   * A privilege function used by RPC
   * @param callback the listener that gets called.
   */
  this.addRemoteServiceListener = function(callback) {
    self.serviceListener = callback;
  };
  /**
   * @param msgObj
   */
  function processMsg(msgObj) {
    session.common.processedMsg(self, msgObj, function(validMsgObj) {
      if (validMsgObj.type === 'prop') {
        if(validMsgObj.payload.status === 'signedCert') {
          self.enrolledPzp(validMsgObj.from, validMsgObj.to, validMsgObj.payload.message.clientCert,
            validMsgObj.payload.message.masterCert, validMsgObj.payload.message.masterCrl );
        } else if(validMsgObj.payload.status === 'pzpUpdate') {
          sendUpdateMsg(config.metaData.pzhId, validMsgObj.payload.status, validMsgObj.payload.message);
        } else if(validMsgObj.payload.status === 'pzhUpdate') {
          sendUpdateMsg(config.metaData.pzhId, validMsgObj.payload.status, validMsgObj.payload.message);
        } else if(validMsgObj.payload.status === 'foundServices') {
          self.serviceListener && self.serviceListener(validMsgObj.payload);
        } else if(validMsgObj.type === 'prop' && validMsgObj.payload.status === 'listUnregServices') {
          var services = self.getInitModules();
          var msg = self.makeMsg(self.config.pzhId, "unregServicesReply", services);
          msg.payload.id = validMsgObj.payload.message.listenerId;
          self.sendMessage(msg, msg.to);
          log.info("sent " + ((services && services.length) || 0) + " initially loaded modules to " + validMsgObj.from);
        } else if(validMsgObj.type === 'prop' && validMsgObj.payload.status === 'registerService') {
          var m = {
            "name": validMsgObj.payload.message.name,
            "params": validMsgObj.payload.message.params
          };
          self.registry.loadModule(m, self.rpcHandler);
        } else if(validMsgObj.type === 'prop' && validMsgObj.payload.status === 'unregisterService') {
          var sv = {
            "id": validMsgObj.payload.message.svId,
            "api": validMsgObj.payload.message.svAPI
          };
          self.registry.unregisterObject(sv);
        }
      } else {
        self.messageHandler.onMessageReceived(validMsgObj, validMsgObj.to);
      }
    });
  }

  /** @ description It is responsible for connecting with PZH and handling events.
   * @param config structure used for connecting with Pzh
   * @param callback is called after connection is useful or fails to inform startPzp
   */
  function connectHub(conn_key, code, callback) {
    var pzpClient, master, options = {};
    try {
      options = setConnParam(conn_key);
      console.log(options);
      pzpClient = tls.connect(config.userPref.ports.provider, address, options, function(conn) {
        handleAuthorization(pzpClient, code, callback);
      });

      pzpClient.on("data", function(buffer) {
        try {
          pzpClient.pause(); // This pauses socket, cannot receive messages
          session.common.readJson(self, buffer, function(obj) {
            processMsg(obj);
          });
        } catch (err) {
          log.error(err);
        } finally {
          pzpClient.resume();// unlocks socket.
        }
      });

      pzpClient.on("end", function () {
        cleanUp();
        // TODO: Try reconnecting back to server but when.
      });

      pzpClient.on("error", function (err) {
        if (err.code === "ECONNREFUSED" || err.code === "ECONNRESET") {
          if(self.mode === self.modes[1]){
            //self.zeroConf.findConnect(self.config.metaData.pzhId);
          } else {
            setupMessage_RPCHandler();// in virgin mode
          }
        }
        log.error("error connecting server " + err);
      });

      /*pzpClient.on("close", function () {
       log.info("connection closed");
       });*/
    } catch (err) {
      log.error("general error : " + err);
      throw err;
    }
  }

  this.enrolledPzp = function(from, to, clientCert, masterCert, masterCrl) {
    // This message come from PZH web server over websocket
    log.info("pzp writing certificates data ");
    config.cert.internal.conn.cert   = clientCert;
    config.cert.internal.master.cert = masterCert;
    config.crl                       = masterCrl;

    config.metaData.pzhId            = from.split("/")[1];
    config.metaData.serverName       = from;

    if(config.trustedList.pzh.indexOf(config.metaData.pzhId) === -1) {
      config.trustedList.pzh.push(config.metaData.pzhId);
    }

    config.storeMetaData(config.metaData, function(status, value) {
      if(status) {
        config.storeAll(function(status, value){
          if (status) {
            log.info("stored all configuration data");
            self.mode      = self.modes[1]; // Moved from Virgin mode to hub mode

            config.fetchKey(config.cert.internal.conn.key_id, function(status, value) {
              if (status) {
                connectHub(value, config.metaData.serverName, function(status, value) {
                  if (status){
                    self.updateApp(sessionId);
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  this.initializePzp = function(inputConfig, modules, callback) {
    var self = this, conn_key;
    initializeRPC_Message(modules);
    config = new session.configuration();
    config.setConfiguration(inputConfig.friendlyName, "Pzp", inputConfig.hostname, function (status, value) {
      if(status){
        checkMode();
        conn_key = value;
        sessionId = "";
        if(config.metaData.pzhId) {
          sessionId = config.metaData.pzhId + '/';
        }
        sessionId = sessionId + config.metaData.webinosName;
        try {
          self.state = self.states[1];
          // pzp starting requires pzp wss to be started at-least

          self.startWebSocketServer(config.metaData.pzhId, sessionId, address, config.userPref.ports, config.cert.internal.conn.csr, self.messageHandler, function(status, value){
            if (status) {
              connectHub(conn_key, config.code, function(status, value) {
                if (status){
                  log.info("connected to PZH successful ");
                } else {
                  log.error("connected to PZH failed ");
                }
              });
              return callback(true);
            } else {
              return callback(false, value);
            }
          });
        } catch (err) {
          self.state = self.states[0];
          return callback(false, err);
        }
      }
    });
  };
  this.connectInfo = function(connectedPzpIds, connectedPzhIds){
    var  key;
    for (key in connectedPzp) {
      if (connectedPzp.hasOwnProperty(key)) {
        connectedPzpIds.push(key);
      }
    }
    for ( key in connectedPzh) {
      if (connectedPzh.hasOwnProperty(key)) {
        connectedPzhIds.push(key);
      }
    }
  };

  this.sendMsg = function(msg, payload) {
    var key;
    for (key in connectedPzp) {
      if (connectedPzp.hasOwnProperty(key)) {
        prepMsg(sessionId, key, msg, payload);
      }
    }
    for ( key in connectedPzh) {
      if (connectedPzh.hasOwnProperty(key)) {
        prepMsg(sessionId, key, msg, payload);
      }
    }
  };
};
util.inherits(Pzp, pzpWebSocket);


module.exports = Pzp;


