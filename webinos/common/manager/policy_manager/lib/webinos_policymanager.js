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
 * Copyright 2011 Telecom Italia SpA
 * 
 ******************************************************************************/


(function () {
	"use strict";

	var policyManager,
	exec = require('child_process').exec;
	var os = require('os');
	var bridge = null;
	var promptMan = null;

	policyManager = function() {
		// Load the native module
		if (os.platform()==='android') {
			this.pmNativeLib = require('pm'); 
			this.bridge = require('bridge');
			this.promptMan = this.bridge.load('org.webinos.impl.PromptImpl', this);
		}
		else {
			//this.pmNativeLib = (process.versions.node < "0.6.0" ) ? require('../src/build/default/pm.node') : require('../src/build/Release/pm.node');
			try {
				this.pmNativeLib = process.binding('pm');
			} catch (err) {
				console.log(err);
			}

			if (os.platform()==='win32'){				
				//this.promptMan = require('../src/promptMan/build/Release/promptMan.node');
				this.promptMan = require('promptMan');
			}
		}
		this.pmCore = new this.pmNativeLib.PolicyManagerInt();
	};

	policyManager.prototype.enforceRequest = function(request, errorCallback, successCallback /*, successCallbackParams*/ ) {
		var res = this.pmCore.enforceRequest(request);
		if (arguments.length > 1) {

			var successCallbackParams = Array.prototype.slice.call(arguments).splice(3);

			switch(res) {
				case 0:		successCallback.apply(this, successCallbackParams);
						break;

				case 1:		errorCallback("SECURITY_ERR: " + res);
						break;

				case 2:
				case 3:
				case 4:		var child = exec("xmessage -buttons allow,deny -print 'Access request to " + request.resourceInfo.apiFeature  + "'",
							function (error, stdout, stderr) {	
								if (stdout === "allow\n") {
									successCallback.apply(this, successCallbackParams);
								}
								else {
									errorCallback("SECURITY_ERR: " + res);
								}
							});
						break;

				default:	errorCallback("SECURITY_ERR: " + res);
			}
		}
		else {
			if(res>1) {
				if (this.promptMan) { // if there is a promptMan then show a message
					var message = request.subjectInfo.userId+" is requesting access to feature "+request.resourceInfo.apiFeature;
					var choices = new Array();
					choices[0] = "Allow";
					choices[1] = "Deny";
					res = this.promptMan.display(message, choices);
				}
			}
		}
		return (res);
	};

	policyManager.prototype.reloadPolicy = function() {
		this.pmCore.reloadPolicy();
		return;
	};

	exports.policyManager = policyManager;

}());
