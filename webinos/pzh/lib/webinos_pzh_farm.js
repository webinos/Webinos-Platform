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
* @author <a href="mailto:habib.virji@samsung.com">Habib Virji</a>
* @description: Starts PZH pzh_farm and handles adding of new PZH
*/

var tls         = require('tls');
var path        = require('path');
var util        = require('util');
var fs          = require('fs');

// var moduleRoot      = require(path.resolve(__dirname, '../dependencies.json'));
// var dependencies    = require(path.resolve(__dirname, '../' + moduleRoot.root.location + '/dependencies.json'));
// var webinosRoot     = path.resolve(__dirname, '../' + moduleRoot.root.location);
// 
// var cert            = require(path.join(webinosRoot, dependencies.pzp.location, 'lib/session_certificate.js'));
// var utils           = require(path.join(webinosRoot, dependencies.pzp.location, 'lib/session_common.js'));
// var log             = require(path.join(webinosRoot, dependencies.pzp.location, 'lib/session_common.js')).debug;
// var configuration   = require(path.join(webinosRoot, dependencies.pzp.location, 'lib/session_configuration.js'));
// var pzhWebInterface = require(path.join(webinosRoot, dependencies.pzh.location, 'web/pzh_webserver.js'));
// var pzh             = require(path.join(webinosRoot, dependencies.pzh.location));


var session         = require('webinos_session');
var log             = require('webinos_session').common.debug;
var pzh             = require('webinos_pzh_sessionHandling');
var pzhWI           = require('webinos_pzh_webserver');

//var pzhWebInterface = require('pzh_webserver');
//var pzh             = require('pzh_sessionHandling');

function pzh_farm (){
	this.pzhs = [];
	this.config = {};
	this.server;
}

function loadPzhs(config) {
	"use strict";
	var self = this;
	var myKey;
	for ( myKey in config.pzhs) {
		if(typeof config.pzhs[myKey] !== "undefined") {
			pzh.addPzh(self, myKey, config.pzhs[myKey], function(res, instance) {
				log('INFO','[PZHFARM] Started PZH ... ' + instance.config.details.name);
			});
		}
	}
}

/**
 * @description: Starts pzh_farm.
 * @param {string} url: pzh pzh_farm url for e.g. pzh.webinos.org
 * @param {function} callback: true in case successful or else false in case unsuccessful
 */
pzh_farm.prototype.startFarm = function (url, name, callback) {
	"use strict";
	var self = this;
	// The directory structure which pzh_farms needs for putting in files
	session.configuration.createDirectoryStructure();
	// Configuration setting for pzh, returns set values and connection key
	session.configuration.setConfiguration(name,'PzhFarm', url, function (config, conn_key) {
		if (config === "undefined") {
			log('ERROR', '[PZHFARM] Failed setting configuration, details are missing')
			return;
		} 
		// Connection parameters for PZH pzh_farm TLS server.
		// Note this is the main server, pzh started are stored as SNIContext to this server
		self.config = config;
		var options = {
			key  : conn_key,
			cert : self.config.conn.cert,
			ca   : self.config.master.cert,
			requestCert       : true,
			rejectUnauthorised: false
		};
		session.common.resolveIP(url, function(resolvedAddress) {
			// Main pzh_farm TLS server
			self.server = tls.createServer (options, function (conn) {
				console.log(conn)
				// if servername existes in conn and pzh_farm.pzhs has details about pzh instance, message will be routed to respective PZH authorization function
				if (conn.servername && self.pzhs[conn.servername]) {
					log('INFO', '[PZHFARM] sending message to ' + conn.servername);
					self.pzhs[conn.servername].handleConnectionAuthorization(self.pzhs[conn.servername], conn);
				} else {
					log('ERROR', '[PZHFARM] Server Is Not Registered in Farm '+conn.servername);
					conn.socket.end();
					return;
				}
				// In case data is received at pzh_farm
				conn.on('data', function(data){
					log('INFO', '[PZHFARM] msg received at pzh_farm');
					// forward message to respective PZH handleData function
					if(conn.servername && self.pzhs[conn.servername]) {
						self.pzhs[conn.servername].handleData(conn, data);
					}
				});
				// In case of error
				conn.on('end', function(err) {
					log('INFO', '[PZHFARM] Client of ' +conn.servername+' ended connection');
				});

				// It calls removeClient to remove PZH from list.
				conn.on('close', function() {
					try {
						log('INFO', '[PZHFARM] ('+conn.servername+') Pzh/Pzp  closed');
						if(conn.servername && self.pzhs[conn.servername]) {
							var cl = self.pzhs[conn.servername];
							var removed = session.common.removeClient(cl, conn);
							if (removed !== null && typeof removed !== "undefined"){
								cl.messageHandler.removeRoute(removed, conn.servername);
								cl.rpcHandler.removeRemoteServiceObjects(removed);
							}
						}
					} catch (err) {
						log('ERROR', '[PZHFARM] ('+conn.servername+') Remove client from connectedPzp/connectedPzh failed' + err);
					}
				});

				conn.on('error', function(err) {
					log('ERROR', '[PZHFARM] ('+conn.servername+') General Error' + err);

				});
			});

			self.server.on('listening', function(){
				log('INFO', '[PZHFARM] Initialized at ' + resolvedAddress);
				// Load PZH's that we already have registered ...
				loadPzhs(self.config);
				// Start web interface, this webinterface will adapt depending on user who logins
				pzhWI.start(self, url, function (status) {
					if (status) {
						callback(true, self.config);
					}
				});
			});

			self.server.listen(session.configuration.farmPort, resolvedAddress);
		});
	});
};

/**
 * @description: this function returns correct pzh id depending on user login details. If details are not present it adds information in config
 * @param {string} url: pzh url
 * @param {object} user: details fetched from openid about user
 */
pzh_farm.prototype.getOrCreatePzhInstance = function (host, user, callback) {
	"use strict";
	var self = this;
	var name;
	
	if (typeof user.username === 'undefined' || user.username === null ) {
		name = user.email;
	} else {
		name = user.username;
	}
	// Check for if user already existed and is stored	
	var myKey = host+'/'+name;

	if ( self.pzhs[myKey] && self.pzhs[myKey].config.details.username === user.username ) {
		log('INFO', '[PZHFARM] User already registered');
		callback(myKey, self.pzhs[myKey]);
	} else if(self.pzhs[myKey]) { // Cannot think of this case, but still might be useful
		log('INFO', '[PZHFARM] User first time login');
		self.pzhs[myKey].config.details.email    = user.email;
		self.pzhs[myKey].config.details.username = user.username;
		self.pzhs[myKey].config.details.country  = user.country;
		self.pzhs[myKey].config.details.connid   = user.id;
		self.pzhs[myKey].config.details.image    = user.image;
		configuration.storeConfig(self.pzhs[myKey].config, function() {
			callback(myKey, self.pzhs[myKey]);
		});
	} else {
		log('INFO', '[PZHFARM] Adding new PZH - ' + myKey);
		var pzhModules = configuration.pzhDefaultServices;;
		pzh.addPzh(myKey, pzhModules, function(){
			self.pzhs[myKey].config.details.email    = user.email;
			self.pzhs[myKey].config.details.username = user.username;
			self.pzhs[myKey].config.details.country  = user.country;
			self.pzhs[myKey].config.details.connid   = user.id;
			self.pzhs[myKey].config.details.image    = user.image;
			configuration.storeConfig(self.pzhs[myKey].config, function() {
				callback(myKey, self.pzhs[myKey]);
			});
		});
	}
};

module.exports = pzh_farm;
