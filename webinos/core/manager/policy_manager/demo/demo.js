
// This test works with the policy file called  "policy-demo.xml"

var pmlib;
var res;
var pm;
var exec = require('child_process').exec;

function runPolicyTest() {
	try {
		console.log("Loading policy module...");
		
		pmlib = require('../lib/policymanager.js');
		
		try {
			pm = new pmlib.policyManager();
			console.log("Load success...");
		}
		catch(e) {
			console.log("Load error: "+e.message);
			return;
		}

		testFeatures1("user2");
		testFeatures("user1");
		testFeatures("user2");
		testFeatures("user3");
	}
	catch(e) {
		console.log("error: "+e.message);
	}
}

function ruleEffectDescription(num) {
	if(num == 0)
		return "PERMIT";
	if(num == 1)
		return "DENY";
	if(num == 2)
		return "PROMPT_ONESHOT";
	if(num == 3)
		return "PROMPT_SESSION";
	if(num == 4)
		return "PROMPT_BLANKET";
	if(num == 5)
		return "UNDETERMINED";
	return "INAPPLICABLE";
}

function testFeatures1(userId) {

	console.log("");
	console.log("Testing features for user " + userId + "...");
	var req = {};
	var ri = {};
	var si = {};
	si.userId = userId;
	req.subjectInfo = si;

	ri.apiFeature = "http://www.w3.org/ns/api-perms/calendar.read";
	req.resourceInfo = ri;
	console.log("\nRequest for " + ri.apiFeature);
	res = pm.enforceRequest(req);

	switch(res) {
		case 0:		console.log("OK");
				break;

		case 1:		console.log("KO");
				break;

		case 2:
		case 3:
		case 4:		var child = exec("xmessage -buttons allow,deny -print 'Access request to ... '",
					function (error, stdout, stderr) {	
						if (stdout == "allow\n") {
							console.log("OK");
						}
						else {
							console.log("KO");
						}
					});
				break;

		default:	console.log("KO");
	}
}



function testFeatures(userId) {

	console.log("");
	console.log("Testing features for user " + userId + "...");
	var req = {};
	var ri = {};
	var si = {};
	si.userId = userId;
	req.subjectInfo = si;

	ri.apiFeature = "http://www.w3.org/ns/api-perms/calendar.read";
	req.resourceInfo = ri;
	console.log("\nRequest for " + ri.apiFeature);
	pm.enforceRequest(req, console.log, console.log, req.resourceInfo.apiFeature + " => OK");

	ri.apiFeature = "http://www.w3.org/ns/api-perms/contacts.read";
	req.resourceInfo = ri;
	console.log("\nRequest for " + ri.apiFeature);
	pm.enforceRequest(req, console.log, console.log, req.resourceInfo.apiFeature + " => OK");

	ri.apiFeature = "http://webinos.org/api/messaging";
	req.resourceInfo = ri;
	console.log("\nRequest for " + ri.apiFeature);
	pm.enforceRequest(req, console.log, console.log, req.resourceInfo.apiFeature + " => OK");
}

runPolicyTest();
