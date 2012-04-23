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
* Copyright 2011 University of Oxford
* Copyright 2011 Habib Virji, Samsung Electronics (UK) Ltd
********************************************************************************/

// This file is a wrapper / facade for all the functionality that the PZH
// web interface is likely to need.  

// Ideally, this would be accessed through the same messaging interface
// as everything else, as these need some access control too.  
// In other words: due a refactor.

var path        = require('path');
var fs          = require('fs');
var util        = require('util');
var crypto      = require('crypto');

var webinos = require('webinos')(__dirname);
var log     = webinos.global.require(webinos.global.pzp.location, 'lib/webinos_session').common.debug;
var session = webinos.global.require(webinos.global.pzp.location, 'lib/webinos_session');
var qrcode  = require('./webinos_pzh_qrcode.js');
var revoke  = require('./webinos_pzh_revoke.js');
var connect = require('./webinos_pzh_connecting.js');
var farm    = require('./webinos_pzh_farm.js');

var pzh_internal_apis = exports;


// var moduleRoot   = require(path.resolve(__dirname, '../dependencies.json'));
// var dependencies = require(path.resolve(__dirname, '../' + moduleRoot.root.location + '/dependencies.json'));
// var webinosRoot  = path.resolve(__dirname, '../' + moduleRoot.root.location);

// var qrcode       = require(path.join(webinosRoot, dependencies.pzh.location, 'lib/pzh_qrcode.js'));
// var revoker      = require(path.join(webinosRoot, dependencies.pzh.location, 'lib/pzh_revoke.js'));	
// var session      = require(path.join(webinosRoot, dependencies.pzh.location, 'lib/pzh_sessionHandling.js'));
// var configuration= require(path.join(webinosRoot, dependencies.pzp.location, 'lib/session_configuration.js'));
// var farm         = require(path.join(webinosRoot, dependencies.pzh.location, 'lib/pzh_farm.js'));
// var pzhConnect   = require(path.join(webinosRoot, dependencies.pzh.location, 'lib/pzh_connecting.js'));
// var common       = require(path.join(webinosRoot, dependencies.pzp.location, 'lib/session_common.js'));
// var log          = require(path.join(webinosRoot, dependencies.pzp.location, 'lib/session_common.js')).debugPzh;



// Synchronous method for getting information about a PZP with a certain ID.
function getPzpInfoSync(instance, pzpId) {
	"use strict";
	//find out whether we have this PZP in a session somewhere.
	var pzpConnected = false;
	var pzpName = pzpId;
	for (var i in instance.connectedPzp) {
		if (typeof instance.connectedPzp[i] !== "undefined") {
			//session IDs append the PZH to the front of the PZP ID.
			var splitId = i.split("/");
			if (splitId.length > 1 && splitId[1] !== null) {
				if (splitId[1] === pzpId) {
					pzpConnected = true;
					pzpName = i;
				}
			}
		}
	}

	return {
		id          : pzpId,
		cname       : pzpName,
		isConnected : pzpConnected
	};
}

// Synchronous method for getting information about a PZH with a certain ID.
function getPzhInfoSync(instance, pzhId) {
	"use strict";
	if (pzhId && pzhId.split('_')[0] === instance.config.details.name) {
		//we know that this PZH is alive
		return {
			id : pzhId + " (Your PZH)",
			url: pzhId,
			isConnected: true
		};
	} else {
		return {
			id          : pzhId.split('/')[1],
			url         : pzhId,
			isConnected : true
		};
	}
}

// Wrapper for adding a new PZP to a personal zone through a short code
pzh_internal_apis.addPzpQR = function (instance, callback) {
	"use strict";
	qrcode.addPzpQRAgain(instance, callback);
};


pzh_internal_apis.listPzp = function(instance, callback) {
	"use strict";
	var result = {signedCert: [], revokedCert: []};
	for (var i in instance.config.signedCert){
		if (typeof instance.config.signedCert[i] !== "undefined") {
			result.signedCert.push(getPzpInfoSync(instance, i));
		}
	}
	
	for (var i in instance.config.revokedCert) {
		if (typeof instance.config.revokedCert[i] !== "undefined") {
			result.revokedCert.push(getPzpInfoSync(instance, i));
		}
	}
	var payload = {cmd:'listPzp', payload:result};
	callback(payload);
};


