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
	var JSV = require('JSV').JSV;
	var fs = require('fs');
	var xml2js = require('xml2js');
	var schema = require('./schema.json');
	var env = JSV.createEnvironment("json-schema-draft-03");
	var xmlParser = new xml2js.Parser(xml2js.defaults["0.2"]);
	var bridge = null;
	var pmCore = null;
	var pmNativeLib = null;
	var promptMan = null;
	var policyFile = null;
	var decisionStorage = null;

        var promptTimeout = 10;

	var policyManager = function(policyFilename) {
		var self = this;
		// Load the native module
		try {
			pmNativeLib = require('pm');
		} catch (err) {
			console.log("Warning! Policy manager could not be loaded");
		}
		// Load the prompt manager
		if (os.platform()==='android') {
			bridge = require('bridge');
			promptMan = bridge.load('org.webinos.impl.PromptImpl', self);
		}
		else if (os.platform()==='win32') {
			promptMan = require('promptMan');
		}
		else {
			promptMan = new promptLib.promptManager();
		}
		//Policy file location
		policyFile = policyFilename;

		self.isAWellFormedPolicyFile(policyFile
			, function () {
				pmCore = new pmNativeLib.PolicyManagerInt(policyFile);
				//Loads decision storage module
				decisionStorage = new dslib.decisionStorage(policyFile);
				console.log("Policy file loaded");
			}
			, function () {
				console.log("Policy file is not valid");
			}
		);
	};

	policyManager.prototype.getPolicyFilePath = function() {
		return policyFile;
	}

	policyManager.prototype.enforceRequest = function(request, sessionId, noprompt) {
		if (!pmCore) {
			console.log("Invalid policy file: request denied")
			return 1;
		}
		var res = pmCore.enforceRequest(request);
		var promptcheck = true;
		if (arguments.length == 3) {
			if (noprompt == true)
				promptcheck = false;
		}

		if(res>1 && res<5) {
			// if there is a promptMan then show a message
			if (promptMan && decisionStorage && promptcheck) {
				var storedDecision = decisionStorage.checkDecision(request, sessionId);
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
						selected = promptMan.display(message, choices, promptTimeout);
                                                // promptman.display returns following negative values:
                                                // -1  ==> prompt timeout
                                                // -2  ==> generic error
						if(selected < 0 || selected == 0 || selected == 1)
							res = 1;
						if(selected == 2)
							res = 0;
						if(selected == 0) {
							decisionStorage.addDecision(request, sessionId, res, 0);
						}
					}
					else if(res==3) {
						//Prompt session
						choices[0] = "Deny always";
						choices[1] = "Deny for this session";
						choices[2] = "Deny this time";
						choices[3] = "Allow this time";
						choices[4] = "Allow for this session";
						selected = promptMan.display(message, choices, promptTimeout);
						if(selected < 0 || selected == 0 || selected == 1 || selected == 2)
							res = 1;
						if(selected == 3 || selected == 4)
							res = 0;
						if(selected == 0) {
							decisionStorage.addDecision(request, sessionId, res, 0);
						}
						if(selected == 1 || selected == 4) {
							decisionStorage.addDecision(request, sessionId, res, 1);
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
						selected = promptMan.display(message, choices, promptTimeout);
						if(selected < 0 || selected == 0 || selected == 1 || selected == 2)
							res = 1;
						if(selected == 3 || selected == 4 || selected == 5)
							res = 0;
						if(selected == 0 || selected == 5) {
							decisionStorage.addDecision(request, sessionId, res, 0);
						}
						if(selected == 1 || selected == 4) {
							decisionStorage.addDecision(request, sessionId, res, 1);
						}
					}
                                        // In case of prompt timeout take needed actions...
					if (selected == -1) {
						console.log('Policy Manager - prompt timed out');
					}
				}
			}
		}

		console.log("Policy Manager enforce request: "+JSON.stringify(request)+" - result is "+res);
		return (res);
	};

	policyManager.prototype.reloadPolicy = function () {
		self.isAWellFormedPolicyFile(policyFile
			, function () {
				pmCore.reloadPolicy();
			}
			, function () {
				console.log("Policy file is not valid");
			}
		);
	};

	policyManager.prototype.isAWellFormedPolicyFile = function (policyFilename, successCB, errorCB) {
		var data = fs.readFileSync(policyFilename);

		xmlParser.parseString(data, function (err, jsonData) {
			if (!err) {
				(env.validate(jsonData, schema).errors.length === 0) ? successCB() : errorCB();
			} else {
				errorCB();
			}
		});
	}

	exports.policyManager = policyManager;

}());
