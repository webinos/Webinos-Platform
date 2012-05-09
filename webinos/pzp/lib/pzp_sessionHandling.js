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
* @description It starts Pzp and handle communication with web socket server. Websocket server allows starting Pzh and Pzp via a web browser
*/

var path = require('path');
var tls  = require('tls');
var fs   = require('fs');

var webinos        = require('webinos')(__dirname);
var log            = require('./session').common.debug;
var session        = require('./session');
var rpc            = webinos.global.require(webinos.global.rpc.location, 'lib/rpc');
var MessageHandler = webinos.global.require(webinos.global.manager.messaging.location, 'lib/messagehandler').MessageHandler;
var RPCHandler     = rpc.RPCHandler;

var pzp_server   = require('./pzp_server'); // Needed as we start PZP server from here
var websocket    = require('./pzp_websocket'); // Needed as we start PZP webserver after PZP is started

var instance, sessionPzp = [];

var Pzp = function (modules) {
	// Stores PZH server details
	this.connectedPzh= [];
	this.connectedPzhIds = [];

	// Stores connected PZP information
	this.connectedPzp = {};
	this.connectedPzpIds = [];

	// List of connected apps i.e session with browser
	this.connectedWebApp = {};

	// sessionWebApp for the connected web pages
	this.sessionWebApp = 0;

	//Configuration details of Pzp (certificates, file names)
	this.config = {};

	// Default port to be used by PZP Server
	this.pzpServerPort = 8040;

	// Used for session reuse
	this.tlsId = '';

	// Code used for the first run to authenticate with PZH.
	this.code = null;

	// For a single callback to be registered via addRemoteServiceListener.
	this.serviceListener;

	// Handler for remote method calls.
	this.rpcHandler = new RPCHandler(this);

	// handler for all things message
	this.messageHandler = new MessageHandler(this.rpcHandler);

	// load specified modules
	this.rpcHandler.loadModules(modules);
	this.tried = true;
};

Pzp.prototype.prepMsg = function(from, to, status, message) {
	var msg = {'type':'prop',
		'from':from,
		'to':to,
		'payload':{'status':status,
			'message':message}};

	this.sendMessage(msg, to);
};

Pzp.prototype.wsServerMsg = function(message) {
	if(typeof this.sessionId !== "undefined" && typeof this.sessionWebAppId !== "undefined") {
		this.prepMsg(this.sessionId, this.sessionWebAppId, 'info', message);
	}
};

/* It is responsible for sending message to correct entity. It checks if message is
	* for Apps connected via WebSocket server. It forwards message to the correct
	* WebSocket pzpInstance or else message is send to PZH or else to connect PZP server or pzpInstance
	* @param message to be sent forward
	* @param address to forward message
	*/
Pzp.prototype.sendMessage = function (message, address) {
	var self = this;
	var buf = new Buffer('#'+JSON.stringify(message)+'#', 'utf8');
	log('INFO','[PZP -'+ self.sessionId+'] Send to '+ address + ' Message '+JSON.stringify(message));

	try {
		if (self.connectedWebApp[address]) { // it should be for the one of the apps connected.
			self.connectedWebApp[address].socket.pause();
			self.connectedWebApp[address].sendUTF(JSON.stringify(message));
			self.connectedWebApp[address].socket.resume();
		} else if (self.connectedPzp[address]) {
			self.connectedPzp[address].socket.pause();
			self.connectedPzp[address].socket.write(buf);
			self.connectedPzp[address].socket.resume();
		} else if(self.connectedPzh[address]){
			self.connectedPzh[address].socket.pause();
			self.connectedPzh[address].socket.write(buf);
			self.connectedPzh[address].socket.resume();
		}
	} catch (err) {
		log('ERROR', '[PZP -'+ self.sessionId+']Error in sending send message' + err);

	}
};

var setupMessageHandler = function (pzpInstance) {
	pzpInstance.messageHandler.setGetOwnId(pzpInstance.sessionId);
	pzpInstance.messageHandler.setObjectRef(pzpInstance);
	pzpInstance.messageHandler.setSendMessage(send);
	pzpInstance.messageHandler.setSeparator("/");
};

