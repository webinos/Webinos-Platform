
var http = require('http');
var fs = require('fs');
var os = require('os');
var url = require('url');
var util = require('util');
var pmlib;
var pm;
var rootPath;

var usersList = ["user1", "user2", "user3"];
var usersListDisplay = ["1: PZ owner", "2: PZ friend", "3: unknown"];

// Console.log redefinition
if (os.platform()=='android') {
	console.log = function(dataLog) {
		var id = fs.openSync("/sdcard/console.log", "a");
		fs.writeSync(id, dataLog+"\n", null, 'utf8');
		fs.closeSync(id);
	}
}

//path definition
if (os.platform()=='android') {
	rootPath = '/sdcard/webinos/policy';
	pmlib = require(rootPath + '/lib/policymanager.js');
}
else {
	rootPath = '.';
	pmlib = require(rootPath + '/../lib/policymanager.js');
}

var featureList = [
	"http://webinos.org/api/authentication",
	"http://www.w3.org/ns/api-perms/calendar.read",
	"http://www.w3.org/ns/api-perms/contacts.read",
	"http://wacapps.net/api/devicestatus",
	"http://webinos.org/api/discovery",
	"http://webinos.org/api/events",
	"http://www.w3.org/ns/api-perms/geolocation",
	"http://webinos.org/api/messaging",
	"http://webinos.org/api/messaging.send",
	"http://webinos.org/api/messaging.find",
	"http://webinos.org/api/messaging.subscribe",
	"http://webinos.org/api/messaging.attach",
	"http://webinos.org/api/nfc",
	"http://webinos.org/api/nfc.read",
	"http://webinos.org/api/vehicle",
	"http://webinos.org/api/vehicle.climate",
	"http://webinos.org/api/vehicle.navigation",
	"http://webinos.org/api/vehicle.parksensors",
	"http://webinos.org/api/vehicle.tripcomputer",
	"http://webinos.org/api/vehicle.controls",
	"http://webinos.org/api/vehicle.shift"
	];

var featureListDisplay = [
	"authentication",
	"calendar.read",
	"contacts.read",
	"devicestatus",
	"discovery",
	"events",
	"geolocation",
	"messaging",
	"messaging.send",
	"messaging.find",
	"messaging.subscribe",
	"messaging.attach",
	"nfc",
	"nfc.read",
	"vehicle",
	"vehicle.climate",
	"vehicle.navigation",
	"vehicle.parksensors",
	"vehicle.tripcomputer",
	"vehicle.controls",
	"vehicle.shift"
	];


try {
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
	var policyFile = parsedUrl.query.file;
	var appCert = parsedUrl.query.appCert;
	console.log("Request received for path "+path);
	if (path=="/getPolicyTable") {
		console.log("Policy file is "+policyFile+", cert is "+appCert);
		var string = getPolicyTable(policyFile, appCert);
		response.writeHead(200, {"Content-Type": "text/plain"});
		response.end(string);
	}
	else {
		//var filename = "."+path;
		var filename = rootPath+path;
		fs.readFile(filename, function(err, file) {
			if(err) {
				console.log("Error: file "+filename+" not found");
				response.writeHead(200, { 'Content-Type': 'text/html' });
				response.end("Not found error", "utf-8");
				return;
			}
			response.writeHead(200, { 'Content-Type': 'text/html' });
			response.end(file, "utf-8");
		});
	};
	
}).listen(8124);

console.log("server initialized"); 


function getPolicyTable(fileName, appCert) {
	copyPolicyFile(fileName);
	pm.reloadPolicy();
	var policyTable = "";
	policyTable += "<table>";
	policyTable += "<tr><td></td>";
	for (var i=0; i<usersList.length; i++) {
		policyTable += "<td>"+usersListDisplay[i]+"</td>";
	}
	policyTable += "</tr>";

	for (var j=0; j<featureList.length; j++) {
		policyTable += "<tr><td>"+featureListDisplay[j]+"</td>";
		for (var i=0; i<usersList.length; i++) {
//			policyTable += "<td>"+checkFeature(featureList[j], usersList[i])+"</td>";
			policyTable += "<td class='"+checkFeature(featureList[j], usersList[i], appCert)+"'></td>";
		}
		policyTable += "</tr>";
	}

	policyTable += "</table>";
	return policyTable;
}

function copyPolicyFile(fileName) {
	var data = fs.readFileSync(rootPath+"/"+fileName);
	fs.writeFileSync(rootPath+"/"+"policy.xml", data);
}

function checkFeature(featureName, userId, appCert) {
	var res;
	var req = {};
	req.subjectInfo = {};
	req.widgetInfo = {};
	req.resourceInfo = {};
	req.subjectInfo.userId = userId;
	if(appCert != "undefined") {
		req.widgetInfo.distributorKeyRootFingerprint = appCert;
	}
	req.resourceInfo.apiFeature = featureName;
	res = pm.enforceRequest(req);
	return(ruleEffectDescription(res));
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

