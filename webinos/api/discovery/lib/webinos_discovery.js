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
* Copyright 2012 Samsung Electronics(UK) Ltd
* 
******************************************************************************/

(function() {
	
	"use strict";
	
	var discoverymodule = '';
	

	if(process.platform!=='android')
	{
		 discoverymodule = require('webinos_discovery_linux');
	}
	else  
	{
		discoverymodule = require('webinos_discovery_general');
		var hrmmodule = require('webinos_discovery_hrm');
	} 
	
	/**
	 * Webinos Bluetooth Discovery service constructor (server side).
	 * @constructor
	 * @param rpcHandler A handler for functions that use RPC to deliver their result.  
	 */
	var DiscoveryModule = function (rpcHandler) {
			this.base = RPCWebinosService;
			this.base({
				api:'http://webinos.org/api/discovery',
				displayName:'Bluetooth discovery manager',
				description:'A simple bluetooth discovery manager'
			});
	}
	DiscoveryModule.prototype = new RPCWebinosService;

	DiscoveryModule.prototype.BTauthenticate = function (params, successCB)
	{
		discoverymodule.BTauthenticate(params,successCB);
	}

	/**
	 * To find devices that support the specific service. This applies to both Android and Linux
	 * @param data Service type.
	 * @param successCallback Success callback.
	 */
	DiscoveryModule.prototype.BTfindservice = function(data, successCallback){

			discoverymodule.BTfindservice(
				data, successCallback);   
	}
	
	/**
	 * To find Heart Rate Monitor device, only support Android OS.
	 * @param data Service type.
	 * @param successCallback Success callback.
	 */
	DiscoveryModule.prototype.findHRM = function(data, successCallback){

			hrmmodule.HRMfindservice(
				data, successCallback); 
	}

	/**
	 * To bind with found device that has the service requested. It lists all 
	 * file folders in the device.
	 * @param data Device address.
	 * @param successCallback Success callback.
	 */
	DiscoveryModule.prototype.bindservice = function(data, successCallback){
			
			discoverymodule.BTbindservice(
					data, successCallback);   
	}
	
	/**
	 * To get file list of selected folder in the bonded device
	 * @param data File folder.
	 * @param successCallback Success callback.
	 */
	DiscoveryModule.prototype.listfile = function(data, successCallback){
		
			discoverymodule.BTlistfile(
					data, successCallback);
	}
	
	/**
	 * To transfer selected file from the bonded device
	 * @param data Selected file.
	 * @param successCallback Success callback.
	 */
	DiscoveryModule.prototype.transferfile = function(data, successCallback){

			discoverymodule.BTtransferfile(
					data, successCallback);
	} 

	exports.Service = DiscoveryModule;
	
})();