var send = function (message, address, object) {
	"use strict";
	object.sendMessage(message, address);
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
	instance = this;
	//websocket.updateInstance(instance);
	if (typeof callback !== "undefined") {
		callback.call(instance, 'startedPZP', instance);
	}
}

sessionPzp.getPzpId = function() {
	if (typeof instance !== "undefined") {
		return instance.sessionId;
	} else {
		return "virgin_pzp";
	}
}

sessionPzp.getMessageHandler = function() {
	if (typeof instance !== "undefined") {
		return instance.messageHandler;
	} else {
		return null;
	}
}

//Added in order to be able to get the rpc handler from the current pzp
sessionPzp.getPzp = function() {
	if (typeof instance !== "undefined") {
		return instance;
	} else {
		return null;
	}
}
sessionPzp.getPzhId = function() {
	if (typeof instance !== "undefined") {
		return instance.pzhId;
	} else {
		return "undefined";
	}
}

sessionPzp.getConnectedPzhId = function() {
	if (typeof instance !== "undefined") {
		return instance.connectedPzhIds;
	} else {
		return [];
	}
}

sessionPzp.getConnectedPzpId = function() {
	if (typeof instance !== "undefined") {
		return instance.connectedPzpIds;
	} else {
		return [];
	}
}

Pzp.prototype.authenticated = function(cn, pzpInstance, callback) {
	var self = this;
	if(!self.connectedPzp.hasOwnProperty(self.sessionId)) {
		log('INFO','[PZP -'+ self.sessionId+'] Connected to PZH & Authenticated');
		self.pzhId = cn;

		self.sessionId = self.pzhId + "/" + self.config.details.name;
		self.rpcHandler.setSessionId(self.sessionId);
		self.connectedPzh[self.pzhId] = {socket: pzpInstance};
		self.connectedPzhIds.push(self.pzhId);

		self.connectedPzp[self.sessionId] = {socket: pzpInstance};

		self.pzpAddress = pzpInstance.socket.address().address;
		self.tlsId[self.sessionId] = pzpInstance.getSession();

		pzpInstance.socket.setKeepAlive(true, 100);

		setupMessageHandler(self);

		var msg = self.messageHandler.registerSender(self.sessionId, self.pzhId);
		self.sendMessage(msg, self.pzhId);

		pzp_server.startServer(self, function() {
			// The reason we send to PZH is because PZH acts as a point of synchronization for connecting PZP's
			self.prepMsg(self.sessionId, self.pzhId, 'pzpDetails', self.pzpServerPort);
			var localServices = self.rpcHandler.getRegisteredServices();
			self.prepMsg(self.sessionId, self.pzhId, 'registerServices', localServices);
			log('INFO', '[PZP -'+ self.sessionId+'] Sent msg to register local services with pzh');

		});
		callback.call(self, 'startedPZP');
	}
};

/* It is responsible for connecting with PZH and handling events.
	* It does JSON parsing of received message
	* @param config structure used for connecting with Pzh
	* @param callback is called after connection is useful or fails to inform startPzp
	*/
