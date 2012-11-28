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

    /**
     * The namespace of this feature
     * @constant
     * @name ServiceDiscoveryFeature#NS
     */
    var NS = "http://webinos.org/api/discovery";

    /**
     * Constructor for the service discovery feature.
     * @constructor
     * @name ServiceDiscoveryFeature
     * @param rpcHandler The rpc handler instance.
     * @param features List of local features that are available.
     */
    function ServiceDiscoveryFeature(rpcHandler, features) {
        GenericFeature.GenericFeature.call(this);

        this.base = RPCWebinosService;
    	this.base({
    		api: 'ServiceDiscovery',
    		displayName: 'ServiceDiscovery',
    		description:'The webinos service discovery API'
    	});
    	
    	this.service = this.base;

        RPCWebinosService.call(this.base);

		/**
		 * Find services and call a listener for each found service.
		 * @name ServiceDiscoveryFeature#findServices
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

            /**
             * Publishes found features to the application
             * @function
             * @private
             * @param The feature to publish.
             */
            var publisher = function(feature) {
    			logger.verbose('Publish feature on ' + feature.device + ' of type ' + feature.api + ' to browser');

                //TODO onservicebound is not according to spec but it is according to implementation
    			var rpc = rpcHandler.createRPC(objectRef, 'onservicefound', feature.getInformation());
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
        	};
            
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
			this.uplink.on(serviceType.api, publisher);
		};
		
    	logger.verbose("Leaving constructor()");
    }

    sys.inherits(ServiceDiscoveryFeature, GenericFeature.GenericFeature);
    exports.Service = ServiceDiscoveryFeature;
    exports.NS = NS;
})();