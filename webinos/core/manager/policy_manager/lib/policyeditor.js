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

	var fs = require('fs');
	var xml2js = require('xml2js');
	var convert2xml = require('data2xml')({attrProp:"$"});

	//var pm = null;
	//var policyFile = null;
	//var policySet = null;
	//var xmlParser = null;
	//var async = require('async');


	var policyEditor = function(policy, pmInstance) {
		console.log("Policy editor constructor");
		var pm = pmInstance;
		var policyFile = policy;
		var policySet = null;
		//Load the xml parser
		var xmlParser = new xml2js.Parser(xml2js.defaults["0.2"]);


		this.addRule = function(request, decision) {
			//console.log("\nPolicy Editor - addRule");
			var newTarget = createNewTarget(request);
			var newRule = createNewRule(request, decision);
			loadPolicy();
			insertRule(newTarget, newRule);
			savePolicy();
			//pm.reloadPolicy();
		}


		this.removeRule = function() {
		}


		function createNewTarget(request) {
			var result = new Array({});
			result[0].subject = new Array();
			var subjectMatch = new Array();
			if(request.subjectInfo != null) {
				if(request.subjectInfo.userId != null) {
					var user = {"$":{"attr":"user-id", "match":request.subjectInfo.userId}};
					subjectMatch.push(user);
				}
			}
			if(request.widgetInfo != null) {
				if(request.widgetInfo.id != null) {
					var user = {"$":{"attr":"id", "match":request.widgetInfo.id}};
					subjectMatch.push(user);
				}
			}
			result[0].subject[0] = {"subject-match":subjectMatch};
			return result;
		}


		function createNewRule(request, decision) {
			var result = new Array({});
			var effect;
			if (decision == 0) {
				effect = "permit";
			}
			else if(decision == 1) {
				effect = "deny";
			}
			else {
				return result;
			}
			result[0]["$"] = {"effect":effect};
			result[0]["condition"] = new Array({});
			result[0]["condition"][0]["$"] = {"combine":"or"};
			result[0]["condition"][0]["resource-match"] = new Array();
			if(request.resourceInfo != null) {
				if(request.resourceInfo.apiFeature != null) {
					var feature = {"$":{"attr":"api-feature","match":request.resourceInfo.apiFeature}};
					result[0]["condition"][0]["resource-match"].push(feature);
				}
			}
			return result;
		}


		function loadPolicy() {
			//console.log("loadPolicy - 01");
			var xmlPolicy = fs.readFileSync(policyFile);
			//console.log("loadPolicy - 02");
			//TODO: it is not clear why parseString ends in a sync way...
			xmlParser.parseString(xmlPolicy, function(err, data) {
				//console.log("loadPolicy - 05");
				policySet = data["policy-set"];
				//console.log("loadPolicy - 06");
			});
			//console.log("loadPolicy: "+JSON.stringify(policySet));
		}


		function savePolicy() {
			//console.log("savePolicy to file "+policyFile);
			var data = convert2xml("policy-set", policySet);
			//Removes line from output file
			//data = data.replace("<?xml version=\"1.0\" encoding=\"utf-8\"?>\n", "");
			fs.writeFileSync(policyFile, data);
			//console.log("savePolicy - new policy is:\n"+data);
		}


		function insertRule(target, rule) {
			//console.log("insertRule");
			//console.log("insertRule - target: "+JSON.stringify(target));
			//console.log("insertRule - rule: "+JSON.stringify(rule));
			//Scan all available policies
			var ruleAdded = false;
			var position = 0;
			for(var i in policySet.policy) {
				//console.log("insertRule - loop "+i);
				if(!ruleAdded) {
					var cmp = compareObject(policySet.policy[i].target, target);
					//cmp == 1 : the two targets are equivalent
					if(cmp == 1) {
						//console.log("insertRule: target match");
						modifyPolicyRule(i, rule[0]);
						ruleAdded = true;
					}
					//cmp == 2 : target is a superset of current policy's target
					else if(cmp == 1) {
						//console.log("insertRule: target included");
						addNewPolicy(target, rule, position);
						ruleAdded = true;
					}
				}
				position++;
			}
			if(position <= 0) {
				console.log("Error: policy does not have a default rule!");
				return;
			}
			//If not added, insert policy at the last but one place
			if(!ruleAdded) {
				addNewPolicy(target, rule, position-1);
			}
			//console.log("insertRule - 09");
		}


		function compareObject(obj1, obj2) {
			//TODO: modify this function to have better comparison and searching for obj2 included in obj1
			if(JSON.stringify(obj1) == JSON.stringify(obj2)) {
				return 1;
			}
			return 0;	//No match
		}


		function modifyPolicyRule(index, rule) {
			//console.log("modifyPolicyRule, index: "+index);
			//console.log("modifyPolicyRule, rule: "+JSON.stringify(rule));
			var ruleAdded = false;
			for(var i in policySet.policy[index].rule) {
				//console.log("modifyPolicyRule - loop "+i);
				var matchIndex = matchRule(policySet.policy[index].rule[i].condition[0]["resource-match"], rule.condition[0]["resource-match"][0]);
				//console.log("modifyPolicyRule - 03 - matchIndex is "+matchIndex);
				if(policySet.policy[index].rule[i]["$"].effect == rule["$"].effect) {
					//console.log("modifyPolicyRule - 04");
					//If a rule with the same effect is present and there's no match
					//for the resource, then add it
					if(matchIndex == -1) {
						policySet.policy[index].rule[i].condition[0]["resource-match"].push(rule.condition[0]["resource-match"][0]);
					}
					ruleAdded = true;
				}
				else {
					//console.log("modifyPolicyRule - 06");
					//If the same resource is present with a different effect,
					//then remove the old one
					if(matchIndex != -1) {
						policySet.policy[index].rule[i].condition[0]["resource-match"].splice(matchIndex, 1);
					}
				}
			} 
			if(!ruleAdded) {
				//If no rule with the same effect has been found, then add the new rule
				//console.log("modifyPolicyRule - 08");
				policySet.policy[index].rule.push(rule);
			}
			//console.log("modifyPolicyRule - end");
		}


		function matchRule(ruleArray, rule) {
			//console.log("matchRule - array: "+JSON.stringify(ruleArray));
			//console.log("matchRule - rule to match: "+JSON.stringify(rule));
			for(var i in ruleArray) {
				//console.log("matchRule - compare "+rule+" with "+ruleArray[i]);
				//if(ruleArray[i] == rule) {
				if(compareObject(ruleArray[i], rule) == 1) {
					return i;
				}
			}
			return -1;
		}


		function addNewPolicy(target, rule, position) {
			//console.log("addNewPolicy - target: "+JSON.stringify(target));
			//console.log("addNewPolicy - rule: "+JSON.stringify(rule));
			//Create the new policy
			var newPolicy = {};
			newPolicy["$"] = {"combine":"first-applicable","description":"default"};
			newPolicy.target = target;
			newPolicy.rule = rule;
			if (rule[0]['$'].effect === 'permit') {
				newPolicy.DataHandlingPreferences = {
					"$": {PolicyId:'#DHP_allow_all'},
					AuthorizationsSet:{
						AuthzUseForPurpose:{
							Purpose:{ }
						}
					}
				};
				newPolicy.ProvisionalActions = {
					ProvisionalAction:[
						{AttributeValue:[
							'#DHP_allow_all',
							'http://webinos.org'
						]},
						{AttributeValue:[
							'#DHP_allow_all',
							'http://www.w3.org'
						]},
						{AttributeValue:[
							'#DHP_allow_all',
							'http://wacapps.net'
						]}
					]
				};
			}
			//Insert policy at the end of the policy set
			policySet.policy.splice(position, 0, newPolicy);
		}
	};


	exports.policyEditor = policyEditor;

}());

