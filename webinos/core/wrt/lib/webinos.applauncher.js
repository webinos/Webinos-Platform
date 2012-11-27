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