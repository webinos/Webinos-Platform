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
 * service_discovery.js
 * handles service discovery request from the browser.
 * author: Eelco Cramer (TNO)
 */

 (function() {
 	"use strict";

    var GenericFeature = require('./GenericFeature.js');
    var sys = require('util');
    var logger = require('./Logger').getLogger('ServiceDiscovery', 'verbose');

    var path = require('path');
    var moduleRoot = require(path.resolve(__dirname, '../dependencies.json'));
    var dependencies = require(path.resolve(__dirname, '../' + moduleRoot.root.location + '/dependencies.json'));
    var webinosRoot = path.resolve(__dirname, '../' + moduleRoot.root.location);

    var geolocation = require(path.join(webinosRoot, dependencies.api.geolocation.location));

    var WebinosFeatures = require('./WebinosFeatures.js');

    var NS = "http://webinos.org/api/discovery";

    // start(io, pzhConnection, jid, rpcHandler) {

    function ServiceDiscoveryFeature(rpcHandler, features) {
        GenericFeature.GenericFeature.call(this);

        this.base = RPCWebinosService;
    	this.base({
    		api: 'ServiceDiscovery',
    		displayName: 'ServiceDiscovery',
    		description:'The webinos service discovery API'
    	});

        RPCWebinosService.call(this.base);

    	var publisher = function(feature, objectRef) {
			logger.verbose('Publish feature on ' + feature.device + ' of type ' + feature.ns + ' to browser');

            //TODO onservicebound is not according to spec but it is according to implementation
			var rpc = rpcHandler.createRPC(objectRef.rpcId, 'onservicefound', feature.service.getInformation());
			rpcHandler.executeRPC(rpc);

    		// keep track of the feature.
    		//TODO this does not seem part of the current implementation yet.
            // feature.once('remove', function(feature) {
            //  // unpublish when the feature is removed.
            //  logger.verbose("onRemove: the feature " + feature.ns + " on " + feature.device + " became unavailable. Id=" + feature.id);
            //          
            //  socket.emit(feature.id + '-removed', { id: feature.id });
            //          
            //  logger.verbose('onRemove: and is removed: ' + feature.id + '-removed');
            // });
            logger.verbose('Finnished publishing');
    	}

		/**
		 * Find services and call a listener for each found service.
		 * @param params Array, first item being the service type to search.
		 * @param successCB Success callback.
		 * @param errorCB Error callback.
		 * @param objectRef RPC object reference.
		 */
		this.findServices = function (params, successCB, errorCB, objectRef) {
			logger.verbose("findServices called: " + JSON.stringify(params));

			var serviceType = params[0];
			var options = params[1];
			var filter = params[2];

            //TODO check if this is still correct
			this.uplink.removeListener(serviceType, publisher);

            // publish matching local features
            for (var key in features) {
                var feature = features[key];
                
                if (feature.api == serviceType.api) {
                    publisher(feature, objectRef);
                }
            }

			// search in services that are already shared
			var alreadyShared = this.uplink.sharedServicesForNamespace(serviceType.api);
			
			logger.verbose("Already have " + alreadyShared.length + " features of this type available.")
			
			for (var i=0; i<alreadyShared.length; i++) {
				publisher(alreadyShared[i], objectRef);
			}

			// subscribe to future messages
			this.uplink.on(serviceType.api, function(feature) {
			    publisher(feature, objectRef)
			});
		};
		
    	logger.verbose("Leaving constructor()");
    }

    sys.inherits(ServiceDiscoveryFeature, GenericFeature.GenericFeature);
    exports.Service = ServiceDiscoveryFeature;
    exports.NS = NS;
})();