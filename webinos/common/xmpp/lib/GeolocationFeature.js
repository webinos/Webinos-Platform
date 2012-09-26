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
        this.geo = new geolocation.Service(rpcHandler, { 'connector': 'geoip'});
    } else {
	    this.geo = new geolocation.Service(rpcHandler, { 'connector': connector} );
    }
    
	this.api = NS;
	this.displayName = "GeolocationFeature" + this.id;
	this.description = 'Geolocation Feature.';
	this.ns = this.api;
	
	this.on('invoked-from-remote', function(featureInvoked, stanza) {
		logger.verbose('on(invoked-from-remote)');
		logger.debug('The GeolocationFeature is invoked from remote. Answering it...');
		logger.debug('Received the following XMPP stanza: ' + stanza);
		
		var query = stanza.getChild('query');
		var params = query.getText();
		
		if (params == null || params == '') {
			params = "{}";
		} else {
			logger.verbose('Query="' + params + '"');
		}
		
		var payload = JSON.parse(params);
		var conn = this.uplink;

		this.geo.getCurrentPosition(payload, function(result) {
			logger.debug("The answer is: " + JSON.stringify(result));
			logger.debug("Sending it back via XMPP...");
			conn.answer(stanza, JSON.stringify(result));
		});

		logger.verbose('ending on(invoked-from-remote)');
	});

	this.on('invoked-from-local', function(featureInvoked, params, successCB, errorCB, objectRef) {
		logger.verbose('on(invoked-from-local)');
		this.geo.getCurrentPosition(params, successCB, errorCB, objectRef);
		logger.verbose('ending on(invoked-from-local)');
	});
		
	//TODO 'this' exposes all functions (and attributes?) to the RPC but only some a selection of features should be exposed.
	//TODO remote clients use the function 'invoke' to invoke the geolocation feature but it should also be possible to have other functions.
	//     at this time invoke is handled by the GenericFeature to dispatch the call locally or remotely.
	
	// We add the 'id' to the name of the feature to make this feature unique to the client.
}

sys.inherits(GeolocationFeature, GenericFeature.GenericFeature);
exports.Service = GeolocationFeature;
exports.NS = NS;

////////////////////////// END Geolocation Feature //////////////////////////

