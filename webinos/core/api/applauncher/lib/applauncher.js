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
	var exec = require('child_process').exec;
	

	var androidLauncher = null;
		
	if(process.platform=='android')
	{
		androidLauncher = require('bridge').load('org.webinos.impl.AppLauncherManagerImpl', this);
	}



var dependencies = require("find-dependencies")(__dirname)	
var pzp = dependencies.global.require(dependencies.global.pzp.location,
    "lib/pzp.js")

	/**
	 * Webinos AppLauncher service constructor (server side).
	 * @constructor
	 * @alias WebinosAppLauncherModule
	 * @param rpcHandler A handler for functions that use RPC to deliver their result.  
	 */
	var WebinosAppLauncherModule = function(rpcHandler, params) {
		// inherit from RPCWebinosService
		this.base = RPCWebinosService;
		this.base({
			api:'http://webinos.org/api/applauncher',
			displayName:'AppLauncher API',
			description:'The AppLauncher API for starting applications.'
		});

		this.browserExecPath = undefined;
		if (params.browserExecPath) {
			this.browserExecPath = params.browserExecPath;

		} else {
			var that = this;
			if (process.platform === 'win32') {
				exec('reg query HKCR\\http\\shell\\open\\command -ve', function(err, stdout, stderr) {
					if (err) return;

					that.browserExecPath = stdout.split('\r\n')[2].split('    ')[3];
					if (/--/.test(that.browserExecPath)) {
						that.browserExecPath = that.browserExecPath.split('--')[0];
					}
				});
			} else if (process.platform === 'linux') {
				this.browserExecPath = 'xdg-open';
			}
		}
	};

	WebinosAppLauncherModule.prototype = new RPCWebinosService;

	/**
	 * Launch an application.
	 * @param params Params.
	 * @param successCB Success callback.
	 * @param errorCB Error callback.
	 */
	WebinosAppLauncherModule.prototype.launchApplication = function (params, successCB, errorCB){
		console.log("launchApplication was invoked. AppID: " +  params.applicationID + " Parameters: " + params.params);
		
		if(process.platform=='android'){
			  androidLauncher.launchApplication(
				  function (res) {
				  	successCB();
				  }, 
				  function (err) {
					errorCB(err)
				  },
				  params.applicationID 
			  );
			  return;
		}

		
		if (endsWith(params.applicationID, ".wgt")){
			
			var path = pzp.session.getWebinosPath() + "/" + params.applicationID;
			console.log("LAUNCHING: " + path)
			
			exec(path, function(error, stdout, stderr){
				console.log("Result: " + error + " " + stdout + " " + stderr);

				if (error && typeof errorCB === "function") {
					errorCB();
					return;
				}

				successCB();
			});
			return;
		}

		if (!/^http[s]?:\/{2}/.test(params.applicationID) || !this.browserExecPath) {
			console.log("applauncher: only http[s] AppIds are allowed or no browser available.");
			if (typeof errorCB === "function") {
				errorCB();
			}
			return;
		}
		
		var cmdLine = this.browserExecPath.concat(' ', params.applicationID);
		console.log("AppLauncher trying to launch: " + cmdLine);
		
		exec(cmdLine, function(error, stdout, stderr){
			console.log("Result: " + error + " " + stdout + " " + stderr);

			if (error && typeof errorCB === "function") {
				errorCB();
				return;
			}

			successCB();
		});
	};
	
	/**
	 * Determine whether an app is available.
	 * 
	 * [not yet implemented.]
	 */
	WebinosAppLauncherModule.prototype.appInstalled = function (params, successCB, errorCB){
		console.log("appInstalled was invoked");
		errorCB();
	};
	
	function endsWith(str, suffix) {
		console.log(str + " with " + suffix);
		return str.indexOf(suffix, str.length - suffix.length) !== -1;
	}

	exports.Service = WebinosAppLauncherModule;

})();
