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
 * Copyright 2012 Telecom Italia SpA
 * 
 ******************************************************************************/


(function () {
	"use strict";

	var os = require('os');
	var fs = require('fs');
	var path = require('path');

	var pmNativeLib = require('pm');
	var pe = require('./policyeditor.js');


	var decisionStorage = function(policyFile) {
		console.log("Decision storage constructor");

		var policyPath = policyFile;
		//Decision files locations
		var decisionFilePermanent = path.join(path.dirname(policyPath), "decisionpermanent.xml");
		var decisionFileSession = new Array();
		console.log("Permanent file is "+decisionFilePermanent);

		//Remove session decision file at startup
		var fileList = fs.readdirSync(path.dirname(policyPath));
		for(var j in fileList) {
			if(fileList[j].indexOf("decisionsession_") == 0) {
				fs.unlinkSync(path.join(path.dirname(policyPath), fileList[j]));
			}

		}
		
		//If permanent file not present, create it
		var existsSync = fs.existsSync || path.existsSync;
		if(!existsSync(decisionFilePermanent)) {
			resetDecisionFile(decisionFilePermanent);
		}

		//Native pm module instance
		var pmCorePermanent = new pmNativeLib.PolicyManagerInt(decisionFilePermanent);
		var pmCoreSession = new Array();

		//Policy editor instances
		var peCorePermanent = new pe.policyEditor(decisionFilePermanent, pmCorePermanent);
		var peCoreSession = new Array();


		this.checkDecision = function(request, sessionId) {
			//console.log("Decision storage - checkDecision for "+JSON.stringify(request));
			var sessionIdInt = sessionId;
			if(sessionId == null) {
				sessionIdInt = "__default__";
			}
			//Check if session module are present; if not, instantiate them
			//console.log("checkDecision - session is "+sessionIdInt);
			if(decisionFileSession[sessionIdInt] == null) {
				//console.log("checkDecision - new session");
				decisionFileSession[sessionIdInt] = path.join(path.dirname(policyPath), "decisionsession_"+sessionIdInt+".xml");
				resetDecisionFile(decisionFileSession[sessionIdInt]);
				pmCoreSession[sessionIdInt] = new pmNativeLib.PolicyManagerInt(decisionFileSession[sessionIdInt]);
				peCoreSession[sessionIdInt] = new pe.policyEditor(decisionFileSession[sessionIdInt], pmCoreSession[sessionIdInt]);
			}
			var res = 5; // Undetermined
			res = pmCorePermanent.enforceRequest(request);
			//console.log("Decision storage - checkDecision permanent returns "+res);
			// res > 1 means no decision taken
			if(res > 1) {
				//console.log("Decision storage - checkDecision in session");
				res = pmCoreSession[sessionIdInt].enforceRequest(request);
			}
			return res;
		}


		this.addDecision = function(request, sessionId, decision, storage) {
			//console.log("Decision storage - addDecision");
			var sessionIdInt = sessionId;
			if(sessionId == null) {
				sessionIdInt = "__default__";
			}
			if((decision != 0) && (decision != 1)) {
				console.log("Decision storage - can store only allow or deny decisions");
				return;
			}
	
			if(storage == 0) {
				//console.log("Decision storage - addDecision - permanent storage");
				// storage == 0 is permanent storage
				peCorePermanent.addRule(request, decision);
				pmCorePermanent.reloadPolicy();
			}
			else if (storage == 1) {
				//console.log("Decision storage - addDecision - session storage");
				// storage == 1 is session storage
				if(decisionFileSession[sessionIdInt] == null) {
					console.log("addDecision: no session data present!");
					return;
				}
				peCoreSession[sessionIdInt].addRule(request, decision);
				pmCoreSession[sessionIdInt].reloadPolicy();
			}
			else {
				console.log("Decision storage - wrong storage type");
				return;
			}
		}


		function resetDecisionFile(filename) {
			var data = "<policy-set combine=\"first-matching-target\" description=\"decisionfile\">\n";
			data += "\t<policy combine=\"first-applicable\" description=\"default\">\n";
			data += "\t\t<rule effect=\"prompt-blanket\"></rule>\n";
			data += "\t</policy>\n";
			data += "</policy-set>";
			fs.writeFileSync(filename, data);
		}
	};


	exports.decisionStorage = decisionStorage;

}());

