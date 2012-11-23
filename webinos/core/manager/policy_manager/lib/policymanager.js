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

	var os = require('os');
	var promptLib = require('../src/promptMan/promptManager.js');
	var dslib = require('./decisionstorage.js');
	var bridge = null;
	var pmCore = null;
	var pmNativeLib = null;
	var promptMan = null;
	var policyFile = null;
	var decisionStorage = null;


	var policyManager = function(policyFilename) {
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
        	policyFile = policyFilename;
		this.pmCore = new this.pmNativeLib.PolicyManagerInt(policyFile);
		//Loads decision storage module
		this.decisionStorage = new dslib.decisionStorage(policyFile);
	};

	policyManager.prototype.getPolicyFilePath = function() {
		return policyFile;
	}

	policyManager.prototype.enforceRequest = function(request, sessionId, noprompt) {
		var res = this.pmCore.enforceRequest(request);
		var promptcheck = true;
		if (arguments.length == 3) {
			if (noprompt == true)
				promptcheck = false;
		}

		if(res>1 && res<5) {
			// if there is a promptMan then show a message
			if (this.promptMan && this.decisionStorage && promptcheck) {
				var storedDecision = this.decisionStorage.checkDecision(request, sessionId);
				if(storedDecision == 0 || storedDecision == 1) {
					res = storedDecision;
				}
				else {
					var message = request.subjectInfo.userId+" is requesting access to feature "+request.resourceInfo.apiFeature;
					var choices = new Array();
					var selected;
					if(res == 2) {
						//Prompt oneshot
						choices[0] = "Deny always";
						choices[1] = "Deny this time";
						choices[2] = "Allow this time";
						selected = this.promptMan.display(message, choices);
						if(selected == 0 || selected == 1)
							res = 1;
						if(selected == 2)
							res = 0;
						if(selected == 0) {
							this.decisionStorage.addDecision(request, sessionId, res, 0);
						}
					}
					else if(res==3) {
						//Prompt session
						choices[0] = "Deny always";
						choices[1] = "Deny for this session";
						choices[2] = "Deny this time";
						choices[3] = "Allow this time";
						choices[4] = "Allow for this session";
						selected = this.promptMan.display(message, choices);
						if(selected == 0 || selected == 1 || selected == 2)
							res = 1;
						if(selected == 3 || selected == 4)
							res = 0;
						if(selected == 0) {
							this.decisionStorage.addDecision(request, sessionId, res, 0);
						}
						if(selected == 1 || selected == 4) {
							this.decisionStorage.addDecision(request, sessionId, res, 1);
						}
					}
					else {
						//Prompt blanket
						choices[0] = "Deny always";
						choices[1] = "Deny for this session";
						choices[2] = "Deny this time";
						choices[3] = "Allow this time";
						choices[4] = "Allow for this session";
						choices[5] = "Allow always";
						selected = this.promptMan.display(message, choices);
						if(selected == 0 || selected == 1 || selected == 2)
							res = 1;
						if(selected == 3 || selected == 4 || selected == 5)
							res = 0;
						if(selected == 0 || selected == 5) {
							this.decisionStorage.addDecision(request, sessionId, res, 0);
						}
						if(selected == 1 || selected == 4) {
							this.decisionStorage.addDecision(request, sessionId, res, 1);
						}
					}
				}
			}
		}

		console.log("Policy Manager enforce request: "+JSON.stringify(request)+" - result is "+res);
		return (res);
	};

	policyManager.prototype.reloadPolicy = function() {
		this.pmCore.reloadPolicy();
		return;
	};

	exports.policyManager = policyManager;

}());

