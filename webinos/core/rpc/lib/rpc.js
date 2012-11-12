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
	var logger = console;
//    var policyManager = {'enforceRPCRequest':function(scope, jsonRPC, from, msgid){handleRequest.call(scope, jsonRPC, from, msgid)}};
	if (typeof module === 'undefined') {
		var exports = {};
	} else {
		var exports = module.exports = {};
		var webinos_= require("find-dependencies")(__dirname);
		logger  = webinos_.global.require(webinos_.global.util.location, "lib/logging.js")(__filename);
//        policyManager = webinos_.global.require(webinos_.global.manager.policy_manager.location).policyManager;
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
		 * Map to store callback objects on which methods can be invoked.
		 * Used by one request to many replies pattern.
		 */
		this.callbackObjects = {};

		/**
		 * Used on the client side by executeRPC to store callbacks that are
		 * invoked once the RPC finished.
		 */
		this.awaitingResponse = {};

		this.messageHandler = {
				write: function() {
					logger.log("could not execute RPC, messageHandler was not set.");
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
	 * @param used for recursion
	 */
	var getNextID = function(a) {
	    // implementation taken from here: https://gist.github.com/982883
        return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,getNextID);
	}

	/**
	 * Preliminary object to hold information to create JSONRPC request object.
	 * @function
	 * @private
	 */
	var newPreRPCRequest = function(method, params) {
		var rpc = newJSONRPCObj();
		rpc.method = method;
		rpc.params = params || [];
		rpc.preliminary = true;
		return rpc;
	};

	/**
	 * Create and return a new JSONRPC 2.0 request object.
	 * @function
	 * @private
	 */
	var toJSONRPC = function(preRPCRequest) {
		if (preRPCRequest.preliminary) {
			var rpcRequest = newJSONRPCObj(preRPCRequest.id);
			rpcRequest.method = preRPCRequest.method;
			rpcRequest.params = preRPCRequest.params;
			return rpcRequest;
		} else {
			return preRPCRequest;
		}
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
			code: -31000,
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
		var isCallbackObject;

		var idx = request.method.lastIndexOf('.');
		var service = request.method.substring(0, idx);
		var method = request.method.substring(idx + 1);
		var serviceId = undefined;
		idx = service.indexOf('@');
		if (idx !== -1) {
			// extract service type and id, e.g. service@id
			var serviceIdRest = service.substring(idx + 1);
			service = service.substring(0, idx);
			var idx2 = serviceIdRest.indexOf('.');
			if (idx2 !== -1) {
				serviceId = serviceIdRest.substring(0, idx2);
			} else {
				serviceId = serviceIdRest;
			}
		} else if (service !== "ServiceDiscovery") {
			// request to object registered with registerCallbackObject
			isCallbackObject = true;
		}
		//TODO send back error if service and method is not webinos style

		if (service.length === 0) {
			logger.log("Cannot handle request because of missing service in request");
			return;
		}

		logger.log("Got request to invoke " + method + " on " + service + (serviceId ? "@" + serviceId : "") +" with params: " + request.params );

		var includingObject;
		if (isCallbackObject) {
			includingObject = this.callbackObjects[service];
		} else {
			includingObject = this.registry.getServiceWithTypeAndId(service, serviceId);
		}

		if (!includingObject) {
			logger.log("No service found with id/type " + service);
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

		if (typeof includingObject === 'object') {
			var id = request.id;
			var that = this;

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

			// registration object (in case of "one request to many responses" use)
			var fromObjectRef = {
				rpcId: request.id,
				from: from
			};

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

		logger.log("Received a response that is registered for " + response.id);

		//invoking linked error / success callback
		if (typeof this.awaitingResponse[response.id] !== 'undefined'){
			if (this.awaitingResponse[response.id] != null){

				if (typeof this.awaitingResponse[response.id].onResult === 'function' && typeof response.result !== 'undefined'){

					this.awaitingResponse[response.id].onResult(response.result);
					logger.log("called SCB");
				}

				if (typeof this.awaitingResponse[response.id].onError === 'function' && typeof response.error !== 'undefined'){
					if (typeof response.error.data !== 'undefined'){
						logger.log("Propagating error to application");
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
		logger.log("New packet from messaging");
		logger.log("Response to " + from);

		if (typeof jsonRPC.method !== 'undefined' && jsonRPC.method != null) {
			// received message is RPC request
//            policyManager.enforceRPCRequest(this, jsonRPC, from, msgid, handleRequest);
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
	 */
	_RPCHandler.prototype.executeRPC = function (preRpc, callback, errorCB, from) {
		var rpc = toJSONRPC(preRpc);

		if (typeof callback === 'function'){
			var cb = {};
			cb.onResult = callback;
			if (typeof errorCB === 'function') cb.onError = errorCB;
			if (typeof rpc.id !== 'undefined') this.awaitingResponse[rpc.id] = cb;
		}

		// service invocation case
		if (typeof preRpc.serviceAddress !== 'undefined') {
			from = preRpc.serviceAddress;
		}

		if (typeof module !== 'undefined') {
			this.messageHandler.write(rpc, from);
		} else {
			// this only happens in the web browser
			webinos.session.message_send(rpc, from);// TODO move the whole mmessage_send function here?
		}
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

		if (service.api && service.id) {
			// e.g. FileReader@cc44b4793332831dc44d30b0f60e4e80.truncate
			// i.e. (class name) @ (md5 hash of service meta data) . (method in class to invoke)
			rpcMethod = service.api + "@" + service.id + "." + method;
		} else if (service.rpcId && service.from) {
			rpcMethod = service.rpcId + "." + method;
		} else {
			rpcMethod = service + "." + method;
		}

		var preRPCRequest = newPreRPCRequest(rpcMethod, params);

		if (service.serviceAddress) {
			preRPCRequest.serviceAddress = service.serviceAddress;
		} else if (service.from) {
			preRPCRequest.serviceAddress = service.from;
		}

		return preRPCRequest;
	};

	/**
	 * Registers an object as RPC request receiver.
	 * @param callback RPC object from createRPC with added methods available via RPC.
	 */
	_RPCHandler.prototype.registerCallbackObject = function (callback) {
		if (!callback.id) {
			// can only happen when registerCallbackObject is called before
			// calling createRPC. file api impl does it this way. that's why
			// the id generated here is then used in notify method below
			// to overwrite the rpc.id, as they need to be the same
			callback.id = getNextID();
		}

		// register
		this.callbackObjects[callback.id] = callback;
	};

	/**
	 * Unregisters an object as RPC request receiver.
	 * @param callback The callback object to unregister.
	 */
	_RPCHandler.prototype.unregisterCallbackObject = function (callback) {
		delete this.callbackObjects[callback.id];
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

	  function callback(maybeCallback) {
	    if (typeof maybeCallback !== "function") {
	      return function () {};
	    }
	    return maybeCallback;
	  }

		return function () {
			var params = Array.prototype.slice.call(arguments);
			var message = self.createRPC(service, method, params);

			if (objectRef && objectRef.api)
				message.id = objectRef.api;
			else if (objectRef)
				message.id = objectRef;

			self.executeRPC(message, callback(successCallback), callback(errorCallback));
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
