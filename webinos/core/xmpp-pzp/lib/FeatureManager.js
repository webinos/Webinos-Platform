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
 * The feature manager creates all local and proxied features and registers them at the RPC registry.
 * It also keeps reference to all features and make them discoverable on the XMPP overlay network.
 *
 * Author: Eelco Cramer, TNO
 */

(function() {
 	"use strict";

    var sys = require('util');
    var webinosFeatures = require('./WebinosFeatures');
    var http = require("http");
    var logger = require('./Logger').getLogger('FeatureManager', 'trace');
    
    var webinos = require("find-dependencies")(__dirname);
    var pzp = webinos.global.require(webinos.global.pzp.location, "lib/pzp");

    var features = {};

    var connection;

    var client;

    /**
     * Initializes the feature manager. Creates and loads all local feature instances and register them at the RPCHandler.
     * Instantiate listeners for remote features to be (un)registered at the RPCHandler as well.
     * @function
     * @param pzhConnection Instance that holds the connection with the PZH.
     * @param rpcHandler The RPC handler instance.
     */
    function initialize(pzhConnection, rpcHandler) {
    	connection = pzhConnection;
	
    	//TODO the instantiation of service objects (or API proxies) should be refactored. Connection is now a property of a service object
    	//but this is the connection to the XMPP server. There can also be local connections.
	
    	var geoLocationFeature = webinosFeatures.factory[webinosFeatures.NS.GEOLOCATION](rpcHandler, 'geoip');
    	geoLocationFeature.setConnection(connection);
        rpcHandler.registry.registerObject(geoLocationFeature);
    	connection.shareFeature(geoLocationFeature);

    	var get42Feature = webinosFeatures.factory[webinosFeatures.NS.GET42](rpcHandler);
    	get42Feature.setConnection(connection);
        rpcHandler.registry.registerObject(get42Feature);
    	connection.shareFeature(get42Feature);
    	
    	var fileFeature = webinosFeatures.factory[webinosFeatures.NS.FILE](rpcHandler, { getPath: pzp.session.getWebinosPath });
    	fileFeature.setConnection(connection);
        rpcHandler.registry.registerObject(fileFeature);
    	connection.shareFeature(fileFeature);
	
    	features[geoLocationFeature.id] = geoLocationFeature;
    	features[get42Feature.id] = get42Feature;
    	features[fileFeature.id] = fileFeature;

    	// we do not add the service discovery feature. This special kind of feature is not discoverable.
    	var serviceDiscoveryFeature = webinosFeatures.factory[webinosFeatures.NS.SERVICE_DISCOVERY](rpcHandler, features);
    	serviceDiscoveryFeature.setConnection(pzhConnection);
        rpcHandler.registry.registerObject(serviceDiscoveryFeature);
    
        connection.on('newFeature', function(feature) {
            try {
                rpcHandler.registry.registerObject(feature);
            } catch (err) {
                logger.warn(err);
            }
        });
    
        connection.on('removeFeature', function (feature) {
            try {
                rpcHandler.registry.unregisterObject(feature);
            } catch (err) {
                logger.warn(err);
            }
        });
    }

    exports.features = features;
    exports.initialize = initialize;
})();