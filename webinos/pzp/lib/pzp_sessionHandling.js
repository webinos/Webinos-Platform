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
 * Copyright 2011 Ziran Sun, Samsung Electronics (UK) Ltd
 *******************************************************************************/

/**
 * @author <a href="mailto:habib.virji@samsung.com">Habib Virji</a>
 * @description It starts Pzp and handle communication with web socket server.
 * Websocket server allows starting Pzh and Pzp via a web browser
 */
var path = require("path");
var tls  = require("tls");
var fs   = require("fs");
var os   = require("os");

var mdns;
try {
  mdns = require('mdns');
} catch(e) {}

var webinos       = require("webinos")(__dirname);
var session       = require("./session");
var log           = new session.common.debug("pzp_session");
var global        = session.configuration;
var rpc           = webinos.global.require(webinos.global.rpc.location);
var Registry      = webinos.global.require(webinos.global.rpc.location, "lib/registry").Registry;
var Discovery     = webinos.global.require(webinos.global.api.service_discovery.location, "lib/rpc_servicedisco").Service;

var MessageHandler = webinos.global.require(webinos.global.manager.messaging.location, "lib/messagehandler").MessageHandler;
var RPCHandler     = rpc.RPCHandler;

var pzpWebSocket  = require("./pzp_websocket"); // Needed as we start PZP server from here
var pzpServer     = require("./pzp_peerTLSServer"); // Needed as we start PZP server from here
var pzpClient     = require("./pzp_peerTLSClient"); // Needed as we start PZP server from here

var context_manager= webinos.global.require(webinos.global.manager.context_manager.location);

var Pzp = function () {
  "use strict";
  this.connectedPzh    = {}; // Stores PZH server details
  this.connectedPzp    = {}; // Stores connected PZP information
  this.connectedWebApp = {}; // List of connected apps i.e session with browser
  this.sessionWebApp   = 0;
  this.webServerState  = global.states[0];
  this.pzptlsServerState  = global.states[0];
  this.config          = {}//Configuration details of Pzp (certificates, file names)
  this.tlsId           = ""; // Used for session reuse
  this.serviceListener;   // For a single callback to be registered via addRemoteServiceListener.
  this.state           = global.states[0]; // State is applicable for hub mode but for peer mode, we need to check individually
  this.mode            = global.modes[0]; //  4 modes a pzp can be, for peer mode, each PZP needs to be checked if it is connected
  this.inputConfig     = {};
};

if((os.type().toLowerCase() == "linux") && (os.platform().toLowerCase() == "android"))
{
	// Console.log redefinition
	console.log = function(dataLog) {
		var id = fs.openSync("/sdcard/console.log", "a");
		fs.writeSync(id, dataLog+"\n", null, 'utf8');
		fs.closeSync(id);
	}
}

function getelement(service, element)
{
  var srv = JSON.stringify(service);
  var ret = null;
  if(element === 'name')
  {
    var nm = srv.split(element)[2];
    var index = nm.indexOf(",");
    //remove ""
    ret = nm.slice(3, index-1);
  }
  else if(element ==='addresses')
  {
    var el = srv.split(element)[1];
    var index = el.indexOf(",");
    ret = el.slice(4, index-2);
  }
  else
  {
    var el = srv.split(element)[1];
    var index = el.indexOf(",");
    ret = el.slice(2, index);
  }
  return ret;
}

Pzp.prototype.checkMode = function(config) {
  // Check if it is virgin mode
  if (config.master.cert === '') {
    this.state = global.states[0];
    this.mode = global.modes[0]; // peer mode
  } else {
    this.state = global.states[0];
    this.mode = global.modes[1]; // hub mode
  }
}

Pzp.prototype.prepMsg = function(from, to, status, message) {
  var msg = {"type" : "prop",
    "from" : from,
    "to"   : to,
    "payload":{"status":status,
        "message":message}};
  this.sendMessage(msg, to);
};

Pzp.prototype.wsServerMsg = function(message) {
  if(typeof this.sessionId !== "undefined" ) {
    for (var key in this.connectedWebApp) {
      if (this.connectedWebApp.hasOwnProperty(key) && this.connectedWebApp[key].status === "") {
        this.prepMsg(this.sessionId, this.connectedWebApp[key], "info", message);
      }
    }
  }
};

