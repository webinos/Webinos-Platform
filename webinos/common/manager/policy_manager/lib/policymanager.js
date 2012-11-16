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

    var exec = require('child_process').exec;
    var os = require('os');
    var path = require('path');
    var dependencies= require('find-dependencies')(__dirname);
    var webinosPath = dependencies.local.require(dependencies.local.pzp.location).getWebinosPath();
    var promptLib = dependencies.local.require(dependencies.local.manager.policy_manager.location,'src/promptMan/promptManager.js');
    var bridge = null;
    var pmCore = null;
    var pmNativeLib = null;
    var promptMan = null;
    var policyFile = null;


	var policyManager = function() {
		// Load the native module
		try {
			this.pmNativeLib = require('pm');
		} catch (err) {
			console.log("Warning! Policy manager could not be loaded");
		}
		// Load the prompt manager
		if (os.platform()==='android') {
			this.bridge = require('bridge');
			this.promptMan = this.bridge.load('org.webinos.impl.PromptImpl', this);
		}
		else if (os.platform()==='win32') {
			this.promptMan = require('promptMan');
		}
		else {
			this.promptMan = new promptLib.promptManager();
		}
		//Policy file location
        	policyFile = path.join(webinosPath,"policies", "policy.xml");
		this.pmCore = new this.pmNativeLib.PolicyManagerInt(policyFile);
	};

	policyManager.prototype.getPolicyFilePath = function() {
		return policyFile;
	}

	policyManager.prototype.enforceRequest = function(request, noprompt) {
		var res = this.pmCore.enforceRequest(request);
		var promptcheck = true;
		if (arguments.length == 2) {
			if (noprompt == true)
				promptcheck = false;
		}

        if(res>1 && res<5) {
           if (this.promptMan && promptcheck) { // if there is a promptMan then show a message
               var message = request.subjectInfo.userId+" is requesting access to feature "+request.resourceInfo.apiFeature;
               var choices = new Array();
               choices[0] = "Allow";
               choices[1] = "Deny";
               res = this.promptMan.display(message, choices);
           }
        }

		return (res);
	};

	policyManager.prototype.reloadPolicy = function() {
		this.pmCore.reloadPolicy();
		return;
	};

    require('./rpcInterception.js');
	exports.policyManager = policyManager;

}());

