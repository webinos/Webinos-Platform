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
 * Place holder for all webinos features. This class hold all the namespaces and factories that create
 * feature classes.
 * 
 * Author: Eelco Cramer, TNO
 */

var sys = require('util');
var GeolocationFeature = require('./GeolocationFeature.js');
var Get42Feature = require('./Get42Feature.js');

var NS = {
	GEOLOCATION: GeolocationFeature.NS,
	GET42: Get42Feature.NS
}

var factory = {
	'urn:services-webinos-org:geolocation': function (rpcHandler) { return new GeolocationFeature.GeolocationFeature(rpcHandler) },
	'urn:services-webinos-org:get42': function (rpcHandler) { return new Get42Feature.Get42Feature(rpcHandler) }
}

exports.factory = factory;
exports.NS = NS;