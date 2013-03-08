if(typeof webinos === 'undefined'){
/*******************************************************************************
 * Code contributed to the webinos project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright 2012 Felix-Johannes Jendrusch, Fraunhofer FOKUS
 ******************************************************************************/

if (typeof webinos === "undefined") webinos = {};
if (typeof webinos.util === "undefined") webinos.util = {};

(function (exports) {
  exports.inherits = inherits;

  // webinos <3 inherits
  function inherits(c, p, proto) {
    proto = proto || {};
    var e = {};
    [c.prototype, proto].forEach(function (s) {
      Object.getOwnPropertyNames(s).forEach(function (k) {
        e[k] = Object.getOwnPropertyDescriptor(s, k);
      });
    });
    c.prototype = Object.create(p.prototype, e);
    c.parent = p;
  }

  exports.CustomError = CustomError;

  inherits(CustomError, Error);
  function CustomError(name, message) {
    CustomError.parent.call(this, message || name);

    this.name = name;
  }

  exports.EventTarget = EventTarget;

  function EventTarget() {}

  EventTarget.prototype.addEventListener = function (type, listener) {
    if (typeof this.events === "undefined") this.events = {};
    if (typeof this.events[type] === "undefined") this.events[type] = [];

    this.events[type].push(listener);
  };

  EventTarget.prototype.removeEventListener = function (type, listener) {
    if (typeof this.events === "undefined" ||
        typeof this.events[type] === "undefined") {
      return;
    }

    var position = this.events[type].indexOf(listener);
    if (position >= 0) {
      this.events[type].splice(position, 1);
    }
  };

  EventTarget.prototype.removeAllListeners = function (type) {
    if (arguments.length === 0) {
      this.events = {};
    } else if (typeof this.events !== "undefined" &&
               typeof this.events[type] !== "undefined") {
      this.events[type] = [];
    }
  };

  EventTarget.prototype.dispatchEvent = function (event) {
    if (typeof this.events === "undefined" ||
        typeof this.events[event.type] === "undefined") {
      return false;
    }

    var listeners = this.events[event.type].slice();
    if (!listeners.length) return false;

    for (var i = 0, length = listeners.length; i < length; i++) {
      listeners[i].call(this, event);
    }

    return true;
  };

  exports.Event = Event;

  function Event(type) {
    this.type = type;
    this.timeStamp = Date.now();
  }

  exports.ProgressEvent = ProgressEvent;

  inherits(ProgressEvent, Event);
  function ProgressEvent(type, eventInitDict) {
    ProgressEvent.parent.call(this, type);

    eventInitDict = eventInitDict || {};

    this.lengthComputable = eventInitDict.lengthComputable || false;
    this.loaded = eventInitDict.loaded || 0;
    this.total = eventInitDict.total || 0;
  }

  exports.callback = function (maybeCallback) {
    if (typeof maybeCallback !== "function") {
      return function () {};
    }
    return maybeCallback;
  };

  exports.async = function (callback) {
    if (typeof callback !== "function") {
      return callback;
    }
    return function () {
      var argsArray = arguments;
      window.setTimeout(function () {
        callback.apply(null, argsArray);
      }, 0);
    };
  };

  exports.ab2hex = function (buf) {
    var hex = "";
    var view = new Uint8Array(buf);
    for (var i = 0; i < view.length; i++) {
      var repr = view[i].toString(16);
      hex += (repr.length < 2 ? "0" : "") + repr;
    }
    return hex;
  };

  exports.hex2ab = function (hex) {
    var buf = new ArrayBuffer(hex.length / 2);
    var view = new Uint8Array(buf);
    for (var i = 0; i < view.length; i++) {
      view[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return buf;
  }
})(webinos.util);

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

(function () {
	var logger = console;

	/**
	 * Registry for service objects. Used by RPC.
	 * @constructor
	 * @alias Registry
	 * @param parent PZH (optional).
	 */
	var Registry = function(parent) {
		this.parent = parent;

		/**
		 * Holds registered Webinos Service objects local to this RPC.
		 *
		 * Service objects are stored in this dictionary with their API url as
		 * key.
		 */
		this.objects = {};
	};

	var _registerObject = function (callback) {
		if (!callback) {
			return;
		}
		logger.log("Adding: " + callback.api);

		var receiverObjs = this.objects[callback.api];
		if (!receiverObjs)
			receiverObjs = [];

		// generate id
		var md5sum = crypto.createHash('md5');
		callback.id = md5sum.update(callback.api + callback.displayName + callback.description).digest('hex');
		
		// verify id isn't existing already
		var filteredRO = receiverObjs.filter(function(el, idx, array) {
			return el.id === callback.id;
		});
		if (filteredRO.length > 0)
			throw new Error('Cannot register, already got object with same id.');

		receiverObjs.push(callback);
		this.objects[callback.api] = receiverObjs;
	};

	/**
	 * Registers a Webinos service object as RPC request receiver.
	 * @param callback The callback object that contains the methods available via RPC.
	 */
	Registry.prototype.registerObject = function (callback) {
		_registerObject.call(this, callback);

		if (this.parent && this.parent.registerServicesWithPzh) {
			this.parent.registerServicesWithPzh();
		}
	};

	/**
	 * Unregisters an object, so it can no longer receives requests.
	 * @param callback The callback object to unregister.
	 */
	Registry.prototype.unregisterObject = function (callback) {
		if (!callback) {
			return;
		}
		logger.log("Removing: " + callback.api);
		var receiverObjs = this.objects[callback.api];

		if (!receiverObjs)
			receiverObjs = [];

		var filteredRO = receiverObjs.filter(function(el, idx, array) {
			return el.id !== callback.id;
		});
		if (filteredRO.length > 0) {
			this.objects[callback.api] = filteredRO;
		} else {
			delete this.objects[callback.api];
		}

		if (this.parent && this.parent.registerServicesWithPzh) {
			this.parent.registerServicesWithPzh();
		}
	};

	/**
	 * Get all registered objects.
	 *
	 * Objects are returned in a key-value map whith service type as key and
	 * value being an array of objects for that service type.
	 */
	Registry.prototype.getRegisteredObjectsMap = function() {
		return this.objects;
	}

	/**
	 * Get service matching type and id.
	 * @param serviceTyp Service type as string.
	 * @param serviceId Service id as string.
	 */
	Registry.prototype.getServiceWithTypeAndId = function(serviceTyp, serviceId) {
		var receiverObjs = this.objects[serviceTyp];
		if (!receiverObjs)
			receiverObjs = [];

		var filteredRO = receiverObjs.filter(function(el, idx, array) {
			return el.id === serviceId;
		});

		if (filteredRO.length < 1) {
			if (serviceTyp === 'ServiceDiscovery') {
				return receiverObjs[0];
			}
			return undefined;
		}

		return filteredRO[0];
	}

	// Export definitions for node.js
	if (typeof module !== 'undefined'){
		exports.Registry = Registry;
		var crypto = require('crypto');
	} else {
		// export for web browser
		window.Registry = Registry;
	}
})();

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
	if (typeof webinos === 'undefined')
		webinos = {};
	var logger = console;

	var idCount = 0;

	/**
	 * RPCHandler constructor
	 *  @constructor
	 *  @param parent The PZP object or optional else.
	 */
	var _RPCHandler = function(parent, registry) {
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

		this.checkPolicy;

		this.messageHandler = {
			write: function() {
				logger.log("could not execute RPC, messageHandler was not set.");
			}
		};
	};

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
	};

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
		var serviceId;
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

			var successCallback = function (result) {
				if (typeof id === 'undefined') return;
				var rpc = newJSONRPCResponseResult(id, result);
				that.executeRPC(rpc, undefined, undefined, from, msgid);
			}

			var errorCallback = function (error) {
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
		// if no id is provided we cannot invoke a callback
		if (!response.id) return;

		logger.log("Received a response that is registered for " + response.id);

		// invoking linked error / success callback
		if (this.awaitingResponse[response.id]) {
			var waitResp = this.awaitingResponse[response.id];

			if (waitResp.onResult && response.result) {
				waitResp.onResult(response.result);
				logger.log("RPC called scb for response");
			}

			if (waitResp.onError && response.error) {
				if (response.error.data) {
					this.awaitingResponse[response.id].onError(response.error.data);
				}
				else {
					this.awaitingResponse[response.id].onError();
				}
				logger.log("RPC called ecb for response");
			}
				delete this.awaitingResponse[response.id];

		} else if (this.callbackObjects[response.id]) {
			// response is for a rpc callback obj
			var callbackObj = this.callbackObjects[response.id];

			if (callbackObj.onSecurityError && response.error &&
					response.error.data && response.error.data.name === 'SecurityError') {

				callbackObj.onSecurityError(response.error.data);
				logger.log('Received SecurityError response.');
			}
			logger.log('Dropping received response for RPC callback obj.');
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

		// check if okay by policy
		if (this.checkPolicy) {
			var isAllowed = this.checkPolicy(jsonRPC, from, msgid);
			if (!isAllowed) {
				var rpc = newJSONRPCResponseError(jsonRPC.id, {name: "SecurityError", code: 18, message: "Access has been denied."});
				this.executeRPC(rpc, undefined, undefined, from, msgid);
				return;
			}
		}

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
	 */
	_RPCHandler.prototype.executeRPC = function (preRpc, callback, errorCB, from) {
		var rpc = toJSONRPC(preRpc);

		if (typeof callback === 'function' || typeof errorCB === 'function'){
			var cb = {};
			if (typeof callback === 'function') cb.onResult = callback;
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
			webinos.session.message_send(rpc, from);
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
		if (!service) throw "Service is undefined";
		if (!method) throw "Method is undefined";

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
	 * Registers a policy check function.
	 * @param checkPolicy
	 */
	_RPCHandler.prototype.registerPolicycheck = function (checkPolicy) {
		this.checkPolicy = checkPolicy;
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
	var RPCWebinosService = function (obj) {
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
	var ServiceType = function(api) {
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
		exports.Registry = require('./registry.js').Registry;
		exports.RPCWebinosService = RPCWebinosService;
		exports.ServiceType = ServiceType;

	} else {
		// export for web browser
		window.RPCHandler = _RPCHandler;
		window.RPCWebinosService = RPCWebinosService;
		window.ServiceType = ServiceType;
	}
})();

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
* Copyright 2012 Ziran Sun, Samsung Electronics(UK) Ltd
******************************************************************************/
(function ()	{
"use strict";
  var logger = console;
  if (typeof module !== "undefined") {
    var webinos_= require("find-dependencies")(__dirname);
    logger  = webinos_.global.require(webinos_.global.util.location, "lib/logging.js")(__filename);
  }
	function logObj(obj, name)	{
		for (var myKey in obj)	{
			if (typeof obj[myKey] === 'object')
			{
				logger.log(name + "["+myKey +"] = "+JSON.stringify(obj[myKey]));
				logObj(obj[myKey], name + "." + myKey);
			}
		}
	}

	/** Message fields:
	 *
	 * var message = {
	 * register: false    //register sender if true
	 * ,type: "JSONRPC"   // JSONRPC message or other
	 * ,id:   0           // messageid used to
	 * ,from:  null       // sender address
	 * ,to:    null       // reciever address
	 * ,resp_to:   null   // the destination to pass RPC result back to
	 * ,timestamp:  0     // currently this parameter is not used
	 * ,timeout:  null    // currently this parameter is not used
	 * ,payload:  null    // message body - RPC object
	 * };
	 */

	/** Address description:

	 * address format in current session Manager code - PZH/PZP/appid/instanceid
	 * address format defined in http://dev.webinos.org/redmine/projects/wp4/wiki/Entity_Naming_for_Messaging is:
	 * https://her_domain.com/webinos/other_user/urn:services-webinos-org:calender
	 *
	 * other_user@her_domain.com                        <-- name of user identity (PZH?)
	 *  |
	 * +-- laptop                                     <-- name of the PZP
	 *         |
	 *        +-- urn:services-webinos-org:calender    <-- service type
	 *              |
	 *              +-- A0B3
	 * other_user@her_domain.com/laptop/urn:services-webinos-org:calender/
	 * @param rpcHandler RPC handler manager.
	 */
  /**
	 * MessageHandler constructor
	 *  @constructor
	 *  @param rpcHandler RPC handler manager.
	 */
	var MessageHandler = function (rpcHandler) {
		this.sendMsg = null;
		this.objectRef = null;

		this.ownId = null;
		this.separator = null;

		this.rpcHandler = rpcHandler;
		this.rpcHandler.setMessageHandler(this);

		/**
		 * To store the session id after registration. e.g. PZP registers with
		 * PZH, PZH creates a session id X for PZP. client[PZP->PZH] = X
		 *
		 *  TODO need to adjust clients[] to accommodate PZH farm, PZP farm scenarios
		 */
		this.clients = {};

		this.message = {};

		/**
		 * To Store callback functions associated with each message.
		 */
		this.messageCallbacks = {};
	};

	/**
	 * Set the sendMessage function that should be used to send message.
	 * Developers use this function to call different sendmessage APIs under
	 * different communication environment. e.g. in socket.io, the
	 * sendMessageFunction could be: io.sockets.send(sessionid);
	 * @param sendMessageFunction A function that used for sending messages.
	 */
	MessageHandler.prototype.setSendMessage = function (sendMessageFunction) {
		this.sendMsg = sendMessageFunction;
	};

	MessageHandler.prototype.sendMessage = function (message, sessionid, objectRef) {
		this.sendMsg(message, sessionid, objectRef);
	};

	/**
	 * To set the reference to different objects.
	 * @param objref A object reference to referring different PZH or PZP instances.
	 */
	MessageHandler.prototype.setObjectRef = function (objref) {
		this.objectRef = objref;
	};

	/**
	 * Function to get own identity.
	 * @param OwnIdGetter A function that used to get own identification.
	 */
	MessageHandler.prototype.setGetOwnId = function (OwnIdGetter) {
		this.ownId = OwnIdGetter;
	};

	/**
	 * Function to get own identity.
	 */
	MessageHandler.prototype.getOwnId = function () {
		return this.ownId;
	};


	/**
	 * Set separator used to in Addressing to separator different part of the address.
	 * e.g. PZH/PZP/APPID, "/" is the separator here
	 * @param sep The separator that used in address representation
	 */

	MessageHandler.prototype.setSeparator = function (sep) {
		this.separator = sep;
	};

	/**
	 *  Create new message. Refer Message fields above for more details.
	 *  @param options An array that contains elements to define fields in a message
	 */
	MessageHandler.prototype.createMessage = function (options) {
		var message = {};

		for (var i in options ) {
			message[i] = options[i];
		}
		return message;
	};

	/**
	 *  Create messageid. This messageid is used as an identifier for callback function associated
	 *  with the message.
	 *  @param message Message
	 *  @param successHandler Success handler
	 *  @param errorHandler	Error handler
	 */
	MessageHandler.prototype.createMessageId = function(message, successHandler, errorHandler) {
		message.id =  1 + Math.floor(Math.random() * 1024);
		if (errorHandler || successHandler)	{
			this.messageCallbacks[message.id] = {onError: errorHandler, onSuccess: successHandler};
		}
	};

	/**
	 *  Only need to call this once. This will result a sessionid in the receiver's storage.
	 *  @param from Message originator
	 *  @param to  Message destination
	 */
	MessageHandler.prototype.registerSender = function(from, to) {
		logger.log('creating register msg to send from ' + from + ' to ' + to);
		if (from === to) throw new Error('cannot create register msg to itself');

		var options = {};
		options.register = true;
		options.to = to;
		options.from = from;
		options.type = "JSONRPC";
		options.payload = null;

		var message = this.createMessage(options);
		return message;
	};

	/**
	 *  Remove stored session route. This function is called once session is closed.
	 *  @param sender Message sender or forwarder
	 *  @param receiver Message receiver
	 */
	MessageHandler.prototype.removeRoute = function (sender, receiver) {
		var session = [sender, receiver];
		session.join("->");
		if (this.clients[session]) {
			this.clients[session] = null;
		}
	};

	/**
	 * RPC writer - referto write function in  RPC
	 * @param rpc Message body
	 * @param respto Destination for rpc result to be sent to
	 * @param msgid Message id
	 */
	MessageHandler.prototype.write = function (rpc, respto, msgid) {
		//TODO calling write function from RPC does not allow to register call-backs yet

		//create response message
		var options = {};
		options.to = respto;
//	options.resp_to = respto; // used to be respto... FIXME
		options.resp_to = this.ownId; // used to be respto... FIXME
		options.from = this.ownId;

		if (!msgid) {
			msgid = 1 + Math.floor(Math.random() * 1024);
		}
		options.id = msgid;

		if (typeof rpc.jsonrpc !== "undefined") {
			options.type = "JSONRPC";
		}

		options.payload = rpc;
		var message = this.createMessage(options);

		if (message.to !== undefined) {
			var to = message.to;
			var session1 = [to, this.self];
			session1.join("->");
			var session2 = [this.self, to];
			session2.join("->");

			if ((!this.clients[session1]) && (!this.clients[session2]))  // not registered either way
			{
				logger.log("session not set up");
				var occurences = (message.to.split(this.separator).length - 1);

				var data = message.to.split(this.separator);
				var id = data[0];
				var forwardto = data[0];

				for (var i = 1; i < occurences; i++)	{
					id = id + this.separator + data[i];
					var new_session1 = [id, this.self];
					new_session1.join("->");
					var new_session2 = [this.self, id];
					new_session2.join("->");

					if (this.clients[new_session1] || this.clients[new_session2]) {
						forwardto = id;
						logger.log("forwardto ", forwardto);
					}
				}
				if (forwardto === data[0]) {
					var s1 = [forwardto, this.self];
					s1.join("->");
					var s2 = [this.self, forwardto];
					s2.join("->");
					if (this.clients[s1] || this.clients[s2])
						forwardto = data[0];
					else
					{
						var own_addr = this.self.split(this.separator);
						var own_pzh = own_addr[0]
						if (forwardto !== own_pzh) {
							forwardto = own_pzh;
						}
					}
				}
				this.sendMsg(message, forwardto, this.objectRef);
			}
			else if (this.clients[session2]) {
				logger.log("clients[session2]:" + this.clients[session2]);
				this.sendMsg(message, this.clients[session2], this.objectRef);
			}
			else if (this.clients[session1]) {
				logger.log("clients[session1]:" + this.clients[session1]);
				this.sendMsg(message, this.clients[session1], this.objectRef);
			}
		}
	};


	/**
	 *  Handle message routing on receiving message. it does -
	 *  [1] Handle register message and create session path for newly registered party
	 *  [2] Forward messaging if not message destination
	 *  [3] Handle message  by calling RPC handler if it is message destination
	 *  @param message	Received message
	 *  @param sessionid session id
	 */
	MessageHandler.prototype.onMessageReceived = function (message, sessionid) {
		if (typeof message === "string") {
			try {
				message = JSON.parse(message);
			} catch (e) {
				log.error("JSON.parse (message) - error: "+ e.message);
			}
		}

		if (message.hasOwnProperty("register") && message.register) {
			var from = message.from;
			var to = message.to;
			if (to !== undefined) {
				var regid = [from, to];
				regid.join("->");

				//Register message to associate the address with session id
				if (message.from) {
					this.clients[regid] = message.from;
				}
				else if (sessionid) {
					this.clients[regid] = sessionid;
				}

				logger.log("register Message");
			}
			return;
		}
		// check message destination
		else if (message.hasOwnProperty("to") && (message.to)) {
			this.self = this.ownId;

			//check if a session with destination has been stored
			if(message.to !== this.self) {
				logger.log("forward Message");

				//if no session is available for the destination, forward to the hop nearest,
				//i.e A->D, if session for D is not reachable, check C, then check B if C is not reachable
				var to = message.to;
				var session1 = [to, this.self];
				session1.join("->");
				var session2 = [this.self, to];
				session2.join("->");

				// not registered either way
				if ((!this.clients[session1]) && (!this.clients[session2])) {
					logObj(message, "Sender, receiver not registered either way");
					//check occurances of separator used in addressing
					var occurences = (message.to.split(this.separator).length - 1);
					var data = message.to.split(this.separator);
					var id = data[0];
					var forwardto = data[0];

					//strip from right side
					for (var i = 1; i < occurences; i++) {
						id = id + this.separator + data[i];
						var new_session1 = [id, this.self];
						new_session1.join("->");
						var new_session2 = [this.self, id];
						new_session2.join("->");

						if (this.clients[new_session1] || this.clients[new_session2]) {
							forwardto = id;
						}
					}


					if (forwardto === data[0]) {
						var s1 = [forwardto, this.self];
						s1.join("->");
						var s2 = [this.self, forwardto];
						s2.join("->");
						if (this.clients[s1] || this.clients[s2])
							forwardto = data[0];
						else
						{
							var own_addr = this.self.split(this.separator);
							var own_pzh = own_addr[0]
							if (forwardto !== own_pzh) {
								forwardto = own_pzh;
							}
						}
					}
					logger.log("message forward to:" + forwardto);
					this.sendMsg(message, forwardto, this.objectRef);
				}
				else if (this.clients[session2]) {
					this.sendMsg(message, this.clients[session2], this.objectRef);
				}
				else if (this.clients[session1]) {
					this.sendMsg(message, this.clients[session1], this.objectRef);
				}
				return;
			}
			//handle message on itself
			else {
				if (message.payload) {
					if(message.to != message.resp_to) {
						var from = message.from;
						var msgid = message.id;
						this.rpcHandler.handleMessage(message.payload, from, msgid);
					}
					else {
						if (typeof message.payload.method !== "undefined") {
							// FIXME: can we call rpc.handleMessage here without checking messageCallbacks[] for message.id?
							var from = message.from;
							var msgid = message.id;
							this.rpcHandler.handleMessage(message.payload, from, msgid);
						}
						else {
							if (typeof message.payload.result !== "undefined" || typeof message.payload.error !== "undefined") {
								this.rpcHandler.handleMessage(message.payload);
							}
						}

						if (this.messageCallbacks[message.id]) {
							this.messageCallbacks[message.id].onSuccess(message.payload.result);
						}
					}
				}
				else {
					// what other message type are we expecting?
				}
				return;
			}
			return;
		}
	};

	// TODO add fucntion to release clients[] when session is closed -> this will also affect RPC callback funcs

	/**
	 * Export messaging handler definitions for node.js
	 */
	if (typeof exports !== 'undefined') {
		exports.MessageHandler = MessageHandler;
	} else {
		// export for web browser
		window.MessageHandler = MessageHandler;
	}

}());

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
* Copyright 2012 - 2013 Samsung Electronics (UK) Ltd
* Authors: Habib Virji
******************************************************************************/

(function() {
  "use strict";
  webinos.session = {};
  var sessionId = null, pzpId, pzhId, otherPzp = [], otherPzh = [], isConnected = false, enrolled = false, mode, port = 8080;
  var serviceLocation;
  var listenerMap = {};
  var channel;
  webinos.session.setChannel = function(_channel) {
    channel = _channel;
  };
  webinos.session.setPzpPort = function (port_) {
    port = port_;
  };
  webinos.session.getPzpPort = function () {
    return port;
 };
  webinos.session.message_send_messaging = function(msg, to) {
    msg.resp_to = webinos.session.getSessionId();
    channel.send(JSON.stringify(msg));
  };
  webinos.session.message_send = function(rpc, to) {
    var type, id = Math.floor(Math.random() * 101);
    if(rpc.type !== undefined && rpc.type === "prop") {
      type = "prop";
      rpc = rpc.payload;
    }else {
      type = "JSONRPC";
    }
    if (typeof rpc.method !== undefined && rpc.method === "ServiceDiscovery.findServices") {
        id = rpc.params[2];
    }
    if (typeof to === "undefined") {
        to = pzpId;
    }
      var message = {"type":type,
          "id":id,
          "from":webinos.session.getSessionId(),
          "to":to,
          "resp_to":webinos.session.getSessionId(),
          "payload":rpc};
      if(rpc.register !== "undefined" && rpc.register === true) {
          console.log(rpc);
          channel.send(JSON.stringify(rpc));
      }else {
          console.log("creating callback");
          console.log("WebSocket Client: Message Sent");
          console.log(message);
          channel.send(JSON.stringify(message));
    }
  };
    webinos.session.setServiceLocation = function (loc) {
        serviceLocation = loc;
    };
    webinos.session.getServiceLocation = function () {
        if (typeof serviceLocation !== "undefined") {
            return serviceLocation;
        } else {
            return pzpId;
        }
    };
    webinos.session.getSessionId = function () {
        return sessionId;
    };
    webinos.session.getPZPId = function () {
        return pzpId;
    };
    webinos.session.getPZHId = function () {
        return ( pzhId || "");
    };
    webinos.session.getOtherPZP = function () {
        return (otherPzp || []);
    };
    webinos.session.getOtherPZH = function () {
        return (otherPzh || []);
    };
    webinos.session.addListener = function (statusType, listener) {
        var listeners = listenerMap[statusType] || [];
        listeners.push (listener);
        listenerMap[statusType] = listeners;
        return listeners.length;
    };
    webinos.session.removeListener = function (statusType, id) {
        var listeners = listenerMap[statusType] || [];
        try {
            listeners[id - 1] = undefined;
        } catch (e) {
        }
    };
    webinos.session.isConnected = function () {
        return isConnected;
    };

  webinos.session.getSessionId = function() {
    return sessionId;
  };
  webinos.session.getPZPId = function() {
    return pzpId;
  };
  webinos.session.getPZHId = function() {
    return ( pzhId || "");
  };
  webinos.session.getOtherPZP = function() {
    return (otherPzp || []);
  };
  webinos.session.getOtherPZH = function() {
    return (otherPzh || []);
  };
  webinos.session.getPzpModeState = function (mode_name) {
    if (enrolled && mode[mode_name] === "connected") {
      return true;
    } else {
      return false;
    }
  };
  webinos.session.addListener = function(statusType, listener) {
    var listeners = listenerMap[statusType] || [];
    listeners.push(listener);
    listenerMap[statusType] = listeners;
    return listeners.length;
  };
  webinos.session.removeListener = function(statusType, id) {
    var listeners = listenerMap[statusType] || [];
    try {
      listeners[id - 1] = undefined;
    }catch(e) {
    }
  };
  webinos.session.isConnected = function(){
    return isConnected;
  };
  function callListenerForMsg(data) {
    var listeners = listenerMap[data.payload.status] || [];
    for(var i = 0;i < listeners.length;i++) {
      listeners[i](data) ;
    }
  }
  function setWebinosMessaging() {
    webinos.messageHandler.setGetOwnId(sessionId);
    var msg = webinos.messageHandler.registerSender(sessionId, pzpId);
    webinos.session.message_send(msg, pzpId);
  }
  function updateConnected(message){
    otherPzh = message.connectedPzh;
    otherPzp = message.connectedPzp;
    isConnected = !!(otherPzh.indexOf(pzhId) !== -1);
    enrolled = message.enrolled;
    mode = message.mode;
  }
  function setWebinosSession(data){
    sessionId = data.to;
    pzpId = data.from;
    if(data.payload.message) {
      pzhId = data.payload.message.pzhId;
      updateConnected(data.payload.message);
    }
    setWebinosMessaging();
  }
  webinos.session.handleMsg = function(data) {
    if(data.type === "prop") {
      switch(data.payload.status) {
        case "registeredBrowser":
          setWebinosSession(data);
          callListenerForMsg(data);
          break;
        case "pzpFindPeers":
          callListenerForMsg(data);
          break;
        case "pubCert":
          callListenerForMsg(data);
          break;
        case "showHashQR":
          callListenerForMsg(data);
          break;
        case "addPzpQR":
          callListenerForMsg(data);
          break;	
        case "requestRemoteScanner":
            callListenerForMsg(data);
          break;	
        case "checkHashQR":
          callListenerForMsg(data);
          break;	  
        case "sendCert":
          callListenerForMsg(data);
          break;
        case "connectPeers":
          callListenerForMsg(data);
          break;
        case "intraPeer":
          callListenerForMsg(data);
          break;   
        case "update":
          setWebinosSession(data);
          callListenerForMsg(data);
          break;
        case "infoLog":
          callListenerForMsg(data);
          break;
        case "errorLog":
          callListenerForMsg(data);
          break;
        case "error":
          callListenerForMsg(data);
          break;
        case "friendlyName":
          callListenerForMsg(data);
          break;
        case "webinosVersion":
          callListenerForMsg(data);
          break;
        case "pzhDisconnected":
          isConnected = false;
          callListenerForMsg(data);
          break;
      }
    }
  }
}());

//
// Webinos-Platform/webinos/core/wrt/lib/webinos.servicedisco.js
//
// Maintenance records:
// These inline comments should be incorporated in release notes and removed
// from here when releasing new versions.
//
// Modification implements
// -- Interface DiscoveryInterface method
//      PendingOperation findServices(ServiceType serviceType, FindCallBack findCallBack, Options options, Filter filter)
// -- Interface FindCallBack method
//      void onError(DOMError error)
// -- Interface PendingOperation method
//      void cancel()
//
(function () {
    function isOnNode() {
        return typeof module === "object" ? true : false;
    };
    
    /**
     * Interface DiscoveryInterface
     */
    var ServiceDiscovery = function (rpcHandler) {
        this.registeredServices = 0;
        
        var _webinosReady = false;
        var callerCache = [];

        /**
         * Search for registered services.
         * @param {ServiceType} serviceType ServiceType object to search for.
         * @param {FindCallBack} callback Callback to call with results.
         * @param {Options} options Timeout, optional.
         * @param {Filter} filter Filters based on location, name, description, optional.
         */
        this.findServices = function (serviceType, callback, options, filter) {
            var that = this;
            var findOp;
            
            var rpc = rpcHandler.createRPC('ServiceDiscovery', 'findServices',
                    [serviceType, options, filter]);
            
            var timer = setTimeout(function () {
                rpcHandler.unregisterCallbackObject(rpc);
                // If no results return TimeoutError.
                if (!findOp.found && typeof callback.onError === 'function') {
                    callback.onError(new DOMError('TimeoutError', ''));
                }
            }, options && typeof options.timeout !== 'undefined' ?
                        options.timeout : 120000 // default timeout 120 secs
            );
            
            findOp = new PendingOperation(function() {
                // remove waiting requests from callerCache
                var index = callerCache.indexOf(rpc);
                if (index >= 0) {
                    callerCache.splice(index, 1);
                }
                rpcHandler.unregisterCallbackObject(rpc);
                if (typeof callback.onError === 'function') {
                    callback.onError(new DOMError('AbortError', ''));
                }
            }, timer);
            
            var success = function (params) {
                var baseServiceObj = params;
                
                console.log("servicedisco: service found.");
                
                // TODO The typeMap is hard-coded here so only these APIs are
                // supported. In the future this should be improved to support
                // dynamic APIs.
                //
                // APIs should be classified as intrinsic ones and webinos
                // services. Intrinsic APIs, like Discovery, App2App, should be
                // provided directly in WRT. webinos service APIs, like Actuator,
                // Vehicle, which are supposed to be provided with a PZP, should be
                // found with Discovery implemented in this file.
                //
                // That means, intrinsic APIs are released along with WRT and not
                // acquired with Discovery. Users can invoke them directly just
                // like using a library. While webinos service APIs will still be
                // acquired with Discovery.
                //
                var typeMap = {};
                if (typeof webinos.file !== 'undefined' && typeof webinos.file.Service !== 'undefined')
                    typeMap['http://webinos.org/api/file'] = webinos.file.Service;
                if (typeof TestModule !== 'undefined') typeMap['http://webinos.org/api/test'] = TestModule;
                if (typeof ActuatorModule !== 'undefined') {
                    typeMap['http://webinos.org/api/actuators'] = ActuatorModule;
                    typeMap['http://webinos.org/api/actuators.linearmotor'] = ActuatorModule;
                    typeMap['http://webinos.org/api/actuators.switch'] = ActuatorModule;
                    typeMap['http://webinos.org/api/actuators.rotationalmotor'] = ActuatorModule;
                    typeMap['http://webinos.org/api/actuators.vibratingmotor'] = ActuatorModule;
                    typeMap['http://webinos.org/api/actuators.servomotor'] = ActuatorModule;
                    typeMap['http://webinos.org/api/actuators.swivelmotor'] = ActuatorModule;
                    typeMap['http://webinos.org/api/actuators.thermostat'] = ActuatorModule;
                }
                if (typeof WebNotificationModule !== 'undefined') typeMap['http://webinos.org/api/notifications'] = WebNotificationModule;
                if (typeof ZoneNotificationModule !== 'undefined') typeMap['http://webinos.org/api/internal/zonenotification'] = ZoneNotificationModule;
                if (typeof oAuthModule!== 'undefined') typeMap['http://webinos.org/mwc/oauth'] = oAuthModule;
                if (typeof WebinosGeolocation !== 'undefined') typeMap['http://www.w3.org/ns/api-perms/geolocation'] = WebinosGeolocation;
                if (typeof WebinosDeviceOrientation !== 'undefined') typeMap['http://webinos.org/api/deviceorientation'] = WebinosDeviceOrientation;
                if (typeof Vehicle !== 'undefined') typeMap['http://webinos.org/api/vehicle'] = Vehicle;
                if (typeof EventsModule !== 'undefined') typeMap['http://webinos.org/api/events'] = EventsModule;
                if (typeof App2AppModule !== 'undefined') typeMap['http://webinos.org/api/app2app'] = App2AppModule;
                if (typeof AppLauncherModule !== 'undefined') typeMap['http://webinos.org/api/applauncher'] = AppLauncherModule;
                if (typeof Sensor !== 'undefined') {
                    typeMap['http://webinos.org/api/sensors'] = Sensor;
                    typeMap['http://webinos.org/api/sensors.temperature'] = Sensor;
                    typeMap['http://webinos.org/api/sensors.light'] = Sensor;
                    typeMap['http://webinos.org/api/sensors.proximity'] = Sensor;
                    typeMap['http://webinos.org/api/sensors.noise'] = Sensor;
                    typeMap['http://webinos.org/api/sensors.pressure'] = Sensor;
                    typeMap['http://webinos.org/api/sensors.humidity'] = Sensor;
                    typeMap['http://webinos.org/api/sensors.heartratemonitor'] = Sensor;
                }
                if (typeof PaymentModule !== 'undefined') typeMap['http://webinos.org/api/payment'] = PaymentModule;
                if (typeof UserProfileIntModule !== 'undefined') typeMap['UserProfileInt'] = UserProfileIntModule;
                if (typeof TVManager !== 'undefined') typeMap['http://webinos.org/api/tv'] = TVManager;
                if (typeof DeviceStatusManager !== 'undefined') typeMap['http://wacapps.net/api/devicestatus'] = DeviceStatusManager;
                if (typeof Contacts !== 'undefined') typeMap['http://www.w3.org/ns/api-perms/contacts'] = Contacts;
                if (typeof webinos.Context !== 'undefined') typeMap['http://webinos.org/api/context'] = webinos.Context;
                //if (typeof DiscoveryModule !== 'undefined') typeMap['http://webinos.org/manager/discovery/bluetooth'] = DiscoveryModule;
                if (typeof DiscoveryModule !== 'undefined') typeMap['http://webinos.org/api/discovery'] = DiscoveryModule;
                if (typeof AuthenticationModule !== 'undefined') typeMap['http://webinos.org/api/authentication'] = AuthenticationModule;
                if (typeof MediaContentModule !== 'undefined') typeMap['http://webinos.org/api/mediacontent'] = MediaContentModule;
                if (typeof corePZinformationModule !== 'undefined') typeMap['http://webinos.org/api/corePZinformation'] = corePZinformationModule;
                if (typeof NfcModule !== 'undefined') typeMap['http://webinos.org/api/nfc'] = NfcModule;

                if (isOnNode()) {
                    var path = require('path');
                    var moduleRoot = path.resolve(__dirname, '../') + '/';
                    var moduleDependencies = require(moduleRoot + '/dependencies.json');
                    var webinosRoot = path.resolve(moduleRoot + moduleDependencies.root.location) + '/';
                    var dependencies = require(path.resolve(webinosRoot + '/dependencies.json'));

                    var Context = require(path.join(webinosRoot, dependencies.wrt.location, 'lib/webinos.context.js')).Context;
                    typeMap['http://webinos.org/api/context'] = Context;
                }

                var ServiceConstructor = typeMap[baseServiceObj.api];
                if (typeof ServiceConstructor !== 'undefined') {
                    // elevate baseServiceObj to usable local WebinosService object
                    var service = new ServiceConstructor(baseServiceObj, rpcHandler);
                    this.registeredServices++;
                    findOp.found = true;
                    callback.onFound(service);
                } else {
                    var serviceErrorMsg = 'Cannot instantiate webinos service.';
                    console.log(serviceErrorMsg);
                    if (typeof callback.onError === 'function') {
                        callback.onError(new DiscoveryError(102, serviceErrorMsg));
                    }
                }
            }; // End of function success
            
            // The core of findService.
            rpc.onservicefound = function (params) {
                // params is the parameters needed by the API method.
                success(params);
            };
            
            // Refer to the call in
            // Webinos-Platform/webinos/core/api/servicedisco/lib/rpc_servicediso.js.
            rpc.onSecurityError = function (params) {
                if (typeof findOp !== 'undefined' && typeof callback.onError === 'function') {
                    callback.onError(new DOMError('SecurityError', ''));
                }
            };
            
            // Add this pending operation.
            rpcHandler.registerCallbackObject(rpc);
            
            if (typeof rpcHandler.parent !== 'undefined') {
                rpc.serviceAddress = rpcHandler.parent.config.pzhId;
            } else {
                rpc.serviceAddress = webinos.session.getServiceLocation();
            }
            
            // TODO Need to check how to handle it. The serviceType BlobBuilder is
            // not in the API spec.
            // Pure local services.
            if (serviceType == "BlobBuilder") {
                this.found =true;
                var tmp = new BlobBuilder();
                this.registeredServices++;
                callback.onFound(tmp);
                return findOp;
            }
            
            if (!isOnNode() && !_webinosReady) {
                callerCache.push(rpc);
            } else {
                // Only do it when _webinosReady is true.
                rpcHandler.executeRPC(rpc);
            }
            
            return findOp;
        };  // End of findServices.
        
        if (isOnNode()) {
            return;
        }
        
        // further code only runs in the browser
        
        webinos.session.addListener('registeredBrowser', function () {
            _webinosReady = true;
            for (var i = 0; i < callerCache.length; i++) {
                var req = callerCache[i];
                rpcHandler.executeRPC(req);
            }
            callerCache = [];
        });
    };
    
    /**
     * Export definitions for node.js
     */
    if (isOnNode()) {
        exports.ServiceDiscovery = ServiceDiscovery;
    } else {
        // this adds ServiceDiscovery to the window object in the browser
        window.ServiceDiscovery = ServiceDiscovery;
    }
    
    /**
     * Interface PendingOperation
     */
    function PendingOperation(cancelFunc, timer) {
        this.found = false;
        
        this.cancel = function () {
            clearTimeout(timer);
            cancelFunc();
        };
    }
    
    function DOMError(name, message) {
        return {
            name: name,
            message: message
        };
    }
    
    
    ///////////////////// WEBINOS SERVICE INTERFACE ///////////////////////////

    // TODO decide what to do with this class.
    WebinosService = function (obj) {
        this.base = RPCWebinosService;
        this.base(obj);

//        this.id = Math.floor(Math.random()*101);
    };
    WebinosService.prototype = new RPCWebinosService;

    WebinosService.prototype.state = "";

//    WebinosService.prototype.api = "";

//    WebinosService.prototype.id = "";

//    WebinosService.prototype.displayName = "";

//    WebinosService.prototype.description = "";

    WebinosService.prototype.icon = "";

    // stub implementation in case a service module doesn't provide its own bindService
    WebinosService.prototype.bindService = function(bindCB) {
        if (typeof bindCB === 'undefined') return;

        if (typeof bindCB.onBind === 'function') {
            bindCB.onBind(this);
        }
    };

    WebinosService.prototype.unbind = function() {
        webinos.discovery.registeredServices--;
        if (channel != null && webinos.discovery.registeredServices > 0) {
            channel.close();
            channel = null;
        }
    };
}());

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
    if (typeof webinos === "undefined") webinos = {};
    var channel = null;

    /**
     * Creates the socket communication channel
     * for a locally hosted websocket server at port 8080
     * for now this channel is used for sending RPC, later the webinos
     * messaging/eventing system will be used
     */
    function createCommChannel (successCB) {
        var channel = null;
        if (typeof WebinosSocket !== 'undefined') { // Check if we are inside Android widget renderer.
            channel = new WebinosSocket ();
        } else { // We are not in Android widget renderer so we can use a browser websocket.
            var port, hostname;
            var defaultHost = "localhost";
            var defaultPort = "8080";
            var isWebServer = true;
            var useDefaultHost = false;
            var useDefaultPort = false;

            // Get web server info.

            // Get web server port.
            port = window.location.port - 0 || 80;
            // Find web server hostname.
            hostname = window.location.hostname;
            if (hostname == "") isWebServer = false; // We are inside a local file.

            // Find out the communication socket info.

            // Set the communication channel's port.
            if (isWebServer) {
                try {
                    var xmlhttp = new XMLHttpRequest ();
                    xmlhttp.open ("GET", "/webinosConfig.json", false);
                    xmlhttp.send ();
                    if (xmlhttp.status == 200) {
                        var resp = JSON.parse (xmlhttp.responseText);
                        port = resp.websocketPort;
                    } else { // We are not inside a pzp or widget server.
                        console.log ("CAUTION: webinosConfig.json failed to load. Are you on a pzp/widget server or older version of webinos? Trying the guess  communication channel's port.");
                        port = port + 1; // Guessing that the port is +1 to the webserver's. This was the way to detect it on old versions of pzp.
                    }
                } catch (err) { // XMLHttpRequest is not supported or something went wrong with it.
                    console.log ("CAUTION: The pzp communication host and port are unknown. Trying the default communication channel.");
                    useDefaultHost = true;
                    useDefaultPort = true;
                }
            } else { // Let's try the default pzp hostname and port.
                console.log ("CAUTION: No web server detected. Using a local file? Trying the default communication channel.");
                useDefaultHost = true;
                useDefaultPort = true;
            }
            // Change the hostname to the default if required.
            if (useDefaultHost) hostname = defaultHost;
            // Change the port to the default if required.
            if (useDefaultPort) port = defaultPort;

            // We are ready to make the connection.

            // Get the correct websocket object.
            var ws = window.WebSocket || window.MozWebSocket;
            try {
                channel = new ws ("ws://" + hostname + ":" + port);
            } catch (err) { // Websockets are not available for this browser. We need to investigate in order to support it.
                throw new Error ("Your browser does not support websockets. Please report your browser on webinos.org.");
            }
        }
        webinos.session.setChannel (channel);
        webinos.session.setPzpPort (port);

        channel.onmessage = function (ev) {
            console.log ('WebSocket Client: Message Received : ' + JSON.stringify (ev.data));
            var data = JSON.parse (ev.data);
            if (data.type === "prop") {
                webinos.session.handleMsg (data);
            } else {
                webinos.messageHandler.setGetOwnId (webinos.session.getSessionId ());
                webinos.messageHandler.setObjectRef (this);
                webinos.messageHandler.setSendMessage (webinos.session.message_send_messaging);
                webinos.messageHandler.onMessageReceived (data, data.to);
            }
        };
        channel.onopen = function() {
          var url = window.location.pathname;
          var filename = url.substring(url.lastIndexOf('/')+1);
          webinos.session.message_send({type: 'prop', payload: {status:'registerBrowser', value: filename}});
        };
    }

    createCommChannel ();

    webinos.rpcHandler = new RPCHandler (undefined, new Registry ());
    webinos.messageHandler = new MessageHandler (webinos.rpcHandler);
    webinos.discovery = new ServiceDiscovery (webinos.rpcHandler);
    webinos.ServiceDiscovery = webinos.discovery; // for backward compat

} ());

/*******************************************************************************
 * Code contributed to the webinos project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright 2012 Felix-Johannes Jendrusch, Fraunhofer FOKUS
 ******************************************************************************/

if (typeof module === "undefined") {
  if (typeof webinos === "undefined") webinos = {};
  if (typeof webinos.path === "undefined") webinos.path = {};
}

// webinos <3 node.js
(function (exports) {
  var splitPathRe =
        /^(\/?)([\s\S]+\/(?!$)|\/)?((?:\.{1,2}$|[\s\S]+?)?(\.[^.\/]*)?)$/;

  function splitPath(path) {
    var result = splitPathRe.exec(path);
    return [result[1] || "", result[2] || "", result[3] || "", result[4] || ""];
  }

  function normalizeArray(parts, allowAboveRoot) {
    var up = 0;
    for (var i = parts.length - 1; i >= 0; i--) {
      var part = parts[i];
      if (part === ".") {
        parts.splice(i, 1);
      } else if (part === "..") {
        parts.splice(i, 1);
        up++;
      } else if (up) {
        parts.splice(i, 1);
        up--;
      }
    }

    if (allowAboveRoot) {
      for (; up--;) {
        parts.unshift("..");
      }
    }

    return parts;
  }

  exports.normalize = function (path) {
    var isAbsolute = path.charAt(0) === "/"
      , trailingSlash = path.substr(-1) === "/";

    path = normalizeArray(path.split("/").filter(function (part) {
      return !!part;
    }), !isAbsolute).join("/");

    if (!path && !isAbsolute) {
      path = ".";
    }
    if (path && trailingSlash) {
      path += "/";
    }

    return (isAbsolute ? "/" : "") + path;
  };

  exports.join = function () {
    var paths = Array.prototype.slice.call(arguments, 0);
    return exports.normalize(paths.filter(function (path) {
      return path && typeof path === "string";
    }).join("/"));
  };

  exports.resolve = function () {
    var resolvedPath = ""
      , resolvedAbsolute = false;

    for (var i = arguments.length - 1; i >= 0 && !resolvedAbsolute; i--) {
      // TODO Use some fallback (e.g., the current working directory ..not)?
      var path = arguments[i];

      if (!path || typeof path !== "string") {
        continue;
      }

      resolvedPath = path + "/" + resolvedPath;
      resolvedAbsolute = path.charAt(0) === "/";
    }

    resolvedPath = normalizeArray(
      resolvedPath.split("/").filter(function (part) {
        return !!part;
      }
    ), !resolvedAbsolute).join("/");

    return ((resolvedAbsolute ? "/" : "") + resolvedPath) || ".";
  };

  exports.relative = function (from, to) {
    from = exports.resolve(from).substr(1);
    to = exports.resolve(to).substr(1);

    function trim(arr) {
      var start = 0;
      for (; start < arr.length; start++) {
        if (arr[start] !== "") break;
      }

      var end = arr.length - 1;
      for (; end >= 0; end--) {
        if (arr[end] !== "") break;
      }

      if (start > end) return [];
      return arr.slice(start, end - start + 1);
    }

    var fromParts = trim(from.split("/"));
    var toParts = trim(to.split("/"));

    var length = Math.min(fromParts.length, toParts.length);
    var samePartsLength = length;
    for (var i = 0; i < length; i++) {
      if (fromParts[i] !== toParts[i]) {
        samePartsLength = i;
        break;
      }
    }

    var outputParts = [];
    for (var i = samePartsLength; i < fromParts.length; i++) {
      outputParts.push("..");
    }

    outputParts = outputParts.concat(toParts.slice(samePartsLength));

    return outputParts.join("/");
  };

  // webinos <3 webkit
  exports.isParentOf = function (parent, mayBeChild) {
    if (parent === "/" && mayBeChild !== "/") {
      return true;
    }

    if (parent.length > mayBeChild.length || mayBeChild.indexOf(parent) !== 0) {
      return false;
    }

    if (mayBeChild.charAt(parent.length) !== "/") {
      return false;
    }

    return true;
  };

  exports.dirname = function (path) {
    var result = splitPath(path)
      , root = result[0]
      , dir = result[1];

    if (!root && !dir) {
      return ".";
    }

    if (dir) {
      dir = dir.substr(0, dir.length - 1);
    }

    return root + dir;
  };

  exports.basename = function (path, ext) {
    var file = splitPath(path)[2];

    if (ext && file.substr(-1 * ext.length) === ext) {
      file = file.substr(0, file.length - ext.length);
    }

    return file;
  };

  exports.extname = function (path) {
    return splitPath(path)[3];
  };
})(typeof module !== "undefined" ? module.exports : webinos.path);

/*******************************************************************************
 * Code contributed to the webinos project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright 2012 Felix-Johannes Jendrusch, Fraunhofer FOKUS
 ******************************************************************************/

// Mid-term issues:
// [WP-?] Support write/truncate abortion.
// [WP-?] Add extension to mime type mapping.

if (typeof webinos === "undefined") webinos = {};
if (typeof webinos.file === "undefined") webinos.file = {};

(function (exports) {
  exports.Service = Service;

  webinos.util.inherits(Service, WebinosService);
  function Service(object, rpc) {
    Service.parent.call(this, object);

    this.rpc = rpc;
  }

  Service.prototype.requestFileSystem = function (type, size, successCallback,
      errorCallback) {
    var self = this;
    var request = self.rpc.createRPC(self, "requestFileSystem",
        { type : type, size : size });
    self.rpc.executeRPC(request, function (filesystem) {
      successCallback(new FileSystem(self, filesystem.name));
    }, errorCallback);
  };

  Service.prototype.resolveLocalFileSystemURL = function (url, successCallback,
      errorCallback) {
    var self = this;
    var request = self.rpc.createRPC(self, "resolveLocalFileSystemURL",
        { url : url });
    self.rpc.executeRPC(request, function (entry) {
      var filesystem = new FileSystem(self, entry.filesystem.name);
      if (entry.isDirectory) {
        successCallback(new DirectoryEntry(filesystem, entry.fullPath));
      } else {
        successCallback(new FileEntry(filesystem, entry.fullPath));
      }
    }, errorCallback);
  };

  function FileSystem(service, name) {
    this.service = service;

    this.name = name;
    this.root = new DirectoryEntry(this, "/");
  }

  FileSystem.prototype.toJSON = function () {
    var json = { name : this.name };
    return json;
  };

  function Entry(filesystem, fullPath) {
    this.name = webinos.path.basename(fullPath);
    this.fullPath = fullPath;
    this.filesystem = filesystem;

    this.service = filesystem.service;
    this.rpc = filesystem.service.rpc;
  }

  Entry.prototype.isFile = false;
  Entry.prototype.isDirectory = false;

  Entry.prototype.getMetadata = function (successCallback, errorCallback) {
    var request = this.rpc.createRPC(this.service, "getMetadata",
        { entry : this });
    this.rpc.executeRPC(request, function (metadata) {
      successCallback(new Metadata(metadata));
    }, errorCallback);
  };

  Entry.prototype.moveTo = function (parent, newName, successCallback,
      errorCallback) {
    var self = this;
    var request = self.rpc.createRPC(self.service, "moveTo",
        { source : self, parent : parent, newName : newName });
    self.rpc.executeRPC(request, function (entry) {
      if (self.isDirectory) {
        successCallback(new DirectoryEntry(self.filesystem, entry.fullPath));
      } else {
        successCallback(new FileEntry(self.filesystem, entry.fullPath));
      }
    }, errorCallback);
  };

  Entry.prototype.copyTo = function (parent, newName, successCallback,
      errorCallback) {
    var self = this;
    var request = self.rpc.createRPC(self.service, "copyTo",
        { source : self, parent : parent, newName : newName });
    self.rpc.executeRPC(request, function (entry) {
      if (self.isDirectory) {
        successCallback(new DirectoryEntry(self.filesystem, entry.fullPath));
      } else {
        successCallback(new FileEntry(self.filesystem, entry.fullPath));
      }
    }, errorCallback);
  };

  Entry.prototype.toURL = function () {
    return "webinos:" + this.filesystem.name + this.fullPath;
  };

  Entry.prototype.remove = function (successCallback, errorCallback) {
    var request = this.rpc.createRPC(this.service, "remove", { entry : this });
    this.rpc.executeRPC(request, successCallback, errorCallback);
  };

  Entry.prototype.getParent = function (successCallback, errorCallback) {
    var self = this;
    var request = self.rpc.createRPC(self.service, "getParent",
        { entry : self });
    self.rpc.executeRPC(request, function (entry) {
      successCallback(new DirectoryEntry(self.filesystem, entry.fullPath));
    }, errorCallback);
  };

  Entry.prototype.toJSON = function () {
    var json = { name        : this.name
               , fullPath    : this.fullPath
               , filesystem  : this.filesystem
               , isFile      : this.isFile
               , isDirectory : this.isDirectory
               };
    return json;
  };

  function Metadata(metadata) {
    this.modificationTime = new Date(metadata.modificationTime);
    this.size = metadata.size;
  }

  webinos.util.inherits(DirectoryEntry, Entry);
  function DirectoryEntry(filesystem, fullPath) {
    DirectoryEntry.parent.call(this, filesystem, fullPath);
  }

  DirectoryEntry.prototype.isDirectory = true;

  DirectoryEntry.prototype.createReader = function () {
    return new DirectoryReader(this);
  };

  DirectoryEntry.prototype.getFile = function (path, options, successCallback,
      errorCallback) {
    var self = this;
    var request = self.rpc.createRPC(self.service, "getFile",
        { entry : self, path : path, options : options });
    self.rpc.executeRPC(request, function (entry) {
      successCallback(new FileEntry(self.filesystem, entry.fullPath));
    }, errorCallback);
  };

  DirectoryEntry.prototype.getDirectory = function (path, options,
      successCallback, errorCallback) {
    var self = this;
    var request = self.rpc.createRPC(self.service, "getDirectory",
        { entry : self, path : path, options : options });
    self.rpc.executeRPC(request, function (entry) {
      successCallback(new DirectoryEntry(self.filesystem, entry.fullPath));
    }, errorCallback);
  };

  DirectoryEntry.prototype.removeRecursively = function (successCallback,
      errorCallback) {
    var request = this.rpc.createRPC(this.service, "removeRecursively",
        { entry : this });
    this.rpc.executeRPC(request, successCallback, errorCallback);
  };

  function DirectoryReader(entry) {
    this.entry = entry;

    this.service = entry.filesystem.service;
    this.rpc = entry.filesystem.service.rpc;
  }

  DirectoryReader.prototype.readEntries = function (successCallback,
      errorCallback) {
    var self = this;

    function next() {
      if (!self.entries.length) return [];

      var chunk = self.entries.slice(0, 10);
      self.entries.splice(0, 10);
      return chunk;
    }

    if (typeof self.entries === "undefined") {
      var request = self.rpc.createRPC(self.service, "readEntries",
          { entry : self.entry });
      self.rpc.executeRPC(request, function (entries) {
        self.entries = entries.map(function (entry) {
          if (entry.isDirectory) {
            return new DirectoryEntry(self.entry.filesystem, entry.fullPath);
          } else {
            return new FileEntry(self.entry.filesystem, entry.fullPath);
          }
        });

        successCallback(next());
      }, errorCallback);
    } else webinos.util.async(successCallback)(next());
  };

  webinos.util.inherits(FileEntry, Entry);
  function FileEntry(filesystem, fullPath) {
    FileEntry.parent.call(this, filesystem, fullPath);
  }

  FileEntry.prototype.isFile = true;

  FileEntry.prototype.createWriter = function (successCallback, errorCallback) {
    var self = this;
    var request = self.rpc.createRPC(self.service, "getMetadata",
        { entry : self });
    self.rpc.executeRPC(request, function (metadata) {
      var writer = new FileWriter(self);
      writer.length = metadata.size;

      successCallback(writer);
    }, errorCallback);
  };

  FileEntry.prototype.file = function (successCallback, errorCallback) {
    var self = this;
    var request = self.rpc.createRPC(self.service, "getMetadata",
        { entry : self });
    self.rpc.executeRPC(request, function (metadata) {
      var blobParts = [];

      var remote;
      var port = self.rpc.createRPC(self.service, "read",
         { entry : self
         , options : { bufferSize : 16 * 1024, autopause : true }
         });
      port.ref = function (params, successCallback, errorCallback, ref) {
        remote = ref;
      };
      port.open = function () {};
      port.data = function (params) {
        blobParts.push(webinos.util.hex2ab(params.data));

        var message = self.rpc.createRPC(remote, "resume", null);
        self.rpc.executeRPC(message);
      };
      port.end = function () {};
      port.close = function () {
        try {
          var blob = new Blob(blobParts);
          blob.name = self.name;
          blob.lastModifiedDate = new Date(metadata.modificationTime);

          successCallback(blob);
        } finally {
          self.rpc.unregisterCallbackObject(port);
        }
      };
      port.error = function (params) {
        try {
          errorCallback(params.error);
        } finally {
          self.rpc.unregisterCallbackObject(port);
        }
      };

      self.rpc.registerCallbackObject(port);
      self.rpc.executeRPC(port);
    }, errorCallback);
  };

  webinos.util.inherits(FileWriter, webinos.util.EventTarget);
  function FileWriter(entry) {
    FileWriter.parent.call(this);

    this.entry = entry;

    this.readyState = FileWriter.INIT;
    this.length = 0;
    this.position = 0;

    this.service = entry.filesystem.service;
    this.rpc = entry.filesystem.service.rpc;

    this.addEventListener("writestart", function (event) {
      webinos.util.callback(this.onwritestart)(event);
    });
    this.addEventListener("progress", function (event) {
      webinos.util.callback(this.onprogress)(event);
    });
    this.addEventListener("abort", function (event) {
      webinos.util.callback(this.onabort)(event);
    });
    this.addEventListener("write", function (event) {
      webinos.util.callback(this.onwrite)(event);
    });
    this.addEventListener("writeend", function (event) {
      webinos.util.callback(this.onwriteend)(event);
    });
    this.addEventListener("error", function (event) {
      webinos.util.callback(this.onerror)(event);
    });
  }

  FileWriter.INIT = 0;
  FileWriter.WRITING = 1;
  FileWriter.DONE = 2;

  function BlobIterator(blob) {
    this.blob = blob;
    this.position = 0;
  }

  BlobIterator.prototype.hasNext = function () {
    return this.position < this.blob.size;
  };

  BlobIterator.prototype.next = function () {
    if (!this.hasNext()) {
      throw new webinos.util.CustomError("InvalidStateError");
    }

    var end = Math.min(this.position + 16 * 1024, this.blob.size);
    var chunk;
    if (this.blob.slice) {
      chunk = this.blob.slice(this.position, end);
    } else if (this.blob.webkitSlice) {
      chunk = this.blob.webkitSlice(this.position, end);
    } else if (this.blob.mozSlice) {
      chunk = this.blob.mozSlice(this.position, end);
    }
    this.position = end;
    return chunk;
  };

  FileWriter.prototype.write = function (data) {
    var self = this;

    if (self.readyState === FileWriter.WRITING) {
      throw new webinos.util.CustomError("InvalidStateError");
    }

    self.readyState = FileWriter.WRITING;
    self.dispatchEvent(new webinos.util.ProgressEvent("writestart"));

    var reader = new FileReader();
    // reader.onloadstart = function (event) {};
    // reader.onprogress = function (event) {};
    // reader.onabort = function (event) {};
    reader.onload = function () {
      var message = self.rpc.createRPC(remote, "write",
          { data : webinos.util.ab2hex(reader.result) });
      self.rpc.executeRPC(message, function (bytesWritten) {
        self.position += bytesWritten;
        self.length = Math.max(self.position, self.length);

        self.dispatchEvent(new webinos.util.ProgressEvent("progress"));
      });
    };
    // reader.onloadend = function (event) {};
    reader.onerror = function () {
      var message = self.rpc.createRPC(remote, "destroy");
      self.rpc.executeRPC(message, function () {
        try {
          self.error = reader.error;
          self.readyState = FileWriter.DONE;
          self.dispatchEvent(new webinos.util.ProgressEvent("error"));
          self.dispatchEvent(new webinos.util.ProgressEvent("writeend"));
        } finally {
          self.rpc.unregisterCallbackObject(port);
        }
      });
    };

    var iterator = new BlobIterator(data);
    function iterate() {
      if (iterator.hasNext()) {
        reader.readAsArrayBuffer(iterator.next());
      } else {
        var message = self.rpc.createRPC(remote, "end");
        self.rpc.executeRPC(message, function () {
          try {
            self.readyState = FileWriter.DONE;
            self.dispatchEvent(new webinos.util.ProgressEvent("write"));
            self.dispatchEvent(new webinos.util.ProgressEvent("writeend"));
          } finally {
            self.rpc.unregisterCallbackObject(port);
          }
        });
      }
    }

    var remote;
    var port = self.rpc.createRPC(self.service, "write",
       { entry : self.entry, options : { start : self.position } });
    port.ref = function (params, successCallback, errorCallback, ref) {
      remote = ref;
    };
    port.open = function () {
      iterate();
    };
    port.drain = function () {
      iterate();
    };
    port.close = function () {};
    port.error = function (params) {
      try {
        self.error = params.error;
        self.readyState = FileWriter.DONE;
        self.dispatchEvent(new webinos.util.ProgressEvent("error"));
        self.dispatchEvent(new webinos.util.ProgressEvent("writeend"));
      } finally {
        reader.abort();

        self.rpc.unregisterCallbackObject(port);
      }
    };

    self.rpc.registerCallbackObject(port);
    self.rpc.executeRPC(port);
  };

  FileWriter.prototype.seek = function (offset) {
    if (this.readyState === FileWriter.WRITING) {
      throw new webinos.util.CustomError("InvalidStateError");
    }

    this.position = offset;

    if (this.position > this.length) {
      this.position = this.length;
    }

    if (this.position < 0) {
      this.position = this.position + this.length;
    }

    if (this.position < 0) {
      this.position = 0;
    }
  };

  FileWriter.prototype.truncate = function (size) {
    var self = this;

    if (self.readyState === FileWriter.WRITING) {
      throw new webinos.util.CustomError("InvalidStateError");
    }

    self.readyState = FileWriter.WRITING;
    self.dispatchEvent(new webinos.util.ProgressEvent("writestart"));

    var request = self.rpc.createRPC(self.service, "truncate",
        { entry : self.entry, size : size });
    self.rpc.executeRPC(request, function () {
      self.length = size;
      self.position = Math.min(self.position, size);

      self.readyState = FileWriter.DONE;
      self.dispatchEvent(new webinos.util.ProgressEvent("write"));
      self.dispatchEvent(new webinos.util.ProgressEvent("writeend"));
    }, function (error) {
      self.error = error;
      self.readyState = FileWriter.DONE;
      self.dispatchEvent(new webinos.util.ProgressEvent("error"));
      self.dispatchEvent(new webinos.util.ProgressEvent("writeend"));
    });
  };

  // FileWriter.prototype.abort = function () {
  //   if (this.readyState === FileWriter.DONE ||
  //       this.readyState === FileWriter.INIT) return;

  //   this.readyState = FileWriter.DONE;

  //   // If there are any tasks from the object's FileSaver task source in one of
  //   // the task queues, then remove those tasks.
  //   // Terminate the write algorithm being processed.

  //   this.error = new webinos.util.CustomError("AbortError");
  //   this.dispatchEvent(new webinos.util.ProgressEvent("abort"));
  //   this.dispatchEvent(new webinos.util.ProgressEvent("writeend"));
  // };
})(webinos.file);

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
* Copyright 2011 Andre Paul, Fraunhofer FOKUS
******************************************************************************/
(function() {

	/**
	 * ...
	 * @constructor
	 * @param obj Object containing displayName, api, etc.
	 */
	WebNotificationModule = function(obj) {
		this.base = WebinosService;
		this.base(obj);

	};
	
	WebNotificationModule.prototype = new WebinosService;
	
	/**
	 * To bind the service.
	 * @param bindCB BindCallback object.
	 */
	WebNotificationModule.prototype.bindService = function (bindCB, serviceId) {
		// actually there should be an auth check here or whatever, but we just always bind
		var that = this;
		this.WebNotification = function (title, options){
			console.log(that.id);
			var rpc = webinos.rpcHandler.createRPC(that, "notify", [title, options]);
			webinos.rpcHandler.executeRPC(rpc,
					function (params){
						//on success
					 	if(params == 'onClick' && that.onClick){
					 		that.onClick(params);
					 	}
					 	else if(params == 'onShow' && that.onShow){
					 		that.onShow(params);
					 	}
					 	else if(params == 'onClose' && that.onClose){
					 		that.onClose(params);
					 	}
					},
					function (error){
						if(that.onError){
					 		that.onError(error);
					 	}
					}
			);
		}
		if (typeof bindCB.onBind === 'function') {
			bindCB.onBind(this);
		};
	}
	
	
}());
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
 * Copyright 2013 John Lyle, University of Oxford
 ******************************************************************************/
 (function () {
    /**
     * Webinos Personal Zone Notifications service constructor (client side).
     * @constructor
     * @param obj Object containing displayName, api, etc.
     */
    ZoneNotificationModule = function (obj) {
        this.base = WebinosService;
        this.base(obj);
    };

    ZoneNotificationModule.prototype = new WebinosService;

    /**
     * To bind the service.
     * @param bindCB BindCallback object.
     */
    ZoneNotificationModule.prototype.bindService = function (bindCB, serviceId) {
        // actually there should be an auth check here or whatever, but we just always bind
        this.respond = respond;
        this.listenAttr = {};
        this.subscribe = subscribe.bind(this);
        if (typeof bindCB.onBind === 'function') {
            bindCB.onBind(this);
        };
    }

    /**
     * @param attr Some attribute.
     * @param successCB Success callback.
     * @param errorCB Error callback. 
     */
    function respond(id, response, successCB, errorCB) {
        console.log(this.id);
        var rpc = webinos.rpcHandler.createRPC(this, "respond", {
            "id": id,
            "response": response
        });
        webinos.rpcHandler.executeRPC(rpc,

        function (params) {
            successCB(params);
        },

        function (error) {
            errorCB(error);
        });
    }

    /**
     * @param listener Listener function that gets called.
     * @param options Optional options.
     */
    function subscribe(listener, options) {
        var rpc = webinos.rpcHandler.createRPC(this, "listenAttr.subscribe", [options]);

        console.log("Subscribe listener: " + JSON.stringify(listener) + " with option: " + JSON.stringify(options));

        rpc.onNotification = function (obj) {
            // we were called back, now invoke the given listener
            listener.onEvent(obj);
            //webinos.rpcHandler.unregisterCallbackObject(rpc);
        };

        rpc.onCancel = function (obj) {
            // we were called back, now invoke the given listener
            listener.onCancel(obj);
            //webinos.rpcHandler.unregisterCallbackObject(rpc);
        };

        webinos.rpcHandler.registerCallbackObject(rpc);
        webinos.rpcHandler.executeRPC(rpc);
    }

}());

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
* Copyright 2012 Andre Paul, Fraunhofer FOKUS
******************************************************************************/
(function() {

	
	
	/**
	 * Webinos Actuator service constructor (client side).
	 * @constructor
	 * @param obj Object containing displayName, api, etc.
	 */
	ActuatorModule = function(obj) {
		this.base = WebinosService;
		this.base(obj);
	};
	
	ActuatorModule.prototype = new WebinosService();

	/**
	 * To bind the service.
	 * @param bindCB BindCallback object.
	 */
	ActuatorModule.prototype.bind = function(bindCB) {
			var self = this;
			var rpc = webinos.rpcHandler.createRPC(this, "getStaticData", []);
			webinos.rpcHandler.executeRPC(rpc,
				function (result){
			
					self.range = result.range;
					self.unit = result.unit;
					self.vendor = result.vendor;
					self.version = result.version;
					if (typeof bindCB.onBind === 'function') {
						bindCB.onBind(self);
					}
				},
				function (error){
					
				}
			);
    };
	
	/**
	 * Launches an application.
	 * @param successCallback Success callback.
	 * @param errorCallback Error callback.
	 * @param applicationID Application ID to be launched.
	 * @param params Parameters for starting the application.
	 */
	ActuatorModule.prototype.setValue = function (value, successCB, errorCallback){
		//returns pendingOp
		
		var rpc = webinos.rpcHandler.createRPC(this, "setValue", value);
		webinos.rpcHandler.executeRPC(rpc,
				function (event){
					successCB(event);
				},
				function (domerror){
					errorCallback(domerror);
				}
		);

	};
    	
}());
//implementation at client side, includes RPC massage invokation
/**
 * Interface for TV control and management.
 * 
 * 
 * The interface provides means to acquire a list of tv sources, channels and
 * their streams.
 * 
 * The TV channel streams can be displayed in HTMLVideoElement object
 * (http://dev.w3.org/html5/spec/video.html). Alternatively the API provides
 * means to control channel management of the native hardware TV, by allowing to
 * set a channel or watch for channel changes that are invoked otherwise.
 * 
 * The tv object is made available under the webinos namespace, i.e. webinos.tv.
 * 
 */
(function() {

	var TVDisplayManager, TVDisplaySuccessCB, TVTunerManager, TVSuccessCB, TVErrorCB, TVError, TVSource, Channel, ChannelChangeEvent;
	var that = this;	
	
	/**
	 * Interface to manage what's currently displayed on TV screen.
	 * 
	 * 
	 * This interface is useful when an app doesn't want to show the broadcast
	 * itself, but let the TV natively handle playback, i.e. not in a web
	 * context. Useful to build an control interface that allows channel
	 * switching.
	 * 
	 */
	TVDisplayManager = function(){};

	/**
	 * Switches the channel natively on the TV (same as when a hardware remote
	 * control would be used).
	 * 
	 */
	TVDisplayManager.prototype.setChannel = function(channel, successCallback,
			errorCallback) {
		var rpc = webinos.rpcHandler.createRPC(that, "display.setChannel", arguments);
		webinos.rpcHandler.executeRPC(rpc, function(params) {
			successCallback(params);
		}, function(error) {
			if(errorCallback) errorCallback();
		});
		return;
	};
	
	//TODO: only internal temporarily use!
	//This is only to bridge the missing Media Capture API and EPG functionality 
	TVDisplayManager.prototype.getEPGPIC = function(channel, successCallback,
			errorCallback) {
		var rpc = webinos.rpcHandler.createRPC(that, "display.getEPGPIC", arguments);
		webinos.rpcHandler.executeRPC(rpc, function(params) {
			successCallback(params);
		}, function(error) {
			if(errorCallback) errorCallback();
		});
		return;
	};

	/**
	 * Callback function when current channel changed successfully.
	 * 
	 */
	TVDisplaySuccessCB = function() {
		// TODO implement constructor logic if needed!

	};
	TVDisplaySuccessCB.prototype.onSuccess = function(channel) {
		// TODO: Add your application logic here!

		return;
	};

	// TODO: does not conform API Spec, but needs to be added!
	TVDisplayManager.prototype.addEventListener = function(eventname,
			channelchangeeventhandler, useCapture) {
		var rpc = webinos.rpcHandler.createRPC(that, "display.addEventListener",
				arguments);

		rpc.onchannelchangeeventhandler = function(params,
				successCallback, errorCallback) {

			channelchangeeventhandler(params);

		};

		// register the object as being remotely accessible
		webinos.rpcHandler.registerCallbackObject(rpc);

		webinos.rpcHandler.executeRPC(rpc);
		return;
	};

	/**
	 * Get a list of all available TV tuners.
	 * 
	 */
	TVTunerManager = function(){};

	/**
	 * Get a list of all available TV tuners.
	 * 
	 */
	TVTunerManager.prototype.getTVSources = function(successCallback,
			errorCallback) {
		var rpc = webinos.rpcHandler.createRPC(that, "tuner.getTVSources", arguments);
		webinos.rpcHandler.executeRPC(rpc, function(params) {
			successCallback(params);
		}, function(error) {
		});
		return;
	};

	/**
	 * Callback for found TV tuners.
	 * 
	 */
	TVSuccessCB = function() {
		// TODO implement constructor logic if needed!

	};

	/**
	 * Callback that is called with the found TV sources.
	 * 
	 */
	TVSuccessCB.prototype.onSuccess = function(sources) {
		// TODO: Add your application logic here!

		return;
	};

	/**
	 * Error callback for errors when trying to get TV tuners.
	 * 
	 */
	TVErrorCB = function() {
		// TODO implement constructor logic if needed!

	};

	/**
	 * Callback that is called when an error occures while getting TV sources
	 * 
	 */
	TVErrorCB.prototype.onError = function(error) {
		// TODO: Add your application logic here!

		return;
	};

	/**
	 * Error codes.
	 * 
	 */
	TVError = function() {
		// TODO implement constructor logic if needed!

		// TODO initialize attributes

		this.code = Number;
	};

	/**
	 * An unknown error.
	 * 
	 */
	TVError.prototype.UNKNOWN_ERROR = 0;

	/**
	 * Invalid input channel.
	 * 
	 */
	TVError.prototype.ILLEGAL_CHANNEL_ERROR = 1;

	/**
	 * Code.
	 * 
	 */
	TVError.prototype.code = Number;

	/**
	 * TV source: a list of channels with a name.
	 * 
	 */
	TVSource = function() {
		// TODO implement constructor logic if needed!

		// TODO initialize attributes

		this.name = String;
		this.channelList = Number;
	};

	/**
	 * The name of the source.
	 * 
	 * 
	 * The name should describe the kind of tuner this source represents, e.g.
	 * DVB-T, DVB-C.
	 * 
	 */
	TVSource.prototype.name = String;

	/**
	 * List of channels for this source.
	 * 
	 */
	TVSource.prototype.channelList = Number;

	/**
	 * The Channel Interface
	 * 
	 * 
	 * Channel objects provide access to the video stream.
	 * 
	 */
	Channel = function() {
		this.channelType = Number;
		this.name = String;
		this.longName = String;
		this.stream = "new Stream()";
		this.tvsource = new TVSource();
	};

	/**
	 * Indicates a TV channel.
	 * 
	 */
	Channel.prototype.TYPE_TV = 0;

	/**
	 * Indicates a radio channel.
	 * 
	 */
	Channel.prototype.TYPE_RADIO = 1;

	/**
	 * The type of channel.
	 * 
	 * 
	 * Type of channel is defined by one of the TYPE_* constants defined above.
	 * 
	 */
	Channel.prototype.channelType = Number;

	/**
	 * The name of the channel.
	 * 
	 * 
	 * The name of the channel will typically be the call sign of the station.
	 * 
	 */
	Channel.prototype.name = String;

	/**
	 * The long name of the channel.
	 * 
	 * 
	 * The long name of the channel if transmitted. Can be undefined if not
	 * available.
	 * 
	 */
	Channel.prototype.longName = String;

	/**
	 * The video stream.
	 * 
	 * 
	 * This stream is a represents a valid source for a HTMLVideoElement.
	 * 
	 */
	Channel.prototype.stream = null;

	/**
	 * The source this channels belongs too.
	 * 
	 */
	Channel.prototype.tvsource = null;

	/**
	 * Event that fires when the channel is changed.
	 * 
	 * 
	 * Changing channels could also be invoked by other parties, e.g. a hardware
	 * remote control. A ChannelChange event will be fire in these cases which
	 * provides the channel that was switched to.
	 * 
	 */
	ChannelChangeEvent = function() {
		// TODO implement constructor logic if needed!

		// TODO initialize attributes

		this.channel = new Channel();
	};

	/**
	 * The new channel.
	 * 
	 */
	ChannelChangeEvent.prototype.channel = null;

	/**
	 * Initializes a new channel change event.
	 * 
	 */
	ChannelChangeEvent.prototype.initChannelChangeEvent = function(type,
			bubbles, cancelable, channel) {
		// TODO: Add your application logic here!

		return;
	};
	
	/**
	 * Access to tuner and display managers.
	 * 
	 */
	TVManager = function(obj) {
		this.base = WebinosService;
		this.base(obj);
		that = this;
		
		this.display = new TVDisplayManager(obj);
		this.tuner = new TVTunerManager(obj);
	};
	TVManager.prototype = new WebinosService;


}());

(function() {

	oAuthModule = function(obj) {
		this.base = WebinosService;
		this.base(obj);
	};
	
	oAuthModule.prototype = new WebinosService;
	
	oAuthModule.prototype.init = function(requestTokenUrl,consumer_key,consumer_secret,callbackUrl, successCB, errorCB){
			var params = [];
			params.push(requestTokenUrl);
			params.push(consumer_key);
			params.push(consumer_secret);
			params.push(callbackUrl);
			var rpc = webinos.rpcHandler.createRPC(this, "init", [params]);
			webinos.rpcHandler.executeRPC(rpc,
				function (pars){
					if (successCB) successCB(pars);
				},
				function (error){
					if (errorCB) errorCB(error);
				}
			);
		};
		
	oAuthModule.prototype.get = function(requestUrl,access_token,access_token_secret, successCB, errorCB){
			var params = [];
			params.push(requestUrl);
			params.push(access_token);
			params.push(access_token_secret);
			var rpc = webinos.rpcHandler.createRPC(this, "get", params);
			webinos.rpcHandler.executeRPC(rpc,
				function (pars){
					if (successCB) successCB(pars);
				},
				function (error){
					if (errorCB) errorCB(error);
				}
			);
		};
		
	oAuthModule.prototype.post = function(requestUrl,access_token,access_token_secret, post_body, post_content_type, successCB, errorCB){
			var params = [];
			params.push(requestUrl);
			params.push(access_token);
			params.push(access_token_secret);
			params.push(post_body);
			params.push(post_content_type);
			var rpc = webinos.rpcHandler.createRPC(this, "post", params);
			webinos.rpcHandler.executeRPC(rpc,
				function (pars){
					if (successCB) successCB(pars);
				},
				function (error){
					if (errorCB) errorCB(error);
				}
			);
		};

}());
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
(function() {

	/**
	 * Webinos Get42 service constructor (client side).
	 * @constructor
	 * @param obj Object containing displayName, api, etc.
	 */
	TestModule = function(obj) {
		this.base = WebinosService;
		this.base(obj);
		
		this._testAttr = "HelloWorld";
		this.__defineGetter__("testAttr", function (){
			return this._testAttr + " Success";
		});
	};
	
	TestModule.prototype = new WebinosService;
	
	/**
	 * To bind the service.
	 * @param bindCB BindCallback object.
	 */
	TestModule.prototype.bindService = function (bindCB, serviceId) {
		// actually there should be an auth check here or whatever, but we just always bind
		this.get42 = get42;
		this.listenAttr = {};
		this.listenerFor42 = listenerFor42.bind(this);
		
		if (typeof bindCB.onBind === 'function') {
			bindCB.onBind(this);
		};
	}
	
	/**
	 * Get 42.
	 * An example function which does a remote procedure call to retrieve a number.
	 * @param attr Some attribute.
	 * @param successCB Success callback.
	 * @param errorCB Error callback. 
	 */
	function get42(attr, successCB, errorCB) {
		console.log(this.id);
		var rpc = webinos.rpcHandler.createRPC(this, "get42", [attr]);
		webinos.rpcHandler.executeRPC(rpc,
				function (params){
					successCB(params);
				},
				function (error){
					errorCB(error);
				}
		);
	}
	
	/**
	 * Listen for 42.
	 * An exmaple function to register a listener which is then called more than
	 * once via RPC from the server side.
	 * @param listener Listener function that gets called.
	 * @param options Optional options.
	 */
	function listenerFor42(listener, options) {
		var rpc = webinos.rpcHandler.createRPC(this, "listenAttr.listenFor42", [options]);

		// add one listener, could add more later
		rpc.onEvent = function(obj) {
			// we were called back, now invoke the given listener
			listener(obj);
			webinos.rpcHandler.unregisterCallbackObject(rpc);
		};

		webinos.rpcHandler.registerCallbackObject(rpc);
		webinos.rpcHandler.executeRPC(rpc);
	}
	
}());
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
(function() {

/**
 * Webinos Geolocation service constructor (client side).
 * @constructor
 * @param obj Object containing displayName, api, etc.
 */
WebinosGeolocation = function (obj) {
	this.base = WebinosService;
	this.base(obj);
};

WebinosGeolocation.prototype = new WebinosService;

/**
 * To bind the service.
 * @param bindCB BindCallback object.
 */
WebinosGeolocation.prototype.bindService = function (bindCB, serviceId) {
	// actually there should be an auth check here or whatever, but we just always bind
	this.getCurrentPosition = getCurrentPosition;
	this.watchPosition = watchPosition;
	this.clearWatch = clearWatch;
	
	if (typeof bindCB.onBind === 'function') {
		bindCB.onBind(this);
	};
}

/**
 * Retrieve the current position.
 * @param positionCB Success callback.
 * @param positionErrorCB Error callback.
 * @param positionOptions Optional options.
 */
function getCurrentPosition(positionCB, positionErrorCB, positionOptions) { 
	var rpc = webinos.rpcHandler.createRPC(this, "getCurrentPosition", positionOptions); // RPC service name, function, position options
	webinos.rpcHandler.executeRPC(rpc, function (position) {
		positionCB(position);
	},
	function (error) {
		positionErrorCB(error);
	});
};

var watchIdTable = {};

/**
 * Register a listener for position updates.
 * @param positionCB Callback for position updates.
 * @param positionErrorCB Error callback.
 * @param positionOptions Optional options.
 * @returns Registered listener id.
 */
function watchPosition(positionCB, positionErrorCB, positionOptions) {
	var rpc = webinos.rpcHandler.createRPC(this, "watchPosition", [positionOptions]);

	rpc.onEvent = function (position) {
		positionCB(position);
	};

	rpc.onError = function (err) {
		positionErrorCB(err);
	};

	webinos.rpcHandler.registerCallbackObject(rpc);
	webinos.rpcHandler.executeRPC(rpc);

	var watchId = parseInt(rpc.id, 16);
	watchIdTable[watchId] = rpc.id;

	return watchId;
};

/**
 * Clear a listener.
 * @param watchId The id as returned by watchPosition to clear.
 */
function clearWatch(watchId) {
	var _watchId = watchIdTable[watchId];
	if (!_watchId) return;

	var rpc = webinos.rpcHandler.createRPC(this, "clearWatch", [_watchId]);
	webinos.rpcHandler.executeRPC(rpc);

	delete watchIdTable[watchId];
	webinos.rpcHandler.unregisterCallbackObject({api:_watchId});
};

})();

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
(function() {

    /**
     * Webinos Sensor service constructor (client side).
     * @constructor
     * @param obj Object containing displayName, api, etc.
     */
    Sensor = function(obj) {
       this.base = WebinosService;
       this.base(obj);
    };
    Sensor.prototype = new WebinosService;
    
    /**
     * To bind the service.
     * @param bindCB BindCallback object.
     */
    Sensor.prototype.bind = function(bindCB) {
             
        var self = this;
        
        var rpc = webinos.rpcHandler.createRPC(this, "getStaticData", []);
        
        webinos.rpcHandler.executeRPC(rpc,
            function (result){
            
                self.maximumRange = result.maximumRange;
                self.minDelay = result.minDelay;
                self.power = result.power;
                self.resolution = result.resolution;
                self.vendor = result.vendor;  
                self.version = result.version; 
            
                if (typeof bindCB.onBind === 'function') {
                    bindCB.onBind(this);
                };
            },
            function (error){
                
            }
        );

    };
    
    Sensor.prototype.configureSensor = function(params, successHandler, errorHandler){
        var rpc = webinos.rpcHandler.createRPC(this, 'configureSensor', params);
        webinos.rpcHandler.executeRPC(rpc, function () {
                successHandler();
            },
            function (error) {
                errorHandler(error);
            });
    };

    Sensor.prototype.addEventListener = function(eventType, eventHandler, capture) {
        var rpc = webinos.rpcHandler.createRPC(this, 'addEventListener', eventType);
        rpc.onEvent = function (sensorEvent) {
            eventHandler(sensorEvent);
        };
        webinos.rpcHandler.registerCallbackObject(rpc);
        webinos.rpcHandler.executeRPC(rpc);
    };


    Sensor.prototype.removeEventListener = function(eventType, eventHandler, capture) {
        var rpc = webinos.rpcHandler.createRPC(this, 'removeEventListener', eventType);
        webinos.rpcHandler.executeRPC(rpc);
    };

}());

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
* Copyright 2012 André Paul, Fraunhofer FOKUS
******************************************************************************/
(function() {

	// Mapping of local listenerId to remote listenerId
	var registeredListeners = {};

	// Mapping of listenerId to RPC callback obj
	var registeredRPCCallbacks = {};

	var eventService = null;

	/**
	 * Webinos Event service constructor (client side).
	 * @constructor
	 * @param obj Object containing displayName, api, etc.
	 */
	EventsModule = function(obj) {
		this.base = WebinosService;
		this.base(obj);
		eventService = this;
		this.idCount = 0;
		//this.myAppID = "TestApp" + webinos.messageHandler.getOwnId();

		//TODO, this is the actuall messaging/session app id but should be replaced with the Apps unique ID (config.xml)
		this.myAppID = webinos.messageHandler.getOwnId();
		console.log("MyAppID: " + this.myAppID);
	};

	EventsModule.prototype = new WebinosService;

	/**
	 * To bind the service.
	 * @param bindCB BindCallback object.
	 */
	EventsModule.prototype.bind = function(bindCB) {

		if (typeof bindCB.onBind === 'function') {
			bindCB.onBind(this);
		};
		
	};

	/**
	 * Creates a webinos Event.
	 * @param type Event type identifier.
	 * @param addressing References to the sending entity on the behalf of which the application wants to create the event and to the event recipients.
	 * @param payload Event type-specific data or null (undefined is considered as equivalent to null).
	 * @param inResponseTo Event that this event is a response to (undefined is considered as equivalent to null).
	 * @param withTimeStamp Whether to set the generation timestamp (undefined is considered as equivalent to false).
	 * @param expiryTimeStamp Moment in time past which the event is no more valid or meaningful (undefined is considered as equivalent to null).
	 * @param addressingSensitive Whether the addressing information is part of the informative content of the event (undefined is considered as equivalent to false).
	 */
	EventsModule.prototype.createWebinosEvent = function (type, addressing, payload, inResponseTo, withTimeStamp, expiryTimeStamp, addressingSensitive){

		var anEvent = new WebinosEvent();
		anEvent.type = type;
		anEvent.addressing = addressing;
		anEvent.payload = payload;
		anEvent.inResponseTo = inResponseTo;
		anEvent.timeStamp = new Date().getTime();
		anEvent.expiryTimeStamp = expiryTimeStamp;
		anEvent.addressingSensitive = addressingSensitive;


		//  raises(WebinosEventException);
		//	returns WebinosEvent
		return anEvent;
	};

	/**
	 * Registers an event listener.
	 * @param listener The event listener.
	 * @param type Specific event type or null for any type (undefined is considered as null).
	 * @param source Specific event source or null for any source (undefined is considered as null).
	 * @param destination Specific event recipient (whether primary or not) or null for any destination (undefined is considered as null).
	 * @returns Listener identifier.
	 */
	EventsModule.prototype.addWebinosEventListener = function(listener, type, source, destination) {

		if (this.idCount === Number.MAX_VALUE) this.idCount = 0;
		this.idCount++;

		var listenerId = this.myAppID + ":" + this.idCount;

		var reqParams = {
			type: type,
			source: source,
			destination: destination
		};
		if (!source) reqParams.source = this.myAppID;

		var rpc = webinos.rpcHandler.createRPC(this, "addWebinosEventListener",  reqParams);

		rpc.handleEvent = function(params, scb, ecb) {
			console.log("Received a new WebinosEvent");
			listener(params.webinosevent);
			scb();
		};

		webinos.rpcHandler.registerCallbackObject(rpc);

		// store RPC callback obj to unregister it when removing event listener
		registeredRPCCallbacks[listenerId] = rpc;

		webinos.rpcHandler.executeRPC(rpc,
			function(remoteId) {
				console.log("New WebinosEvent listener registered. Mapping remote ID", remoteId, " localID ", listenerId);

				registeredListeners[listenerId] = remoteId;
			},
			function(error) {
				console.log("Error while registering new WebinosEvent listener");
			}
		);

		// raises(WebinosEventException);
		return listenerId;
	};

	/**
     * Unregisters an event listener.
     * @param listenerId Listener identifier as returned by addWebinosEventListener().
     */
	EventsModule.prototype.removeWebinosEventListener = function(listenerId) {

		if (!listenerId || typeof listenerId !== "string") {
			throw new WebinosEventException(WebinosEventException.INVALID_ARGUMENT_ERROR, "listenerId must be string type");
		}

		var rpc = webinos.rpcHandler.createRPC(this, "removeWebinosEventListener",  registeredListeners[listenerId]);
		webinos.rpcHandler.executeRPC(rpc);

		// unregister RPC callback obj
		webinos.rpcHandler.unregisterCallbackObject(registeredRPCCallbacks[listenerId]);
		registeredRPCCallbacks[listenerId] = undefined;
		registeredListeners[listenerId] = undefined;

		// returns void
	};

	/**
	 * Webinos event exception constructor.
	 * @constructor
	 * @param code Error code.
	 * @param message Descriptive error message.
	 */
	WebinosEventException = function(code, message) {
		this.code = code;
		this.message = message;
	};
	// constants
	WebinosEventException.__defineGetter__("INVALID_ARGUMENT_ERROR",  function() {return 1});
	WebinosEventException.__defineGetter__("PERMISSION_DENIED_ERROR", function() {return 2});

	/**
	 * Webinos Event constructor.
	 * @constructor
	 */
	WebinosEvent = function() {
		this.id =  Math.floor(Math.random()*1001);  //DOMString
		this.type = null;					//DOMString
		this.addressing = {};  			//WebinosEventAddressing
		this.addressing.source = eventService.myAppID;
		this.inResponseTo = null;			//WebinosEvent
		this.timeStamp = null;				//DOMTimeStamp
		this.expiryTimeStamp = null;		//DOMTimeStamp
		this.addressingSensitive = null;	//bool
		this.forwarding = null;			//WebinosEventAddressing
		this.forwardingTimeStamp = null;	//DOMTimeStamp
		this.payload = null;				//DOMString
	};

	/**
	 * Sends an event.
	 * @param callbacks Set of callbacks to monitor sending status (null and undefined are considered as equivalent to a WebinosEventCallbacks object with all attributes set to null).
	 * @param referenceTimeout Moment in time until which the Webinos runtime SHALL ensure that the WebinosEvent object being sent is not garbage collected for the purpose of receiving events in response to the event being sent (null, undefined and values up to the current date/time mean that no special action is taken by the runtime in this regard).
	 * @param sync If false or undefined, the function is non-blocking, otherwise if true it will block.
	 */
	WebinosEvent.prototype.dispatchWebinosEvent = function(callbacks, referenceTimeout, sync) {

		var params = {
			webinosevent: {
				id: this.id,
				type: this.type,
				addressing: this.addressing,
				inResponseTo: this.inResponseTo,
				timeStamp: this.timeStamp,
				expiryTimeStamp: this.expiryTimeStamp,
				addressingSensitive: this.addressingSensitive,
				forwarding: this.forwarding,
				forwardingTimeStamp: this.forwardingTimeStamp,
				payload: this.payload
			},
			referenceTimeout: referenceTimeout,
			sync: sync
		};

		if (!params.webinosevent.addressing) {
			params.webinosevent.addressing = {};
		}
		params.webinosevent.addressing.source = {};
		params.webinosevent.addressing.source.id = eventService.myAppID;

		// check that callbacks has the right type
		if (callbacks) {
			if (typeof callbacks !== "object") {
				throw new WebinosEventException(WebinosEventException.INVALID_ARGUMENT_ERROR, "callbacks must be of type WebinosEventCallbacks");
			}
			var cbNames = ["onSending", "onCaching", "onDelivery", "onTimeout", "onError"];
			for (var cbName in cbNames) {
				var cb = callbacks[cbName];
				if (cb && typeof cb !== "function") {
					throw new WebinosEventException(WebinosEventException.INVALID_ARGUMENT_ERROR, "cb is not a function");
				}
			}
			params.withCallbacks = true;
		}

		var rpc = webinos.rpcHandler.createRPC(eventService, "WebinosEvent.dispatchWebinosEvent", params);

		if (callbacks) {

			console.log("Registering delivery callback");

			rpc.onSending = function (params) {
				// params.event, params.recipient
				if (callbacks.onSending) {
					callbacks.onSending(params.event, params.recipient);
				}
			};
			rpc.onCaching = function (params) {
				// params.event
				if (callbacks.onCaching) {
					callbacks.onCaching(params.event);
				}
			};
			rpc.onDelivery = function (params) {
				// params.event, params.recipient
				if (callbacks.onDelivery) {
					callbacks.onDelivery(params.event, params.recipient);
				}
				webinos.rpcHandler.unregisterCallbackObject(rpc);
			};
			rpc.onTimeout = function (params) {
				// params.event, params.recipient
				if (callbacks.onTimeout) {
					callbacks.onTimeout(params.event, params.recipient);
				}
				webinos.rpcHandler.unregisterCallbackObject(rpc);
			};
			rpc.onError = function (params) {
				// params.event, params.recipient, params.error
				if (callbacks.onError) {
					callbacks.onError(params.event, params.recipient, params.error);
				}
				webinos.rpcHandler.unregisterCallbackObject(rpc);
			};

			webinos.rpcHandler.registerCallbackObject(rpc);
		}

		webinos.rpcHandler.executeRPC(rpc);

		//raises(WebinosEventException);
		//returns void
    };

	/**
	 * Forwards an event.
	 * [not yet implemented]
	 */
	WebinosEvent.prototype.forwardWebinosEvent = function(forwarding, withTimeStamp, callbacks, referenceTimeout, sync){

    	//returns void
    	//raises(WebinosEventException);
    };

}());

/*******************************************************************************
 * Code contributed to the Webinos project.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright 2012 Fabian Walraven, TNO
 ******************************************************************************/

(function() {
  App2AppModule = function (params) {

    if(typeof App2AppModule.prototype._singletonInstance !== 'undefined') {
      return App2AppModule.prototype._singletonInstance;
    }

    App2AppModule.prototype._singletonInstance = this;

    this.base = WebinosService;
    this.base(params);

    this.peerId = this.id;
    module = this;

    this.createChannel = createChannel;
    this.searchForChannels = searchForChannels;

    console.log("Creating app2app instance with id "+ this.id);
    registerPeer(
      function (success) {
        console.log("Bind succeeded: registered peer.");
      },
      function (error) {
        console.log("Bind failed: could not register peer: " + error.message);
      }
    );

  };

  App2AppModule.prototype = new WebinosService();

  App2AppModule.prototype.bindService = function (bindCallback) {
    if (typeof bindCallback.onBind === 'function') {
      bindCallback.onBind(this);
    }
  };

  App2AppModule.prototype.unbindService = function (successCallback, errorCallback) {
    var params = {};
    params.peerId = module.peerId;

    var rpc = webinos.rpcHandler.createRPC(module, "unregisterPeer", params);

    webinos.rpcHandler.executeRPC(rpc,
      function (success) {
        App2AppModule.prototype._singletonInstance = undefined;
        successCallback(success);
      },
      function (error) {
        errorCallback(error);
      }
    );
  };

  /* Administration */

  var CHANNEL_NAMESPACE_REGEXP = /^urn:[a-z0-9][a-z0-9\-]{0,31}:[a-z0-9()+,\-.:=@;$_!*'%\/?#]+$/i;
  var CHANNEL_SEARCH_TIMEOUT = 5000;

  var MODE_SEND_RECEIVE = "send-receive";
  var MODE_RECEIVE_ONLY = "receive-only";

  var module;
  var requestCallbacks = {};
  var messageCallbacks = {};
  var searchCallbacks = {};

  /* Initialisation helpers */

  function registerPeer(successCallback, errorCallback) {
    var params = {};
    params.peerId = module.peerId;

    var rpc = webinos.rpcHandler.createRPC(module, "registerPeer", params);

    // setup callback dispatcher for incoming channel connect requests
    rpc.handleConnectRequest = function (connectRequest, requestSuccessCallback, requestErrorCallback) {
      dispatchConnectRequest(connectRequest, requestSuccessCallback, requestErrorCallback);
    };

    // setup callback dispatcher for incoming channel messages
    rpc.handleChannelMessage = function (channelMessage, messageSuccessCallback, messageErrorCallback) {
      dispatchChannelMessage(channelMessage, messageSuccessCallback, messageErrorCallback);
    };

    // setup callback dispatcher for incoming search results
    rpc.handleChannelSearchResult = function (searchResult, searchSuccessCallback, searchErrorCallback) {
      dispatchChannelSearchResult(searchResult, searchSuccessCallback, searchErrorCallback);
    };

    webinos.rpcHandler.registerCallbackObject(rpc);

    webinos.rpcHandler.executeRPC(rpc,
      function (success) {
        successCallback(success);
      },
      function (error) {
        errorCallback(error);
      }
    );
  }

  /* Local callback dispatchers */

  function dispatchConnectRequest(connectRequest, successCallback, errorCallback) {
    console.log("Received channel request from proxy " + connectRequest.from.proxyId);
    if (requestCallbacks.hasOwnProperty(connectRequest.namespace)) {
      var requestCallback = requestCallbacks[connectRequest.namespace];
      var isAllowed = requestCallback(connectRequest);

      if (isAllowed) {
        successCallback();
      } else {
        errorCallback(respondWith("Channel creator rejected connect request."));
      }
    } else {
      errorCallback(respondWith("No request callback found for namespace " + connectRequest.namespace));
    }
  }

  function dispatchChannelMessage(channelMessage, successCallback, errorCallback) {
    console.log("Received channel message from proxy " + channelMessage.from.proxyId);

    if (messageCallbacks.hasOwnProperty(channelMessage.to.proxyId)) {
      var messageCallback = messageCallbacks[channelMessage.to.proxyId];
      messageCallback(channelMessage);
      successCallback();
    } else {
      errorCallback(respondWith("No message callback found for namespace " + channelMessage.namespace));
    }
  }

  function dispatchChannelSearchResult(searchResult, successCallback, errorCallback) {
    var channel = searchResult.channel;
    var proxyId = searchResult.proxyId;

    console.log("Received channel search result with namespace " + channel.namespace);
    if (searchCallbacks.hasOwnProperty(module.peerId)) {
      var callback = searchCallbacks[module.peerId];
      callback(new ChannelProxy(channel, proxyId));
      successCallback();
    } else {
      errorCallback(respondWith("No search result callback found for namespace " + searchResult.namespace));
    }
  }

  /* Public API functions */

  /**
   * Create a new channel. The configuration object should contain "namespace", "properties" and optionally "appInfo".
   * Namespace is a valid URN which uniquely identifies the channel in the personal zone. Properties currently contain
   * a "mode" of either "send-receive" or "receive-only". The "send-receive" mode allows both the channel creator
   * and connected clients to send and receive, while "receive-only" only allows the channel creator to send. appInfo
   * allows a channel creator to attach application-specific information to a channel.
   *
   * The channel creator decides which clients are allowed to connect to the channel. For each client which wants to
   * connect to the channel the requestCallback is invoked which should return true (if allowed to connect) or false.
   *
   * @param configuration Channel configuration.
   * @param requestCallback Callback invoked to allow or deny clients access to a channel.
   * @param messageCallback Callback invoked to receive messages.
   * @param successCallback Callback invoked when channel creation was successful.
   * @param errorCallback Callback invoked when channel creation failed.
   */
  function createChannel(configuration, requestCallback, messageCallback, successCallback, errorCallback) {

    // sanity checks

    if (typeof errorCallback !== "function") errorCallback = function() {};

    if (typeof successCallback !== "function") {
      errorCallback(respondWith("Invalid success callback to return the channel proxy."));
      return;
    }

    if (typeof configuration === "undefined") {
      errorCallback(respondWith("Missing configuration."));
      return;
    }

    if ( ! CHANNEL_NAMESPACE_REGEXP.test(configuration.namespace)) {
      errorCallback(respondWith("Namespace is not a valid URN."));
      return;
    }

    if ( ! configuration.hasOwnProperty("properties")) {
      errorCallback(respondWith("Missing properties in configuration."));
      return;
    }

    if ( ! configuration.properties.hasOwnProperty("mode")) {
      errorCallback(respondWith("Missing channel mode in configuration."));
      return;
    }

    if (configuration.properties.mode !== MODE_SEND_RECEIVE && configuration.properties.mode !== MODE_RECEIVE_ONLY) {
      errorCallback(respondWith("Unsupported channel mode."));
      return;
    }

    if (typeof requestCallback !== "function") {
      errorCallback(respondWith("Invalid request callback."));
      return;
    }

    if (typeof messageCallback !== "function") {
      errorCallback(respondWith("Invalid message callback."));
      return;
    }

    var params = {};
    params.peerId = module.peerId;
    params.namespace = configuration.namespace;
    params.properties = configuration.properties;
    params.appInfo = configuration.appInfo;

    var rpc = webinos.rpcHandler.createRPC(module, "createChannel", params);
    webinos.rpcHandler.executeRPC(rpc,
      function(channel) {
        requestCallbacks[channel.namespace] = requestCallback;
        messageCallbacks[channel.creator.proxyId] = messageCallback;
        successCallback(new ChannelProxy(channel, channel.creator.proxyId));
      },
      function(error) {
        console.log("Could not create channel: " + error.message);
        errorCallback(error);
      }
    );
  }

  /**
   * Search for channels with given namespace, within its own personal zone. It returns a proxy to a found
   * channel through the searchCallback function. Only a single search can be active on a peer at the same time,
   * and a search automatically times out after 5 seconds.
   *
   * @param namespace A valid URN of the channel to be found (see RFC2141). If the NSS is a wildcard ("*")
   *  all channels with the same NID are returned.
   * @param zoneIds Not implemented yet.
   * @param searchCallback Callback function invoked for each channel that is found. A proxy to the channel is
   *  provided as an argument. The proxy is not yet connected to the actual channel; to use it one first has to call
   *  its connect method.
   * @param successCallback Callback invoked when the search is accepted for processing.
   * @param errorCallback Callback invoked when search query could not be processed.
   */
  function searchForChannels(namespace, zoneIds, searchCallback, successCallback, errorCallback) {

    // sanity checks

    if (typeof successCallback !== "function") successCallback = function() {};
    if (typeof errorCallback !== "function") errorCallback = function() {};

    if ( ! CHANNEL_NAMESPACE_REGEXP.test(namespace)) {
      errorCallback(respondWith("Namespace is not a valid URN."));
      return;
    }

    if (typeof searchCallback !== "function") {
      errorCallback(respondWith("Invalid search callback."));
      return;
    }

    var params = {};
    params.peerId = module.peerId;
    params.namespace = namespace;
    params.zoneIds = zoneIds;

    // we only allow a single search at a time
    if (searchCallbacks.hasOwnProperty(module.peerId)) {
      errorCallback(respondWith("There is already a search in progress."));
      return;
    }

    // set current search callback
    searchCallbacks[module.peerId] = searchCallback;

    var timeoutId = setTimeout(function() {
      console.log("Hit channel search timeout, remove callback");
      delete searchCallbacks[module.peerId];
    }, CHANNEL_SEARCH_TIMEOUT);

    var rpc = webinos.rpcHandler.createRPC(module, "searchForChannels", params);
    webinos.rpcHandler.executeRPC(rpc,
      function(success) {
        successCallback(success);
      },
      function(error) {
        console.log("Could not search for channels: " + error.message);
        errorCallback(error);
      }
    );

    var pendingOperation = {};
    pendingOperation.cancel = function() {
      if (searchCallbacks[module.peerId]) {
        clearTimeout(timeoutId);
        delete searchCallbacks[module.peerId];
      }
    };

    return pendingOperation;

  }

  /* Channel proxy implementation */

  function ChannelProxy(channel, proxyId) {
    this.client = {};
    this.client.peerId = module.peerId;
    this.client.proxyId = proxyId;

    this.creator = channel.creator;
    this.namespace = channel.namespace;
    this.properties = channel.properties;
    this.appInfo = channel.appInfo;
  }

  /**
   * Connect to the channel. The connect request is forwarded to the channel creator, which decides if a client
   * is allowed to connect. The client can provide application-specific info with the request through the
   * requestInfo parameter.
   *
   * @param requestInfo Application-specific information to include in the request.
   * @param messageCallback Callback invoked when a message is received on the channel (only after successful connect).
   * @param successCallback Callback invoked if the client is successfully connected to the channel (i.e. if authorized)
   * @param errorCallback Callback invoked if the client could not be connected to the channel.
   */
  ChannelProxy.prototype.connect = function (requestInfo, messageCallback, successCallback, errorCallback) {

    // sanity checks

    if (typeof successCallback !== "function") successCallback = function() {};
    if (typeof errorCallback !== "function") errorCallback = function() {};

    if (typeof messageCallback !== "function") {
      errorCallback(respondWith("Invalid message callback."));
      return;
    }

    var params = {};
    params.from = this.client;
    params.requestInfo = requestInfo;
    params.namespace = this.namespace;

    var rpc = webinos.rpcHandler.createRPC(module, "connectToChannel", params);
    webinos.rpcHandler.executeRPC(rpc,
      function (client) {
        messageCallbacks[client.proxyId] = messageCallback;
        successCallback();
      },
      function (error) {
        console.log("Could not search for channels: " + error.message);
        errorCallback(error);
      }
    );
  };

  /**
   * Send a message to all connected clients on the channel.
   *
   * @param message The message to be send.
   * @param successCallback Callback invoked when the message is accepted for processing.
   * @param errorCallback Callback invoked if the message could not be processed.
   */
  ChannelProxy.prototype.send = function (message, successCallback, errorCallback) {

    // sanity checks

    if (typeof successCallback !== "function") successCallback = function() {};
    if (typeof errorCallback !== "function") errorCallback = function() {};

    if (typeof message === "undefined") {
      errorCallback(respondWith("Invalid message."));
      return;
    }

    var params = {};
    params.from = this.client;
    params.namespace = this.namespace;
    params.clientMessage = message;

    var rpc = webinos.rpcHandler.createRPC(module, "sendToChannel", params);
    webinos.rpcHandler.executeRPC(rpc,
      function (success) {
        successCallback();
      },
      function (error) {
        console.log("Could not send to channel: " + error.message);
        errorCallback(error);
      }
    );
  };

  /**
   * Send to a specific client only. The client object of the channel creator is a property of the channel proxy. The
   * App2App Messaging API does not include a discovery mechanism for clients. A channel creator obtains the client
   * objects for each client through its connectRequestCallback, and if needed the channel creator can implement
   * an application-specific lookup service to other clients. A client object only has meaning within the scope of its
   * channel, not across channels. Note that the client object of a message sender can also be found in the "from"
   * property of the message.
   *
   * @param client The client object of the client to send the message to.
   * @param message The message to be send.
   * @param successCallback Callback invoked when the message is accepted for processing.
   * @param errorCallback Callback invoked if the message could not be processed.
   */
  ChannelProxy.prototype.sendTo = function (client, message, successCallback, errorCallback) {

    // sanity checks

    if (typeof successCallback !== "function") successCallback = function() {};
    if (typeof errorCallback !== "function") errorCallback = function() {};

    if ( ! isValidClient(client)) {
      errorCallback(respondWith("Invalid client."));
      return;
    }

    if (typeof message === "undefined") {
      errorCallback(respondWith("Invalid message."));
      return;
    }

    var params = {};
    params.from = this.client;
    params.to = client;
    params.namespace = this.namespace;
    params.clientMessage = message;

    var rpc = webinos.rpcHandler.createRPC(module, "sendToChannel", params);
    webinos.rpcHandler.executeRPC(rpc,
      function (success) {
        successCallback();
      },
      function (error) {
        console.log("Could not send to channel: " + error.message);
        errorCallback(error);
      }
    );
  };

  /**
   * Disconnect from the channel. After disconnecting the client does no longer receive messages from the channel.
   * If the channel creator disconnects, the channel is closed and is no longer available. The service
   * does not inform connected clients of the disconnect or closing. If needed the client can send an
   * application-specific message to inform other clients before disconnecting.
   *
   * @param successCallback Callback invoked when the disconnect request is accepted for processing.
   * @param errorCallback Callback invoked if the disconnect request could not be processed.
   */
  ChannelProxy.prototype.disconnect = function (successCallback, errorCallback) {

    // sanity checks

    if (typeof successCallback !== "function") successCallback = function() {};
    if (typeof errorCallback !== "function") errorCallback = function() {};

    var params = {};
    params.from = this.client;
    params.namespace = this.namespace;

    var rpc = webinos.rpcHandler.createRPC(module, "disconnectFromChannel", params);
    webinos.rpcHandler.executeRPC(rpc,
      function (success) {
        successCallback();
      },
      function (error) {
        console.log("Could not disconnect from channel: " + error.message);
        errorCallback(error);
      }
    );
  };

  /* Helpers */

  function isValidClient(client) {
    return typeof client !== "undefined" &&
      client.hasOwnProperty("peerId") &&
      client.hasOwnProperty("proxyId");
  }

  function respondWith(message) {
    return {
      message: message
    };
  }

}());

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
(function() {
	var _sync = new SyncManager({
		"api": "http://webinsdf/sync",
		"name": "sync",
		"id": "foo"
	});

	webinos.__defineGetter__('sync', function() {
		return _sync;
	});

	/**
	 * @constructor
	 * @param obj Object containing displayName, api, etc.
	 */
	function SyncManager(obj) {
		this.base = WebinosService;
		this.base(obj);

		var _app2app;
		var _chanMap = {};
		var _watchMap = {};

		var that = this;
		var _callerCache = [];
		var finishCallers = function() {
			for (var i = 0; i < _callerCache.length; i++) {
				var caller = _callerCache[i];
				webinos.sync[caller.func].apply(that, caller.params);
			}
			_callerCache = [];
		};

		webinos.discovery.findServices({"api": "http://webinos.org/api/app2app"}, {
			onFound: function (unboundService) {
				_app2app = unboundService; // FIXME should be assigned on bind
				unboundService.bindService({onBind: function(sv) {
					finishCallers();
				}});
			}
		});

		this.create = function (id, successCallback, errorCallback, options) {
			if (!_app2app) {
				_callerCache.push({
					"func": "create",
					"params": [id, successCallback, errorCallback, options]
				});
				return;
			}

			var messageCallback = function (msg) {
				console.log("got appstate sync msg");
				var scb = _watchMap[msg.contents[0]+msg.contents[1]];
				if (scb) {
					scb({
						"propertyPath": msg.contents[1],
						"previousValue": msg.contents[3],
						"currentValue": msg.contents[2]
					});
				}
			};

			var creatSyOb = function(c, connect, searchOp) {
				if (searchOp) searchOp.cancel();

				var chan = _chanMap[id];
				if (chan) chan.ref++;
				
				_chanMap[id] = chan ? chan : {"chan": c, "ref": 0};
				var so = options && options.referenceObject ?
						new SyncObject(id, options.referenceObject) : new SyncObject(id);

				if (connect) {
					c.connect({"source": id}, messageCallback, function() {
						successCallback(so);
					}, function(err) {
						errorCallback(err);
					});
				} else {
					successCallback(so);
				}
			};
			
			var search = function() {
				var op = _app2app.searchForChannels("urn:syncobj:" + id, [], function searchCallback(chan) {
					console.log("Found existing channel for sync obj");
					creatSyOb(chan, true, op);
				}, function succCallbackSearch() {
					
				}, function errCallbackSearch(err) {
					if (err.message === "There is already a search in progress.") {
						setTimeout(function() {
							search();
						}, 600);
					} else {
						if (errorCallback) errorCallback(err);
					}
				});
			};

			_app2app.createChannel({
				"namespace": "urn:syncobj:" + id,
				"properties": { "mode": "send-receive" },
				"appInfo": {}
			}, function requestCallback(req) {
				return true;
			},
			messageCallback, 
			function succCallbackCreate(chan) {
				creatSyOb(chan);
			}, function errCallbackCreate(err) {
				if (err.message === "Channel already exists.") {
					search();
				} else {
					if (errorCallback) errorCallback(err);
				}
			});
		};

		/**
		 */
		this.find = function (id, successCallback, errorCallback) {
			if (!_app2app) {
				_callerCache.push({
					"func": "find",
					"params": [id, successCallback, errorCallback]
				});
				return;
			}

		};

		/**
		 */
		this.detach = function (id, successCallback, errorCallback) {
			if (!_app2app) {
				_callerCache.push({
					"func": "detach",
					"params": [id, successCallback, errorCallback]
				});
				return;
			}

		};

		/**
		 */
		this.remove = function (id, successCallback, errorCallback) {
			if (!_app2app) {
				_callerCache.push({
					"func": "remove",
					"params": [id, successCallback, errorCallback]
				});
				return;
			}

			var chan = _chanMap[id];
			if (!chan) {
				if (errorCallback) errorCallback({"message": "couldn't remove, already removed?"});
				return;
			}
			chan.chan.disconnect();

			if (chan.ref > 0) chan.ref--;
			if (chan.ref === 0) delete _chanMap[id];

			successCallback();
		};

		function SyncObject(id, data) {
			var _id = id;
			var _data;
			this.data = {};

			var clone = function(obj) {
				if (obj == null || typeof(obj) != 'object')
					return obj;

				var temp = new obj.constructor();
				for (var key in obj)
					temp[key] = clone(obj[key]);

				return temp;
			};
			_data = clone(data);

			var get = function(prop) {
				return _data[prop];
			};
			var set = function(prop, val) {
				var chan = _chanMap[id];
				chan.chan.send([id, prop, val, _data[prop]]);
				_data[prop] = val;
			};
			var defineProp = function(prop) {
				Object.defineProperty(this.data, prop, {
					configurable: true,
					enumeable: true,
					writeable: true,
					get: function() {
						return get.call(this, prop);
					},
					set: function(val) {
						set.call(this, prop, val);
					}
				});
			};

			// use props from data as template for this object
			for (var prop in _data) {
				if (!prop) break;

				defineProp.call(this, prop);
			}

			var that = this;
			this.watch = function(prop, successCallback, errorCallback) {
				var chan = _chanMap[id];
				if (!chan) {
					errorCallback({message: 'not connected'});
					return;
				}
				_watchMap[id+prop] = successCallback;

				if (that.data[prop]) {
					_data[prop] = that.data[prop];
					delete that.data[prop];
				}
				defineProp.call(that, prop);
			};

			this.unwatch = function(prop, successCallback, errorCallback) {
				var chan = _chanMap[id];
				if (!chan) {
					errorCallback({message: 'not connected'});
					return;
				}

				delete _watchMap[id+prop];
			};
		}

	};

	SyncManager.prototype = new WebinosService;

}());
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
* Copyright 2012 Andr� Paul, Fraunhofer FOKUS
******************************************************************************/
(function() {

	//AppLauncher Module Functionality
	
	/**
	 * Webinos AppLauncher service constructor (client side).
	 * @constructor
	 * @param obj Object containing displayName, api, etc.
	 */
	AppLauncherModule = function(obj) {
		this.base = WebinosService;
		this.base(obj);
	};
	
	AppLauncherModule.prototype = new WebinosService();

	/**
	 * To bind the service.
	 * @param bindCB BindCallback object.
	 */
	AppLauncherModule.prototype.bind = function(bindCB) {
		if (typeof bindCB.onBind === 'function') {
			bindCB.onBind(this);
		};
	};
	
	/**
	 * Launches an application.
	 * @param successCallback Success callback.
	 * @param errorCallback Error callback.
	 * @param appURI Application ID to be launched.
	 */
	AppLauncherModule.prototype.launchApplication = function (successCallback, errorCallback, appURI){

		var rpc = webinos.rpcHandler.createRPC(this, "launchApplication", [appURI]);
		webinos.rpcHandler.executeRPC(rpc,
				function (params){
					successCallback(params);
				},
				function (error){
					errorCallback(error);
				}
		);

	};
    
	/**
	 * Reports if an application is isntalled.
	 * [not yet implemented]
	 * @param applicationID Application ID to test if installed.
	 * @returns Boolean whether application is installed.
	 */
	AppLauncherModule.prototype.appInstalled = function(successCallback, errorCallback, appURI){

		var rpc = webinos.rpcHandler.createRPC(this, "appInstalled", [appURI]);
		webinos.rpcHandler.executeRPC(rpc,
				function (params){
					successCallback(params);
				},
				function (error){
					errorCallback(error);
				}
		);
    
	};
	
	
}());
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
 * Copyright 2012 BMW AG
 ******************************************************************************/ 

(function () {
    Vehicle = function (obj) {
        this.base = WebinosService;
        this.base(obj);
    }
    Vehicle.prototype = new WebinosService;
    Vehicle.prototype.bindService = function (bindCB, serviceId) {
        // actually there should be an auth check here or whatever, but we just always bind
        //METHODS
        this.get = get;
        this.addEventListener = addEventListener;
        this.removeEventListener = removeEventListener;
        this.requestGuidance = requestGuidance;
        this.findDestination = findDestination;
        //OBJECTS (in case someone needs them)
        this.POI = POI;
        this.Address = Address;
        this.LatLng = LatLng;
        if (typeof bindCB.onBind === 'function') {
            bindCB.onBind(this);
        };
    }
    var _referenceMapping = new Array();
    var _vehicleDataIds = new Array('climate-all', 'climate-driver', 'climate-passenger-front', 'climate-passenger-rear-left', 'passenger-rear-right', 'lights-fog-front', 'lights-fog-rear', 'lights-signal-right', 'lights-signal-left', 'lights-signal-warn', 'lights-hibeam', 'lights-parking', 'lights-head', 'lights-head', 'wiper-front-wash', 'wiper-rear-wash', 'wiper-automatic', 'wiper-front-once', 'wiper-rear-once', 'wiper-front-level1', 'wiper-front-level2', 'destination-reached', 'destination-changed', 'destination-cancelled', 'parksensors-front', 'parksensors-rear', 'gear', 'tripcomputer', 'wipers', 'oillevel');

    function get(vehicleDataId, callOnSuccess, callOnError) {
        arguments[0] = vehicleDataId;
        var rpc = webinos.rpcHandler.createRPC(this, "get", arguments);
        webinos.rpcHandler.executeRPC(rpc,

        function (result) {
            callOnSuccess(result);
        },

        function (error) {
            callOnError(error);
        });
    }

    function addEventListener(vehicleDataId, eventHandler, capture) {
        if (_vehicleDataIds.indexOf(vehicleDataId) != -1) {
            var rpc = webinos.rpcHandler.createRPC(this, "addEventListener", vehicleDataId);
            _referenceMapping.push([rpc.id, eventHandler]);
            console.log('# of references' + _referenceMapping.length);
            rpc.onEvent = function (vehicleEvent) {
                eventHandler(vehicleEvent);
            }
            webinos.rpcHandler.registerCallbackObject(rpc);
            webinos.rpcHandler.executeRPC(rpc);
        } else {
            console.log(vehicleDataId + ' not found');
        }
    }

    function removeEventListener(vehicleDataId, eventHandler, capture) {
        var refToBeDeleted = null;
        for (var i = 0; i < _referenceMapping.length; i++) {
            console.log("Reference" + i + ": " + _referenceMapping[i][0]);
            console.log("Handler" + i + ": " + _referenceMapping[i][1]);
            if (_referenceMapping[i][1] == eventHandler) {
                var arguments = new Array();
                arguments[0] = _referenceMapping[i][0];
                arguments[1] = vehicleDataId;
                console.log("ListenerObject to be removed ref#" + refToBeDeleted);
                var rpc = webinos.rpcHandler.createRPC(this, "removeEventListener", arguments);
                webinos.rpcHandler.executeRPC(rpc,

                function (result) {
                    callOnSuccess(result);
                },

                function (error) {
                    callOnError(error);
                });
                break;
            }
        }
    }

    function POI(name, position, address) {
        this.name = name;
        this.position = position;
        this.address = address;
    }

    function Address(country, region, county, city, street, streetNumber, premises, additionalInformation, postalCode) {
        this.county = county;
        this.regions = region;
        this.county = city;
        this.street = streetNumber;
        this.premises = premises;
        this.addtionalInformation = additionalInformation;
        this.postalCode = postalCode;
    }

    function LatLng(lat, lng) {
        this.latitude = lat;
        this.longitude = lng;
    }

    function requestGuidance(callOnSuccess, callOnError, destinations) {
        arguments = destinations;
        var successCb = callOnSuccess;
        var errorCb = callOnError;
        var rpc = webinos.rpcHandler.createRPC(this, "requestGuidance", arguments);
        webinos.rpcHandler.executeRPC(rpc,

        function () {
            callOnSuccess();
        },

        function (error) {
            callOnError(error);
        });
    }

    function findDestination(callOnSuccess, callOnError, search) {
        arguments = search;
        var rpc = webinos.rpcHandler.createRPC(this, "findDestination", arguments);
        webinos.rpcHandler.executeRPC(rpc,

        function (results) {
            callOnSuccess(results);
        },

        function (error) {
            callOnError(error);
        });
    }
})();

(function() {

WebinosDeviceOrientation = function (obj) {
	this.base = WebinosService;
	this.base(obj);
};

var _referenceMappingDo = new Array();
var _eventIdsDo = new Array('deviceorientation', 'compassneedscalibration', 'devicemotion');

WebinosDeviceOrientation.prototype = new WebinosService;

WebinosDeviceOrientation.prototype.bindService = function (bindCB, serviceId) {
	// actually there should be an auth check here or whatever, but we just always bind
	this.addEventListener = addEventListener;
	this.removeEventListener = removeEventListener;
	this.dispatchEvent = dispatchEvent;
	
    //Objects
    this.DeviceOrientationEvent = DeviceOrientationEvent;
    this.DeviceMotionEvent = DeviceMotionEvent;
    this.Acceleration = Acceleration;
    this.RotationRate = RotationRate;
    
    
    
    
	if (typeof bindCB.onBind === 'function') {
		bindCB.onBind(this);
	};
}

function addEventListener(type, listener, useCapture) {
    
    if(_eventIdsDo.indexOf(type) != -1){	
    
            console.log("LISTENER"+ listener);
    
			var rpc = webinos.rpcHandler.createRPC(this, "addEventListener", [type, listener, useCapture]);
			_referenceMappingDo.push([rpc.id, listener]);

			console.log('# of references' + _referenceMappingDo.length);	
			rpc.onEvent = function (orientationEvent) {
				listener(orientationEvent);
			};
            
			webinos.rpcHandler.registerCallbackObject(rpc);
			webinos.rpcHandler.executeRPC(rpc);
		}else{
			console.log(type + ' not found');	
		}
};

//DEFINITION BASE EVENT
WDomEvent = function(type, target, currentTarget, eventPhase, bubbles, cancelable, timestamp){
	this.initEvent(type, target, currentTarget, eventPhase, bubbles, cancelable, timestamp);
}

WDomEvent.prototype.speed = 0;

WDomEvent.prototype.initEvent = function(type, target, currentTarget, eventPhase, bubbles, cancelable, timestamp){
    this.type = type;
    this.target = target;
    this.currentTarget = currentTarget;
    this.eventPhase = eventPhase;
    this.bubbles = bubbles;
    this.cancelable  = cancelable;
    this.timestamp = timestamp; 
}


DeviceOrientationEvent = function(alpha, beta, gamma){
	this.initDeviceOrientationEvent(alpha, beta, gamma);
}

DeviceOrientationEvent.prototype = new WDomEvent();
DeviceOrientationEvent.prototype.constructor = DeviceOrientationEvent;
DeviceOrientationEvent.parent = WDomEvent.prototype; // our "super" property

DeviceOrientationEvent.prototype.initDeviceOrientationEvent = function(alpha, beta, gamma){
	this.alpha = alpha;
	this.beta = beta;
	this.gamma = gamma;
    
    var d = new Date();
    var stamp = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
    var stamp = stamp + d.getUTCMilliseconds();
    
	DeviceOrientationEvent.parent.initEvent.call(this,'deviceorientation', null, null, null, false, false, stamp);
}
Acceleration = function(x,y,z){
	this.x = x;
	this.y = y;
	this.z = z;
}
RotationRate = function(alpha, beta, gamma){
	this.alpha = alpha;
	this.beta = beta;
	this.gamma = gamma;
}
DeviceMotionEvent = function(acceleration, accelerationIncludingGravity, rotationRate, interval){
	this.initDeviceMotionEvent(acceleration, accelerationIncludingGravity, rotationRate, interval);
}
DeviceMotionEvent.prototype = new WDomEvent();
DeviceMotionEvent.prototype.constructor = DeviceOrientationEvent;
DeviceMotionEvent.parent = WDomEvent.prototype; // our "super" property

DeviceMotionEvent.prototype.initDeviceMotionEvent = function(acceleration, accelerationIncludingGravity, rotationRate, interval){
	this.acceleration = acceleration;
	this.accelerationIncludingGravity = accelerationIncludingGravity;
	this.rotationRate = rotationRate;
	this.interval = interval;
    var d = new Date();
    var stamp = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
    var stamp = stamp + d.getUTCMilliseconds();
	DeviceOrientationEvent.parent.initEvent.call(this,'devicemotion', null, null, null, false, false, stamp);
}

function removeEventListener(type, listener, useCapture) {
        console.log("LISTENER"+ listener);
        var refToBeDeleted = null;
		for(var i = 0; i < _referenceMappingDo.length; i++){
			console.log("Reference" + i + ": " + _referenceMappingDo[i][0]);
			console.log("Handler" + i + ": " + _referenceMappingDo[i][1]);
			if(_referenceMappingDo[i][1] == listener){
					var arguments = new Array();
					arguments[0] = _referenceMappingDo[i][0];
					arguments[1] = type;
					console.log("ListenerObject to be removed ref#" + _referenceMappingDo[i][0]);                                             
                    var rpc = webinos.rpcHandler.createRPC(this, "removeEventListener", arguments);
					webinos.rpcHandler.executeRPC(rpc,
						function(result){
							callOnSuccess(result);
						},
						function(error){
							callOnError(error);
						}
					);
					break;			
			}	
    }
};

function dispatchEvent(event) {
    //TODO
};

})();
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
* Copyright 2012 EPU-National Technical University of Athens
******************************************************************************/
(function() {

	var Context = function(obj, rpcHandler) {
		this.base = WebinosService;
		this.base(obj);
    	this.rpcHandler = rpcHandler;
	};
	
	Context.prototype = new WebinosService;
	
	Context.prototype.bindService = function (bindCB, serviceId) {
		// actually there should be an auth check here or whatever, but we just always bind
		this.find = find.bind(this);
		this.executeQuery = executeQuery.bind(this);
		
		if (typeof bindCB.onBind === 'function') {
			bindCB.onBind(this);
		};
	}
	
	function find(params, successCB,errorCB) {
		var rpc = this.rpcHandler.createRPC(this, "find",  params);
		this.rpcHandler.executeRPC(rpc,
				function (params){
					successCB(params);
				},
				function (error){
					errorCB(error);
				}
		);
	}
	
  function registerAppContextObject(APPName, ContextObjectName, ContextFields, callback) {
    var rpc = webinos.rpcHandler.createRPC(this, "registerAppContextObject",  query);
    webinos.rpcHandler.executeRPC(rpc,
        function (params){
      callback(params);
        },
        function (error){
          callback(error);
        }
    );
  }

	function executeQuery(query, successCB,errorCB) {
	    var rpc = this.rpcHandler.createRPC(this, "executeQuery",  query);
	    this.rpcHandler.executeRPC(rpc,
	        function (params){
	          successCB(params);
	        },
	        function (error){
	          errorCB(error);
	        }
	    );
	  }
	
	if (typeof module !== 'undefined') {
		exports.Context = Context;
	} else {
		webinos.Context = Context;
	}
})();

/*
*********************************************************************************
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
* Copyright 2012 Torsec -Computer and network security group-
* Politecnico di Torino
******************************************************************************/

(function() {
	
	/**
	 * Webinos Authentication service constructor (client side).
	 * @name AuthenticationModule
	 * @constructor
	 * @param obj Object containing displayName, api, etc.
	 */
	AuthenticationModule = function (obj) {
		"use strict";
		this.base = WebinosService;
		this.base(obj);
	};

	AuthenticationModule.prototype = new WebinosService();

	/**
	 * Requests user authentication
	 * @name authenticate
	 * @function
	 * @param usename Username
	 * @param successCB Success callback
	 * @param errorCB Error callback
	 */
	function authenticate(username, successCB, errorCB) {
		"use strict";
		var rpc = webinos.rpcHandler.createRPC(this, "authenticate", [username]);
		webinos.rpcHandler.executeRPC(rpc,
			function (params) {
				console.log("authenticate successCB: ", params);
				successCB(params);
			},
			function (error) {
				console.log("authenticate errorCB: ", error);
				errorCB(error);
			}
		);
	}

	/**
	 * Reports if user is authenticated
	 * @name isAuthenticated
	 * @function
	 * @param usename Username
	 * @param successCB Success callback
	 * @param errorCB Error callback
	 */
	function isAuthenticated(username, successCB, errorCB) {
		"use strict";
		var rpc = webinos.rpcHandler.createRPC(this, "isAuthenticated", [username]);
		webinos.rpcHandler.executeRPC(rpc,
			function (params) {
				console.log("isAuthenticated successCB: ", params);
				successCB(params);
			},
			function (error) {
				console.log("isAuthenticated errorCB: ", error);
				errorCB(error);
			}
		);
	}
	
	/**
	 * Retrieves user authentication status (when and how he or she was last authenticated)
	 * @name getAuthenticationStatus
	 * @function
	 * @param usename Username
	 * @param successCB Success callback
	 * @param errorCB Error callback
	 */
	function getAuthenticationStatus(username, successCB, errorCB) {
		"use strict";
		var rpc = webinos.rpcHandler.createRPC(this, "getAuthenticationStatus", [username]);
		webinos.rpcHandler.executeRPC(rpc,
			function (params) {
				console.log("getAuthenticatationStatus successCB: ", params);
				successCB(params);
			},
			function (error) {
				console.log("getAuthenticationStatus errorCB: ", error);
				errorCB(error);
			}
		);
	}

	/**
	 * To bind the service.
	 * @name bindService
	 * @function
	 * @param bindCB BindCallback object.
	 */
	AuthenticationModule.prototype.bindService = function (bindCB, serviceId) {
		"use strict";
		this.authenticate = authenticate;
		this.isAuthenticated = isAuthenticated;
		this.getAuthenticationStatus = getAuthenticationStatus;
		
		if (typeof bindCB.onBind === 'function') {
			bindCB.onBind(this);
		}
	};

})();

/*******************************************************************************
 * Copyright 2011 Istituto Superiore Mario Boella (ISMB)
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
 ******************************************************************************/

(function()
{
    Contacts = function(obj) {
		this.base = WebinosService;
		this.base(obj);
		
		this.syncGoogleContacts = syncGoogleContacts;
		this.find = find;
    };
    
    Contacts.prototype = new WebinosService;

    Contacts.prototype.bindService = function (bindCB, serviceId) {
	    // actually there should be an auth check here or whatever, but we just always bind
	    this.syncGoogleContacts = syncGoogleContacts;
	    this.find = find;

	    if (typeof bindCB.onBind === 'function') {
		    bindCB.onBind(this);
	    };
    }

    

    /**
    * returns true if contacts service is authenticated with GMail using username and password
    * or a valid address book file could be open
    * TODO this method has to be removed when user profile will handle this
    * */
    function syncGoogleContacts(attr, successCB,errorCB)
    {
        var rpc = webinos.rpcHandler.createRPC(this, "syncGoogleContacts", [ attr ]); // RPCservicename,
        // function
        webinos.rpcHandler.executeRPC(rpc, function(params)
        {
            successCB(params);
        }, function(error)
        {
            if (typeof(errorCB) !== 'undefined')
        errorCB(error);
        });
    };
     

    /**
     * return a list of contacts matching some search criteria
     * 
     * TODO full W3C specs
     */
    function find(attr,successCB,errorCB)
    {
        var rpc =webinos.rpcHandler.createRPC(this, "find", [ attr ]); // RPCservicename,
        //RPCservicename,
        // function
        webinos.rpcHandler.executeRPC(rpc, function(params)
        {
            successCB(params);
        }, function(error)
        {
            if (typeof(errorCB) !== 'undefined')
            errorCB(error);
        });
    };

}());

(function () {
	var PropertyValueSuccessCallback, ErrorCallback, DeviceAPIError, PropertyRef;

	DeviceStatusManager = function (obj) {
		this.base = WebinosService;
		this.base(obj);
	};
	
	DeviceStatusManager.prototype = new WebinosService;

	DeviceStatusManager.prototype.bindService = function (bindCB, serviceId) {
		// actually there should be an auth check here or whatever, but we just always bind
		this.getComponents = getComponents;
		this.isSupported = isSupported;
		this.getPropertyValue = getPropertyValue;

		if (typeof bindCB.onBind === 'function') {
			bindCB.onBind(this);
		};
	}

	function getComponents (aspect, successCallback, errorCallback)	{
		var rpc = webinos.rpcHandler.createRPC(this, "devicestatus.getComponents", [aspect]);
		webinos.rpcHandler.executeRPC(rpc,
			function (params) { successCallback(params); }
		);
		return;
	}

	function isSupported (aspect, property, successCallback)
	{
		var rpc = webinos.rpcHandler.createRPC(this, "devicestatus.isSupported", [aspect, property]);
		webinos.rpcHandler.executeRPC(
			rpc, 
			function (res) { successCallback(res); }
		);
		return;
	}

	function getPropertyValue (successCallback, errorCallback, prop) {
		var rpc = webinos.rpcHandler.createRPC(this, "devicestatus.getPropertyValue", [prop]);
		webinos.rpcHandler.executeRPC(
			rpc, 
			function (params) { successCallback(params); },
			function (err) { errorCallback(err); }
		);
		return;
	};

	PropertyValueSuccessCallback = function () {};

	PropertyValueSuccessCallback.prototype.onSuccess = function (prop) {
		return;
	};

	ErrorCallback = function () {};

	ErrorCallback.prototype.onError = function (error) {
		return;
	};

	DeviceAPIError = function () {
		this.message = String;
		this.code = Number;
	};

	DeviceAPIError.prototype.UNKNOWN_ERR                    = 0;
	DeviceAPIError.prototype.INDEX_SIZE_ERR                 = 1;
	DeviceAPIError.prototype.DOMSTRING_SIZE_ERR             = 2;
	DeviceAPIError.prototype.HIERARCHY_REQUEST_ERR          = 3;
	DeviceAPIError.prototype.WRONG_DOCUMENT_ERR             = 4;
	DeviceAPIError.prototype.INVALID_CHARACTER_ERR          = 5;
	DeviceAPIError.prototype.NO_DATA_ALLOWED_ERR            = 6;
	DeviceAPIError.prototype.NO_MODIFICATION_ALLOWED_ERR    = 7;
	DeviceAPIError.prototype.NOT_FOUND_ERR                  = 8;
	DeviceAPIError.prototype.NOT_SUPPORTED_ERR              = 9;
	DeviceAPIError.prototype.INUSE_ATTRIBUTE_ERR            = 10;
	DeviceAPIError.prototype.INVALID_STATE_ERR              = 11;
	DeviceAPIError.prototype.SYNTAX_ERR                     = 12;
	DeviceAPIError.prototype.INVALID_MODIFICATION_ERR       = 13;
	DeviceAPIError.prototype.NAMESPACE_ERR                  = 14;
	DeviceAPIError.prototype.INVALID_ACCESS_ERR             = 15;
	DeviceAPIError.prototype.VALIDATION_ERR                 = 16;
	DeviceAPIError.prototype.TYPE_MISMATCH_ERR              = 17;
	DeviceAPIError.prototype.SECURITY_ERR                   = 18;
	DeviceAPIError.prototype.NETWORK_ERR                    = 19;
	DeviceAPIError.prototype.ABORT_ERR                      = 20;
	DeviceAPIError.prototype.TIMEOUT_ERR                    = 21;
	DeviceAPIError.prototype.INVALID_VALUES_ERR             = 22;
	DeviceAPIError.prototype.NOT_AVAILABLE_ERR              = 101;
	DeviceAPIError.prototype.code = Number;
	DeviceAPIError.prototype.message = Number;

	PropertyRef = function () {
		this.component = String;
		this.aspect = String;
		this.property = String;
	};

	PropertyRef.prototype.component = String;
	PropertyRef.prototype.aspect = String;
	PropertyRef.prototype.property = String;

}());

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
* Copyright 2012 Ziran Sun Samsung Electronics(UK) Ltd
*
******************************************************************************/
(function () {

	/**
	 * Webinos Bluetooth Discovery service constructor (client side).
	 * @constructor
	 * @param obj Object containing displayName, api, etc.
	 */
	DiscoveryModule = function (obj) {
		this.base = WebinosService;
		this.base(obj);
	};
	
	DiscoveryModule.prototype = new WebinosService();
	
	DiscoveryModule.prototype.BTauthenticate = function (data, success) {
		console.log("BT Authenticate");
		var rpc = webinos.rpcHandler.createRPC(this, "BTauthenticate", data);
		webinos.rpcHandler.executeRPC(rpc, function(params) {
			success(params);
		});
	};
	
	/**
	 * To find devices that support the specific service. This applies to both Android and Linux
	 * @param data Service type.
	 * @param success Success callback.
	 */
	DiscoveryModule.prototype.BTfindservice = function (data, success) {
		console.log("BT findservice");
		var rpc = webinos.rpcHandler.createRPC(this, "BTfindservice", arguments);
		webinos.rpcHandler.executeRPC(rpc, function(params) {
			success(params);
		});
	};
	
	
	/**
	 * To find devices using DNS . This applies to Android
	 * @param data Service type.
	 * @param success Success callback.
	 */
	DiscoveryModule.prototype.DNSfindservice = function(data, success){
		console.log("DNS findservice");
		var rpc = webinos.rpcHandler.createRPC(this, "DNSfindservice", arguments);
		webinos.rpcHandler.executeRPC(rpc, function(params) {
			success(params);
		});
	};
	
	/**
	 * To find Heart Rate Monitor device, only support Android OS.
	 * @param data Service type.
	 * @param success Success callback.
	 */

	DiscoveryModule.prototype.findHRM = function(data, success){
		console.log("HRM find HRM");
  		var rpc = webinos.rpcHandler.createRPC(this, "findHRM",data);
	  	webinos.rpcHandler.executeRPC(rpc, function(params) {
	  		success(params);
	  	});
	};

	/**
	 * To bind with found device that has the service requested. It lists all 
	 * file folders in the device.
	 * @param data Device address.
	 * @param success Success callback.
	 */
	DiscoveryModule.prototype.bindservice = function(data, success){
		console.log("Linux BT bindservice");
		var rpc = webinos.rpcHandler.createRPC(this, "bindservice",arguments);
	  	webinos.rpcHandler.executeRPC(rpc, function(params) {
	  		success(params);
	  	});
	};

	/**
	 * To get file list of selected folder in the bonded device
	 * @param data File folder.
	 * @param success Success callback.
	 */
	DiscoveryModule.prototype.listfile = function(data, success){
		console.log("Linux BT listfile");
		var rpc = webinos.rpcHandler.createRPC(this, "listfile",arguments);
		webinos.rpcHandler.executeRPC(rpc, function(params) {
			success(params);
		});
	};
	
	/**
	 * To transfer selected file from the bonded device
	 * @param data Selected file.
	 * @param success Success callback.
	 */

	DiscoveryModule.prototype.transferfile = function(data, success){
		console.log("Linux BT transferfile");
		var rpc = webinos.rpcHandler.createRPC(this, "transferfile",arguments);
		webinos.rpcHandler.executeRPC(rpc, function(params) {
			success(params);
		});
	};
}());

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
* Copyright 2012 Christian Fuhrhop, Fraunhofer FOKUS
******************************************************************************/

(function() {
 //Payment Module Functionality

        PaymentModule = function (obj){      
                this.base = WebinosService;
                this.base(obj);
        };

    var rpcServiceProviderID, rpcCustomerID, rpcShopID;

        PaymentModule.prototype = new WebinosService;
        
        /**
         * To bind the service.
         * @param bindCB BindCallback object.
         */
        PaymentModule.prototype.bindService = function (bindCB, serviceId) {
                this.listenAttr = {};
                
                if (typeof bindCB.onBind === 'function') {
                        bindCB.onBind(this);
                };
        }


    PaymentModule.prototype.createShoppingBasket = function (successCallback, errorCallback, serviceProviderID, customerID, shopID) {
                rpcServiceProviderID=serviceProviderID;
                rpcCustomerID=customerID;
                rpcShopID=shopID;
                
                var arguments = new Array();
                arguments[0]=rpcServiceProviderID;
                arguments[1]=rpcCustomerID;
                arguments[2]=rpcShopID;
                var self = this;
                var rpc = webinos.rpcHandler.createRPC(this, "createShoppingBasket", arguments);
                webinos.rpcHandler.executeRPC(rpc,
                                function (params){
                                        successCallback(new ShoppingBasket(self));
                                },
                                function (error){errorCallback(error);}
                );
        }
    /**
     * The ShoppingItem captures the attributes of a single shopping product
     *
     * 
     * The shopping basket represents a current payment action and allows to 
     * add a number of items to the basket before proceeding to checkout.
     * 
     */
    ShoppingItem = function (obj) {

        // initialize attributes

        this.productID = "";
        this.description = "";
        this.currency = "EUR";
        this.itemPrice = 0.0;
        this.itemCount = 0;
        this.itemsPrice = 0.0;
        this.base = WebinosService;
        this.base(obj);
    };        
    /**
     * An id that allows the shop to identify the purchased item
     *
     * 
     * No exceptions
     * 
     */
    ShoppingItem.prototype.productID = ""

    /**
     * A human-readable text to appear on the bill, so the user can easily see what they bought.
     *
     * 
     * No exceptions
     * 
     */
    ShoppingItem.prototype.description = "";

    /**
     * The 3-figure code as per ISO 4217.
     *
     * 
     * No exceptions
     * 
     */
    ShoppingItem.prototype.currency = "EUR";

    /**
     * The price per individual item in the currency given above, a negative number represents a refund.
     *
     * 
     * No exceptions
     * 
     */
    ShoppingItem.prototype.itemPrice = 0.0;

    /**
     * The number of identical items purchased
     *
     * 
     * No exceptions
     * 
     */
    ShoppingItem.prototype.itemCount = 0;

    /**
     * Price for all products in this shopping item.
     *
     * 
     * Typically this is itemPrice*itemCount, but special '3 for 2' rebates might apply.
     * 
     * Updated by the shopping basket update function.
     * 
     * No exceptions
     * 
     */
    ShoppingItem.prototype.itemsPrice = 0.0;

        /**
     * The ShoppingBasket interface provides access to a shopping basket
     *
     * 
     * The shopping basket represents a current payment action and allows to 
     * add a number of items to the basket before proceeding to checkout.
     * 
     */
    ShoppingBasket = function (obj) {

        // initialize attributes
        this.items =new Array(); 
        this.extras =new Array(); 
        this.totalBill = 0.0;        
        this.base = WebinosService;
        this.base(obj);
    };
  
    
    /**
     * List of items currently in the shopping basket.
     *
     * 
     * These are the items that have been added with addItem.
     * 
     * No exceptions
     * 
     */
    ShoppingBasket.prototype.items =  null;

    /**
     * Automatically generated extra items, typically rebates, taxes and shipping costs.
     *
     * 
     * These items are automatically added to the shopping basket by update()
     * (or after the addition of an item to the basket).
     * 
     * These items can contain such 'virtual' items as payback schemes, rebates, taxes,
     * shipping costs and other items that are calculated on the basis of the regular
     * items added.
     * 
     * No exceptions
     * 
     */
    ShoppingBasket.prototype.extras = null;

    /**
     * The total amount that will be charged to the user on checkout.
     *
     * 
     * Will be updated by update(), may be updated by addItem().
     * 
     * No exceptions
     * 
     */
    ShoppingBasket.prototype.totalBill = 0.0;

    /**
     * Adds an item to a shopping basket.
     *
     */
    ShoppingBasket.prototype.addItem = function (successCallback, errorCallback, item) {
                var arguments = new Array();
                arguments[0]=rpcServiceProviderID;
                arguments[1]=rpcCustomerID;
                arguments[2]=rpcShopID;
                arguments[3]=this;
                arguments[4]=item;
                var self = this;
                var rpc = webinos.rpcHandler.createRPC(this, "addItem", arguments);
                webinos.rpcHandler.executeRPC(rpc,
                                function (params){
                                        
                                              self.items=params.items;
                                              self.extras=params.extras;
                                              self.totalBill=params.totalBill;
                                        successCallback();
                                },
                                function (error){errorCallback(error);}
                );
    };

  /**
     * Updates the shopping basket
     *
     * 
     */
    ShoppingBasket.prototype.update = function (successCallback, errorCallback) {
                var arguments = new Array();
                arguments[0]=rpcServiceProviderID;
                arguments[1]=rpcCustomerID;
                arguments[2]=rpcShopID;
                arguments[3]=this;
                var self = this;
                var rpc = webinos.rpcHandler.createRPC(this, "update", arguments);
                webinos.rpcHandler.executeRPC(rpc,
                                function (params){                                       
                                              self.items=params.items;
                                              self.extras=params.extras;
                                              self.totalBill=params.totalBill;
                                        successCallback();
                                },
                                function (error){errorCallback(error);}
                );  
    };

   /**
     * Performs the checkout of the shopping basket.
     *
     * 
     * The items in the shopping basket will be charged to the shopper.
     * 
     * Depending on the implementation of the actual payment service, this function
     * might cause the checkout screen of the payment service provider to be displayed.
     * 
     */
    ShoppingBasket.prototype.checkout = function (successCallback, errorCallback) {
                var arguments = new Array();
                arguments[0]=rpcServiceProviderID;
                arguments[1]=rpcCustomerID;
                arguments[2]=rpcShopID;
                arguments[3]=this;
                var self = this;
                var rpc = webinos.rpcHandler.createRPC(this, "checkout", arguments);
                webinos.rpcHandler.executeRPC(rpc,
                                function (params){      
                                        // remove shopping basket after checkout                                 
                                              self=null;
                                        successCallback();
                                },
                                function (error){errorCallback(error);}
                );  
    };

 

    ShoppingBasket.prototype.release = function () {
                var arguments = new Array();
                arguments[0]=rpcServiceProviderID;
                arguments[1]=rpcCustomerID;
                arguments[2]=rpcShopID;
                arguments[3]=this;
                var self = this;
    
                 // now call thr release on the server, in case it needs to do some clean-up there                       
                var rpc = webinos.rpcHandler.createRPC(this, "release", arguments);
                webinos.rpcHandler.executeRPC(rpc,
                                function (params){ },
                                function (error){errorCallback(error);}
                );  
                 // remove shopping basket after release   
                 // actually, we could do that without the RPC call,
                 // but there might be data on the server side that
                  // needs to be released as well.
                     // would be best if we could null the object itself,
                     // but JavaScript doesn't allow this               
                                        self.items=null;
                                        self.extras=null;        
    };
            
}());

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
 * Copyright 2011 Habib Virji, Samsung Electronics (UK) Ltd
 ******************************************************************************/
(function () {
  /**
   * Webinos MediaContent service constructor (client side).
   * @constructor
   * @param obj Object containing displayName, api, etc.
   */
  MediaContentModule = function (obj) {
    this.base = WebinosService;
    this.base(obj);
  };

  MediaContentModule.prototype = new WebinosService;

  /**
   * To bind the service.
   * @param bindCB BindCallback object.
   */
  MediaContentModule.prototype.bindService = function (bindCB, serviceId) {
    this.getLocalFolders = function (successCB, errorCB) {
      var rpc = webinos.rpcHandler.createRPC(this, "getLocalFolders", []);
      webinos.rpcHandler.executeRPC(rpc,
        function (params) {
          successCB(params);
        },
        function (error) {
          errorCB(error);
        }
        );
    };
    this.findItem = function (successCB, errorCB, params) {
      "use strict";
      var rpc = webinos.rpcHandler.createRPC(this, "findItem", params);
      webinos.rpcHandler.executeRPC(rpc,
        function (params) {
          successCB(params);
        },
        function (error) {
          errorCB(error);
        }
        );
    };
    this.updateItem = function (successCB, errorCB) {
      "use strict";
      var rpc = webinos.rpcHandler.createRPC(this, "updateItem", []);
      webinos.rpcHandler.executeRPC(rpc,
        function (params) {
          successCB(params);
        },
        function (error) {
          errorCB(error);
        }
        );
    };

    this.updateItemsBatch = function (successCB, errorCB) {
      "use strict";
      var rpc = webinos.rpcHandler.createRPC(this, "updateItemBatches", []);
      webinos.rpcHandler.executeRPC(rpc,
        function (params) {
          successCB(params);
        },
        function (error) {
          errorCB(error);
        }
        );
    };

    this.getContents = function (listener, errorCB, params) {
      "use strict";
      var rpc = webinos.rpcHandler.createRPC(this, "getContents", params);//, totalBuffer = 0, data = "";
      rpc.onEvent = function (params) {
        // we were called back, now invoke the given listener
     /*   totalBuffer += params.currentBuffer;
        data += btoa(params.contents);
        if (totalBuffer === params.totalLength) {
          //photo = new Buffer(data, 'binary').toString('base64');
          window.open("data:image/png;base64"+atob(data));*/
        listener(params);
          //totalBuffer = 0;
          //data = '';
          //webinos.rpcHandler.unregisterCallbackObject(rpc);
        //}
      };

      webinos.rpcHandler.registerCallbackObject(rpc);
      webinos.rpcHandler.executeRPC(rpc);
      /*webinos.rpcHandler.executeRPC(rpc,
        function (params) {
          totalBuffer += params.currentBuffer;
          if (totalBuffer === params.totalLength) {
            successCB(params);
            totalBuffer = 0;
          }
        },
        function (error) {
          errorCB(error);
        }
        );*/
    };
  };
}());

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
 * Copyright 2011 Krishna Bangalore, TU München
 ******************************************************************************/
(function () {
  /**
   * Webinos corePZinformation service constructor (client side).
   * @constructor
   * @param obj Object containing displayName, api, etc.
   */
  corePZinformationModule = function (obj) {
    this.base = WebinosService;
    this.base(obj);
  };

  corePZinformationModule.prototype = new WebinosService;

  /**
   * To bind the service.
   * @param bindCB BindCallback object.
   */
  corePZinformationModule.prototype.bindService = function (bindCB, serviceId) {

/*Returns PZP Name*/
    this.pzpname = function (successCB, errorCB) {	 
    if (webinos.session.getSessionId()) {
          successCB(webinos.session.getSessionId());
    } else {
          errorCB("PZP Name is not set");
    } 
    };

/*Returns PZP State*/
    this.pzpstate = function (successCB, errorCB) {
     if (webinos.session.isConnected()) {
          successCB("connected =" + webinos.session.getPZHId());
    } else {
          errorCB("Enrolled to " + webinos.session.getPZHId() + "not-connected");
    } 
    };

/*Returns PZH Name*/
    this.pzhname = function (successCB, errorCB) {
      if (webinos.session.getPZHId()){
          successCB(webinos.session.getPZHId());
    } else {
          errorCB("PZH Name is not set");
    } 
    };

/*Returns PZP ID*/
    this.pzpid = function (successCB, errorCB) {
      if (webinos.session.getPZPId()){
          successCB(webinos.session.getPZPId());
    } else {
          errorCB("PZP ID is not set");
    } 
    };

  };
}());

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
 * Copyright 2013 Sony Mobile Communications
 * 
 ******************************************************************************/

(function() {

    var ListenerType = {
        TEXT : 0,
        URI : 1,
        MIME : 2
    };

    function ListenerWrapper(type, extra, listener, rpc) {
        this.type = type;
        this.extra = extra;
        this.listener = listener;
        this.rpc = rpc;
    }

    NfcModule = function(obj) {
        this.base = WebinosService;
        this.base(obj);

        this.listeners = {};
        
        this.currentTag = null;
    };

    NfcModule.prototype = new WebinosService;

    NfcModule.prototype.bindService = function(bindCB, serviceId) {
        this.textRecord = textRecord;
        this.uriRecord = uriRecord;
        this.mimeRecord = mimeRecord;
        this.addTextTypeListener = addTextTypeListener;
        this.addUriTypeListener = addUriTypeListener;
        this.addMimeTypeListener = addMimeTypeListener;
        this.removeTextTypeListener = removeTextTypeListener;
        this.removeUriTypeListener = removeUriTypeListener;
        this.removeMimeTypeListener = removeMimeTypeListener;
        this.shareTag = shareTag;
        this.unshareTag = unshareTag;
        this.launchScanningUI = launchScanningUI;
        this.dispatchEvent = dispatchEvent;
        if (typeof bindCB.onBind === 'function') {
            bindCB.onBind(this);
        }
    };

    string2byteArray = function(str) {
        var ba = [];
        for ( var i = 0; i < str.length; i++) {
            ba[i] = str.charCodeAt(i);
        }
        return ba;
    };
    
    NdefRecord = function(id, TNF, type, payload, info) {
      this.id = id;
      this.TNF = TNF;
      this.type = type;
      this.payload = payload;
      this.info = info;
    };
    
    function textRecord(text, lang) {
        var textBytes  = string2byteArray(text);
        var langBytes  = string2byteArray(lang);
        var payload = [];
        
        payload.push(langBytes.length);

        payload = payload.concat(langBytes);
        payload = payload.concat(textBytes);
        
        return new NdefRecord("", 1, "T", payload, text);  
    }

    function uriRecord(uri) {
        var uriBytes  = string2byteArray(uri);
        var payload = [];
        
        payload.push(0);
        
        payload = payload.concat(uriBytes);
        
        return new NdefRecord("", 1, "U", payload, uri);  
    }

    function mimeRecord(mimeType, data) {
        return new NdefRecord("", 2, mimeType, data, data);
    }
    

    function findListener(nfcModule, type, extra, listener) {
        for ( var handle in nfcModule.listeners) {
            var listenerWrapper = nfcModule.listeners[handle];
            if (listenerWrapper.type == type
                    && (extra != null || extra == listenerWrapper.extra)
                    && listenerWrapper.listener == listener) {
                return handle;
            }
        }
        return null;
    }
    

    function addListener(nfcModule, type, extra, listener, success, fail) {
        if (findListener(nfcModule, type, extra, listener) != null) {
            if(typeof fail !== "undefined") {
                fail("listener is already registered");
            }
        } else {
            var rpc;
            if (type == ListenerType.TEXT) {
                rpc = webinos.rpcHandler.createRPC(nfcModule,
                        "addTextTypeListener");
            } else if (type == ListenerType.URI) {
                rpc = webinos.rpcHandler.createRPC(nfcModule,
                        "addUriTypeListener", [ extra ]);
            } else if (type == ListenerType.MIME) {
                rpc = webinos.rpcHandler.createRPC(nfcModule,
                        "addMimeTypeListener", [ extra ]);
            }

            rpc.onEvent = function(tag) {
                
                tag.read = function(success, fail) {
                    if (this != nfcModule.currentTag) {
                        fail("invalid tag");
                    }
                    var rpc = webinos.rpcHandler.createRPC(nfcModule,
                            "read");
                    webinos.rpcHandler.executeRPC(rpc, function(params) {                       
                        if (typeof success !== 'undefined') {
                            success(params);
                        }
                    }, function(error) {
                        if (typeof fail !== 'undefined') {
                            fail();
                        }
                    });
                }
                
                tag.write = function(ndefmessage, success, fail) {
                    if (this != nfcModule.currentTag) {
                        fail("invalid tag");
                    }
                    var rpc = webinos.rpcHandler.createRPC(nfcModule,
                            "write", [ ndefmessage ]);
                    webinos.rpcHandler.executeRPC(rpc, function(params) {                       
                        if (typeof success !== 'undefined') {
                            success();
                        }
                    }, function(error) {
                        if (typeof fail !== 'undefined') {
                            fail();
                        }
                    });
                }
                
                tag.close = function(fail) {
                    if (this != nfcModule.currentTag) {
                        fail("invalid tag");
                    }
                    var rpc = webinos.rpcHandler.createRPC(nfcModule, "close");
                    webinos.rpcHandler.executeRPC(rpc, null, function(error) {
                        if (typeof fail !== 'undefined') {
                            fail();
                        }
                    });
                }               
                
                nfcModule.currentTag = tag;
                listener(tag);
            };

            webinos.rpcHandler.registerCallbackObject(rpc);

            webinos.rpcHandler.executeRPC(rpc, function(params) {
                nfcModule.listeners[params] = new ListenerWrapper(type, extra,
                        listener, rpc);
                if (typeof success !== 'undefined') {
                    success();
                }
            }, function(error) {
                webinos.rpcHandler.unregisterCallbackObject(rpc);
                if (typeof fail !== 'undefined') {
                    fail();
                }
            });
        }
    }

    function addTextTypeListener(listener, success, fail) {
        addListener(this, ListenerType.TEXT, null, listener, success, fail);
    }

    function addUriTypeListener(scheme, listener, success, fail) {
        addListener(this, ListenerType.URI, scheme, listener, success, fail);
    }

    function addMimeTypeListener(mimeType, listener, success, fail) {
        addListener(this, ListenerType.MIME, mimeType, listener, success, fail);
    }

    function removeListener(nfcModule, type, extra, listener) {
        var handle = findListener(nfcModule, type, extra, listener);
        if (handle != null) {
            var rpc = webinos.rpcHandler.createRPC(nfcModule, "removeListener",
                    [ handle ]);
            webinos.rpcHandler.executeRPC(rpc);
            webinos.rpcHandler.unregisterCallbackObject(nfcModule.listeners[handle].rpc);
            delete nfcModule.listeners[handle];
        }
    }

    function removeTextTypeListener(listener) {
        removeListener(this, ListenerType.TEXT, null, listener);
    }

    function removeUriTypeListener(scheme, listener) {
        removeListener(this, ListenerType.URI, scheme, listener);
    }

    function removeMimeTypeListener(mimeType, listener) {
        removeListener(this, ListenerType.MIME, mimeType, listener);
    }
    

    function shareTag(message, success, fail) {
        var rpc = webinos.rpcHandler.createRPC(this, "shareTag",
                [ message ]);
        webinos.rpcHandler.executeRPC(rpc, function() {
            if (typeof success !== 'undefined') {
                success();
            }
        }, function(err) {
            if (typeof fail !== 'undefined') {
                fail();
            }
        });
    }
    
    function unshareTag(success, fail) {
        var rpc = webinos.rpcHandler.createRPC(this, "unshareTag");
        webinos.rpcHandler.executeRPC(rpc, function() {
            if (typeof success !== 'undefined') {
                success();
            }
        }, function(err) {
            if (typeof fail !== 'undefined') {
                fail();
            }
        });
    }
    
    function launchScanningUI(autoDismiss, success, fail) {
        var rpc = webinos.rpcHandler.createRPC(this, "launchScanningUI",
                [ autoDismiss ]);
        webinos.rpcHandler.executeRPC(rpc, function() {
            if (typeof success !== 'undefined') {
                success();
            }
        }, function(err) {
            if (typeof fail !== 'undefined') {
                fail();
            }
        });
    }

    function dispatchEvent(event) {
        var rpc = webinos.rpcHandler.createRPC(this, "dispatchEvent", [ event ]);
        webinos.rpcHandler.executeRPC(rpc);
    }

}());
}