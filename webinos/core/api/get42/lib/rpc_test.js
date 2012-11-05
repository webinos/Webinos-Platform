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
var RPCWebinosService = require("webinos-jsonrpc2").RPCWebinosService;

var TestApiModule = function(rpcHandler, params) {
	this.rpcHandler = rpcHandler;
	this.params = params;
};

TestApiModule.prototype.init = function (register, unregister) {
	var service = new TestService(this.rpcHandler, this.params);
	register(service);
};

/**
 * Webinos Get42 service constructor (server side).
 * 
 * This is an example, useful as a guide or writing a new service implementation.
 * @constructor
 * @alias TestService
 * @param rpcHandler A handler for functions that use RPC to deliver their result.
 * @param params Parameters to initialize the service.
 */
var TestService = function(rpcHandler, params) {
	// inherit from RPCWebinosService
	this.base = RPCWebinosService;
	this.base({
		api:'http://webinos.org/api/test',
		displayName:'Test',
		description:'Test Module with the life answer.'
	});
	
	// member attribute
	this.testAttr = "Hello Attribute";

	// member attribute 
	this.listenAttr = {};
	
	// custom get42 attribute
	this.blaa = typeof params === 'object' && typeof params.num !== 'undefined' ? params.num : 42;

	/**
	 * Invoke the registered listener twice with a constant number value. 
	 * @param params Optional parameters.
	 * @param successCB Success callback.
	 * @param errorCB Error callback.
	 * @param objectRef RPC object reference.
	 */
	this.listenAttr.listenFor42 = function(params, successCB, errorCB, objectRef){
		console.log("listenerFor42 was invoked");
		
		// use RPC to deliver result
		var rpc = rpcHandler.createRPC(objectRef, 'onEvent', {msg: "42"});
		rpcHandler.executeRPC(rpc);
	};
}

TestService.prototype = new RPCWebinosService;

/**
 * Get the value of an internal property and whatever was sent as params.
 * @param params Array with parameters.
 * @param successCB Success callback.
 * @param errorCB Error callback.
 */
TestService.prototype.get42 = function(params, successCB, errorCB){
	console.log("get42 was invoked");
	successCB(this.blaa + " " + params[0]);
}

// export our object
exports.Module = TestApiModule;

})();