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
*******************************************************************************/

/**
 * Handles connection with other PZP and starts PZP
 */
var pzp_server = exports;

var tls   = require('tls');
var path  = require('path');

var moduleRoot   = require(path.resolve(__dirname, '../dependencies.json'));
var dependencies = require(path.resolve(__dirname, '../' + moduleRoot.root.location + '/dependencies.json'));
var webinosRoot  = path.resolve(__dirname, '../' + moduleRoot.root.location);
var cert         = require(path.join(webinosRoot, dependencies.pzp.location, 'lib/session_certificate.js'));        
var logs         = require(path.join(webinosRoot, dependencies.pzp.location, 'lib/session_common.js')).debug;
var common       = require(path.join(webinosRoot, dependencies.pzp.location, 'lib/session_common.js'));
var rpc          = require(path.join(webinosRoot, dependencies.rpc.location, 'lib/rpc.js'));
var configuration= require(path.join(webinosRoot, dependencies.pzp.location, 'lib/session_configuration.js'));

pzp_server.connectOtherPZP = function (pzp, msg) {
	var parent = pzp, client;
	configuration.fetchKey(parent.config.conn.key_id, function(key) {
		var options = {
				key:  key,
				cert: parent.config.conn.cert,
				crl:  parent.config.master.crl,
				ca:   parent.config.master.cert
				};

		client = tls.connect(msg.port, msg.address, options, function () {
			if (client.authorized) {
				parent.status = 'peer_mode';
				logs('INFO', "[PZP - " + parent.sessionId + "] Client: Authorized & Connected to PZP: " + msg.address + " name = " + msg.name);
				parent.connectedPeer[msg.name] = {socket: client};
				var msg1 = parent.messageHandler.registerSender(parent.sessionId, msg.name);
				parent.sendMessage(msg1, msg.name);
			} else {
				logs('INFO', "[PZP - " + parent.sessionId + "]  Client: Connection failed, first connect with PZH to download certificated");
			}
		});

		client.on('data', function (data) {
			try {
				client.pause();
				
				common.processedMsg(parent, data, function(data2) {
					for (var j = 1 ; j < (data2.length-1); j += 1 ) {
						if (data2[j] === '') {
							continue;
						}
						var parse = JSON.parse(data2[j]);
						if(parse.type === 'prop' && parse.payload.status === 'foundServices') {
							logs('INFO', '[PZP -'+parent.sessionId+'] Received message about available remote services.');
							parent.serviceListener && parent.serviceListener(parse.payload);
						} else {
							parent.messageHandler.onMessageReceived(parse, parse.to);
						}
					}
				});
				
				client.resume();
			} catch (err) {
				logs('ERROR', "[PZP - " + parent.sessionId + "]  Client: Exception" + err);
			}
		});

		client.on('end', function () {
			logs('INFO', "[PZP - " + parent.sessionId + "]  Client: Connection terminated");
		});


		client.on('error', function (err) {
			logs('ERROR', "[PZP - " + parent.sessionId + "]  Client:  " + err);			
		});

		client.on('close', function () {
			logs('INFO', "[PZP - " + parent.sessionId + "] Client:  Connection closed by PZP Server");
		});
	});
};

