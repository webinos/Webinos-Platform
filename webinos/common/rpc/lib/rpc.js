/*******************************************************************************
*  Code contributed to the webinos project
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*	 http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
* Copyright 2011 Alexander Futasz, Fraunhofer FOKUS
******************************************************************************/

//This RPC implementation should be compliant to JSON RPC 2.0
//as specified @ http://jsonrpc.org/spec.html
(function () {
	if (typeof webinos === 'undefined')
		webinos = {};

	if (typeof module === 'undefined') {
		var exports = {};
		var utils = webinos.utils || (webinos.utils = {});
	} else {
		var utils = require('./webinos.utils.js');
		var exports = module.exports = {};
	}

	var idCount = 0;
	//Code to enable Context from settings file
//	var contextEnabled = false;
//	if (typeof module !== 'undefined'){
//	var path = require('path');
//	var moduleRoot = require(path.resolve(__dirname, '../dependencies.json'));
//	var dependencies = require(path.resolve(__dirname, '../' + moduleRoot.root.location + '/dependencies.json'));
//	var webinosRoot = path.resolve(__dirname, '../' + moduleRoot.root.location)+'/';
//	contextEnabled = require(webinosRoot + dependencies.manager.context_manager.location + 'data/contextSettings.json').contextEnabled;
//  }

	/**
	 * RPCHandler constructor
	 *  @constructor
	 *  @param parent The PZP object or optional else.
	 */
	_RPCHandler = function(parent, registry) {
		/**
		 * Parent is the PZP. The parameter is not used/optional on PZH and the
		 * web browser.
		 */
		this.parent = parent;

		/**
		 * Registry of registered RPC objects.
		 */
		this.registry = registry;

		/**
		 * session id
		 */
		this.sessionId = '';

		/**
		 * Used to store objectRefs for callbacks that get invoked more than once
		 */
		this.objRefCacheTable = {};

		/**
		 * Used on the client side by executeRPC to store callbacks that are
		 * invoked once the RPC finished.
		 */
		this.awaitingResponse = {};

		this.messageHandler = {
				write: function() {
					console.log('INFO: [RPC] could not execute RPC, messageHandler was not set.');
				}
		};
	}

	/**
	 * Sets the writer that should be used to write the stringified JSON RPC request.
	 * @param messageHandler Message handler manager.
	 */
	_RPCHandler.prototype.setMessageHandler = function (messageHandler){
		this.messageHandler = messageHandler;
	};

	/**
	 * Create and return a new JSONRPC 2.0 object.
	 * @function
	 * @private
	 */
	var newJSONRPCObj = function(id) {
		return {
			jsonrpc: '2.0',
			id: id || getNextID()
		};
	};

	/**
	 * Creates a new unique identifier to be used for RPC requests and responses.
	 * @function
	 * @private
	 */
	var getNextID = function() {
		function s4() {
			return ((1 + Math.random()) * 0x10000|0).toString(16).substr(1);
		}
		return s4() + s4() + s4();
	}

	/**
	 * Create and return a new JSONRPC 2.0 request object.
	 * @function
	 * @private
	 */
	var newJSONRPCRequest = function(method, params) {
		var rpc = newJSONRPCObj();
		rpc.method = method;
		rpc.params = params || [];
		return rpc;
	};

	/**
	 * Create and return a new JSONRPC 2.0 response result object.
	 * @function
	 * @private
	 */
	var newJSONRPCResponseResult = function(id, result) {
		var rpc = newJSONRPCObj(id);
		rpc.result = typeof result === 'undefined' ? {} : result;
		return rpc;
	};

	/**
	 * Create and return a new JSONRPC 2.0 response error object.
	 * @function
	 * @private
	 */
	var newJSONRPCResponseError = function(id, error) {
		var rpc = newJSONRPCObj(id);
		rpc.error = {
			data: error,
			code: 32000,
			message: 'Method Invocation returned with error'
		};
		return rpc;
	};

	/**
	 * Handles a JSON RPC request.
	 * @param request JSON RPC request object.
	 * @param from The sender.
	 * @param msgid An id.
	 * @function
	 * @private
	 */
	var handleRequest = function (request, from, msgid) {
		var idx = request.method.lastIndexOf('.');
		var service = request.method.substring(0, idx);
		var method = request.method.substring(idx + 1);
		var serviceId = undefined;
		idx = service.indexOf('@');
		if (idx !== -1) {
			// uses old format without md5 hash, see createRPC
			var serviceIdRest = service.substring(idx + 1);
			service = service.substring(0, idx);
			var idx2 = serviceIdRest.indexOf('.');
			if (idx2 !== -1) {
				serviceId = serviceIdRest.substring(0, idx2);
			} else {
				serviceId = serviceIdRest;
			}
		}
		//TODO send back error if service and method is not webinos style

		if (service.length === 0) {
			console.log('ERROR: [RPC] Cannot handle request because of missing service in request');
			return;
		}

		console.log('INFO: [RPC] '+"Got request to invoke " + method + " on " + service + (serviceId ? "@" + serviceId : "") +" with params: " + request.params );

		var includingObject = this.registry.getServiceWithTypeAndId(service, serviceId);

		if (typeof includingObject === 'undefined'){
			console.log('INFO: [RPC] '+"No service found with id/type " + service);
			return;
		}

		// takes care of finding functions bound to attributes in nested objects
		idx = request.method.lastIndexOf('.');
		var methodPathParts = request.method.substring(0, idx);
		methodPathParts = methodPathParts.split('.');
		// loop through the nested attributes
		for (var pIx = 0; pIx<methodPathParts.length; pIx++) {
			if (methodPathParts[pIx] && methodPathParts[pIx].indexOf('@') >= 0) continue;
			if (methodPathParts[pIx] && includingObject[methodPathParts[pIx]]) {
				includingObject = includingObject[methodPathParts[pIx]];
			}
		}

		if (typeof includingObject === 'object'){
			var id = request.id;
			var that = this;
			var fromObjectRef;

			// callback registration (one request to many responses)
			if (typeof request.fromObjectRef !== 'undefined' && request.fromObjectRef != null) {
				this.objRefCacheTable[request.fromObjectRef] = {'from':from, msgId: msgid};
				fromObjectRef = request.fromObjectRef;
			}

			function successCallback(result) {
				if (typeof id === 'undefined') return;
				var rpc = newJSONRPCResponseResult(id, result);
				that.executeRPC(rpc, undefined, undefined, from, msgid);

				// CONTEXT LOGGING HOOK
//				if (contextEnabled){
//					webinos.context.logContext(request,res);
//				}
			}
			function errorCallback(error) {
				if (typeof id === 'undefined') return;
				var rpc = newJSONRPCResponseError(id, error);
				that.executeRPC(rpc, undefined, undefined, from, msgid);
			}

			// call the requested method
			includingObject[method](request.params, successCallback, errorCallback, fromObjectRef);
		}
	};

	/**
	 * Handles a JSON RPC response.
	 * @param response JSON RPC response object.
	 * @function
	 * @private
	 */
	var handleResponse = function (response) {
		//if no id is provided we cannot invoke a callback
		if (typeof response.id === 'undefined' || response.id == null) return;

		console.log('INFO: [RPC] '+"Received a response that is registered for " + response.id);

		//invoking linked error / success callback
		if (typeof this.awaitingResponse[response.id] !== 'undefined'){
			if (this.awaitingResponse[response.id] != null){

				if (typeof this.awaitingResponse[response.id].onResult === 'function' && typeof response.result !== 'undefined'){

					this.awaitingResponse[response.id].onResult(response.result);
					console.log('INFO: [RPC] '+"called SCB");
				}

				if (typeof this.awaitingResponse[response.id].onError === 'function' && typeof response.error !== 'undefined'){
					if (typeof response.error.data !== 'undefined'){
						console.log('INFO: [RPC] '+"Propagating error to application");
						this.awaitingResponse[response.id].onError(response.error.data);
					}
					else this.awaitingResponse[response.id].onError();
				}

				delete this.awaitingResponse[response.id];
			}
		}
	};

	/**
	 * Handles a new JSON RPC message (as string)
	 * @param message The RPC message coming in.
	 * @param from The sender.
	 * @param msgid An id.
	 */
	_RPCHandler.prototype.handleMessage = function (jsonRPC, from, msgid){
		console.log('INFO: [RPC] '+"New packet from messaging");
		console.log('INFO: [RPC] '+"Response to " + from);

		if (typeof jsonRPC.method !== 'undefined' && jsonRPC.method != null) {
			// received message is RPC request
			handleRequest.call(this, jsonRPC, from, msgid);
		} else {
			// received message is RPC response
			handleResponse.call(this, jsonRPC, from, msgid);
		}
	};

	/**
	 * Executes the given RPC request and registers an optional callback that
	 * is invoked if an RPC response with same id was received.
	 * @param rpc An RPC object create with createRPC.
	 * @param callback Success callback.
	 * @param errorCB Error callback.
	 * @param from Sender.
	 * @param msgid An id.
	 */
	_RPCHandler.prototype.executeRPC = function (rpc, callback, errorCB, from, msgid) {
		// service invocation case
		if (typeof rpc.serviceAddress !== 'undefined') {
			if (typeof module !== 'undefined') {
				this.messageHandler.write(rpc, rpc.serviceAddress);
			} else {
				// this only happens in the web browser
				webinos.session.message_send(rpc, rpc.serviceAddress);// TODO move the whole mmessage_send function here?
			}

			if (typeof callback === 'function'){
				var cb = {};
				cb.onResult = callback;
				if (typeof errorCB === 'function') cb.onError = errorCB;
				if (typeof rpc.id !== 'undefined') this.awaitingResponse[rpc.id] = cb;
			}
			return;
		}


		// ObjectRef invocation case
		if (typeof callback === 'function'){
			var cb = {};
			cb.onResult = callback;
			if (typeof errorCB === 'function') cb.onError = errorCB;
			if (typeof rpc.id !== 'undefined') this.awaitingResponse[rpc.id] = cb;

			if (rpc.method && rpc.method.indexOf('@') === -1) {
				var objectRef = rpc.method.split('.')[0];
				if (typeof this.objRefCacheTable[objectRef] !== 'undefined') {
					from = this.objRefCacheTable[objectRef].from;

				}
				console.log('INFO: [RPC] '+'RPC MESSAGE' + " to " + from + " for callback " + objectRef);
			}

		}
		else if (rpc.method && rpc.method.indexOf('@') === -1) {
			var objectRef = rpc.method.split('.')[0];
			if (typeof this.objRefCacheTable[objectRef] !== 'undefined') {
				from = this.objRefCacheTable[objectRef].from;

			}
			console.log('INFO: [RPC] '+'RPC MESSAGE' + " to " + from + " for callback " + objectRef);
		}

		//TODO check if rpc is request on a specific object (objectref) and get mapped from / destination session


		this.messageHandler.write(rpc, from, msgid);
	};

	/**
	 * Creates a JSON RPC 2.0 compliant object.
	 * @param service The service (e.g., the file reader or the
	 * 		  camera service) as RPCWebinosService object instance.
	 * @param method The method that should be invoked on the service.
	 * @param params An optional array of parameters to be used.
	 * @returns RPC object to execute.
	 */
	_RPCHandler.prototype.createRPC = function (service, method, params) {
		if (typeof service === 'undefined') throw "Service is undefined";
		if (typeof method === 'undefined') throw "Method is undefined";

		var rpcMethod;

		if (typeof service === 'object') {
			// e.g. FileReader@cc44b4793332831dc44d30b0f60e4e80.truncate
			// i.e. (class name) @ (md5 hash of service meta data) . (method in class to invoke)
			rpcMethod = service.api + "@" + service.id + "." + method;
		} else {
			rpcMethod = service + "." + method;
		}

		var rpcRequest = newJSONRPCRequest(rpcMethod, params);

		if (typeof service === 'object' && typeof service.serviceAddress !== 'undefined') {
			// FIXME not a defined member of the JSON-RPC spec, maybe encode as part of the method
			rpcRequest.serviceAddress = service.serviceAddress;
		}

		return rpcRequest;
	};

	/**
	 * Registers an object as RPC request receiver.
	 * @param callback RPC object from createRPC with added methods available via RPC.
	 */
	_RPCHandler.prototype.registerCallbackObject = function (callback) {
		if (typeof callback.id === 'undefined') {
			callback.id = getNextID();
		}
		if (typeof callback.api === 'undefined') {
			// api property must exist, since that is used to register an object
			callback.api = callback.id;

			// for listener rpc calls it was previously needed to manually add
			// fromObjRef to an rpc object. instead, now the rpc object can be
			// used directly with registerCallbackObject which will add the
			// fromObjRef property
			callback.fromObjectRef = callback.id;
		}
		this.registry.registerCallbackObject(callback);
	};

	/**
	 * Unregisters an object as RPC request receiver.
	 * @param callback The callback object to unregister.
	 */
	_RPCHandler.prototype.unregisterCallbackObject = function (callback) {
		if (typeof callback.id === 'undefined') {
			// id property is needed. in case of listener rpc calls it's usually
			// the same as api property
			callback.id = callback.api;
		}
		this.registry.unregisterObject(callback);
	};

	/**
	 * Utility method that combines createRPC and executeRPC.
	 * @param service The service (e.g., the file reader or the
	 * 		  camera service) as RPCWebinosService object instance.
	 * @param method The method that should be invoked on the service.
	 * @param objectRef RPC object reference.
	 * @param successCallback Success callback.
	 * @param errorCallback Error callback.
	 * @returns Function which when called does the rpc.
	 */
	_RPCHandler.prototype.request = function (service, method, objectRef, successCallback, errorCallback) {
		var self = this; // TODO Bind returned function to "this", i.e., an instance of RPCHandler?

		return function () {
			var params = Array.prototype.slice.call(arguments);
			var message = self.createRPC(service, method, params);

			if (objectRef && objectRef.api)
				message.fromObjectRef = objectRef.api;
			else if (objectRef)
				message.fromObjectRef = objectRef;

			self.executeRPC(message, utils.callback(successCallback, this), utils.callback(errorCallback, this));
		};
	};

	/**
	 * Utility method that combines createRPC and executeRPC.
	 *
	 * For notification only, doesn't support success or error callbacks.
	 * @param service The service (e.g., the file reader or the
	 * 		  camera service) as RPCWebinosService object instance.
	 * @param method The method that should be invoked on the service.
	 * @param objectRef RPC object reference.
	 * @returns Function which when called does the rpc.
	 */
	_RPCHandler.prototype.notify = function (service, method, objectRef) {
		return this.request(service, method, objectRef, function(){}, function(){});
	};

	/**
	 * RPCWebinosService object to be registered as RPC module.
	 *
	 * The RPCWebinosService has fields with information about a Webinos service.
	 * It is used for three things:
	 * 1) For registering a webinos service as RPC module.
	 * 2) The service discovery module passes this into the constructor of a
	 *	webinos service on the client side.
	 * 3) For registering a RPC callback object on the client side using ObjectRef
	 *	as api field.
	 * When registering a service the constructor should be called with an object
	 * that has the following three fields: api, displayName, description. When
	 * used as RPC callback object, it is enough to specify the api field and set
	 * that to ObjectRef.
	 * @constructor
	 * @param obj Object with fields describing the service.
	 */
	RPCWebinosService = function (obj) {
		if (!obj) {
			this.id = '';
			this.api = '';
			this.displayName = '';
			this.description = '';
			this.serviceAddress = '';
		} else {
			this.id = obj.id || '';
			this.api = obj.api || '';
			this.displayName = obj.displayName || '';
			this.description = obj.description || '';
			this.serviceAddress = obj.serviceAddress || '';
		}
	};

	/**
	 * Get an information object from the service.
	 * @returns Object including id, api, displayName, serviceAddress.
	 */
	RPCWebinosService.prototype.getInformation = function () {
		return {
			id: this.id,
			api: this.api,
			displayName: this.displayName,
			description: this.description,
			serviceAddress: this.serviceAddress
		};
	};

	/**
	 * Webinos ServiceType from ServiceDiscovery
	 * @constructor
	 * @param api String with API URI.
	 */
	ServiceType = function(api) {
		if (!api)
			throw new Error('ServiceType: missing argument: api');

		this.api = api;
	};

	/**
	 * Set session id.
	 * @param id Session id.
	 */
 	_RPCHandler.prototype.setSessionId = function(id) {
		this.sessionId = id;
	};

	/**
	 * Export definitions for node.js
	 */
	if (typeof module !== 'undefined'){
		exports.RPCHandler = _RPCHandler;
		exports.RPCWebinosService = RPCWebinosService;
		exports.ServiceType = ServiceType;

	} else {
		// export for web browser
		this.RPCHandler = _RPCHandler;
		this.RPCWebinosService = RPCWebinosService;
		this.ServiceType = ServiceType;
	}
})();
