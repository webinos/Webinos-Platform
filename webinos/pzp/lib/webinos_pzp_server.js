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

// var moduleRoot   = require(path.resolve(__dirname, '../dependencies.json'));
// var dependencies = require(path.resolve(__dirname, '../' + moduleRoot.root.location + '/dependencies.json'));
// var webinosRoot  = path.resolve(__dirname, '../' + moduleRoot.root.location);
// var cert         = require(path.join(webinosRoot, dependencies.pzp.location, 'lib/session_certificate.js'));        
// var logs         = require(path.join(webinosRoot, dependencies.pzp.location, 'lib/session_common.js')).debug;
// var rpc          = require(path.join(webinosRoot, dependencies.rpc.location, 'lib/rpc.js'));
// var configuration= require(path.join(webinosRoot, dependencies.pzp.location, 'lib/session_configuration.js'));
var webinos = require('webinos')(__dirname);
var logs    = require('./webinos_session').common.debug;
var session = require('./webinos_session');
var rpc     = webinos.global.require(webinos.global.rpc.location, 'lib/webinos_rpc');

pzp_server.connectOtherPZP = function (pzp, msg) {
	var self = pzp, client;
	session.configuration.fetchKey(self.config.conn.key_id, function(key) {
		var options = {
				key:  key,
				cert: self.config.conn.cert,
				crl:  self.config.master.crl,
				ca:   self.config.master.cert
				};

		client = tls.connect(msg.port, msg.address, options, function () {
			if (client.authorized) {
				logs('INFO', "[PZP - " + self.sessionId + "] Client: Authorized & Connected to PZP: " + msg.address );
				self.connectedPzp[msg.name] = {socket: client};
				
				var msg1 = self.messageHandler.registerSender(self.sessionId, msg.name);
				self.sendMessage(msg1, msg.name); 
			} else {
				logs('INFO', "[PZP - " + self.sessionId + "]  Client: Connection failed, first connect with PZH to download certificated");
			}
		});

		client.on('data', function (data) {
			try {
				client.pause();
				for(var i = 1; i < data1.length-1; i += 1) {
					if (data1[i] === '') {
						continue
					}
					var parse = JSON.parse(data1[i]);
					self.messageHandler.onMessageReceived(parse, parse.to);
					client.resume();
					
				}
			} catch (err) {
				logs('ERROR', "[PZP - " + self.sessionId + "]  Client: Exception" + err);
			}
		});

		client.on('end', function () {
			logs('INFO', "[PZP - " + self.sessionId + "]  Client: Connection terminated");
		});


		client.on('error', function (err) {
			logs('ERROR', "[PZP - " + self.sessionId + "]  Client:  " + err);			
		});

		client.on('close', function () {
			logs('INFO', "[PZP - " + self.sessionId + "] Client:  Connection closed by PZP Server");
		});
	});
};

pzp_server.startServer = function (self, callback) {
	var server;
	session.configuration.fetchKey(self.config.conn.key_id, function(key) {
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
			var cn, sessionId;
			/* If connection is authorized:
			* SessionId is generated for PZP. Currently it is PZH's name and 
			* PZP's CommonName and is stored in form of PZH::PZP.
			* registerClient of message manager is called to store PZP as client of PZH
			* Connected_client list is sent to connected PZP. Message sent is with payload 
			* of form {status:'Auth', message:self.connected_client} and type as prop.
			*/
			if (conn.authorized) {
				cn = conn.getPeerCertificate().subject.CN;			
				sessionId = self.pzhId + '/' +cn.split(':')[1];
				utils.debug(2, "PZP (" + self.sessionId +") Server: Client Authenticated " + sessionId) ;
			
				if(self.connectedPzp[sessionId]) {
					self.connectedPzp[sessionId]= {socket: conn};
				} else {
					self.connectedPzp[sessionId]= {socket: conn, address: conn.socket.peerAddress.address, port: ''};
				}
			} 
			
			conn.on('connection', function () {
				utils.debug(2, "PZP (" + self.sessionId +") Server: Connection established");
			});
	
			conn.on('data', function (data) {
				try{
					utils.processedMsg(self, data, 1, function(data2) {
						for(var i = 1; i < data2.length-1; i += 1) {
							if (data2[i] === '') {
								continue
							}
							var parse = JSON.parse(data2[i]);
							if (parse.type === 'prop' && parse.payload.status === 'pzpDetails') {
								if(self.connectedPzp[parse.from]) {
									self.connectedPzp[parse.from].port = parse.payload.message;
								} else {
									utils.debug(2, "PZP (" + self.sessionId +") Server: Received PZP"+
									"details from entity which is not registered : " + parse.from);
								}
							} else {
								rpc.setSessionId(self.sessionId);
								utils.sendMessageMessaging(self, self.messageHandler, parse);
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

			// It calls removeClient to remove PZP from connected_client and connectedPzp.
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