Pzp.prototype.connect = function (conn_key, conn_csr, callback) {
	var self, pzpInstance, master;
	self = this;
	var conn_key, config = {};
	try {
		if (typeof self.config.master.cert !== "undefined" && self.config.master.cert !== '' ) {
			config = {
				key : conn_key,
				cert: self.config.conn.cert,
				crl : self.config.master.crl,
				ca  : self.config.master.cert,
				servername: self.config.details.servername
			};
		} else {
			config = {
				key : conn_key,
				cert: self.config.conn.cert,
				servername: self.config.details.servername
			};
		}
		pzpInstance = tls.connect(session.configuration.pzhPort, self.address, config,
		function(conn) {
			log('INFO','[PZP -'+ self.sessionId+'] Connection to PZH status: ' + pzpInstance.authorized );
			log('INFO','[PZP -'+ self.sessionId+'] Reusing session : ' + pzpInstance.isSessionReused());

			if(pzpInstance.authorized){
				var text = decodeURIComponent(pzpInstance.getPeerCertificate().subject.CN);
				var cn = text.split(':')[1];
				self.authenticated(cn, pzpInstance, callback);
			} else {
				log('INFO','[PZP -'+ self.sessionId+']: Not Authenticated ' );
				if (typeof conn_csr !== "undefined" && conn_csr !== null) {
					var text = decodeURIComponent(pzpInstance.getPeerCertificate().subject.CN);
					self.pzhId = text.split(':')[1];//parseMsg.from;
					self.connectedPzh[self.pzhId] = {socket: pzpInstance};
					self.prepMsg(self.sessionId, self.pzhId,
						'clientCert', { csr: conn_csr,
						name: self.config.details.name,
						code: self.code //"DEBUG"
					});
				}
			}
		});

	} catch (err) {
		log('ERROR', '[PZP -'+ self.sessionId+'] Connection Exception' + err);
		throw err;
	}

	/* It fetches data and forward it to processMsg
	* @param data is the received data
	*/
	pzpInstance.on('data', function(data) {
		try {
			pzpInstance.pause(); // This pauses socket, cannot receive messages
			self.processMsg(data, callback);
			pzpInstance.resume();// unlocks socket.
		} catch (err) {
			log('ERROR', '[PZP] Exception ' + err);

		}
	});

	pzpInstance.on('end', function () {
		var webApp;
		log('INFO', '[PZP -'+ self.sessionId+'] Connection terminated');
		if (typeof self.sessionId !== "undefined") {
			self.messageHandler.removeRoute(self.pzhId, self.sessionId);

			delete self.connectedPzh[self.pzhId];
			delete self.connectedPzp[self.sessionId];

			self.pzhId     = '';
			self.sessionId = self.config.details.name;
			self.rpcHandler.setSessionId(self.sessionId);

			self.connectedApp(instance);
			setupMessageHandler(self);
			for ( webApp in self.connectedWebApp ) {
				if (self.connectedWebApp.hasOwnProperty(webApp)) {
					var addr = self.sessionId + '/' + self.sessionWebApp;
					self.sessionWebApp += 1;
					self.connectedApp[addr] = self.connectedApp[webApp];
					var payload = {'pzhId':self.pzhId,'connectedPzp': self.connectedPzpIds,'connectedPzh': self.connectedPzhIds};
					self.prepMsg(self.sessionId, addr, 'registeredBrowser', payload);
				}
			}
		}
		// TODO: Try reconnecting back to server but when.
	});

	pzpInstance.on('error', function (err) {
		log('ERROR', '[PZP -'+self.sessionId+'] Error connecting server (' + err+')');

		// connection to PZH refused likely because there is no PZH
		// go into PZP mode from PZH/PZP mode
		if (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') {
			self.pzhId = '';
			self.sessionId = self.config.details.name;
			self.rpcHandler.setSessionId(self.sessionId);
			setupMessageHandler(self);
			log('INFO', '[PZP -'+self.sessionId+'] VIRGIN PZP mode');
			callback('startedPZP');
		}
	});

	pzpInstance.on('close', function () {
		log('INFO', '[PZP -'+ self.sessionId+'] Connection closed');
	});

};

Pzp.prototype.connectedApp = function(connection) {
	var self = this;
	if(typeof self !== "undefined" && typeof self.sessionId !== "undefined") {
		var id, connectedPzp=[];
		self.sessionWebAppId  = self.sessionId+ '/'+ self.sessionWebApp;
		self.sessionWebApp  += 1;
		self.connectedWebApp[self.sessionWebAppId] = connection;
		payload = {'pzhId':self.pzhId,'connectedPzp': self.connectedPzpIds,'connectedPzh': self.connectedPzhIds};
		self.prepMsg(self.sessionId, self.sessionWebAppId, 'registeredBrowser', payload);
	}
};