/** description: It is responsible for sending message to correct entity. It checks if message is
* for Apps connected via WebSocket server. It forwards message to the correct
* WebSocket self or else message is send to PZH or else to connect PZP server or self
* @param message to be sent forward
* @param address to forward message
*/
Pzp.prototype.sendMessage = function (message, address) {
  var self = this;

  var jsonString = JSON.stringify(message);
  var buf = session.common.jsonStr2Buffer(jsonString);

  log.info('send to '+ address + ' message ' + jsonString);
  log.info('mode '+ self.mode + ' state '+self.state);

  try {
    if (self.connectedWebApp[address]) { // it should be for the one of the apps connected.
      self.connectedWebApp[address].socket.pause();
      self.connectedWebApp[address].sendUTF(jsonString);
      self.connectedWebApp[address].socket.resume();
    } else if (self.connectedPzp[address] && self.connectedPzp[address].state === global.states[2] &&
      (self.mode === global.modes[2] || self.mode === global.modes[3])) {
      self.connectedPzp[address].socket.pause();
      self.connectedPzp[address].socket.write(buf);
      self.connectedPzp[address].socket.resume();
    } else if(self.connectedPzh[address] && self.state === global.states[2] &&
      (self.mode === global.modes[1] || self.mode === global.modes[3])){
      self.connectedPzh[address].pause();
      self.connectedPzh[address].write(buf);
      self.connectedPzh[address].resume();
    }
  } catch (err) {
    log.error("sending send message"+ err);
  }
};

var setupMessageHandler = function (self) {
  var send = function (message, address, object) {
    "use strict";
    object.sendMessage(message, address);
  };
  self.messageHandler.setGetOwnId(self.sessionId);
  self.messageHandler.setObjectRef(self);
  self.messageHandler.setSendMessage(send);
  self.messageHandler.setSeparator("/");
};

/**
* Add callback to be used when PZH sends message about other remote
* services being available. This is used by the RPCHandler to receive
* other found services.
* @param callback the listener that gets called.
*/
Pzp.prototype.addRemoteServiceListener = function(callback) {
  this.serviceListener = callback;
};

Pzp.prototype.update = function(callback) {
  var self = this;
  self.connectedApp();
  self.webServerState = global.states[2];

   /*
   * Zerconf: Advertise itself as a PZP service _tcp_pzp once authenticated by PZH. service type: _pzp._tcp
   */
	switch(os.type().toLowerCase()){
		case "linux":
			switch(os.platform().toLowerCase()){
				case "android":
					break;
				case "linux":
					var ad = mdns.createAdvertisement(mdns.tcp('pzp'), global.pzpZeroconfPort);
					ad.start();
					ad.on('error', function(err) {
						log.error("Zeroconf PZP Advertisement error: (" + err+")");
					});
					log.info("started pzp");
					break;
			}
      break;
    case "darwin":
      break;
    case "windows_nt":
      break;
  }
  //end - Zeroconf changes

  if (typeof callback !== "undefined") {
    callback.call(self, "startedPZP", self);
  }
}

Pzp.prototype.authenticated = function(cn, instance, callback) {
  var self = this;
  if(!self.connectedPzp.hasOwnProperty(self.sessionId)) {
    log.info("connected to pzh & authenticated");

    self.state = global.states[2];
    self.mode = global.modes[1];

    self.connectedPzh[self.config.pzhId] = instance;

    self.tlsId[self.sessionId] = instance.getSession();

    instance.socket.setKeepAlive(true, 100);
    self.rpcHandler.setSessionId(self.sessionId);
    setupMessageHandler(self);

    var msg = self.messageHandler.registerSender(self.sessionId, self.config.pzhId);
    self.sendMessage(msg, self.config.pzhId);

    var localServices = self.discovery.getRegisteredServices();
    self.prepMsg(self.sessionId, self.config.pzhId, "registerServices", localServices);
    callback("startedPZP");
    log.info("sent msg to register local services with pzh");
    if (self.pzptlsServerState !== global.states[2]) {
      var server = new pzpServer();
      server.startServer(self, function() {
        self.pzptlsServerState = global.states[2];
        self.prepMsg(self.sessionId, self.config.pzhId, "pzpDetails", global.pzpServerPort);
      });
    }
  }
};

