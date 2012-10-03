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
 * The geolocation feature wrapper.
 * Author: Eelco Cramer, TNO
 */

var GenericFeature = require('./GenericFeature.js');
var sys = require('util');
var logger = require('./Logger').getLogger('GeolocationFeature', 'info');

var path = require('path');
var moduleRoot = require(path.resolve(__dirname, '../dependencies.json'));
var dependencies = require(path.resolve(__dirname, '../' + moduleRoot.root.location + '/dependencies.json'));
var webinosRoot = path.resolve(__dirname, '../' + moduleRoot.root.location);

var geolocation = require(path.join(webinosRoot, dependencies.api.geolocation.location));

/*
 * Geolocation feature, defined as subclass of GenericFeature
 *
 * When an app invokes this service, a query request is sent to the 
 * service (address). The result is passed back through a callback.
 *
 * See the XMPP logging for the details.
 */

var NS = "http://webinos.org/api/w3c/geolocation";

function GeolocationFeature(rpcHandler, connector) {
	GenericFeature.GenericFeature.call(this);

    if (connector === undefined) {
        this.embedService(new geolocation.Service(rpcHandler, { 'connector': 'geoip'}));
    } else {
	    this.embedService(new geolocation.Service(rpcHandler, { 'connector': connector}));
    }
}

sys.inherits(GeolocationFeature, GenericFeature.GenericFeature);
exports.Service = GeolocationFeature;
exports.NS = NS;

////////////////////////// END Geolocation Feature //////////////////////////