// Get a list of all Personal zone devices.
pzh_internal_apis.listZoneDevices = function(instance, callback) {
	"use strict";
	var result = {pzps: [], pzhs: []};
	
	for (var i in instance.config.signedCert){
		if (typeof instance.config.signedCert[i] !== "undefined") {
			result.pzps.push(getPzpInfoSync(instance));
		}
	}

	for (var i in instance.config.otherCert) {
		if (typeof instance.config.otherCert[i] !== "undefined" && instance.config.otherCert[i].cert !== '') {
			result.pzhs.push(getPzhInfoSync(instance, i));
		}
	}
	result.pzhs.push(getPzhInfoSync(instance, pzh.sessionId));
	
	var payload = {cmd:'listDevices', payload:result};
	callback(payload);
};

// Return the crashlog of this PZH.
pzh_internal_apis.crashLog = function(instance, callback){
	"use strict";
	var filename = path.join(common.webinosConfigPath()+'/logs/', instance.sessionId+'.json');
	fs.readFile(filename, function(err, data){
		var payload = {cmd:'crashLog', payload:''};
		if (data !== null && typeof data !== "undefined"){
			payload.payload = data.toString('utf8');
			callback(payload);
		} else {
			callback(payload);
		}
	});
};

pzh_internal_apis.revoke = function(instance, pzpid, callback) {
	"use strict";        
	revoke.revokePzp(pzpid, instance, callback);
};

// This is sending side action on PZH end
pzh_internal_apis.addPzhCertificate = function(instance, to, callback) {
	"use strict";
	var id, id_to, pzh_id;
	if (instance.config.details.servername) {
		id = instance.config.details.servername.split('/')[0];
	}
	if (to) {
		id_to = to.split('/')[0];
	}

	// There are two scenarios:
	// 1. Inside same PZH Farm, it is a mere copy.
	if (id === id_to) {
		for (var myKey in farm.pzhs) {
			if( typeof farm.pzhs[myKey] !== "undefined" && myKey=== to) {
				
				// Store the information in other_cert
				instance.config.otherCert[to] = { cert: farm.pzhs[to].config.master.cert, crl: farm.pzhs[to].config.master.crl};
				farm.pzhs[to].config.otherCert[instance.config.details.servername] = { cert: instance.config.master.cert, crl: instance.config.master.crl }

				// Add in particular context of each PZH options
				instance.options.ca.push(instance.config.otherCert[myKey].cert);
				instance.options.crl.push(instance.config.otherCert[myKey].crl);

				farm.pzhs[to].options.ca.push(instance.config.master.cert);
				farm.pzhs[to].options.crl.push(instance.config.master.crl);

				farm.server._contexts.some(function(elem) {
					if (to.match(elem[0]) !== null) {
						elem[1] = crypto.createCredentials(farm.pzhs[to].options).context;
					}
					
					if (instance.config.details.servername.match(elem[0]) !== null) {
						elem[1] =  crypto.createCredentials(instance.options).context;
					}
				});
				 
				// pzh.serverContext.pair.credentials.context.addCACert(pzh.config.other_cert[i]);
				// Store configuration
				session.configuration.storeConfig(instance.config, function() {
					session.configuration.storeConfig(farm.pzhs[to].config, function(){
						connect.connectOtherPZH(instance, to, callback);
					});
				});
			}
		}		
	} 
	// TODO:2. Outside farm, this will involve https.request going out.
	else {
		var payload = instance.prepMsg(instance.sessionId, to, 'receiveMasterCert', instance.config.master.cert);
		callback(true);
	}
	
};

pzh_internal_apis.restartPzh = function(instance, callback) {
	"use strict";
	try {
		// Reload contents
		var id = instance.config.servername;
		farm.server._contexts.some(function(elem) {
			if (id.match(elem[0]) !== null) {
				
				elem[1] = crypto.createCredentials(farm.pzhs[id].options).context;
				console.log('Restarting PZH ... ');
			}
		});
	} catch(err) {
		log(instance.sessionId, 'ERROR', 'Pzh restart failed ' + err);
		callback.call(instance, err);
	}
};