Pzp.prototype.unauthenticated = function(conn, sessionId, pzhId, conn_csr, code) {
  try{
    var msg = {"type" : "prop", "from" : sessionId, "to": pzhId,
      "payload": {"status": "clientCert", "message": {csr: conn_csr, code: code}}};

    var jsonString = JSON.stringify(msg);
    var buf = session.common.jsonStr2Buffer(jsonString);

    log.info('send to '+ pzhId + ' message ' + jsonString);
    conn.write(buf);
  } catch(err) {
    log.error("failed sending client certificate to the PZH" );
    conn.socket.end();
  }
}

/** @ description It is responsible for connecting with PZH and handling events.
* @param config structure used for connecting with Pzh
* @param callback is called after connection is useful or fails to inform startPzp
*/
Pzp.prototype.connect = function (conn_key, conn_csr, code, address, callback) {
  var self, pzpInstance, master;
  self = this;
  var conn_key, config = {};
  try {
    if (self.mode === global.modes[1]) { // Hub Mode
      config = {
        key : conn_key,
        cert: self.config.own.cert,
        crl : self.config.master.crl,
        ca  : self.config.master.cert,
        servername: self.config.serverName
      };
    } else {
      config = {
          key : conn_key,
          cert: self.config.own.cert,
          servername: self.config.serverName
      };
    }
    pzpInstance = tls.connect(global.pzhPort, address, config, function(conn) {
      log.info("connection to pzh status: " + pzpInstance.authorized );
      log.info("reusing session : " + pzpInstance.isSessionReused());

      if(pzpInstance.authorized) {
        var pzhId = decodeURIComponent(pzpInstance.getPeerCertificate().subject.CN);
        self.config.pzhId = pzhId.split(":")[1];
        global.storeConfig(self.config, function() {
          self.authenticated(self.config.pzhId, pzpInstance, callback);
        });
      } else {
        log.info("not authenticated " );
        if(pzpInstance.authorizationError === 'CERT_NOT_YET_VALID') {
          log.info("possible clock difference between PZH and your PZP, try updating time and try again");
        }
        if (typeof conn_csr !== "undefined" && conn_csr !== null) {
          var pzhId = decodeURIComponent(pzpInstance.getPeerCertificate().subject.CN);
          pzhId = pzhId.split(":")[1];
          self.unauthenticated(pzpInstance, self.sessionId, pzhId, conn_csr, code);
        }
      }
    });

    /* It fetches data and forward it to processMsg
    * @param data is the received data
    */
    pzpInstance.on("data", function(buffer) {
      try {
        pzpInstance.pause(); // This pauses socket, cannot receive messages
        session.common.readJson(self, buffer, function(obj) {
          self.processMsg(obj, callback);
        });
      } catch (err) {
        log.error(err);
      } finally {
        pzpInstance.resume();// unlocks socket.
      }
    });

    pzpInstance.on("end", function () {
      var webApp;
      log.info("connection terminated from PZH");
      if (typeof self.sessionId !== "undefined") {
        self.messageHandler.removeRoute(self.config.pzhId, self.sessionId);
        self.rpcHandler.setSessionId(self.sessionId);
        setupMessageHandler(self);
        if (self.config.pzhId) {
          for (var key in self.connectedPzh) {
            delete self.connectedPzh[key];
          }
          self.connectedApp();
        }
      }
      // TODO: Try reconnecting back to server but when.
    });

    pzpInstance.on("error", function (err) {
      log.error("error connecting server (" + err+")");

      if (err.code === "ECONNREFUSED" || err.code === "ECONNRESET") {
        if (self.mode === global.modes[3] ) { //hub_peer mode
          self.mode = global.modes[2]; // Go in peer mode
                // state will be peer mode state
        } else if (self.mode === global.modes[1] ) { //hub mode
            self.state = global.states[0]; // not connected
            //Zeroconf - start
            switch(os.type().toLowerCase()){
              case "linux":
								switch(os.platform().toLowerCase()){
									case "android":
									{
										function onFound(service){
											console.log("Android-Mdns onFound callback: found service."); 
					
											if((service.deviceNames[0] != "undefined") && (service.deviceAddresses[0] != "undefined"))
											{ 
												var msg ={};
												msg.name = service.deviceNames[0];
												msg.address = service.deviceAddresses[0];
												msg.name = self.config.pzhId + "/" + msg.name + "_Pzp";
                      	
												// Use case - Had connected to this PZP at least once 
												if((typeof self.connectedPzp[msg.name] !== "undefined") && (self.connectedPzp[msg.name].state === global.states[0])) {
													console.log("trying to connect to PZP");
	                      	
													self.connectedPzp[msg.name].address = msg.address;
													self.connectedPzp[msg.name].port = global.pzpServerPort;
													var client = new pzpClient();
													//TODO: Android PZP peer connection  
													//client.connectOtherPZP(self, msg);
												}
												else if (typeof self.connectedPzp[msg.name] === "undefined") {
													console.log("new peer");   
							
												msg.port = global.pzpServerPort;
												self.connectedPzp[msg.name] = {};
												console.log("found peer address:" + msg.address);										
												self.connectedPzp[msg.name].address = msg.address;
												self.connectedPzp[msg.name].port    = global.pzpServerPort;
												self.connectedPzp[msg.name].state   = global.states[1];
												self.mode  = global.modes[2];
												self.state = global.states[1];
												var client = new pzpClient();
												//TODO: Android PZP peer connection 
												//client.connectOtherPZP(self, msg);
												}
											} 
										}	
					
										try{
											var servicetype = {
												api: "_pzp._tcp.local."
											} 
											var bridge = require("bridge");
											mdnsModule = bridge.load('org.webinos.impl.discovery.DiscoveryMdnsImpl', this);
											console.log("\n test msdndiscovery...");
				  		
											try {
												mdnsModule.findServices(servicetype, onFound);
											console.log("startDiscovery - END");
											}
											catch(e) {
												console.log("Android mdns Findservices - error: "+e.message);
											}
										}
										catch(e){
											console.log("error: "+e.message);
										}
									}
									break;
                  case "linux":
                    var browser = mdns.createBrowser(mdns.tcp('pzp'));
                    browser.on('error', function(err) {
                    log.error("browser error: (" + err+")");
                    });
                    browser.start();

                    var msg ={};
                    browser.on('serviceUp', function(service) {
                    log.info("service up");
                    msg.name = getelement(service, 'name');
                    msg.port = getelement(service, 'port');
                    msg.address = getelement(service, 'addresses');

                    log.info("Check ZeroConf discovery list");
                    var hostname = os.hostname();
                    if(msg.name !== os.hostname()) {
                      //Update connection - msg.name is machine name
                      msg.name = self.config.pzhId + "/" + msg.name + "_Pzp";

                      // Use case - Had connected to this PZP at least once
                    if((typeof self.connectedPzp[msg.name] !== "undefined") && self.connectedPzp[msg.name].state === global.states[0] ) {
                      self.connectedPzp[msg.name].address = msg.address;
                      self.connectedPzp[msg.name].port = global.pzpServerPort;
                      var client = new pzpClient();
                      client.connectOtherPZP(self, msg);
                    }
                    else if (typeof self.connectedPzp[msg.name] === "undefined") {
                      log.info("new peer");

                      msg.port = global.pzpServerPort;
                      self.connectedPzp[msg.name] = {};
                      self.connectedPzp[msg.name].address = msg.address;
                      self.connectedPzp[msg.name].port    = global.pzpServerPort;
                      self.connectedPzp[msg.name].state   = global.states[1];
                      self.mode  = global.modes[2];
                      self.state = global.states[1];
                      var client = new pzpClient();
                      client.connectOtherPZP(self, msg);
                    }
                  }
                });
                break;
              }
              break;
            case "darwin":
              break;
            case "windows_nt":
              break;
            }
            //end - zeroconf
          }

            // Special case if started in hub disconnected mode
          if (self.webServerState !== global.states[2]) {
            pzpWebSocket.startPzpWebSocketServer(self, self.inputConfig, function() {
              self.rpcHandler.setSessionId(self.sessionId);
              setupMessageHandler(self);
              self.update(callback);
            });
          }
          if(self.pzptlsServerState === global.states[0])
          {
            log.info("Zeroconf: calling start pzptlsServer");
            var server = new pzpServer();
            server.startServer(self, function() {
            self.pzptlsServerState = global.states[2];
          });
        }
      } else {
            self.mode = global.modes[1];
            self.state = global.states[0];
      }
      if (self.config.pzhId) {
        for (var key in self.connectedPzh) {
          delete self.connectedPzh[key];
        }
        self.connectedApp();
      }

      log.info("pzp mode " + self.mode + " and state is " + self.state);
    });

    pzpInstance.on("close", function () {
      log.info("connection closed");
      if (self.mode === global.modes[3] ) { //hub_peer mode
        self.mode = global.modes[2]; // Go in peer mode
           // state will be peer mode state
      } else if (self.mode === global.modes[1] ) { //hub mode
        self.state = global.states[0]; // not connected
      }
      log.info("pzp mode " + self.mode + " and state is " + self.state);
    });
  } catch (err) {
    log.error("general error : " + err);
    throw err;
  }
};

