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
var logger = require('./Logger').getLogger('LocalFeatureManager', 'info');

var features = {};

var connection;

var client;

function initialize(pzhConnection, jid, rpcHandler) {
	connection = pzhConnection;
	
	//TODO the instantiation of service objects (or API proxies) should be refactored. Connection is now a property of a service object
	//but this is the connection to the XMPP server. There can also be local connections.
	
	var geoLocationFeature = webinosFeatures.factory[webinosFeatures.NS.GEOLOCATION](rpcHandler, 'geoip');
	geoLocationFeature.setConnection(jid, connection);
    rpcHandler.registry.registerObject(geoLocationFeature);

	var get42Feature = webinosFeatures.factory[webinosFeatures.NS.GET42](rpcHandler);
	get42Feature.setConnection(jid, connection);
    rpcHandler.registry.registerObject(get42Feature);
	
	features[geoLocationFeature.id] = geoLocationFeature;
	features[get42Feature.id] = get42Feature;

	// we do not add the service discovery feature. This special kind of feature is not discoverable.
	var serviceDiscoveryFeature = webinosFeatures.factory[webinosFeatures.NS.SERVICE_DISCOVERY](rpcHandler, features);
	serviceDiscoveryFeature.setConnection(jid, pzhConnection);
    rpcHandler.registry.registerObject(serviceDiscoveryFeature);
}

exports.features = features;
exports.initialize = initialize;
