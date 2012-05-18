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
var path = require("path");
var tls = require("tls");
var fs   = require("fs");

var webinos       = require("webinos")(__dirname);
var session       = require("./session");
var log           = session.common.debug;
var global        = session.configuration
var rpc           = webinos.global.require(webinos.global.rpc.location, "lib/rpc");

var MessageHandler = webinos.global.require(webinos.global.manager.messaging.location, "lib/messagehandler").MessageHandler;
var RPCHandler     = rpc.RPCHandler;

var pzpWebSocket  = require("./pzp_websocket"); // Needed as we start PZP server from here
var pzpServer     = require("./pzp_peerTLSServer"); // Needed as we start PZP server from here
var pzpClient     = require("./pzp_peerTLSClient"); // Needed as we start PZP server from here

var Pzp = function (config, modules) {
  "use strict";
  this.connectedPzh   = {}; // Stores PZH server details
  this.connectedPzp   = {}; // Stores connected PZP information
  this.connectedWebApp = {}; // List of connected apps i.e session with browser
  this.sessionWebApp   = 0;
  this.config         = {}//Configuration details of Pzp (certificates, file names)
  this.tlsId           = ""; // Used for session reuse
  this.serviceListener;   // For a single callback to be registered via addRemoteServiceListener.
  this.state          = global.states[0]; // State is applicable for hub mode but for peer mode, we need to check individually
  this.mode          = global.modes[0]; //  4 modes a pzp can be, for peer mode, each PZP needs to be checked if it is connected
  this.initializePzp(config, modules);
};