Pzp.prototype.connectedApp = function(connection) {
  var self = this;
  if(typeof self !== "undefined" && typeof self.sessionId !== "undefined") {
    var appId, connectedPzpIds = [], connectedPzhIds = [];
    for (var key in self.connectedPzp) {
      if (self.connectedPzp.hasOwnProperty(key)) {
        connectedPzpIds.push(key);
      }
    }
    for (var key in self.connectedPzh) {
      if (self.connectedPzh.hasOwnProperty(key)) {
        connectedPzhIds.push(key);
      }
    }
    if (typeof connection !== "undefined") {
      appId = self.sessionId+ "/"+ self.sessionWebApp;
      self.sessionWebApp  += 1;
      self.connectedWebApp[appId] = connection;
      connection.id = appId; // this appId helps in while deleting socket connection has ended

      var payload = { "pzhId": self.pzhId, "connectedPzp": connectedPzpIds, "connectedPzh": connectedPzhIds};
      self.prepMsg(self.sessionId, appId, "registeredBrowser", payload);
    } else {
      for (var key in self.connectedWebApp) {
        conn = self.connectedWebApp[key];
        key = self.sessionId+ "/" + key.split("/")[1];
        self.connectedWebApp[key] = conn;
        var payload = {"pzhId":self.pzhId,"connectedPzp": connectedPzpIds,"connectedPzh": connectedPzhIds};
        self.prepMsg(self.sessionId, key, "registeredBrowser", payload);
      }
    }
  }
 };

