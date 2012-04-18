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

// var path = require('path');
// var moduleRoot   = require(path.resolve(__dirname, '../dependencies.json'));
// var dependencies = require(path.resolve(__dirname, '../' + moduleRoot.root.location + '/dependencies.json'));
// var webinosRoot  = path.resolve(__dirname, '../' + moduleRoot.root.location);
// 
// var uniqueID     = require(path.join(webinosRoot, dependencies.uniqueID.location, 'lib/uniqueID.js'));
//var log          =  require(path.resolve(webinosRoot,dependencies.pzp.location, 'lib/session_common.js')).debug;


/** @description Create private key, certificate request, self signed certificate and empty crl. This is crypto sensitive function
 * @param {Object} self is currect object of Pzh/Pzp
 * @param {String} name used in common field to differentiate Pzh and Pzp 
 * @param {Object} obj holds key, certificate and crl certificate values and names
 * @returns {Function} callback returns failed or certGenerated. Added to get synchronous behaviour
 */
exports.selfSigned = function(config, type, callback) {
	"use strict";
	var certman;
	var certType;
	var key , csr ;
	var obj = {cert: '', crl:''};	

	try {
		if(process.platform !== 'android') {
			//certman = require(path.resolve(webinosRoot,dependencies.manager.certificate_manager.location));
			certman = process.binding('certificate_manager');
		} else {
			certman = require('certificate_manager');
		}
	} catch (err) {
		callback("failed", err);
		return;
	}

	try {
		key = certman.genRsaKey(1024);
	} catch(err1) {
		callback("failed", err1);
		return;
	}

	var cn = encodeURIComponent(type+':'+config.details.name);
	if (cn.length > 40) {
		
		cn = cn.substring(0, 40);
	}
	
	if (type === 'PzhFarmCA' ||  type === 'PzhCA') {
		certType = 0;
	} else if (type === 'Pzh' || type === 'PzhFarm' || type === 'PzhWebServer' || type === 'PzhWebSocketServer') {
		certType = 1;
	} else {
		certType = 2;
	}
	
	try {
		// state, city, orgname, orgunit are left empty as we do not posses this information
		csr = certman.createCertificateRequest(key,
			config.details.country,
			'', // state
			'', //city
			'', //orgname
			'', //orgunit
			cn,
			config.details.email);
	} catch (e) {
		callback("failed", e);
		return;
	}

	try {
		obj.cert = certman.selfSignRequest(csr, 3600, key, certType, config.details.servername);
	} catch (e1) {
		callback("failed", e1);
		return;
	}

	try {
		obj.crl = certman.createEmptyCRL(key, obj.cert, 3600, 0);
	} catch (e2) {
		callback("failed", e2);
		return;
	}
	callback("certGenerated", null, key, obj, csr);
};

/**
 * @description Crypto sensitive 
*/
exports.signRequest = function(csr, master_key, master_cert, certType, uri, callback) {
	"use strict";
	var certman;
	
	try {
		//certman = require(path.resolve(webinosRoot,dependencies.manager.certificate_manager.location));
		certman = process.binding('certificate_manager');
	} catch (err) {
		callback( "failed");
		return;
	}
	
	try {
		var clientCert = certman.signRequest(csr, 3600, master_key, master_cert, certType, uri);
		callback("certSigned", clientCert);
	} catch(err1) {
		log('ERROR', "Failed to sign certificate: " + err1.code + ", " + err1.stack);
		callback("failed");
		return;
	}	
};

exports.revokeClientCert = function(master_key, master_crl, pzpCert, callback) {
	"use strict";
	var certman;
	
	try {
		//certman = require(path.resolve(webinosRoot,dependencies.manager.certificate_manager.location));
		certman = process.binding('certificate_manager');
	} catch (err) {
		log("ERROR", "Failed to find the certificate manager");
		callback("failed", err);
		return;
	}
	try {
		log("INFO", "Calling certman.addToCRL\n");
		var crl = certman.addToCRL("" + master_key, "" + master_crl, "" + pzpCert);
		// master.key.value, master.cert.value
		callback("certRevoked",  crl);
	} catch(err1) {
		log("ERROR", "Error: " + err1);
		callback("failed", err1);
		return;
	}
}

