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
*******************************************************************************/

/**
 * Manager for all features that are local to the device.
 * 
 * Author: Eelco Cramer, TNO
 */

var sys = require('util');
var webinosFeatures = require('./WebinosFeatures');
var http = require("http");
var logger = require('nlogger').logger('LocalFeatureManager.js');

var features = {};

var connection;

var client;


function initialize(pzhConnection, jid, rpcHandler) {
	connection = pzhConnection;
	
	var geoLocationFeature = webinosFeatures.factory[webinosFeatures.NS.GEOLOCATION](rpcHandler, 'geoip');
	geoLocationFeature.local = true;
	geoLocationFeature.shared = false;
	geoLocationFeature.device = jid;
    geoLocationFeature.owner = jid.split("/")[0];
	geoLocationFeature.uplink = connection;
    
	//TODO here goes the RPC stuff
	// should result in a call to geoLocationFeature.invoke(payload);

	var get42Feature = webinosFeatures.factory[webinosFeatures.NS.GET42](rpcHandler);
	get42Feature.local = true;
	get42Feature.shared = false;
	get42Feature.device = jid;
    get42Feature.owner = jid.split("/")[0];
	get42Feature.uplink = connection;

	//TODO here goes the RPC stuff
	// should result in a call to remoteAlertFeature.invoke(payload);

	features[geoLocationFeature.id] = geoLocationFeature;
	features[get42Feature.id] = get42Feature;
}

exports.features = features;
exports.initialize = initialize;
