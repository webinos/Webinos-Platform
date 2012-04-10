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

	/**
	 * Webinos AppLauncher service constructor (server side).
	 * @constructor
	 * @param rpcHandler A handler for functions that use RPC to deliver their result.  
	 */
	var WebinosAppLauncherModule = function(rpcHandler) {
		// inherit from RPCWebinosService
		this.base = RPCWebinosService;
		this.base({
			api:'http://webinos.org/api/applauncher',
			displayName:'AppLauncher API',
			description:'The AppLauncher API for starting applications.'
		});
	};
	
	WebinosAppLauncherModule.prototype = new RPCWebinosService;

	/**
	 * Launch an application.
	 * @param params Params.
	 * @param successCB Success callback.
	 * @param errorCB Error callback.
	 * @param objectRef RPC object reference.
	 */
	WebinosAppLauncherModule.prototype.launchApplication = function (params, successCB, errorCB, objectRef){
		console.log("launchApplication was invoked. AppID: " +  params.applicationID + " Parameters: " + params.params);
		
		var startUpLine = params.applicationID;
		
		var i;
		if (typeof params.params !== 'undefined'){
			for (i = 0; i < params.params.length; i++){
				startUpLine = startUpLine + " " + params.params[i];
			}
		}
		
		console.log("AppLauncher trying to launch: " + startUpLine);
		
		var exec = require('child_process').exec;
		exec(startUpLine, function callback(error, stdout, stderr){
		    console.log("Result: " + error + " " + stdout + " " + stderr);
		    
		    if (error != null){
		    	errorCB();
		    }
		    else {
		    	successCB();
		    } 
		    	
		});
		
	};

	
	/**
	 * Determine whether an app is available.
	 * 
	 * [not yet implemented.]
	 */
	WebinosAppLauncherModule.prototype.appInstalled = function (params, successCB, errorCB, objectRef){
		console.log("appInstalled was invoked");
	};


	exports.Service = WebinosAppLauncherModule;

})();
