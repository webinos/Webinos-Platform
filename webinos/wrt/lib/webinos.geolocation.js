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

/**
 * Register a listener for position updates.
 * @param positionCB Callback for position updates.
 * @param positionErrorCB Error callback.
 * @param positionOptions Optional options.
 * @returns Registered listener id.
 */
function watchPosition(positionCB, positionErrorCB, positionOptions) {
	var watchIdKey = Math.floor(Math.random()*101);

	var rpc = webinos.rpcHandler.createRPC(this, "watchPosition", [positionOptions, watchIdKey]);
	rpc.fromObjectRef = Math.floor(Math.random()*101); //random object ID	

	var callback = new RPCWebinosService({api:rpc.fromObjectRef});
	callback.onEvent = function (position) {
		positionCB(position); 
	};
	webinos.rpcHandler.registerCallbackObject(callback);

	webinos.rpcHandler.executeRPC(rpc);

	return watchIdKey;
};

/**
 * Clear a listener.
 * @param watchId The id as returned by watchPosition to clear.
 */
function clearWatch(watchId) {
	var rpc = webinos.rpcHandler.createRPC(this, "clearWatch", [watchId]); 
	webinos.rpcHandler.executeRPC(rpc, function() {}, function() {});
};

})();