Pzp.prototype.processMsg = function(msgObj, callback) {
  var self = this;
  var msg;
  session.common.processedMsg(self, msgObj, function(validMsgObj) {
    log.info(JSON.stringify(validMsgObj));
    if(validMsgObj.type === 'prop' && validMsgObj.payload.status === 'signedCert') {
      self.status = global.states[3]; // Disconnecting

      log.info("pzp writing certificates data ");
      self.config.own.cert   = validMsgObj.payload.message.clientCert;
      self.config.master.cert = validMsgObj.payload.message.masterCert;

      global.storeConfig(self.config, function() {
        self.mode  = global.modes[1]; // Moved from Virgin mode to hub mode
        self.sessionId = validMsgObj.from + '/' + self.config.name;
        self.state = global.states[0];
        callback.call(self, 'startPZPAgain');
      });

    } // This is update message about other connected PZP
    else if(validMsgObj.type === 'prop' && validMsgObj.payload.status === 'pzpUpdate') {
      msg = validMsgObj.payload.message;
      for (var i in msg) {
        if (msg.hasOwnProperty(i) && self.sessionId !== msg[i].name) {
          self.connectedPzp[msg[i].name] = {};
          self.connectedPzp[msg[i].name].address = msg[i].address;
          self.connectedPzp[msg[i].name].port    = msg[i].port;
          self.connectedPzp[msg[i].name].state   = global.states[0];
          if(msg[i].newPzp)  {
            self.mode  = global.modes[3];
            self.state = global.states[1];
            var client = new pzpClient();
            client.connectOtherPZP(self, msg[i]);
          }
        }
      }
      self.connectedApp();
    } else if(validMsgObj.type === 'prop' && validMsgObj.payload.status === 'pzhUpdate') {
      msg = validMsgObj.payload.message;
      for (var i in msg) {
        if (msg.hasOwnProperty(i) && self.config.pzhId !== msg[i].name) {
          self.connectedPzh[msg[i].name] = {};
          self.connectedApp();
        }
      }
    } else if(validMsgObj.type === 'prop' && validMsgObj.payload.status === 'failedCert') {
      log.error("failed to get certificate from PZH");
      callback.call(self, "ERROR");
    } else if(validMsgObj.type === 'prop' && validMsgObj.payload.status === 'foundServices') {
      log.info('received message about available remote services.');
      this.serviceListener && this.serviceListener(validMsgObj.payload);
    }
    // Forward message to message handler
    else {
      self.messageHandler.onMessageReceived(validMsgObj, validMsgObj.to);
    }
  });
};