pzp_server.startServer = function (self, callback) {
	var server;
	configuration.fetchKey(self.config.conn.key_id, function(key) {
		// Read server configuration for creating TLS connection
		var config = {	
				key: key,
				cert: self.config.conn.cert,
				ca: self.config.master.cert,
				crl: self.config.master.crl,
				requestCert: true, 
				rejectUnauthorized: true
		};

		server = tls.createServer(config, function (conn) {
			var cn, clientSessionId;
			/* If connection is authorized:
			* SessionId is generated for PZP. Currently it is PZH's name and 
			* PZP's CommonName and is stored in form of PZH::PZP.
			* registerClient of message manager is called to store PZP as client of PZH
			* Connected_client list is sent to connected PZP. Message sent is with payload 
			* of form {status:'Auth', message:self.connected_client} and type as prop.
			*/
			if (conn.authorized) {
				self.status = 'peer_mode';
				var text = decodeURIComponent(conn.getPeerCertificate().subject.CN);
				var cn = text.split(':')[1];
				clientSessionId = self.pzhId + '/'+ cn; //self.pzhId + '/' +cn;
				self.connectedPeer[clientSessionId]= {socket: conn};
				logs(2, "PZP (" + self.sessionId +") Server: Client Authenticated " + clientSessionId) ;
				var msg = self.messageHandler.registerSender(self.sessionId, clientSessionId);
				self.sendMessage(msg, clientSessionId);				
				
			} 
			
			conn.on('connection', function () {
				utils.debug(2, "PZP (" + self.sessionId +") Server: Connection established");
			});
	
			conn.on('data', function (data) {
				try{
					common.processedMsg(self, data, function(data2) {
						for (var j = 1 ; j < (data2.length-1); j += 1 ) {
							if (data2[j] === '') {
								continue;
							}
							var parse = JSON.parse(data2[j]);
// 							if(parse.type === "prop" && parse.payload.status === 'registerServices') {
// 								log(self.sessionId, 'INFO', '[PZH -'+ self.sessionId+'] Receiving Webinos Services from PZP...');
// 								self.rpcHandler.addRemoteServiceObjects(parse.payload.message);
// 							}
							// Send findServices information to connected PZP..
							if(parse.type === "prop" && parse.payload.status === 'findServices') {
								logs(self.sessionId, 'INFO', '[PZH -'+ self.sessionId+'] Trying to send Webinos Services from this RPC handler to ' + parse.from + '...');
								var services = self.rpcHandler.getAllServices(parse.from);
								var msg = {'type':'prop', 'from':self.sessionId, 'to':parse.from, 'payload':{'status':'foundServices', 'message':services}};
								msg.payload.id = parse.payload.message.id;
								self.sendMessage(msg, parse.from);
								logs(self.sessionId, 'INFO', '[PZH -'+ self.sessionId+'] Sent ' + (services && services.length) || 0 + ' Webinos Services from this RPC handler.');
							}	
							else if (parse.type === 'prop' && parse.payload.status === 'pzpDetails') {
								if(self.connectedPeer[parse.from]) {
									self.connectedPeer[parse.from].port = parse.payload.message;
								} else {
									logs(2, "PZP (" + self.sessionId +") Server: Received PZP"+
									"details from entity which is not registered : " + parse.from);
								}
							} else {
								self.messageHandler.onMessageReceived( parse, parse.to);
							}
						}
					});					
					
				} catch(err) {
					utils.debug(1, 'PZP (' + self.sessionId + ' Server: Exception' + err);

				}			
			});

			conn.on('end', function () {
				logs('INFO', "[PZP Server - " + self.sessionId + "] connection end");
			});

			// It calls removeClient to remove PZP from connected_client and connectedPeer.
			conn.on('close', function() {
				logs('ERROR', "[PZP Server - " + self.sessionId + "] socket closed");
			});

			conn.on('error', function(err) {
				logs('ERROR', "[PZP Server - " + self.sessionId + "] " + err);
			});
		});
	
		server.on('error', function (err) {
			if (err.code === 'EADDRINUSE') {
				logs('INFO', "[PZP Server - " + self.sessionId + "]  Address in use");
				self.pzpServerPort = parseInt(self.pzpServerPort, 10) + 1;
				server.listen(self.pzpServerPort, self.pzpAddress);
			}
		});

		server.on('listening', function () {
			logs('INFO', "[PZP Server - " + self.sessionId + "] listening as server on port :" + self.pzpServerPort + " address : "+ self.pzpAddress);
			callback.call(self, 'started');
		});				
			
		server.listen(self.pzpServerPort, self.pzpAddress);
	});
};
