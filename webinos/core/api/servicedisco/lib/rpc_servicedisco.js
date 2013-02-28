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
	var RPCWebinosService = require("webinos-jsonrpc2").RPCWebinosService;
	var webinos_= require("find-dependencies")(__dirname);
	logger = webinos_.global.require(webinos_.global.util.location, "lib/logging.js")(__filename);
	
	var idCount = 0;

	/**
	 * Creates a new unique identifier to be used for RPC requests and responses.
	 * @function
	 * @private
	 */
	var getNextID = function(sessionId) {
		if (idCount == Number.MAX_VALUE) idCount = 0;
		idCount++;
		return sessionId + idCount;
	}

	/**
	 * Webinos ServiceDiscovery service constructor (server side).
	 * @constructor
	 * @alias Discovery
	 * @param rpcHandler A handler for functions that use RPC to deliver their result.
	 */
	var Discovery = function(rpcHandler, params) {
		// inherit from RPCWebinosService
		this.base = RPCWebinosService;
		this.base({
			api: 'ServiceDiscovery',
			displayName: 'ServiceDiscovery',
			description: 'Webinos ServiceDiscovery'
		});

		/**
		 * Registry of registered RPC objects.
		 */
		this.registry = params[0];

		/**
		 * RPC handler
		 */
		this.rpcHandler = rpcHandler;

		/**
		 * Holds other Service objects, not registered here. Only used on the
		 * PZH.
		 */
		this.remoteServiceObjects = {};

		/**
		 * Holds callbacks for findServices callbacks from the PZH
		 */
		this.remoteServicesFoundCallbacks = {};

		if (typeof this.rpcHandler.parent !== 'undefined') {
			var that = this;

			// add listener to pzp object, to be called when remote services
			// are returned by the pzh
			this.rpcHandler.parent.webinos_manager.addRemoteServiceListener(function (payload) {
 				var callback = that.remoteServicesFoundCallbacks[payload.id];

				if (!callback) {
					logger.log("ServiceDiscovery: no findServices callback found for id: " + payload.id);
					return;
				}

				callback(payload.message, payload.id);
			});
		}

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
			search.call(this, serviceType, callback, options, filter);

			function callback(services) {
				services = services || [];

				function stripFuncs(el) {
					return typeof el.getInformation === 'function' ? el.getInformation() : el;
				}
				services = services.map(stripFuncs);

				for (var i = 0; i < services.length; i++) {
					logger.log('findServices: calling found callback for ' + services[i].id);
					var rpc = rpcHandler.createRPC(objectRef, 'onservicefound', services[i]);
					rpcHandler.executeRPC(rpc);
				}
			}
		};

		/**
		 * Used by the ServiceDiscovery to search for registered services.
		 * @param serviceType ServiceType object to search for.
		 * @param callback Callback to call with results.
		 * @param options Timeout, optional.
		 * @param filter Filters based on location, name, description, optional.
		 * @private
		 * @function
		 */
		var search = function (serviceType, callback, options, filter) {
			logger.log('INFO: [Discovery] '+"search: searching for ServiceType: " + serviceType.api);
			var results = [];
			var cstar = serviceType.api.indexOf("*");
			if(cstar !== -1){
				//*c*
				if(serviceType.api.lastIndexOf("*") !== 0){
					var len = serviceType.api.length - 1;
					var midString = serviceType.api.substring(1, len);
					for (var i in this.registry.getRegisteredObjectsMap()){
						if(i.indexOf(midString) != -1) {
							for( var j = 0; j <this.registry.getRegisteredObjectsMap()[i].length; j++){
								results.push(this.registry.getRegisteredObjectsMap()[i][j]);
							}
						}
					}
				}
				//*, *c
				else {
					if(serviceType.api.length == 1) {
						for (var i in this.registry.getRegisteredObjectsMap()){
							for( var j = 0; j <this.registry.getRegisteredObjectsMap()[i].length;j++){
								results.push(this.registry.getRegisteredObjectsMap()[i][j]);
							}
						}
					}
					else {
						var restString = serviceType.api.substr(1);
						for (var i in this.registry.getRegisteredObjectsMap()) {
							if(i.indexOf(restString, i.length - restString.length) !== -1)	{
								for( var j = 0; j <this.registry.getRegisteredObjectsMap()[i].length; j++){
									results.push(this.registry.getRegisteredObjectsMap()[i][j]);
								}
							}
						}
					}
				}
				callback(results);

			}
			else {
				function deliverResults(r) {
					function isDuplicate(sv, pos) {
						var cnt = 0;
						for (var i=0; i<r.length; i++) {
							if (sv.id === r[i].id & sv.serviceAddress === r[i].serviceAddress) {
								if (i === pos && cnt === 0) {
									return true;
								}
								cnt += 1;
							}
						}
						return false;
					}
					r = r.filter(isDuplicate);

					// filter results for zoneId
					if (filter && typeof filter.zoneId === 'object') {
						function hasZoneId(sv) {
							for (var i=0; i<filter.zoneId.length; i++) {
								var found = sv.serviceAddress.indexOf(filter.zoneId[i]) !== -1 ? true : false;
								if (found) return true;
							}
							return false;
						}
						r = r.filter(hasZoneId);
					}

					// finally return results
					callback(r);
				}

				for (var i in this.registry.getRegisteredObjectsMap()) {
					if (i === serviceType.api) {
						logger.log('INFO: [Discovery] '+"search: found matching service(s) for ServiceType: " + serviceType.api);
						results = this.registry.getRegisteredObjectsMap()[i];
					}
				}

				// add address where this service is available, namely this pzp/pzh sessionid
				for (var i=0; i<results.length; i++) {
					results[i].serviceAddress = this.rpcHandler.sessionId; // This is source address, it is used by messaging for returning back
				}
				// reference counter of all entities we expect services back from
				// Not in peer mode and connected
				var entityRefCount =  Object.keys(this.rpcHandler.parent.pzp_state.connectedPzp).length + Object.keys(this.rpcHandler.parent.pzp_state.connectedPzh).length;
				// no connection to a PZH & other connected Peers, don't ask for remote services
				if (!this.rpcHandler.parent || entityRefCount === 0) {
					deliverResults(results);
					return;
				}

				var callbackId = getNextID(this.rpcHandler.sessionId);
				var that = this;

				// deliver results once timeout kicks in
				setTimeout(function() {
					if (that.remoteServicesFoundCallbacks[callbackId]) {
						that.remoteServicesFoundCallbacks[callbackId]([], callbackId, true);
					}
				}, options && typeof options.timeout !== 'undefined' ? options.timeout : 120000); // default: 120 secs

				// store callback in map for lookup on returned remote results
				this.remoteServicesFoundCallbacks[callbackId] = (function(res, refCnt) {
					return function(remoteServices, cId, ignoreCnt) {

						function isServiceType(el) {
							return el.api === serviceType.api ? true : false;
						}
						res = res.concat(remoteServices.filter(isServiceType));
						refCnt -= 1;

						if (refCnt < 1 || ignoreCnt) {
							// entity reference counter is zero, got all answers, so continue
							deliverResults(res);
							delete that.remoteServicesFoundCallbacks[cId];
						}
					}
				})(results, entityRefCount);
				this.rpcHandler.parent.sendMessageAll('findServices', {id: callbackId});
			}
		};
	};

	Discovery.prototype = new RPCWebinosService;

	/**
	 * Add services to internal array. Used by PZH.
	 * @param services Array of services to be added.
	 */
	Discovery.prototype.addRemoteServiceObjects = function(msg) {
		var services = msg.services;
		logger.log('INFO: [Discovery] '+"addRemoteServiceObjects: found " + (services && services.length) || 0 + " services.");
		this.remoteServiceObjects[msg.from] = services;
	};

	/**
	 * Remove services from internal array. Used by PZH.
	 * @param address Remove all services for this address.
	 */
	Discovery.prototype.removeRemoteServiceObjects = function(address) {
		var count = this.remoteServiceObjects[address] && this.remoteServiceObjects[address].length;
		delete this.remoteServiceObjects[address];
		logger.log("removeRemoteServiceObjects: removed " + count + " services from: " + address);
	};

	/**
	 * Get an array of all registered Service objects.
	 * @returns Array with said objects.
	 * @private
	 */
	Discovery.prototype.getRegisteredServices = function() {
		var that = this;
		var results = [];

		for (var service in this.registry.getRegisteredObjectsMap()) {
			results = results.concat(this.registry.getRegisteredObjectsMap()[service]);
		}

		function getServiceInfo(el) {
			el = el.getInformation();
			el.serviceAddress = that.rpcHandler.sessionId;
			return el;
		}
		return results.map(getServiceInfo);
	};

	/**
	 * Get an array of all known services, including local and remote
	 * services. Used by PZH.
	 * @param exceptAddress Address of services that match will be excluded from
	 * results.
	 * @returns Array with known services.
	 * @private
	 */
	Discovery.prototype.getAllServices = function(exceptAddress) {
		var that = this;
		var results = [];
		Object.keys(this.remoteServiceObjects).map(function(address) {
			if (address === exceptAddress) {
				return;
			}
			results = results.concat(that.remoteServiceObjects[address]);
		});
		results = results.concat(this.getRegisteredServices());
		return results;
	};

	exports.Service = Discovery;

})();