Pzp.prototype.checkMode = function(config) {
  // Check if it is virgin mode
  if (config.master.cert === '') {
    this.state = global.states[0];
    this.mode = global.modes[0]; // peer mode
  } else {
    this.state = global.states[0];
    this.mode = global.modes[1]; // hub mode
  }
  
  log("INFO", "PZP is in mode " + this.mode);
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
  var self = this, buf;
  buf = new Buffer('#'+JSON.stringify(message)+'#', 'utf8');
  log('INFO','[PZP -'+ self.sessionId+'] Mode '+ self.mode + ' State '+self.state);
  log('INFO','[PZP -'+ self.sessionId+'] Send to '+ address + ' Message '+JSON.stringify(message));
  try {
    if (self.connectedWebApp[address]) { // it should be for the one of the apps connected.
      self.connectedWebApp[address].socket.pause();
      self.connectedWebApp[address].sendUTF(JSON.stringify(message));
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
    log("ERROR", "[PZP-"+ self.sessionId+"]Error in sending send message" + err);
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
  this.connectedApp();
  if (typeof callback !== "undefined") {
    callback.call(this, "startedPZP", this);
  }
}

Pzp.prototype.authenticated = function(cn, instance, callback) {
  var self = this;
  if(!self.connectedPzp.hasOwnProperty(self.sessionId)) {
    log("INFO","[PZP-"+ self.sessionId+"] Connected to PZH & Authenticated");

    self.state = global.states[2];
    self.mode = global.modes[1];

    self.connectedPzh[self.config.pzhId] = instance;
    self.pzpAddress = instance.socket.address().address;
    self.tlsId[self.sessionId] = instance.getSession();

    instance.socket.setKeepAlive(true, 100);
    self.rpcHandler.setSessionId(self.sessionId);
    setupMessageHandler(self);

    var msg = self.messageHandler.registerSender(self.sessionId, self.config.pzhId);
    self.sendMessage(msg, self.config.pzhId);

    var localServices = self.rpcHandler.getRegisteredServices();
    self.prepMsg(self.sessionId, self.config.pzhId, "registerServices", localServices);
    log("INFO", "[PZP-"+ self.sessionId+"] Sent msg to register local services with pzh");
    
    var server = new pzpServer();
    server.startServer(self, function() {
      // The reason we send to PZH is because PZH acts as a point of synchronization for connecting PZP"s
      self.prepMsg(self.sessionId, self.config.pzhId, "pzpDetails", global.pzpServerPort);
    });

    callback.call(self, "startedPZP");
  }
};

Pzp.prototype.unauthenticated = function(conn, sessionId, pzhId, conn_csr, code) {
  try{
    var msg = {"type" : "prop", "from" : sessionId, "to": pzhId,
      "payload": {"status": "clientCert", "message": {csr: conn_csr, code: code}}};       
    var buf = new Buffer('#'+JSON.stringify(msg)+'#', 'utf8');
    conn.write(buf);
  } catch(err) {
    log("INFO","[PZP-"+ self.sessionId+"]Failed sending client certificate to the PZH" );
    conn.socket.end();
  }
}

/** @ description It is responsible for connecting with PZH and handling events.
* @param config structure used for connecting with Pzh
* @param callback is called after connection is useful or fails to inform startPzp
*/
Pzp.prototype.connect = function (conn_key, conn_csr, code, callback) {
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

    pzpInstance = tls.connect(global.pzhPort, self.address, config, function(conn) {
      log("INFO","[PZP-"+ self.sessionId+"] Connection to PZH status: " + pzpInstance.authorized );
      log("INFO","[PZP-"+ self.sessionId+"] Reusing session : " + pzpInstance.isSessionReused());

      if(pzpInstance.authorized) {
        var pzhId = decodeURIComponent(pzpInstance.getPeerCertificate().subject.CN);
        self.config.pzhId = pzhId.split(":")[1];
        global.storeConfig(self.config, function() {
          self.authenticated(self.config.pzhId, pzpInstance, callback);
        });
      } else {
        log("INFO","[PZP-"+ self.sessionId+"]: Not Authenticated " );
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
    pzpInstance.on("data", function(data) {
      try {
        pzpInstance.pause(); // This pauses socket, cannot receive messages
        self.processMsg(data, callback);
        pzpInstance.resume();// unlocks socket.
      } catch (err) {
        log("ERROR", "[PZP] Exception " + err);

      }
    });

    pzpInstance.on("end", function () {
      var webApp;
      log("INFO", "[PZP-"+ self.sessionId+"] Connection terminated from PZH");
      if (typeof self.sessionId !== "undefined") {
        self.messageHandler.removeRoute(self.config.pzhId, self.sessionId);
        self.rpcHandler.setSessionId(self.sessionId);
        setupMessageHandler(self);
        if (self.config.pzhId) {
            delete self.connectedPzh[self.config.pzhId];
        }
      }
        // TODO: Try reconnecting back to server but when.
    });

    pzpInstance.on("error", function (err) {
      log("ERROR", "[PZP-"+self.sessionId+"] Error connecting server (" + err+")");

      if (err.code === "ECONNREFUSED" || err.code === "ECONNRESET") {
        if (self.mode === global.modes[3] ) { //hub_peer mode
          self.mode = global.modes[2]; // Go in peer mode
                // state will be peer mode state
        } else if (self.mode === global.modes[1] ) { //hub mode
          self.state = global.states[0]; // not connected
        }        
        log("INFO", "[PZP-"+self.sessionId+"] PZP mode " + self.mode + " and state is " + self.state);       
      } else {
        self.mode = global.modes[1];
        self.state = global.states[0];
      }
    });

    pzpInstance.on("close", function () {
      log("INFO", "[PZP-"+ self.sessionId+"] Connection closed");
      if (self.mode === global.modes[3] ) { //hub_peer mode
        self.mode = global.modes[2]; // Go in peer mode
           // state will be peer mode state
      } else if (self.mode === global.modes[1] ) { //hub mode
        self.state = global.states[0]; // not connected
      }
      log("INFO", "[PZP-"+self.sessionId+"] PZP mode " + self.mode + " and state is " + self.state);
    });

  } catch (err) {
    log("ERROR", "[PZP-"+ self.sessionId+"] General Error : " + err);
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

      var payload = { "pzhId": self.pzhId, "connectedPzp": connectedPzpIds,"connectedPzh": connectedPzhIds};
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

Pzp.prototype.processMsg = function(data, callback) {
  var self = this;
  var msg, i ;
  session.common.processedMsg(self, data, function(message) { // 1 is for #
    for (var j = 1 ; j < (message.length-1); j += 1 ) {
      if (message[j] === '') {
        continue;
      }

      var parseMsg = JSON.parse(message[j]);
      
      if(parseMsg.type === "prop" && parseMsg.payload.status === "signedCert") {
        self.status = global.states[3]; // Disconnecting
        log("INFO", "[PZP-"+self.sessionId+"] PZP Writing certificates data ");
        self.config.own.cert    = parseMsg.payload.message.clientCert;
        self.config.master.cert = parseMsg.payload.message.masterCert;

        global.storeConfig(self.config, function() {
          self.mode  = global.modes[1]; // Moved from Virgin mode to hub mode
          self.state = global.states[0];
          callback.call(self, "startPZPAgain");
        });

      } // This is update message about other connected PZP
      else if(parseMsg.type === "prop" && parseMsg.payload.status === "pzpUpdate") {
        log("INFO", "[PZP-"+self.sessionId+"] Update PZPs details") ;
        msg = parseMsg.payload.message;
        for ( var i in msg) {
          if (msg.hasOwnProperty(i) && self.sessionId !== msg[i].name) {
            self.connectedPzp[msg[i].name] = {};
            self.connectedPzp[msg[i].name].address = msg[i].address;
            self.connectedPzp[msg[i].name].port   = msg[i].port;
            self.connectedPzp[msg[i].name].state   = global.states[0];
            if(msg[i].newPzp) {
              console.log(msg[i]);
              self.mode  = global.modes[3];
              self.state  = global.states[1];
              var client = new pzpClient(); 
              client.connectOtherPZP(self, msg[i]);
            }
          }
        }
      } else if(parseMsg.type === "prop" && parseMsg.payload.status === "failedCert") {
        log("ERROR", "[PZP-"+ self.sessionId+"] Failed to get certificate from PZH");
        callback.call(self, "ERROR");
      } else if(parseMsg.type === "prop" && parseMsg.payload.status === "foundServices") {
        log("INFO", "[PZP-"+self.sessionId+"] Received message about available remote services.");
        this.serviceListener && this.serviceListener(parseMsg.payload);
      }
      // Forward message to message handler
      else {
        self.messageHandler.onMessageReceived( parseMsg, parseMsg.to);
      }
    }
  });
};

Pzp.prototype.initializePzp = function(config, modules) {
  var self = this;
  
  self.rpcHandler     = new RPCHandler(this); // Handler for remote method calls.
  self.messageHandler = new MessageHandler(this.rpcHandler); // handler for all things message
  self.modules         = modules;
  self.rpcHandler.loadModules(modules);// load specified modules
  
  if (config && config.pzhHost !== "undefined" && config.pzpName!== "undefined" && config.pzpHost !== "undefined") {
    global.createDirectoryStructure( function() {
      global.setConfiguration(config.pzpName, "Pzp", config.pzhHost, function (configure, conn_key, conn_csr) {
        if (configure === "undefined") {
          log("ERROR", "Error in loading PZP configuration, please delete ~/.webinos/config/ and restart PZP");
          process.exit();
        }

        self.checkMode(configure);

        if (self.mode === global.modes[0] && config.code === "DEBUG") {
          log("ERROR", "Configuration Code Missing, required to enroll device to PZH");
          process.exit();
        } 

        self.config = configure;

        if (self.mode === global.modes[0]) { //Virgin
          self.sessionId = configure.name;
        } else {
          self.sessionId = configure.pzhId + '/' + configure.name;
        }

        try {
          self.states = global.states[1];
          if (config.pzhHost && config.pzhHost.split("/")) {
            addr = config.pzhHost.split("/")[0];
          } else {
            addr = config.pzhHost;
          }
          session.common.resolveIP(addr, function(resolvedAddress) {
            log("INFO", "[PZP -"+ self.sessionId+"] Connecting Address: " + resolvedAddress);
            self.address = resolvedAddress;
            self.connect(conn_key, conn_csr, config.code, function(result) {
              if(result === "startedPZP") {
                pzpWebSocket.startPzpWebSocketServer(self, config, function() {
                  self.connectedApp();
                  log("INFO", "[PZP -"+ self.sessionId+"] Started PZP");
                });
              } else if(result === "startPZPAgain") {
                self.connect(conn_key, null, null, function(result){
                  if (result === "startedPZP") {
                    pzpWebSocket.startPzpWebSocketServer(self, config, function() {
                      self.connectedApp();
                      log("INFO", "[PZP -"+ self.sessionId+"] Started PZP");
                    });
                  }
                });
              }
            });
          });
        } catch (err) {
          log("ERROR", "Failed Starting PZP in Hub Mode");
          self.state = global.states[0];
          callback.call(self, "failedStarting", self);
          return;
        }
      });
    });
  } else {
    log("ERROR", "[PZP-"+ self.sessionId+"] Failed starting PZP, configuration parameters missing " );
    process.exit();
  }
}

module.exports = Pzp;
