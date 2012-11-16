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
var path = require("path"),
  tls  = require("tls"),
  fs   = require("fs"),
  os   = require("os"),
  util = require("util");


var webinos       = require("find-dependencies")(__dirname);
var session       = require("./session");
var logger        = webinos.global.require(webinos.global.util.location, "lib/logging.js")(__filename) || console;
var rpc           = webinos.global.require(webinos.global.rpc.location);
var Registry      = webinos.global.require(webinos.global.rpc.location, "lib/registry").Registry;
var Discovery     = webinos.global.require(webinos.global.api.service_discovery.location, "lib/rpc_servicedisco").Service;
var MessageHandler = webinos.global.require(webinos.global.manager.messaging.location, "lib/messagehandler").MessageHandler;
var RPCHandler     = rpc.RPCHandler;

var pzpWebSocket  = require("./pzp_websocket");
var pzpDiscovery = require("./pzp_local");

var Pzp = function () {
  "use strict";
  pzpWebSocket.call(this);
  // TODO: better to have get functions instead of exposing them
  var states          = ["NOT_CONNECTED", "CONNECTING", "CONNECTED", "DISCONNECTING"];
  var modes           = ["VIRGIN", "HUB", "PEER"];
  var state           = states[0]; // State is applicable for hub mode but for peer mode, we need to check individually
  var mode            = modes[0]; //  3 modes a pzp can be, for peer mode, each PZP needs to be checked if it is connected
  var connectedPzh    = {}; // Stores PZH server details
  var connectedPzp    = {}; // Stores connected PZP information
  var address         = "localhost";
  var sessionId;
  var config;
  var tlsServer;
  var self = this;
  // TODO: these variables are directly set by service discovery does not look right
  var serviceListener;  // For a single callback to be registered via addRemoteServiceListener.
  var registry;
  var rpcHandler;
  var discovery;
  this.messageHandler;
  var localDiscovery;

  // Helper functions
  /**
   * PZP Client Authorized sets the
   * @param client: the connection object passed to store id information
   * @param msg: object containing details about PZP port, address, and name
   */
  function pzpClient_Authorized(client, msg) {
    var peerSessionId = msg.name;
    logger.log("authorized & connected to PZP: "+ peerSessionId);
    connectedPzp[msg.name] = {state: states[2], socket: client};
    client.id = msg.name;
    var msg1 = self.messageHandler.registerSender(sessionId, msg.name);
    sendMessage(msg1, msg.name);
    self.updateApp();
  }

    /**
   * Prepares webinos internal message to be sent between webinos endpoints
   * @param from    : address of the PZP
   * @param to      : address of the entity message is being sent
   * @param status  : webinos specific command
   * @param message : message payload
   */
  function prepMsg(from, to, status, message) {
    var msg = {"type" : "prop",
      "from" : from,
      "to"   : to,
      "payload":{"status":status,
        "message":message}};
    sendMessage(msg, to);
  }
  /**
   * Checks current status of certificate present and set hub or virgin mode accordingly
   */
  function checkMode() {
    // Check if it is virgin mode
    if (config && (config.cert.internal.master.cert && config.metaData.pzhId)) {
      mode = modes[1]; // Hub mode
    } else {
      mode  = modes[0]; // Virgin mode
    }
  }

  /**
   * Sets webinos pzp sessionId
   */
  function setSessionId() {
    sessionId = config.metaData.webinosName;
    if(config.metaData.pzhId) {
      sessionId = config.metaData.pzhId + "/" +  config.metaData.webinosName;
    }
  }

  /**
   * TODO : Ideally this should be in webinos messaging manager
   * Initializes Webinos Other Components that interact with the session manager
   * @param loadModules : webinos modules that should be loaded in the PZP
   */
  function  initializeRPC_Message(loadModules) {
    registry       = new Registry();
    rpcHandler     = new RPCHandler(self, registry); // Handler for remote method calls.
    discovery      = new Discovery(rpcHandler, [registry]);
    registry.registerObject(discovery);
    registry.loadModules(loadModules, rpcHandler); // load specified modules
    self.messageHandler = new MessageHandler(rpcHandler); // handler for all things message
    webinos.global.require(webinos.global.manager.policy_manager.location); //initializes the policy manager
    webinos.global.require(webinos.global.manager.context_manager.location);//initializes context manager
  }

  /**
   * Any entity connecting to PZP has to register its address with other end point
   */
  function registerMessaging() {
    if (config.metaData.pzhId && connectedPzh[config.metaData.pzhId]) {
      var msg = self.messageHandler.registerSender(sessionId, config.metaData.pzhId);
      sendMessage(msg, config.metaData.pzhId);
    }
  }

  function sendFoundServices(validMsgObj) {
    var msg = {"type" : "prop",
      "from" : sessionId,
      "to"   : validMsgObj.from,
      "payload":{"status":"foundServices",
        "message":discovery.getAllServices(validMsgObj.from), id: validMsgObj.payload.message.id}};
    sendMessage(msg, validMsgObj.from);
  }
  /**
   * Setups message rpc handler, this is tied to sessionId, should be called when sessionId changes
   */
  function setupMessage_RPCHandler() {
    var send = function (message, address, object) {
      "use strict";
      sendMessage(message, address);
    };
    rpcHandler.setSessionId(sessionId);
    self.messageHandler.setGetOwnId(sessionId);
    self.messageHandler.setObjectRef(self);
    self.messageHandler.setSendMessage(send);
    self.messageHandler.setSeparator("/");
  }

  /**
   * Called when PZP is connected to Hub or in case if error occurs in PZP connecting
   */
  function startOtherManagers(){
    setupMessage_RPCHandler();
    registerMessaging();    //message handler
    self.registerServicesWithPzh(); //rpc
    start_PzpServer();//pzp tls server
    self.updateApp(sessionId);//

    if(!localDiscovery && mode !== modes[0]) {// local discovery
      localDiscovery = new pzpDiscovery();
      localDiscovery.startLocalAdvert(config.userPref.ports.pzp_zeroConf);
    }
  }

  /**
   * Removes pzp and pzh from the connected list and then updatesApp to update status about connection status
   * @param id - identity of the PZP or PZH disconnected
   */
  function cleanUp(id){
    var key;
    if (id) {
      self.messageHandler.removeRoute(id, sessionId);
      for (key in connectedPzh) {
        if (connectedPzh.hasOwnProperty(key) && key === id){
          delete connectedPzh[key];
        }
      }
      for (key in connectedPzp) {
        if (connectedPzp.hasOwnProperty(key) && key === id){
          delete connectedPzp[key];
        }
      }
      self.updateApp();
    }
  }

  /**
   * Triggered when pzhUpdate or pzpUpdate updates the PZP about connectedPzp and connectedPzh list
   * @param cmd - pzpUpdate or pzhUpdate
   * @param msg - msg contains information about name, address and port
   */
  function sendUpdateMsg(cmd, msg) {
    var i;
    if (cmd === "pzpUpdate") {
      for (i in msg) {
        if (msg.hasOwnProperty(i) && sessionId !== msg[i].name && !connectedPzp.hasOwnProperty(msg[i].name)) {
          if(msg[i].newPzp )  {
            logger.log("Attempting to connect peer pzp " + msg[i].name);
            self.connectPeer(msg[i]);
          }
        }
      }
    } else if (cmd === "pzhUpdate") {
      for (i in msg) {
        if (msg.hasOwnProperty(i) && config.metaData.pzhId !== msg[i].name) {
          connectedPzh[msg[i].name] = {};
        }
      }
    }
    self.updateApp();
  }

  /**
   * It is responsible for sending message to correct entity.Forwards message to either PZH or PZP or Apps
   * @param message to be sent forward
   * @param address to forward message
   */
  function sendMessage (message, address) {
    var jsonString = JSON.stringify(message);
    var buf = session.common.jsonStr2Buffer(jsonString);
    logger.log('send to '+ address + ' message ' + jsonString +' and mode '+ mode);

    try {
      if (connectedPzp.hasOwnProperty(address) && connectedPzp[address].state === states[2]) {
        connectedPzp[address].socket.pause();
        connectedPzp[address].socket.write(buf);
        connectedPzp[address].socket.resume();
      } else if(connectedPzh.hasOwnProperty(address) && connectedPzh[address].state === states[2] && mode === modes[1]){
        connectedPzh[address].socket.pause();
        connectedPzh[address].socket.write(buf);
        connectedPzh[address].socket.resume();
      } else { // sending to the app
        self.sendConnectedApp(address, message);
      }
    } catch (err) {
      logger.error("sending send message"+ err);
    }
  }

  /**
   * If PZP fails to connect to PZH, this tries to connect back to PZH
   */
  function retryConnecting() {
    if (mode === modes[1]) {
      setTimeout(function(){
        setConnParam(function(options){
          connectHub(function(status, value){
            logger.log("retrying to connect back to the PZH " + (status ? "successful": "failed"));
          });
        });
      }, 60000);//increase time limit to suggest when it should retry connecting back to the PZH
    }
  }
  /**
   * Sets TLS connection parameters
   * @param callback - Object containing about TLS connection parameters
   */
  function setConnParam(callback) {
    var options ;
    config.fetchKey(config.cert.internal.conn.key_id, function(status, value) {
      if (status) {
        if (mode === modes[1]) { // Hub Mode
          options = {
            key : value,
            cert: config.cert.internal.conn.cert,
            //crl : config.crl,
            ca  : config.cert.internal.master.cert,
            servername: config.metaData.pzhId
          };
        } else {
          options =  {
            key : value,
            cert: config.cert.internal.conn.cert,
            servername: config.metaData.serverName
          };
        }
        return callback(options)
      }
    });
  }

  /**
   * PZH connected details are stored in this function
   * @param conn - connection object of the tls client
   * @param callback - returns true or false depending on the PZH connected status
   */
  function authenticated(conn, callback) {
    if(!connectedPzh.hasOwnProperty(sessionId)) {
      setSessionId();
      connectedPzh[config.metaData.pzhId] = {socket: conn, state: states[2]};
      conn.id = config.metaData.pzhId;
      startOtherManagers();
      callback(true, "pzp " + sessionId+ " connected to "+ config.metaData.pzhId);
    } else {
      callback(false, "pzh already connected");
    }
  }

  /**
   * TODO: remove this support of adding PZP via tls server
   * Sends PZP CSR and AuthCode to the PZH TLS server
   * @param conn - Socket connection object of the PZH
   * @param code  - Authorization code of the PZP
   * @param callback-  returns back true or false depending on the error
   * @return {*} callback function if not successful
   */
  function unauthenticated( conn, callback) {
    try{
      logger.log("not authenticated " +conn.authorizationError);
      if(conn.authorizationError === 'CERT_NOT_YET_VALID') {
        return callback(false,"possible clock difference between PZH and your PZP, try updating time and try again" )
      }
      return callback(false);
    } catch(err) {
      conn.socket.end();
      return callback(false, "failed sending client certificate to the PZH" );
    }
  }

  /**
   * Calls authenticated or unauthenticated function respectively
   * @param pzpClient - socket information about the
   * @param code - authorization code generated by the PZH
   * @param callback - called from the enrolledPzp or initializePzp function
   */
  function handleAuthorization(pzpClient, callback) {
    logger.log("connection to pzh status: " + pzpClient.authorized );
    if(pzpClient.authorized) {
      authenticated( pzpClient, callback);
    } else {
      unauthenticated(pzpClient, callback);
    }
  }

  /**
   * Processes message received from the PZP
   * @param msgObj - the buffer array received from other webinos end point
   */
  function processMsg(msgObj) {
    session.common.processedMsg(self, msgObj, function(validMsgObj) {
      logger.log("msg received " + JSON.stringify(validMsgObj));
      if (validMsgObj.type === 'prop') {
        switch(validMsgObj.payload.status) {
          case 'signedCert':
          self.enrolledPzp(validMsgObj.from, validMsgObj.to, validMsgObj.payload.message.clientCert,
            validMsgObj.payload.message.masterCert, validMsgObj.payload.message.masterCrl );
          break;
          case 'pzpUpdate':
          sendUpdateMsg(validMsgObj.payload.status, validMsgObj.payload.message);
          break;
          case 'pzhUpdate':
          sendUpdateMsg(validMsgObj.payload.status, validMsgObj.payload.message);
          break;
          case'foundServices':
          serviceListener && serviceListener(validMsgObj.payload);
          break;
          case "findServices":
          sendFoundServices(validMsgObj);
          break;
          case 'listUnregServices':
          prepMsg(sessionId, config.metaData.pzhId, "unregServicesReply", {services: getInitModules(), id:validMsgObj.payload.message.listenerId });
          break;
          case 'registerService':
          registry.loadModule({"name": validMsgObj.payload.message.name,"params": validMsgObj.payload.message.params}, rpcHandler);
          break;
          case'unregisterService':
          registry.unregisterObject({ "id": validMsgObj.payload.message.svId, "api": validMsgObj.payload.message.svAPI});
          break;
        }
      } else {
        self.messageHandler.onMessageReceived(validMsgObj, validMsgObj.to);
      }
    });
  }

  /**
   *
   * @param conn
   * @param buffer
   */
  function handleMsg(conn, buffer) {
    try {
      conn.pause(); // This pauses socket, cannot receive messages
      session.common.readJson(self, buffer, function(obj) {
        processMsg(obj);
      });
    } catch (err) {
      logger.error(err);
    } finally {
      conn.resume();// unlocks socket.
    }
  }
  /**
   * Connects with PZH and handle respective events
   * @param callback is called after connection is useful or fails to inform startPzp
   */
  function connectHub(callback) {
    var pzpClient, master, options = {};
    try {
      setConnParam(function(options){
        pzpClient = tls.connect(config.userPref.ports.provider, config.metaData.serverName, options, function(conn) {
          handleAuthorization(pzpClient, callback);
        });

        pzpClient.on("data", function(buffer) {
          handleMsg(pzpClient, buffer);
        });

        pzpClient.on("end", function () {
          cleanUp(pzpClient.id);
          retryConnecting();
        });

        pzpClient.on("error", function (err) {
          startOtherManagers();
          if (err.code === "ECONNREFUSED" || err.code === "ECONNRESET") {
            logger.error("Connect  attempt to YOUR PZH "+ config.metaData.pzhId+" failed.");
            if(mode === modes[1]){
              localDiscovery.findLocalPzp(self, config.userPref.ports.pzp_tlsServer, config.metaData.pzhId);
            }
          } else {
            logger.error(err);
          }
          //retryConnecting();
        });
      });
    } catch (err) {
      logger.error("general error : " + err);
    }
  }

  /**
   * Starts PZP server
   */
  function start_PzpServer() {
    if (mode !== modes[0] && !tlsServer) {
      setConnParam(function(certConfig) {
        certConfig.rejectUnauthorized = true;
        certConfig.requestCert = true;
        tlsServer = tls.createServer(certConfig, function (conn) {
          var cn, clientSessionId;
          if (conn.authorized) {
            var text = decodeURIComponent(conn.getPeerCertificate().subject.CN);
            clientSessionId = config.metaData.pzhId + "/"+ text.split(":")[1]; // Assuming in 1 zone;
            connectedPzp[clientSessionId]= {state: states[2], socket: conn};
            conn.id  = clientSessionId;
            var msg = self.messageHandler.registerSender(sessionId, clientSessionId);
            sendMessage(msg, clientSessionId);
            logger.log("pzp server - " + clientSessionId + " connected") ;
          }


          conn.on("data", function (buffer) {
            handleMsg(conn,buffer);
          });

          conn.on("end", function () {
            logger.log("pzp server - connection ended with pzp client " + conn.id );
            cleanUp(conn.id);
          });

          conn.on("error", function(err) {
            logger.log("pzp server -"+ err.message);
          });

        });
        tlsServer.on("error", function (err) {
          if (err.code === "EADDRINUSE") {// not starting on next available port as pzp local discovery will not work
            logger.error("pzp server - address in use could not start the server");
          } else {
            logger.error("pzp server - " + err.message);
          }
        });

        tlsServer.on("listening", function () {
          logger.log("pzp server - listening on port :" + config.userPref.ports.pzp_tlsServer);
        });

        tlsServer.listen(config.userPref.ports.pzp_tlsServer);
      });
    }
  }

  /**
   * Connect Peer PZPs. This is either triggered by PZH sending PZPUpdate message or else from PZP local discovery
   * @param msg - msg is an object containing port, address and name of PZP to be connected
   */
  this.connectPeer = function (msg) {
    setConnParam(function(options){
      var client = tls.connect(config.userPref.ports.pzp_tlsServer, msg.address, options, function () {
        if (client.authorized) {
          pzpClient_Authorized(client, msg);
        } else {
          logger.error("pzp client - connection failed, " + client.authorizationError);
        }
      });

      client.on("data", function (buffer) {
        handleMsg(client, buffer);
      });

      client.on("end", function () {
        cleanUp(client.id);
      });

      client.on("error", function (err) {
        logger.error("pzp client - " + err.message);
      });
    });
  };

  /**
   * Add callback to be used when PZH sends message about other remote
   * services being available. This is used by the RPCHandler to receive
   * other found services. A privilege function used by RPC
   * @param callback the listener that gets called.
   */
  this.addRemoteServiceListener = function(callback) {
    serviceListener = callback;
  };
  /**
   * Used by RPC to register and update services to the PZH
   */
  this.registerServicesWithPzh = function() {
    if (config.metaData.pzhId && connectedPzh[config.metaData.pzhId]) {
      var localServices = discovery.getRegisteredServices();
      prepMsg(sessionId, config.metaData.pzhId, "registerServices", {services:localServices, from:sessionId});
      logger.log("sent msg to register local services with pzh");
    }
  };
  /**
   * EnrollPZP stores signed certificate information from the PZH and then triggers connectHub function
   * @param from - Contains PZH Id
   * @param to - Contains PZP Id
   * @param clientCert - Signed PZP certificate from the PZH
   * @param masterCert - PZH master certificate
   * @param masterCrl  -  PZH master CRL
   */
  this.enrolledPzp = function(from, to, clientCert, masterCert, masterCrl) {
    logger.log("pzp writing certificates data ");    // This message come from PZH web server over websocket
    config.cert.internal.conn.cert   = clientCert;
    config.cert.internal.master.cert = masterCert;
    config.crl                       = masterCrl;
    config.metaData.pzhId            = from;
    config.metaData.serverName       = from.split("_")[0];

    if(config.trustedList.pzh.indexOf(config.metaData.pzhId) === -1) {
      config.trustedList.pzh.push(config.metaData.pzhId);
    }
    config.storeMetaData(config.metaData);
    config.storeAll();

    mode      = modes[1]; // Moved from Virgin mode to hub mode

    connectHub(function(status, value) {
      if (status){
        logger.log("successfully connected to the PZH ")
      } else{
        logger.error("connection to the PZH unsuccessful")
      }
    });
  };

  /**
   * TODO: Remove this function.
   * Send message function used by RPC to send findService.. Ideally it should send via messaging,
   * @param msg - find Service message
   * @param payload - contains id of the service being searched for
   */
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
  /**
   * TODO: Only send friendly name
   * Connected PZP function returns list of current connected PZPs
   * @return {Array} ConnectedPzpIds information
   */
  this.getConnectedPzp = function(){
    var  key, connectedPzpIds = [];
    for (key in connectedPzp) {
      if (connectedPzp.hasOwnProperty(key)) {
        connectedPzpIds.push(key);
      }
    }
    return connectedPzpIds;
  };
  /**
   * TODO: Only send friendly name
   * Connected PZH function returns list of directly connected PZH and PZH connected to own PZH
   * @return {Array} ConnectedPzhIds information
   */
  this.getConnectedPzh = function(){
    var key, connectedPzhIds = [];
    for ( key in connectedPzh) {
      if (connectedPzh.hasOwnProperty(key)) {
        connectedPzhIds.push(key);
      }
    }
    return connectedPzhIds;
  };

  this.getSessionId = function (){
    return sessionId;
  };
  this.getPath = function(){
    return config.metaData.webinosRoot;
  };
  this.getPorts = function(){
	return { pzp_webSocket: config.userPref.ports.pzp_webSocket,
			 pzp_web_webSocket: config.userPref.ports.pzp_web_webSocket
		};
  };
  /**
   * Initializes PZP WebSocket Server and then tries connecting with the PZH hub
   * Starting PZP means starting web socket server
   * @param inputConfig - the input configuration includes Provider address, authCode and PZH address
   * @param modules - Default modules to load when starting PZP
   * @param callback - true or false depending on startup status
   */
  this.initializePzp = function(inputConfig, modules, callback) {
    config = new session.configuration();// sets configuration
    config.setConfiguration(inputConfig.friendlyName, "Pzp", inputConfig.hostname, function (status, value) {
      if(status){
        checkMode();   //virgin or hub mode
        setSessionId();//sets pzp sessionId
        try {
          self.startWebSocketServer(config.metaData.pzhId, sessionId, address, config.userPref.ports, config.cert.internal.conn.csr,
          function(status, value){
            if (status) {
              initializeRPC_Message(modules); // Initializes RPC
              logger.log("successfully started pzp websocket server ");
              if (mode === modes[1]) {
                connectHub(function(status, value) {  // connects hub
                  if (status){
                    logger.log("connected to PZH successfully ");
                  } else {
                    logger.error("connection to PZH failed ");
                  }
                });
              } else{
                setupMessage_RPCHandler();
              }
              return callback(true, sessionId, config.cert.internal.conn.csr);// retruning csr to make test work
            } else {
              return callback(false, value);
            }
          });
        } catch (err) {
          state = states[0];//disconnected
          return callback(false, err);
        }
      }
    });
  };
};

util.inherits(Pzp, pzpWebSocket);

var pzpInstance;

exports.initializePzp= function(config, pzpModules, callback) {
  pzpInstance = new Pzp();
  pzpInstance.initializePzp(config, pzpModules, function(status, result) {
    if (status){
      logger.log("initialized pzp");
      callback(true);
    } else {
      callback(false);
    }
  });
};

exports.getSessionId = function() {
  return pzpInstance.getSessionId();
};

exports.getWebinosPath = function() {
  return pzpInstance.getPath();
};

exports.getWebinosPorts = function() {
  return pzpInstance.getPorts();
};
