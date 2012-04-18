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
* Copyright 2011 Alexander Futasz, Fraunhofer FOKUS
******************************************************************************/
(function () {

	/**
	 * Webinos ServiceDiscovery service constructor (server side).
	 * @constructor
	 * @param rpcHandler A handler for functions that use RPC to deliver their result.  
	 */
	function ServiceDiscoModule (rpcHandler) {
		// inherit from RPCWebinosService
		this.base = RPCWebinosService;
		this.base({
			api: 'ServiceDiscovery',
			displayName: 'ServiceDiscovery',
			description: 'Webinos ServiceDiscovery'
		});

		/**
		 * Call a listener for each found service.
		 * @param params Array, first item being the service type to search.
		 * @param successCB Success callback.
		 * @param errorCB Error callback.
		 * @param objectRef RPC object reference.
		 */
		this.findServices = function (params, successCB, errorCB, objectRef) {
			var serviceType = params[0];
			var options = params[1];
			var filter = params[2];

			var callback;
			rpcHandler.findServices(serviceType, callback, options, filter);
			
			function callback(services) {
				services = services || [];
				
				function stripFuncs(el) {
					return typeof el.getInformation === 'function' ? el.getInformation() : el; 
				}
				services = services.map(stripFuncs);

				for (var i = 0; i < services.length; i++) {
					console.log('rpc.findService: calling found callback for ' + services[i].id);
					var rpc = rpcHandler.createRPC(objectRef, 'onservicefound', services[i]);
					rpcHandler.executeRPC(rpc);
				}
			}
		};
	}

	ServiceDiscoModule.prototype = new RPCWebinosService;

	exports.Service = ServiceDiscoModule;

})();