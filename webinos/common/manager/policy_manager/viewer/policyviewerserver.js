
var featureList;
var subjectList;

var featureListTmp;
var subjectListTmp;

var http = require('http');
var fs = require('fs');
var os = require('os');
var url = require('url');
var util = require('util');
var common = require('../../../../pzp/lib/session_common');
var pmlib = require('../lib/policymanager.js');
var pm;
var rootPath;

// FILE NAMES DEFINITIONS
var policyFile = common.webinosConfigPath()+"/policy.xml";
var subjectsFile = "./subjects.json";
var subjectsFileBackup = "./subjects.json.bak";
var featuresFile = "./features.json";
var featuresFileBackup = "./features.json.bak";

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


try {
	// TODO: add a parameter to start policyManager without prompt
	pm = new pmlib.policyManager();
	console.log("Policy manager: load success...");
}
catch(e) {
	console.log("Policy manager: load error: "+e.message);
	return;
}

http.createServer(function(request, response){

	var parsedUrl = url.parse(request.url, true);
	var path = parsedUrl.pathname;
	var subjectData = parsedUrl.query.subject;
	var featureData = parsedUrl.query.feature;
	console.log("Request received for path "+path);
	if (path=="/writePolicy") {
		// Writes the current policy to policy file and saves settings (in json files)
		writePolicyFile();
		sendResponse(response, "");
	}
	else if (path=="/getPolicyTable") {
		readFeaturesArray();
		readSubjectArray();
		writePolicyFile();
		// Builds the policy table and returns it as a json object
		sendResponse(response, getPolicyTable());
	}
	else if (path=="/getSubjectData") {
		sendResponse(response, JSON.stringify(subjectListTmp));
	}
	else if (path=="/postSubjectData") {
		console.log(subjectData);
		fs.writeFileSync(subjectsFile, subjectData);
		sendResponse(response, "");
	}
	else if (path=="/getFeatureData") {
		sendResponse(response, JSON.stringify(featureListTmp));
	}
	else if (path=="/postFeatureData") {
		console.log(subjectData);
		fs.writeFileSync(featuresFile, featureData);
		sendResponse(response, "");
	}
	else {
		var filename = "../../../../test/client/policy"+path;
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
	res = pm.reloadPolicy();
	res = pm.enforceRequest(req, true);
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


