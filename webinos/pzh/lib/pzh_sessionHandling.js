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
* @description session_pzh.js starts Pzh and handle communication with a messaging manager. It is also responsible for loading rpc modules.
*/
(function () {
	"use strict";

	/**
	 * Node modules used by Pzh
	 */
	var tls = require('tls'),
		fs = require('fs'),
		path = require('path'),
		crypto = require('crypto'),
		util = require('util');

	var moduleRoot   = require(path.resolve(__dirname, '../dependencies.json'));
	var dependencies = require(path.resolve(__dirname, '../' + moduleRoot.root.location + '/dependencies.json'));
	var webinosRoot  = path.resolve(__dirname, '../' + moduleRoot.root.location);

	if (typeof exports !== 'undefined') {
		try {
			/**
			 * Webinos Modules loaded or used in PZH
			 */
			var rpc          = require(path.join(webinosRoot, dependencies.rpc.location));
			var authcode     = require(path.join(webinosRoot, dependencies.pzh.location, 'lib/pzh_authcode.js'));
			var cert         = require(path.join(webinosRoot, dependencies.pzp.location, 'lib/session_certificate.js'));
			var utils        = require(path.join(webinosRoot, dependencies.pzp.location, 'lib/session_common.js'));
			var log          = require(path.join(webinosRoot, dependencies.pzp.location, 'lib/session_common.js')).debugPzh;
			var pzhapis      = require(path.join(webinosRoot, dependencies.pzh.location, 'lib/pzh_internal_apis.js'));
			var configuration = require(path.join(webinosRoot, dependencies.pzp.location, 'lib/session_configuration.js'));
			var farm         = require(path.join(webinosRoot, dependencies.pzh.location, 'lib/pzh_farm.js'));
			var webInt       = require(path.join(webinosRoot, dependencies.pzh.location, 'web/pzh_webserver.js'));

			var MessageHandler = require(path.join(webinosRoot, dependencies.manager.messaging.location, 'lib/messagehandler.js')).MessageHandler;
			var RPCHandler     = rpc.RPCHandler;
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
		/** Holds PZH Session Id */
		this.sessionId = 0;
		/** Holds PZH Configuration particularly certificates */
		this.config = {};
		/** Holds Connected PZH information such as IP address, port and socket */
		this.connectedPzh = [];
		/** Holds connected PZP information such as IP address and socket connection */
		this.connectedPzp = [];
		/** This is used for synchronization purpose with connected PZP and PZH */
		this.connectedPzhIds = [];
		// Handler for remote method calls.
		this.rpcHandler = new RPCHandler();
		// handler of all things message
		this.messageHandler = new MessageHandler(this.rpcHandler);
		// load specified modules
		this.rpcHandler.loadModules(modules);
		/* This is used for authenticating new PZPs */
		var self = this;
		authcode.createAuthCounter(function (res) {
		    self.expecting = res;
		});
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
			log(this.sessionId, 'INFO', "Prep message failed");
		} else {
			msg = {'type'  : 'prop',
				'from' : from,
				'to'   : to,
				'payload' : {'status' : status, 'message' : message}};
		}		
		return msg;
	};

	/**
	 * @description It searches for correct PZP by looking in connectedPzp and connectedPzh. As we are using objects, they need to be stringify to be processed at other end of the socket
	 * @param {Object} message Message to be send forward
	 * @param {String} address Destination session id
	 * @param {Object} conn This is used in special cases, especially when Pzh and Pzp are not connected. 
	 */
	Pzh.prototype.sendMessage = function (message, address, conn) {
		var buf, self = this;
		try {
			/** TODO: This is a temporary solution to append message with #. This is done in order to identify whole message at receiving end */
			log(self.sessionId, 'INFO', '[PZH -'+ self.sessionId+'] Send to '+ address + ' Message '+JSON.stringify(message));
			buf = new Buffer('#'+JSON.stringify(message)+'#', 'utf8');
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
			log(self.sessionId, 'ERROR ','[PZH -'+ self.sessionId+'] Exception in sending packet ' + err);
			
		}
	};

	/**
	 * @description Responsible for adding PZH and PZP. It also is responsible for registering with message handler and dessimenating information about connected PZP's to other PZP
	 * @param {Object} self: PZH instance
	 * @param {Object} conn: Connection object when any new connection is accepted. 
	 */
	Pzh.prototype.handleConnectionAuthorization = function (self, conn) {
		var msg;
		/**
		 * Allows PZP to connect if it has proper QRCode
		 */
		if(conn.authorized === false) {
			log(self.sessionId, 'INFO', '[PZH -'+self.sessionId+'] Connection NOT authorised at PZH');
			/**
			 * @description: If this is a new PZP, we allow if it has proper QRCode
			 */
			self.expecting.isExpected(function(expected) {
				if (!expected || conn.authorizationError !== "UNABLE_TO_GET_CRL"){
					//we're not expecting anything - disallow.
					log(self.sessionId, 'INFO', "Ending connect: " + conn.authorizationError);
					conn.socket.end();
				} else {
					log(self.sessionId, 'INFO',"Continuing connect - expected: " + conn.authorizationError);
				}
			});
		}
		
		/**
		 * PZP/PZH connecting with proper certificate at both ends
		 */
		if(conn.authorized) {
			var cn, data;
			log(self.sessionId, 'INFO', '[PZH -'+self.sessionId+'] Connection authorised at PZH');
			try {
				// Get peer certificate details from the certiicate
				cn = conn.getPeerCertificate().subject.CN;
				var text = decodeURIComponent(cn);
				data = text.split(':');
			} catch(err) {
				log(self.sessionId, 'ERROR ','[PZH  -'+self.sessionId+'] Exception in reading common name of peer PZH certificate ' + err);
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
					log(self.sessionId, 'ERROR ','[PZH -'+self.sessionId+'] Pzh information in certificate is in unrecognized format ' + err1);
					return;
				}

				log(self.sessionId, 'INFO', '[PZH -'+self.sessionId+'] PZH '+pzhId+' Connected');
				if(!self.connectedPzh.hasOwnProperty(pzhId)) {
					// Store socket information for communication purpose
					self.connectedPzh[pzhId] = {'socket': conn};
					// This structure is updated for synchronization purpose
					self.connectedPzhIds.push(pzhId);

					// Register PZH with message handler
					msg = self.messageHandler.registerSender(self.sessionId, pzhId);
					self.sendMessage(msg, pzhId);

					// Sends connected PZH details to other connected PZH's
					msg = self.prepMsg(self.sessionId, pzhId, 'pzhUpdate', self.connectedPzhIds);
					self.sendMessage(msg, pzhId);
				}
			}
			/**
			 * Authorized PZP session handling
			 */
			else if(data[0] === 'Pzp' ) {
				var sessionId, err1;
				try {
					sessionId = self.sessionId+'/'+data[1];
				} catch(err1) {
					log(self.sessionId, 'ERROR ','[PZH  -' + self.sessionId + '] Exception in reading common name of PZP certificate ' + err1);
					return;
				}
				
				log(self.sessionId, 'INFO', '[PZH -'+self.sessionId+'] PZP '+sessionId+' Connected');
				// Check if PZP is connected or not already, if already connected delete details
				if(self.connectedPzp.hasOwnProperty(sessionId)) {
					delete self.connectedPzp[sessionId];
				} 				
				// Used for communication purpose. Address is used as PZP might have different IP addresses
				self.connectedPzp[sessionId] = {'socket': conn,  'address': conn.socket.remoteAddress};

				// Register PZP with message handler	
				msg = self.messageHandler.registerSender(self.sessionId, sessionId);
				self.sendMessage(msg, sessionId);
				
				
			}
			webInt.updateList(self);
		}
	};

	/**
	 * @description: Calls processmsg to handle incoming message to PZH. This is called by PZH Farm
	 * @param {Object} conn: Socket connection details of client socket ..
	 * @param {String} data: Incoming data received from other PZH or PZP
	 */
	Pzh.prototype.handleData = function(conn, data) {
		try {
			conn.pause();
			this.processMsg(conn, data);
			conn.resume();
		} catch (err) {
			log(this.sessionId, 'ERROR ', '[PZH] Exception in processing recieved message ' + err);
		}
	}
	
	Pzh.prototype.sendPzpUpdate = function (sessionId, conn, port) {
		// Fetch details about connected pzp's
		// Information to be sent includes address, id and indication which is a newPZP joining
		var self = this;
		// Fetch details about connected pzp's
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
		// Send message to all connected pzp's about new pzp that has joined in
		for(var i in self.connectedPzp) {
			if (self.connectedPzp.hasOwnProperty(i)) {				
				var msg = self.prepMsg(self.sessionId, i, 'pzpUpdate', otherPzp);
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
					configuration.signedCert(parse.payload.message.csr, self.config, parse.payload.message.name, 2, function(config) { // pzp = 2
						// unset expected QRCode
						self.expecting.unsetExpected(function() {
							// Send signed certificate and master certificate to PZP
							var payload = {'clientCert': config.signedCert[parse.payload.message.name], 'masterCert':self.config.master.cert};
							var msg = self.prepMsg(self.sessionId, parse.from, 'signedCert', payload);
							// update configuration with signed certificate details ..
							cb.call(self, null, msg);
						});
					});
				} else {
					// Fail message
					var payload = {};
					var msg = self.prepMsg(self.sessionId, parse.from, 'failedCert', payload);
					log(self.sessionId, 'INFO', '[PZH -'+self.sessionId+'] Failed to create client certificate: not expected code, please generate via PZH');
					cb.call(self, null, msg);
				}
			});
			
		} catch (err) {
			log(self.sessionId, 'ERROR ', '[PZH -'+self.sessionId+'] Error Signing Client Certificate' + err);
			cb.call(self, "Could not create client certificate");
		}
	}
	/**
	* @description process incoming messages, message of type prop are only received while session is established. Rest of the time it is usually RPC messages
	* @param {Object} conn: It is used in special scenarios, when PZP is not connected and we need to send response back
	* @param {data} data: Actual data received from other PZH or PZP.
	*/
	Pzh.prototype.processMsg = function(conn, data) {
		var self = this;
		// ProcessedMsg handles message coming in small chunks.  
		utils.processedMsg(self, data, function(message) {
			// Sometime messages are accumulated, thsi allows going through combined message received
			for (var i = 1 ; i < (message.length-1); i += 1 ) {
				if (message[i] === '') {
					continue;
				}
				// Parse each individual message
 				log(self.sessionId, 'DEBUG', '[PZH -'+self.sessionId+'] Received message' + message[i])
				var parse= JSON.parse(message[i]);
				
				// Message sent by PZP connecting first time based on this message it generates client certificate
				if(parse.type === 'prop' && parse.payload.status === 'clientCert' ) {
					self.addNewPZPCert(parse, function(err, msg) {
						if (err !== null) {
							log(self.sessionId, 'INFO', err);
							return;
						} else {
							self.sendMessage(msg, parse.from,conn);
						}
					});
				} else if (parse.type === "prop" && parse.payload.status === "pzpDetails") {
					log(self.sessionId, 'INFO', '[PZH -'+ self.sessionId+'] Receiving details from PZP...');
					self.sendPzpUpdate(parse.from, conn, parse.payload.message);				
				} // information sent by connecting PZP about services it supports. These details are then used by findServices
				// information sent by connecting PZP about services it supports. These details are then used by findServices 
				else if(parse.type === "prop" && parse.payload.status === 'registerServices') {
					log(self.sessionId, 'INFO', '[PZH -'+ self.sessionId+'] Receiving Webinos Services from PZP...');
					self.rpcHandler.addRemoteServiceObjects(parse.payload.message);
				}
				// Send findServices information to connected PZP..
				else if(parse.type === "prop" && parse.payload.status === 'findServices') {
					log(self.sessionId, 'INFO', '[PZH -'+ self.sessionId+'] Trying to send Webinos Services from this RPC handler to ' + parse.from + '...');
					var services = self.rpcHandler.getAllServices(parse.from);
					var msg = self.prepMsg(self.sessionId, parse.from, 'foundServices', services);
					msg.payload.id = parse.payload.message.id;
					self.sendMessage(msg, parse.from);
					log(self.sessionId, 'INFO', '[PZH -'+ self.sessionId+'] Sent ' + (services && services.length) || 0 + ' Webinos Services from this RPC handler.');
				}
				// Message is forwarded to Messaging manager
				else {
					try {
						self.messageHandler.onMessageReceived(parse, parse.to);
					} catch (err2) {
						log(self.sessionId, 'ERROR', '[PZH -'+ self.sessionId+'] Error Message Sending to Messaging ' + err2);
						return;
					}
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
			log(null, 'ERROR', '[PZH] Farm is not running, please startFarm');
			callback(false);
		} else {
			if (typeof uri === "undefined" || uri === 'null' || typeof modules === "undefined" || modules === 'null' ){
				log(null, 'ERROR','PZH could not be started as one of the details are missing ');
				callback(false);
			} else {
				var name = uri.split('/')[1];
				var pzh  = new Pzh(modules);
				configuration.setConfiguration(name, 'Pzh', uri, function(config, conn_key) {
					pzh.config    = config;
					// Set sessionId by reading common value.
					pzh.sessionId = name ;//Pzh_DeviceName
					// modules loaded in pzh
					pzh.modules   = modules;
					// pzh servername
					pzh.config.details.servername = uri;
					// store pzh instance in farm, this will allow farm to know about PZH instance.
					farm.pzhs[uri] = pzh;
					// Information for reloading PZH if PZH Farm restarts later
					farm.config.pzhs[uri] = modules;
					// Certificate parameters that will be added in SNI context of farm
					var options = {
						key  : conn_key,
						cert : config.conn.cert,
						ca   : [config.master.cert],
						crl  : [config.master.crl],
						requestCert: true,
						rejectUnauthorized: false
					};
					pzh.options = options;
					pzh.setMessageHandler();
					// RPC instance getting PZH session id
					pzh.rpcHandler.setSessionId(pzh.sessionId);

					if (typeof farm.server === "undefined" || farm.server === null) {
						log(pzh.sessionId, 'ERROR', '[PZH -'+ self.sessionId+'] Farm is not running, please startFarm');
					} else {
						// This adds SNI context to existing running PZH server
						farm.server.addContext(uri, options);
					}

					configuration.storeConfig(farm.config, function() {
						callback(true, pzh);
					});
				});
			}
		}
	}
}());

