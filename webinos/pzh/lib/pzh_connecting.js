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
* Copyright 2011 Habib Virji Samsung Electronics (UK) Ltd
*******************************************************************************/

/*
 * Handles connection with other PZH
 */

var pzhConnecting = exports;

var path      = require('path');
var http      = require('http');
var tls       = require('tls');

var moduleRoot   = require(path.resolve(__dirname, '../dependencies.json'));
var dependencies = require(path.resolve(__dirname, '../' + moduleRoot.root.location + '/dependencies.json'));
var webinosRoot  = path.resolve(__dirname, '../' + moduleRoot.root.location);

var utils        = require(path.join(webinosRoot, dependencies.pzp.location, 'lib/session_common.js'));
var certificate  = require(path.join(webinosRoot, dependencies.pzp.location, 'lib/session_certificate.js'));
var log          = require(path.join(webinosRoot, dependencies.pzp.location, 'lib/session_common.js')).debugPzh;
var config       = require(path.join(webinosRoot, dependencies.pzp.location, 'lib/session_configuration.js'));

var rpc          = require(path.join(webinosRoot, dependencies.rpc.location));

// this is for connecting when PZH is in same farm
pzhConnecting.connectOtherPZH = function(pzh, server, callback) {
	"use strict";
	var self = pzh, options;
	var serverName;
	if (server.split('/')) {
		serverName = server.split('/')[0];
	} else {
		serverName = server;
	}
	
	log(pzh.sessionId, 'INFO', '[PZH -'+self.sessionId+'] Connect Other PZH - '+serverName);
	
	config.fetchKey(self.config.conn.key_id, function(key_id) {
		try {
			var caList = [], crlList = [];
			caList.push(self.config.master.cert);
			crlList.push(self.config.master.crl);
			
			for (var myKey in self.config.otherCert) {
				if (self.config.otherCert[myKey] !== "undefined" && myKey === server) {
					caList.push(self.config.otherCert[myKey].cert);
					crlList.push(self.config.otherCert[myKey].crl);
				}
			}
			//No CRL support yet, as this is out-of-zone communication.  TBC.
			options = {
				key : key_id ,
				cert: self.config.conn.cert,
				ca  : caList,
				crl : crlList,
				servername: server};

		} catch (err) {
			log(pzh.sessionId, 'ERROR', '[PZH -'+self.sessionId+'] Connecting other Pzh failed in setting configuration ' + err);
			return;
		}
		
		var connPzh = tls.connect(config.pzhPort, serverName, options, function() {
			log('INFO', '[PZH -'+self.sessionId+'] Connection Status : '+connPzh.authorized);
			if(connPzh.authorized) {
				var connPzhId, msg;
				try {
					var text = connPzh.getPeerCertificate().subject.CN;
					connPzhId = decodeURIComponent(text);
					connPzhId = connPzhId.split(':')[1];
					log(pzh.sessionId, 'INFO', '[PZH -'+self.sessionId+'] Connected to ' + connPzhId);
				} catch (err) {
					log(pzh.sessionId, 'ERROR', '[PZH -'+self.sessionId+'] Error reading common name of peer certificate ' + err);
					return;
				}
				try {
					if(self.config.otherCert.hasOwnProperty(server)) {
						self.connectedPzh[connPzhId] = {socket : connPzh};
						msg = self.messageHandler.registerSender(self.sessionId, connPzhId);
						self.sendMessage(msg, connPzhId);
						callback(connPzh.authorized);
					}
				} catch (err1) {
					log(pzh.sessionId, 'ERROR', 'PZH ('+self.sessionId+') Error storing pzh in the list ' + err1);
					return;
				}
			} else {
				callback(connPzh.authorized);
				log(pzh.sessionId, 'INFO', '[PZH -'+self.sessionId+'] Not connected');
			}

			connPzh.on('data', function(data) {
				utils.processedMsg(self, data, function(parse){
					try {
						self.messageHandler.onMessageReceived(parse, parse.to);
					} catch (err) {
						log(pzh.sessionId, 'ERROR', '[PZH -'+self.sessionId+'] Error sending message to messaging ' + err);
					}
				});
			});

			connPzh.on('error', function(err) {
				log(pzh.sessionId, 'ERROR', '[PZH -'+self.sessionId+'] Error in connect Pzh' + err.stack );
			});

			connPzh.on('close', function() {
				log(pzh.sessionId, 'INFO', 'Peer Pzh closed');
			});

			connPzh.on('end', function() {
				log(pzh.sessionId, 'INFO', 'Peer Pzh End');
			});
		});
	});
};
