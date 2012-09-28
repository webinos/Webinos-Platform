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
