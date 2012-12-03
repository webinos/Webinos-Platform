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
 * Place holder for all webinos features. This class holds all the namespaces and factories that create
 * feature classes.
 * 
 * Author: Eelco Cramer, TNO
 */

 (function() {
 	"use strict";

    var sys = require('util');
    var GeolocationFeature = require('./GeolocationFeature.js');
    var Get42Feature = require('./Get42Feature.js');
    var ServiceDiscoveryFeature = require('./ServiceDiscoveryFeature.js');
    var FileFeature = require('./FileFeature.js');

    var NS = {
    	GEOLOCATION: GeolocationFeature.NS,
    	GET42: Get42Feature.NS,
    	SERVICE_DISCOVERY: ServiceDiscoveryFeature.NS,
    	FILE: FileFeature.NS
    }

    var factory = {
    	'http://webinos.org/api/w3c/geolocation': function (rpcHandler, connector) { return new GeolocationFeature.Service(rpcHandler, connector) },
    	'http://webinos.org/api/test': function (rpcHandler, params) { return new Get42Feature.Module(rpcHandler, params) },
    	'http://webinos.org/api/discovery': function (rpcHandler, features) { return new ServiceDiscoveryFeature.Service(rpcHandler, features)},
    	'http://webinos.org/api/file': function (rpcHandler, params) { return new FileFeature.Service(rpcHandler, params) }
    }

    exports.factory = factory;
    exports.NS = NS;
})();