Pzp.prototype.processMsg = function(data, callback) {
	var self = this;
	var  msg, i ;
	session.common.processedMsg(self, data, function(message) { // 1 is for #
		for (var j = 1 ; j < (message.length-1); j += 1 ) {
			if (message[j] === '') {
				continue;
			}

			var parseMsg = JSON.parse(message[j]);
			if(parseMsg.type === 'prop' && parseMsg.payload.status === 'signedCert') {
				log('INFO', '[PZP -'+self.sessionId+'] PZP Writing certificates data ');
				self.config.conn.cert   = parseMsg.payload.message.clientCert;
				self.config.master.cert = parseMsg.payload.message.masterCert;

				session.configuration.storeConfig(self.config, function() {
					callback.call(self, 'startPZPAgain');
				});

			} // This is update message about other connected PZP
			else if(parseMsg.type === 'prop' && parseMsg.payload.status === 'pzpUpdate') {
				log('INFO', '[PZP -'+self.sessionId+'] Update PZPs details') ;
				msg = parseMsg.payload.message;
				for ( var i in msg) {
					if (msg.hasOwnProperty(i) && self.sessionId !== msg[i].name) {
						if(!self.connectedPzp.hasOwnProperty(msg[i].name)) {

							self.connectedPzp[msg[i].name] = {'address': msg[i].address, 'port': msg[i].port};
							self.connectedPzpIds.push(msg[i].name);

							if(msg[i].newPzp) {
								pzp_server.connectOtherPZP(self, msg[i]);
							}
							self.wsServerMsg("Pzp Joined " + msg[i].name);
							self.prepMsg(self.sessionId, self.sessionWebAppId, 'update', {pzp: msg[i].name });
						}

					}
				}
			} else if(parseMsg.type === 'prop' && parseMsg.payload.status === 'failedCert') {
				log('ERROR', '[PZP -'+ self.sessionId+']Failed to get certificate from PZH');
				callback.call(self, "ERROR");

			} else if(parseMsg.type === 'prop' && parseMsg.payload.status === 'foundServices') {
				log('INFO', '[PZP -'+self.sessionId+'] Received message about available remote services.');
				this.serviceListener && this.serviceListener(parseMsg.payload);
			}
			// Forward message to message handler
			else {
				self.messageHandler.onMessageReceived( parseMsg, parseMsg.to);
			}
		}
	});
};

/**
	* starts pzp, creates pzpInstance, start servers and event listeners
	* @param server name
	* @param port: port on which PZH is running
	*/
sessionPzp.startPzp = function(config, modules, callback) {
	if (typeof config === 'object') {
		var pzpInstance;
		if (modules !== 'undefined') {
			pzpInstance = new Pzp(modules);
			pzpInstance.modules  = modules;
		}
		if (pzpInstance !== 'undefined' && config && config.code !== 'undefined') {
			pzpInstance.code = config.code;
		}

		if (config && config.pzhHost !== 'undefined' && config.pzpName!== 'undefined' && config.pzpHost !== 'undefined') {
			session.configuration.createDirectoryStructure( function() {
				session.configuration.setConfiguration(config.pzpName, 'Pzp', config.pzhHost, function (configure, conn_key, conn_csr) {
					var addr;
					if (configure === "undefined") {
						log('ERROR', 'Error in initializing PZP configuration')
						return;
					}

					pzpInstance.config                    = configure;
					pzpInstance.sessionId                 = configure.details.name;

					if (config.pzhHost && config.pzhHost.split('/')) {
						addr = config.pzhHost.split('/')[0];
					} else {
						addr = config.pzhHost;
					}
					session.common.resolveIP(addr, function(resolvedAddress) {
						log('INFO', '[PZP -'+ pzpInstance.sessionId+'] Connecting Address: ' + resolvedAddress);
						pzpInstance.address = resolvedAddress;
						try {
							pzpInstance.connect(conn_key, conn_csr, function(result) {
								if(result === 'startedPZP') {
									websocket.startPzpWebSocketServer(pzpInstance, config, function() {
										pzpInstance.update(callback);
									});
								} else if(result === 'startPZPAgain'){
									pzpInstance.connect(conn_key, null, function(result){
										if (result === 'startedPZP') {
											websocket.startPzpWebSocketServer(pzpInstance, config, function() {
													pzpInstance.update(callback);
											});
										}
									});
								}
							});
						} catch (err) {
							callback.call(pzpInstance, 'failedStarting', pzpInstance);
							return;
						}
					});
				});
			});
		}
	}
};



if (typeof exports !== 'undefined') {
	exports.startPzp = sessionPzp.startPzp;
	exports.getPzp = sessionPzp.getPzp;
	exports.getPzpId = sessionPzp.getPzpId;
	exports.getPzhId = sessionPzp.getPzhId;
	exports.getConnectedPzhId = sessionPzp.getConnectedPzpId;
	exports.getConnectedPzpId = sessionPzp.getConnectedPzpId;
	exports.getMessageHandler = sessionPzp.getMessageHandler;
}