Pzp.prototype.initializePzp = function(config, modules, callback) {
  var self = this;
  self.registry       = new Registry();
  self.rpcHandler     = new RPCHandler(this, self.registry); // Handler for remote method calls.
  self.discovery      = new Discovery(self.rpcHandler, [self.registry]);
  self.registry.registerObject(self.discovery);
  self.registry.loadModules(modules, self.rpcHandler); // load specified modules
  self.messageHandler = new MessageHandler(this.rpcHandler); // handler for all things message
  self.modules        = modules;
  self.inputConfig    = config;

  global.createDirectoryStructure( function() {
    global.setConfiguration(config.pzpName, "Pzp", config.pzhHost, config.pzhName,
    function (configure, conn_key, conn_csr) {
      if (configure === "undefined") {
        log.error("pzp configuration could not be loaded");
      }
      self.checkMode(configure);
      if (self.mode === global.modes[0]) { // VIRGIN MODE
        if (!checkConfiguration(self.inputConfig, configure)) {
          callback("undefined");
        }
      }
      self.config = configure;

      if (self.mode === global.modes[0]) { //Virgin
        self.sessionId = configure.name;
      } else {
        self.sessionId = configure.pzhId + '/' + configure.name;
      }

      try {
        var host, connectingAdd;
        if (configure.serverName.split("/") !== -1) {
          host = configure.serverName.split("/")[0];
        } else {
          host = configure.serverName;
        }
        self.states = global.states[1];
        session.common.resolveIP(host, function(address) {
          resolvedAddress = address;
          self.address = "0.0.0.0";
          session.common.fetchIP(function(address){
            self.connectingAddress= address;
          });
          log.info("pzp starting at address: " + self.address);
          self.connect(conn_key, conn_csr, config.code, resolvedAddress, function(result) {
            if(result === "startedPZP" && self.webServerState !== global.states[2]) {
              pzpWebSocket.startPzpWebSocketServer(self, config, function() {
                self.update(callback);
              });
            } else if(result === "startPZPAgain") {
              self.connect(conn_key, null, null, resolvedAddress, function(result){
                if (result === "startedPZP" && self.webServerState !== global.states[2]) {
                  pzpWebSocket.startPzpWebSocketServer(self, config, function() {
                    self.update(callback);
                  });
                }
              });
            }
          });
        });
      } catch (err) {
        log.error("failed Starting PZP in Hub Mode");
        self.state = global.states[0];
        callback.call(self, "failedStarting", self);
        return;
      }
    });
  });
}

function checkConfiguration(config) {
  log.info("Your device has not been enrolled to PZH yet");
  log.info("If you are connecting PZH from command line.. ensure following commands are specified");
  if (config.pzhHost === "") {
    log.error("pzhHost should be ip address or a domain name, by default value it is localhost");
    return false;
  }
  if (config.pzhName === "") {
    log.error("pzhName should not be empty, please enter your full name as it appears on PZH farm page");
    log.error("./webinos_pzp.js --auth-code=\"<code>\"  --pzh-name=\"<fullname>\"");
    return false;
  }
  if (config.code === "DEBUG") {
    log.error("No authorization code specified, please generate code on PZH and enter while starting PZP");
    log.error("./webinos_pzp.js --auth-code=\"<code>\"  --pzh-name=\"<fullname>\"");
    return false;
  }
  return true;
}

module.exports = Pzp;
