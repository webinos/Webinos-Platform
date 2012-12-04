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

(function() {
        "use strict";

var featureList;
var subjectList;

var featureListTmp;
var subjectListTmp;

var http = require('http');
var fs = require('fs');
var os = require('os');
var path = require('path');
var url = require('url');
var util = require('util');
var pm;
var rootPath;


// FILE NAMES DEFINITIONS
var policyFile = null;
var subjectsFile = path.join(__dirname, "subjects.json");
var subjectsFileBackup = path.join(__dirname, "subjects.json.bak");
var featuresFile = path.join(__dirname, "features.json");
var featuresFileBackup = path.join(__dirname, "features.json.bak");

var policyViewer = null;

/*
// Console.log redefinition
if (os.platform()=='android') {
	console.log = function(dataLog) {
		var id = fs.openSync("/sdcard/console.log", "a");
		fs.writeSync(id, dataLog+"\n", null, 'utf8');
		fs.closeSync(id);
	}
}
*/

	policyViewer = function(pmInstance) {

	pm = pmInstance;
	policyFile = pm.getPolicyFilePath();

http.createServer(function(request, response){

	var parsedUrl = url.parse(request.url, true);
	var reqpath = parsedUrl.pathname;
	var subjectData = parsedUrl.query.subject;
	var featureData = parsedUrl.query.feature;
	console.log("Request received for path "+reqpath);
	if (reqpath=="/writePolicy") {
		// Writes the current policy to policy file and saves settings (in json files)
		writePolicyFile();
		sendResponse(response, "");
	}
	else if (reqpath=="/getPolicyTable") {
		readFeaturesArray();
		readSubjectArray();
		writePolicyFile();
		// Builds the policy table and returns it as a json object
		sendResponse(response, getPolicyTable());
	}
	else if (reqpath=="/getSubjectData") {
		sendResponse(response, JSON.stringify(subjectListTmp));
	}
	else if (reqpath=="/postSubjectData") {
		//console.log(subjectData);
		fs.writeFileSync(subjectsFile, subjectData);
		sendResponse(response, "");
	}
	else if (reqpath=="/getFeatureData") {
		sendResponse(response, JSON.stringify(featureListTmp));
	}
	else if (reqpath=="/postFeatureData") {
		//console.log(featureData);
		fs.writeFileSync(featuresFile, featureData);
		sendResponse(response, "");
	}
	else {
		var filename = path.join(__dirname, "../../../../web_root/testbed/policy", reqpath);
		fs.readFile(filename, function(err, file) {
			if(err) {
				console.log("Error: file "+filename+" not found");
				sendResponse(response, "Not found error");
				return;
			}
			sendResponse(response, file);
		});
	};
	
}).listen(7777);

console.log("server initialized"); 


function sendResponse(response, data) {
	response.writeHead(200, { 'Content-Type': 'text/html' });
	response.end(data, "utf-8");
}


function getPolicyTable() {
	//console.log("getPolicyTable");
	var policyTable = {};
	var users = new Array();

	pm.reloadPolicy();

	for(var i=0; i<subjectList.subjects.length; i++) {
		var userTmp = getUserTable(subjectList.subjects[i].userid, subjectList.subjects[i].apps);
		users.push(userTmp);
	}

	policyTable.users = users;
	return JSON.stringify(policyTable);
}


function getUserTable(userId, apps) {
	//console.log("getUserTable - "+userId);
	var userData = {};
	userData.id = userId;
	var userApps = new Array();
	for(var i=0; i<apps.length; i++) {
		var appTmp = getAppTable(userId, apps[i].id);
		userApps.push(appTmp);
	}
	userData.apps = userApps;
	return userData;
}


function getAppTable(userId, app) {
	//console.log("getAppTable - "+app);
	var userApp = {};
	userApp.id = app;
	var appFeatures = new Array();
	for(var i=0; i<featureList.features.length; i++) {
		var featTmp = {};
		featTmp.name = featureList.features[i].name;
		featTmp.res = checkFeature(featureList.features[i].name, userId, app);
		appFeatures.push(featTmp);
	}
	userApp.features = appFeatures;
	return userApp;
}


function checkFeature(featureName, userId, appId) {
	var res;
	var req = {};
	req.subjectInfo = {};
	req.widgetInfo = {};
	req.resourceInfo = {};
	req.subjectInfo.userId = userId;
	req.widgetInfo.id = appId;
	req.resourceInfo.apiFeature = featureName;
	res = pm.enforceRequest(req, "testSession", true);
	return(ruleEffectDescription(res));
	//return(res);
}

function ruleEffectDescription(num) {
	if(num == 0)
		return "PERMIT";
	if(num == 1)
		return "DENY";
	if(num == 2 || num == 3 || num == 4)
		return "PROMPT";
	return "UNDETERMINED";
/*
	if(num == 2)
		return "PROMPT_ONESHOT";
	if(num == 3)
		return "PROMPT_SESSION";
	if(num == 4)
		return "PROMPT_BLANKET";
	if(num == 5)
		return "UNDETERMINED";
	return "INAPPLICABLE";
*/
}

function writePolicyFile() {
	//console.log("writePolicyFile");
	//TODO: add param for policy description
	var fileContent = "<policy-set combine=\"first-matching-target\" description=\"\">\n";
	for(var i=0; i<subjectList.subjects.length; i++) {
		var data=writePolicyUser(subjectList.subjects[i].userid, subjectList.subjects[i].usertrust, subjectList.subjects[i].devices, subjectList.subjects[i].apps);
		fileContent+=data;
	}
	fileContent+="\t<policy combine=\"first-applicable\" description=\"denytherest\">\n";
	fileContent+="\t\t<rule effect=\"deny\"></rule>\n";
	fileContent+="\t</policy>\n";
	fileContent+="</policy-set>\n";
	fs.writeFileSync(policyFile, fileContent);
	savePolicyData();
	//console.log("writePolicyFile - END");
}

function writePolicyUser(userId, userTrust, devices, apps) {
	//TODO: at the moment devices are ignored...
	//console.log("writePolicyUser: "+userId+", "+userTrust);
	var fileContent="";
	for(var i=0; i<apps.length; i++) {
		var data= writePolicyUserApp(userId, userTrust, apps[i].id, apps[i].trust);
		//console.log("writePolicyUser: "+data);
		fileContent+=data;
	}
	//console.log("writePolicyUser - END");
	return fileContent;
}


function writePolicyUserApp(userId, userTrust, appId, appTrust) {
	//console.log("writePolicyUserApp: "+appId+", "+appTrust);
	var fileContent = "\t<policy combine=\"first-applicable\" description=\""+userId+"-"+appId+"\">\n";
	// Subjects of the policy
	fileContent += "\t\t<target>\n";
	fileContent += "\t\t\t<subject>\n";
	fileContent += "\t\t\t\t<subject-match attr=\"user-id\" match=\""+userId+"\"/>\n";
	if(appId != "__default__") {
		fileContent += "\t\t\t\t<subject-match attr=\"id\" match=\""+appId+"\"/>\n";
	}
	fileContent += "\t\t\t</subject>\n";
	fileContent += "\t\t</target>\n";
	// Permit rules
	fileContent += "\t\t<rule effect=\"permit\">\n";
	fileContent += "\t\t\t<condition combine=\"or\">\n";
	fileContent += writeMatchingFeatures(0, userTrust, appTrust);
	fileContent += "\t\t\t</condition>\n";
	fileContent += "\t\t</rule>\n";
	// Prompt rules
	fileContent += "\t\t<rule effect=\"prompt-blanket\">\n";
	fileContent += "\t\t\t<condition combine=\"or\">\n";
	fileContent += writeMatchingFeatures(2, userTrust, appTrust);
	fileContent += "\t\t\t</condition>\n";
	fileContent += "\t\t</rule>\n";

	// Deny rules (all the rest)
	fileContent += "\t\t<rule effect=\"deny\"></rule>\n";
	fileContent += "\t</policy>\n";
	return fileContent;
	//console.log("writePolicyUserApp - END");
}

function writeMatchingFeatures(ruleEffect, userTrust, appTrust) {
	//console.log("writeMatchingFeatures: "+ruleEffect);
	var fileContent="";
	for(var i=0; i<featureList.features.length;i++) {
		//console.log("writeMatchingFeatures: "+featureList.features[i].feature+", "+featureList.features[i].permissions[userTrust][appTrust]);
		if(featureList.features[i].permissions[userTrust][appTrust] == ruleEffect) {
			//console.log("writeMatchingFeatures: MATCHED");
			fileContent+="\t\t\t\t<resource-match attr=\"api-feature\" match=\""+featureList.features[i].name+"\"/>\n";
		}
	}
	return fileContent;
}


function readFeaturesArray() {
	var data;
	try {
		data=fs.readFileSync(featuresFile);
	}
	catch(e) {
		copyFile(featuresFileBackup, featuresFile);
		data=fs.readFileSync(featuresFile);
	}
	featureList=JSON.parse(data);
	featureListTmp = featureList;
}


function readSubjectArray() {
	var data;
	try {
		data=fs.readFileSync(subjectsFile);
	}
	catch(e) {
		copyFile(subjectsFileBackup, subjectsFile);
		data=fs.readFileSync(subjectsFile);
	}
	subjectList=JSON.parse(data);
	subjectListTmp = subjectList;
}


function savePolicyData() {
	var subjectData = JSON.stringify(subjectList);
	fs.writeFileSync(subjectsFile, subjectData);
	var featureData = JSON.stringify(featureList);
	fs.writeFileSync(featuresFile, featureData);
}


function copyFile(source, destination) {
        fs.writeFileSync(destination, fs.readFileSync(source));
}


	};

	exports.policyViewer = policyViewer;

}());

