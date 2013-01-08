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
* Copyright 2012 Telecom Italia Spa
*******************************************************************************/

var pmlib;
var fs = require("fs");
var pm;
var policyFile = "./policy.xml";

var featureList = [
	"http://webinos.org/api/discovery",
	"http://webinos.org/api/w3c/geolocation",
	"http://webinos.org/api/messaging",
	"http://webinos.org/api/messaging.find",
	"http://webinos.org/api/messaging.send",
	"http://webinos.org/api/messaging.subscribe",
	"http://webinos.org/api/nfc",
	"http://webinos.org/api/nfc.read"
	];


var userList = [
	"user1",
	"user2",
	"user3"
	];

var deviceList = [
	"device1",
	"device2",
	"device3"
	];


var companyList = [
	"Company1",
	"Company2",
	"Company3"
	];


var policyList = [
	"policy1.xml",
	"policy2.xml",
	"policy3.xml",
	"policy4.xml",
	"policy5.xml",
	"policy6.xml",
	"policy7.xml",
	"policy8.xml",
	"policy9.xml",
	"policy10.xml",
	"policy11.xml",
	"policy12.xml",
	"policy13.xml",
	"policy_dhp_1.xml",
	"policy_dhp_2.xml",
	"policy_dhp_3.xml",
	"policy_dhp_4.xml",
	"policy_dhp_5.xml",
	"policy_dhp_6.xml",
	"policy_dhp_7.xml",
	"policy_dhp_8.xml",
	"policy_dhp_9.xml",
	"policy_dhp_10.xml",
	"policy_dhp_11.xml",
	"policy_dhp_12.xml"
	];


function loadManager() {
	pmlib = require("../../lib/policymanager.js");
	pm = new pmlib.policyManager(policyFile);
	return pm;
}


function changepolicy(fileName) {
	console.log("Change policy to file "+fileName);
	var data = fs.readFileSync("./"+fileName);
	fs.writeFileSync(policyFile, data);
}


function setRequest(userId, certCn, feature, deviceId, purpose, obligations) {
	console.log("Setting request for user "+userId+", device "+deviceId+", application released by "+certCn+", feature "+feature+", purpose "+purpose+" and obligations "+obligations);
	var req = {};
	var ri = {};
	var si = {};
	var wi = {};
	var di = {};
	si.userId = userId;
	req.subjectInfo = si;
	wi.distributorKeyCn = certCn;
        req.widgetInfo = wi;
	di.requestorId = deviceId;
        req.deviceInfo = di;
	ri.apiFeature = feature;
	req.resourceInfo = ri;
	if (purpose !== undefined)
		req.purpose = purpose;
	if (obligations !== undefined)
		req.obligations=obligations;
	return req;
}


function checkFeature(policyName, userName, certName, featureName, deviceId, purpose, obligations) {
	changepolicy(policyName);
	pm = loadManager();

	var req = setRequest(userName, certName, featureName, deviceId, purpose, obligations);

	// noprompt (third parameter) set to true
	var res = pm.enforceRequest(req, 0, true);
	console.log("result is "+res);
	return res;
}

describe("Manager.PolicyManager", function() {

	it("Every user can access every feature", function() {
		runs(function() {
			var res = checkFeature(policyList[0], userList[0], companyList[0], featureList[0], deviceList[0]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[0], userList[0], companyList[0], featureList[3], deviceList[0]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[0], userList[1], companyList[0], featureList[1], deviceList[0]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[0], userList[1], companyList[0], featureList[4], deviceList[0]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[0], userList[2], companyList[0], featureList[2], deviceList[0]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[0], userList[2], companyList[0], featureList[5], deviceList[0]);
			expect(res).toEqual(4);
		});


	});

	it("Every feature is denied to every user", function() {
		runs(function() {
			var res = checkFeature(policyList[2], userList[0], companyList[0], featureList[2], deviceList[0]);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[2], userList[0], companyList[0], featureList[3], deviceList[0]);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[2], userList[1], companyList[0], featureList[4], deviceList[0]);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[2], userList[1], companyList[0], featureList[5], deviceList[0]);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[2], userList[2], companyList[0], featureList[6], deviceList[0]);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[2], userList[2], companyList[0], featureList[7], deviceList[0]);
			expect(res).toEqual(1);
		});

	});

	it("user1 and user2 are allowed, user3 denied", function() {
		runs(function() {
			var res = checkFeature(policyList[1], userList[0], companyList[0], featureList[0], deviceList[0]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[1], userList[0], companyList[0], featureList[1], deviceList[0]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[1], userList[1], companyList[0], featureList[0], deviceList[0]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[1], userList[1], companyList[0], featureList[1], deviceList[0]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[1], userList[2], companyList[0], featureList[0], deviceList[0]);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[1], userList[2], companyList[0], featureList[1], deviceList[0]);
			expect(res).toEqual(1);
		});

	});

	/* commented out because generic uris handling is not yet implemented

	it("Test with generic uris (pzowner and pzfriend are allowed, untrusted user denied)", function() {
		runs(function() {
			var res = checkFeature(policyList[3], userList[0], companyList[0], featureList[0], deviceList[0]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[3], userList[0], companyList[0], featureList[1], deviceList[0]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[3], userList[1], companyList[0], featureList[0], deviceList[0]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[3], userList[1], companyList[0], featureList[1], deviceList[0]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[3], userList[2], companyList[0], featureList[0], deviceList[0]);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[3], userList[2], companyList[0], featureList[1], deviceList[0]);
			expect(res).toEqual(1);
		});

	});
	*/

	it("Users mixed permissions", function() {
		runs(function() {
			var res = checkFeature(policyList[4], userList[0], companyList[0], featureList[0], deviceList[0]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[4], userList[0], companyList[0], featureList[3], deviceList[0]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[4], userList[0], companyList[0], featureList[6], deviceList[0]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[4], userList[0], companyList[0], featureList[7], deviceList[0]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[4], userList[0], companyList[0], featureList[1], deviceList[0]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[4], userList[0], companyList[0], featureList[2], deviceList[0]);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[4], userList[0], companyList[0], featureList[4], deviceList[0]);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[4], userList[1], companyList[0], featureList[7], deviceList[0]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[4], userList[1], companyList[0], featureList[6], deviceList[0]);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[4], userList[2], companyList[0], featureList[7], deviceList[0]);
			expect(res).toEqual(1);
		});

	});


	it("Applications signed by Company1 are allowed, other denied", function() {
		runs(function() {
			var res = checkFeature(policyList[5], userList[0], companyList[0], featureList[0], deviceList[0]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[5], userList[0], companyList[1], featureList[3], deviceList[0]);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[5], userList[0], companyList[2], featureList[4], deviceList[0]);
			expect(res).toEqual(1);
		});

	});


	/* commented out because generic uris handling is not yet implemented

	it("Test with generic uris (trusted app can access every feature, others are denied)", function() {
		runs(function() {
			var res = checkFeature(policyList[6], userList[0], companyList[0], featureList[0], deviceList[0]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[6], userList[0], companyList[1], featureList[3], deviceList[0]);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[6], userList[0], companyList[2], featureList[4], deviceList[0]);
			expect(res).toEqual(1);
		});

	});
	*/

	it("Applications mixed permissions", function() {
		runs(function() {
			var res = checkFeature(policyList[7], userList[0], companyList[0], featureList[1], deviceList[0]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[7], userList[0], companyList[0], featureList[3], deviceList[0]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[7], userList[0], companyList[1], featureList[0], deviceList[0]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[7], userList[0], companyList[1], featureList[4], deviceList[0]);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[7], userList[0], companyList[2], featureList[0], deviceList[0]);
			expect(res).toEqual(1);
		});

	});


	it("device1 is allowed, others are denied", function() {
		runs(function() {
			var res = checkFeature(policyList[8], userList[0], companyList[0], featureList[1], deviceList[0]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[8], userList[0], companyList[0], featureList[4], deviceList[1]);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[8], userList[0], companyList[0], featureList[0], deviceList[1]);
			expect(res).toEqual(1);
		});

	});


	/* commented out because generic uris handling is not yet implemented

	it("test with generic uris (device from pz is allowed, others are denied)", function() {
		runs(function() {
			var res = checkFeature(policyList[9], userList[0], companyList[0], featureList[1], deviceList[0]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[9], userList[0], companyList[0], featureList[5], deviceList[1]);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[9], userList[0], companyList[0], featureList[4], deviceList[2]);
			expect(res).toEqual(1);
		});

	});


	it("test with generic uris (mobile device is allowed, others are denied)", function() {
		runs(function() {
			var res = checkFeature(policyList[10], userList[0], companyList[0], featureList[0], deviceList[0]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[10], userList[0], companyList[0], featureList[2], deviceList[1]);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[10], userList[0], companyList[0], featureList[5], deviceList[2]);
			expect(res).toEqual(1);
		});

	});
	*/

	it("Device mixed permissions", function() {
		runs(function() {
			var res = checkFeature(policyList[11], userList[0], companyList[0], featureList[1], deviceList[0]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[11], userList[0], companyList[0], featureList[3], deviceList[0]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[11], userList[0], companyList[0], featureList[0], deviceList[1]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[11], userList[0], companyList[0], featureList[4], deviceList[1]);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[11], userList[0], companyList[0], featureList[0], deviceList[2]);
			expect(res).toEqual(1);
		});

	});


	it("mixed policy", function() {
		runs(function() {
			var res = checkFeature(policyList[12], userList[0], companyList[0], featureList[0], deviceList[0]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[12], userList[0], companyList[1], featureList[4], deviceList[2]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[12], userList[0], companyList[0], featureList[4], deviceList[1]);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[12], userList[1], companyList[0], featureList[3], deviceList[1]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[12], userList[1], companyList[0], featureList[1], deviceList[0]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[12], userList[1], companyList[1], featureList[0], deviceList[1]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[12], userList[1], companyList[0], featureList[6], deviceList[2]);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[12], userList[1], companyList[0], featureList[4], deviceList[1]);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[12], userList[2], companyList[2], featureList[1], deviceList[2]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[12], userList[2], companyList[0], featureList[7], deviceList[0]);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[12], userList[2], companyList[0], featureList[0], deviceList[1]);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[12], userList[2], companyList[1], featureList[4], deviceList[1]);
			expect(res).toEqual(1);
		});

	});


	/* DHPref, authorizations only*/

	it("DHPref: Every user can access every feature", function() {
		var purpose = [
			true,	//"http://www.w3.org/2002/01/P3Pv1/current"
			true,	//"http://www.w3.org/2002/01/P3Pv1/admin"
			true,	//"http://www.w3.org/2002/01/P3Pv1/develop"
			true,	//"http://www.w3.org/2002/01/P3Pv1/tailoring"
			true,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-analysis"
			true,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-decision"
			true,	//"http://www.w3.org/2002/01/P3Pv1/individual-analysis"
			true,	//"http://www.w3.org/2002/01/P3Pv1/individual-decision"
			true,	//"http://www.w3.org/2002/01/P3Pv1/contact"
			true,	//"http://www.w3.org/2002/01/P3Pv1/historical"
			true,	//"http://www.w3.org/2002/01/P3Pv1/telemarketing"
			true,	//"http://www.w3.org/2002/01/P3Pv11/account"
			true,	//"http://www.w3.org/2002/01/P3Pv11/arts"
			true,	//"http://www.w3.org/2002/01/P3Pv11/browsing"
			true,	//"http://www.w3.org/2002/01/P3Pv11/charity"
			true,	//"http://www.w3.org/2002/01/P3Pv11/communicate"
			true,	//"http://www.w3.org/2002/01/P3Pv11/custom"
			true,	//"http://www.w3.org/2002/01/P3Pv11/delivery"
			true,	//"http://www.w3.org/2002/01/P3Pv11/downloads"
			true,	//"http://www.w3.org/2002/01/P3Pv11/education"
			true,	//"http://www.w3.org/2002/01/P3Pv11/feedback"
			true,	//"http://www.w3.org/2002/01/P3Pv11/finmgt"
			true,	//"http://www.w3.org/2002/01/P3Pv11/gambling"
			true,	//"http://www.w3.org/2002/01/P3Pv11/gaming"
			true,	//"http://www.w3.org/2002/01/P3Pv11/government"
			true,	//"http://www.w3.org/2002/01/P3Pv11/health"
			true,	//"http://www.w3.org/2002/01/P3Pv11/login"
			true,	//"http://www.w3.org/2002/01/P3Pv11/marketing"
			true,	//"http://www.w3.org/2002/01/P3Pv11/news"
			true,	//"http://www.w3.org/2002/01/P3Pv11/payment"
			true,	//"http://www.w3.org/2002/01/P3Pv11/sales"
			true,	//"http://www.w3.org/2002/01/P3Pv11/search"
			true,	//"http://www.w3.org/2002/01/P3Pv11/state"
			true,	//"http://www.w3.org/2002/01/P3Pv11/surveys"
			true	//"http://www.primelife.eu/purposes/unspecified"
			];
		runs(function() {
			var res = checkFeature(policyList[13], userList[0], companyList[0], featureList[0], deviceList[0], purpose);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[13], userList[0], companyList[0], featureList[3], deviceList[0], purpose);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[13], userList[1], companyList[0], featureList[1], deviceList[0], purpose);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[13], userList[1], companyList[0], featureList[4], deviceList[0], purpose);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[13], userList[2], companyList[0], featureList[2], deviceList[0], purpose);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[13], userList[2], companyList[0], featureList[5], deviceList[0], purpose);
			expect(res).toEqual(0);
		});

	});

	it("DHPref: Every feature is denied to every user", function() {
		var purpose = [
			true,	//"http://www.w3.org/2002/01/P3Pv1/current"
			true,	//"http://www.w3.org/2002/01/P3Pv1/admin"
			true,	//"http://www.w3.org/2002/01/P3Pv1/develop"
			true,	//"http://www.w3.org/2002/01/P3Pv1/tailoring"
			true,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-analysis"
			true,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-decision"
			true,	//"http://www.w3.org/2002/01/P3Pv1/individual-analysis"
			true,	//"http://www.w3.org/2002/01/P3Pv1/individual-decision"
			true,	//"http://www.w3.org/2002/01/P3Pv1/contact"
			true,	//"http://www.w3.org/2002/01/P3Pv1/historical"
			true,	//"http://www.w3.org/2002/01/P3Pv1/telemarketing"
			true,	//"http://www.w3.org/2002/01/P3Pv11/account"
			true,	//"http://www.w3.org/2002/01/P3Pv11/arts"
			true,	//"http://www.w3.org/2002/01/P3Pv11/browsing"
			true,	//"http://www.w3.org/2002/01/P3Pv11/charity"
			true,	//"http://www.w3.org/2002/01/P3Pv11/communicate"
			true,	//"http://www.w3.org/2002/01/P3Pv11/custom"
			true,	//"http://www.w3.org/2002/01/P3Pv11/delivery"
			true,	//"http://www.w3.org/2002/01/P3Pv11/downloads"
			true,	//"http://www.w3.org/2002/01/P3Pv11/education"
			true,	//"http://www.w3.org/2002/01/P3Pv11/feedback"
			true,	//"http://www.w3.org/2002/01/P3Pv11/finmgt"
			true,	//"http://www.w3.org/2002/01/P3Pv11/gambling"
			true,	//"http://www.w3.org/2002/01/P3Pv11/gaming"
			true,	//"http://www.w3.org/2002/01/P3Pv11/government"
			true,	//"http://www.w3.org/2002/01/P3Pv11/health"
			true,	//"http://www.w3.org/2002/01/P3Pv11/login"
			true,	//"http://www.w3.org/2002/01/P3Pv11/marketing"
			true,	//"http://www.w3.org/2002/01/P3Pv11/news"
			true,	//"http://www.w3.org/2002/01/P3Pv11/payment"
			true,	//"http://www.w3.org/2002/01/P3Pv11/sales"
			true,	//"http://www.w3.org/2002/01/P3Pv11/search"
			true,	//"http://www.w3.org/2002/01/P3Pv11/state"
			true,	//"http://www.w3.org/2002/01/P3Pv11/surveys"
			true	//"http://www.primelife.eu/purposes/unspecified"
			];
		runs(function() {
			var res = checkFeature(policyList[14], userList[0], companyList[0], featureList[2], deviceList[0], purpose);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[14], userList[0], companyList[0], featureList[3], deviceList[0], purpose);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[14], userList[1], companyList[0], featureList[4], deviceList[0], purpose);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[14], userList[1], companyList[0], featureList[5], deviceList[0], purpose);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[14], userList[2], companyList[0], featureList[6], deviceList[0], purpose);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[14], userList[2], companyList[0], featureList[7], deviceList[0], purpose);
			expect(res).toEqual(1);
		});
	});

	it("DHPref: user1 allowed, user2 prompted due to DHPref, user3 denied", function() {
		var purpose = [
			true,	//"http://www.w3.org/2002/01/P3Pv1/current"
			true,	//"http://www.w3.org/2002/01/P3Pv1/admin"
			true,	//"http://www.w3.org/2002/01/P3Pv1/develop"
			true,	//"http://www.w3.org/2002/01/P3Pv1/tailoring"
			true,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-analysis"
			true,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-decision"
			true,	//"http://www.w3.org/2002/01/P3Pv1/individual-analysis"
			true,	//"http://www.w3.org/2002/01/P3Pv1/individual-decision"
			true,	//"http://www.w3.org/2002/01/P3Pv1/contact"
			true,	//"http://www.w3.org/2002/01/P3Pv1/historical"
			true,	//"http://www.w3.org/2002/01/P3Pv1/telemarketing"
			true,	//"http://www.w3.org/2002/01/P3Pv11/account"
			true,	//"http://www.w3.org/2002/01/P3Pv11/arts"
			true,	//"http://www.w3.org/2002/01/P3Pv11/browsing"
			true,	//"http://www.w3.org/2002/01/P3Pv11/charity"
			true,	//"http://www.w3.org/2002/01/P3Pv11/communicate"
			true,	//"http://www.w3.org/2002/01/P3Pv11/custom"
			true,	//"http://www.w3.org/2002/01/P3Pv11/delivery"
			true,	//"http://www.w3.org/2002/01/P3Pv11/downloads"
			true,	//"http://www.w3.org/2002/01/P3Pv11/education"
			true,	//"http://www.w3.org/2002/01/P3Pv11/feedback"
			true,	//"http://www.w3.org/2002/01/P3Pv11/finmgt"
			true,	//"http://www.w3.org/2002/01/P3Pv11/gambling"
			true,	//"http://www.w3.org/2002/01/P3Pv11/gaming"
			true,	//"http://www.w3.org/2002/01/P3Pv11/government"
			true,	//"http://www.w3.org/2002/01/P3Pv11/health"
			true,	//"http://www.w3.org/2002/01/P3Pv11/login"
			true,	//"http://www.w3.org/2002/01/P3Pv11/marketing"
			true,	//"http://www.w3.org/2002/01/P3Pv11/news"
			true,	//"http://www.w3.org/2002/01/P3Pv11/payment"
			true,	//"http://www.w3.org/2002/01/P3Pv11/sales"
			true,	//"http://www.w3.org/2002/01/P3Pv11/search"
			true,	//"http://www.w3.org/2002/01/P3Pv11/state"
			true,	//"http://www.w3.org/2002/01/P3Pv11/surveys"
			true	//"http://www.primelife.eu/purposes/unspecified"
			];
		runs(function() {
			var res = checkFeature(policyList[15], userList[0], companyList[0], featureList[0], deviceList[0], purpose);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[15], userList[0], companyList[0], featureList[1], deviceList[0], purpose);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[15], userList[1], companyList[0], featureList[0], deviceList[0], purpose);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[15], userList[1], companyList[0], featureList[1], deviceList[0], purpose);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[15], userList[2], companyList[0], featureList[0], deviceList[0], purpose);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[15], userList[2], companyList[0], featureList[1], deviceList[0], purpose);
			expect(res).toEqual(1);
		});

	});

	it("DHPref: Users mixed permissions", function() {
		var purpose = [
			true,	//"http://www.w3.org/2002/01/P3Pv1/current"
			false,	//"http://www.w3.org/2002/01/P3Pv1/admin"
			false,	//"http://www.w3.org/2002/01/P3Pv1/develop"
			false,	//"http://www.w3.org/2002/01/P3Pv1/tailoring"
			true,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/contact"
			false,	//"http://www.w3.org/2002/01/P3Pv1/historical"
			false,	//"http://www.w3.org/2002/01/P3Pv1/telemarketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/account"
			false,	//"http://www.w3.org/2002/01/P3Pv11/arts"
			false,	//"http://www.w3.org/2002/01/P3Pv11/browsing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/charity"
			false,	//"http://www.w3.org/2002/01/P3Pv11/communicate"
			false,	//"http://www.w3.org/2002/01/P3Pv11/custom"
			false,	//"http://www.w3.org/2002/01/P3Pv11/delivery"
			false,	//"http://www.w3.org/2002/01/P3Pv11/downloads"
			false,	//"http://www.w3.org/2002/01/P3Pv11/education"
			false,	//"http://www.w3.org/2002/01/P3Pv11/feedback"
			false,	//"http://www.w3.org/2002/01/P3Pv11/finmgt"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gambling"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gaming"
			false,	//"http://www.w3.org/2002/01/P3Pv11/government"
			false,	//"http://www.w3.org/2002/01/P3Pv11/health"
			false,	//"http://www.w3.org/2002/01/P3Pv11/login"
			false,	//"http://www.w3.org/2002/01/P3Pv11/marketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/news"
			false,	//"http://www.w3.org/2002/01/P3Pv11/payment"
			false,	//"http://www.w3.org/2002/01/P3Pv11/sales"
			false,	//"http://www.w3.org/2002/01/P3Pv11/search"
			false,	//"http://www.w3.org/2002/01/P3Pv11/state"
			false,	//"http://www.w3.org/2002/01/P3Pv11/surveys"
			false	//"http://www.primelife.eu/purposes/unspecified"
			];
		runs(function() {
			var res = checkFeature(policyList[16], userList[0], companyList[0], featureList[0], deviceList[0], purpose);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[16], userList[0], companyList[0], featureList[3], deviceList[0], purpose);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[16], userList[0], companyList[0], featureList[6], deviceList[0], purpose);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[16], userList[0], companyList[0], featureList[7], deviceList[0], purpose);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[16], userList[0], companyList[0], featureList[1], deviceList[0], purpose);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[16], userList[0], companyList[0], featureList[2], deviceList[0], purpose);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[16], userList[0], companyList[0], featureList[4], deviceList[0], purpose);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[16], userList[1], companyList[0], featureList[7], deviceList[0], purpose);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[16], userList[1], companyList[0], featureList[6], deviceList[0], purpose);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[16], userList[2], companyList[0], featureList[7], deviceList[0], purpose);
			expect(res).toEqual(1);
		});
	});

	it("DHPref: mixed policy", function() {
		var purpose = [
			true,	//"http://www.w3.org/2002/01/P3Pv1/current"
			false,	//"http://www.w3.org/2002/01/P3Pv1/admin"
			false,	//"http://www.w3.org/2002/01/P3Pv1/develop"
			false,	//"http://www.w3.org/2002/01/P3Pv1/tailoring"
			true,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/contact"
			false,	//"http://www.w3.org/2002/01/P3Pv1/historical"
			false,	//"http://www.w3.org/2002/01/P3Pv1/telemarketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/account"
			false,	//"http://www.w3.org/2002/01/P3Pv11/arts"
			false,	//"http://www.w3.org/2002/01/P3Pv11/browsing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/charity"
			false,	//"http://www.w3.org/2002/01/P3Pv11/communicate"
			false,	//"http://www.w3.org/2002/01/P3Pv11/custom"
			false,	//"http://www.w3.org/2002/01/P3Pv11/delivery"
			false,	//"http://www.w3.org/2002/01/P3Pv11/downloads"
			false,	//"http://www.w3.org/2002/01/P3Pv11/education"
			false,	//"http://www.w3.org/2002/01/P3Pv11/feedback"
			false,	//"http://www.w3.org/2002/01/P3Pv11/finmgt"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gambling"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gaming"
			false,	//"http://www.w3.org/2002/01/P3Pv11/government"
			false,	//"http://www.w3.org/2002/01/P3Pv11/health"
			false,	//"http://www.w3.org/2002/01/P3Pv11/login"
			false,	//"http://www.w3.org/2002/01/P3Pv11/marketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/news"
			false,	//"http://www.w3.org/2002/01/P3Pv11/payment"
			false,	//"http://www.w3.org/2002/01/P3Pv11/sales"
			false,	//"http://www.w3.org/2002/01/P3Pv11/search"
			false,	//"http://www.w3.org/2002/01/P3Pv11/state"
			false,	//"http://www.w3.org/2002/01/P3Pv11/surveys"
			false	//"http://www.primelife.eu/purposes/unspecified"
			];
		runs(function() {
			var res = checkFeature(policyList[17], userList[0], companyList[0], featureList[0], deviceList[0], purpose);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[17], userList[0], companyList[1], featureList[4], deviceList[2], purpose);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[17], userList[0], companyList[0], featureList[4], deviceList[1], purpose);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[17], userList[1], companyList[0], featureList[3], deviceList[1], purpose);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[17], userList[1], companyList[0], featureList[1], deviceList[0], purpose);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[17], userList[1], companyList[1], featureList[0], deviceList[1], purpose);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[17], userList[1], companyList[0], featureList[6], deviceList[2], purpose);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[17], userList[1], companyList[0], featureList[4], deviceList[1], purpose);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[17], userList[2], companyList[2], featureList[1], deviceList[2], purpose);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[17], userList[2], companyList[0], featureList[7], deviceList[0], purpose);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[17], userList[2], companyList[0], featureList[0], deviceList[1], purpose);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[17], userList[2], companyList[1], featureList[4], deviceList[1], purpose);
			expect(res).toEqual(1);
		});
	});

	/* DHPref, authorizations and obligations*/

	it("DHPref: ActionDeletePersonalData and TriggerAtTime test 1", function() {
		var purpose = [
			true,	//"http://www.w3.org/2002/01/P3Pv1/current"
			false,	//"http://www.w3.org/2002/01/P3Pv1/admin"
			false,	//"http://www.w3.org/2002/01/P3Pv1/develop"
			false,	//"http://www.w3.org/2002/01/P3Pv1/tailoring"
			true,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/contact"
			false,	//"http://www.w3.org/2002/01/P3Pv1/historical"
			false,	//"http://www.w3.org/2002/01/P3Pv1/telemarketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/account"
			false,	//"http://www.w3.org/2002/01/P3Pv11/arts"
			false,	//"http://www.w3.org/2002/01/P3Pv11/browsing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/charity"
			false,	//"http://www.w3.org/2002/01/P3Pv11/communicate"
			false,	//"http://www.w3.org/2002/01/P3Pv11/custom"
			false,	//"http://www.w3.org/2002/01/P3Pv11/delivery"
			false,	//"http://www.w3.org/2002/01/P3Pv11/downloads"
			false,	//"http://www.w3.org/2002/01/P3Pv11/education"
			false,	//"http://www.w3.org/2002/01/P3Pv11/feedback"
			false,	//"http://www.w3.org/2002/01/P3Pv11/finmgt"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gambling"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gaming"
			false,	//"http://www.w3.org/2002/01/P3Pv11/government"
			false,	//"http://www.w3.org/2002/01/P3Pv11/health"
			false,	//"http://www.w3.org/2002/01/P3Pv11/login"
			false,	//"http://www.w3.org/2002/01/P3Pv11/marketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/news"
			false,	//"http://www.w3.org/2002/01/P3Pv11/payment"
			false,	//"http://www.w3.org/2002/01/P3Pv11/sales"
			false,	//"http://www.w3.org/2002/01/P3Pv11/search"
			false,	//"http://www.w3.org/2002/01/P3Pv11/state"
			false,	//"http://www.w3.org/2002/01/P3Pv11/surveys"
			false	//"http://www.primelife.eu/purposes/unspecified"
			];

		var triggers = [];
		var obligations = [];

		var action = {
			actionID: "ActionDeletePersonalData"
		};

		triggers[0] = {
			triggerID : "TriggerAtTime",
			Start : "StartNow",
			MaxDelay : "P0Y0M5DT0H0M0S"
		};

		obligations[0] = {
			action : action,
			triggers : triggers
		};

		runs(function() {
			var res = checkFeature(policyList[18], userList[0], companyList[0], featureList[2], deviceList[0], purpose, obligations);
			expect(res).toEqual(0);
		});

	});

	it("DHPref: ActionDeletePersonalData and TriggerAtTime test 2", function() {
		var purpose = [
			true,	//"http://www.w3.org/2002/01/P3Pv1/current"
			false,	//"http://www.w3.org/2002/01/P3Pv1/admin"
			false,	//"http://www.w3.org/2002/01/P3Pv1/develop"
			false,	//"http://www.w3.org/2002/01/P3Pv1/tailoring"
			true,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/contact"
			false,	//"http://www.w3.org/2002/01/P3Pv1/historical"
			false,	//"http://www.w3.org/2002/01/P3Pv1/telemarketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/account"
			false,	//"http://www.w3.org/2002/01/P3Pv11/arts"
			false,	//"http://www.w3.org/2002/01/P3Pv11/browsing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/charity"
			false,	//"http://www.w3.org/2002/01/P3Pv11/communicate"
			false,	//"http://www.w3.org/2002/01/P3Pv11/custom"
			false,	//"http://www.w3.org/2002/01/P3Pv11/delivery"
			false,	//"http://www.w3.org/2002/01/P3Pv11/downloads"
			false,	//"http://www.w3.org/2002/01/P3Pv11/education"
			false,	//"http://www.w3.org/2002/01/P3Pv11/feedback"
			false,	//"http://www.w3.org/2002/01/P3Pv11/finmgt"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gambling"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gaming"
			false,	//"http://www.w3.org/2002/01/P3Pv11/government"
			false,	//"http://www.w3.org/2002/01/P3Pv11/health"
			false,	//"http://www.w3.org/2002/01/P3Pv11/login"
			false,	//"http://www.w3.org/2002/01/P3Pv11/marketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/news"
			false,	//"http://www.w3.org/2002/01/P3Pv11/payment"
			false,	//"http://www.w3.org/2002/01/P3Pv11/sales"
			false,	//"http://www.w3.org/2002/01/P3Pv11/search"
			false,	//"http://www.w3.org/2002/01/P3Pv11/state"
			false,	//"http://www.w3.org/2002/01/P3Pv11/surveys"
			false	//"http://www.primelife.eu/purposes/unspecified"
			];

		var triggers = [];
		var obligations = [];

		var action = {
			actionID: "ActionDeletePersonalData"
		};

		triggers[0] = {
			triggerID : "TriggerAtTime",
			Start : "StartNow",
			MaxDelay : "P0Y0M8DT0H0M0S"
		};

		obligations[0] = {
			action : action,
			triggers : triggers
		};
		console.log(JSON.stringify(obligations));

		runs(function() {
			var res = checkFeature(policyList[18], userList[0], companyList[0], featureList[2], deviceList[0], purpose, obligations);
			expect(res).toEqual(4);
		});

	});

	it("DHPref: ActionAnonymizePersonalData and TriggerAtTime test 1", function() {
		var purpose = [
			true,	//"http://www.w3.org/2002/01/P3Pv1/current"
			false,	//"http://www.w3.org/2002/01/P3Pv1/admin"
			false,	//"http://www.w3.org/2002/01/P3Pv1/develop"
			false,	//"http://www.w3.org/2002/01/P3Pv1/tailoring"
			true,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/contact"
			false,	//"http://www.w3.org/2002/01/P3Pv1/historical"
			false,	//"http://www.w3.org/2002/01/P3Pv1/telemarketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/account"
			false,	//"http://www.w3.org/2002/01/P3Pv11/arts"
			false,	//"http://www.w3.org/2002/01/P3Pv11/browsing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/charity"
			false,	//"http://www.w3.org/2002/01/P3Pv11/communicate"
			false,	//"http://www.w3.org/2002/01/P3Pv11/custom"
			false,	//"http://www.w3.org/2002/01/P3Pv11/delivery"
			false,	//"http://www.w3.org/2002/01/P3Pv11/downloads"
			false,	//"http://www.w3.org/2002/01/P3Pv11/education"
			false,	//"http://www.w3.org/2002/01/P3Pv11/feedback"
			false,	//"http://www.w3.org/2002/01/P3Pv11/finmgt"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gambling"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gaming"
			false,	//"http://www.w3.org/2002/01/P3Pv11/government"
			false,	//"http://www.w3.org/2002/01/P3Pv11/health"
			false,	//"http://www.w3.org/2002/01/P3Pv11/login"
			false,	//"http://www.w3.org/2002/01/P3Pv11/marketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/news"
			false,	//"http://www.w3.org/2002/01/P3Pv11/payment"
			false,	//"http://www.w3.org/2002/01/P3Pv11/sales"
			false,	//"http://www.w3.org/2002/01/P3Pv11/search"
			false,	//"http://www.w3.org/2002/01/P3Pv11/state"
			false,	//"http://www.w3.org/2002/01/P3Pv11/surveys"
			false	//"http://www.primelife.eu/purposes/unspecified"
			];

		var triggers = [];
		var obligations = [];

		var action = {
			actionID: "ActionAnonymizePersonalData"
		};

		triggers[0] = {
			triggerID : "TriggerAtTime",
			Start : "2012-12-11T00:00:00.00+00:00",
			MaxDelay : "P0Y0M5DT0H0M0S"
		};

		obligations[0] = {
			action : action,
			triggers : triggers
		};

		runs(function() {
			var res = checkFeature(policyList[19], userList[0], companyList[0], featureList[2], deviceList[0], purpose, obligations);
			expect(res).toEqual(0);
		});

	});

	it("DHPref: ActionAnonymizePersonalData and TriggerAtTime test 2", function() {
		var purpose = [
			true,	//"http://www.w3.org/2002/01/P3Pv1/current"
			false,	//"http://www.w3.org/2002/01/P3Pv1/admin"
			false,	//"http://www.w3.org/2002/01/P3Pv1/develop"
			false,	//"http://www.w3.org/2002/01/P3Pv1/tailoring"
			true,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/contact"
			false,	//"http://www.w3.org/2002/01/P3Pv1/historical"
			false,	//"http://www.w3.org/2002/01/P3Pv1/telemarketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/account"
			false,	//"http://www.w3.org/2002/01/P3Pv11/arts"
			false,	//"http://www.w3.org/2002/01/P3Pv11/browsing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/charity"
			false,	//"http://www.w3.org/2002/01/P3Pv11/communicate"
			false,	//"http://www.w3.org/2002/01/P3Pv11/custom"
			false,	//"http://www.w3.org/2002/01/P3Pv11/delivery"
			false,	//"http://www.w3.org/2002/01/P3Pv11/downloads"
			false,	//"http://www.w3.org/2002/01/P3Pv11/education"
			false,	//"http://www.w3.org/2002/01/P3Pv11/feedback"
			false,	//"http://www.w3.org/2002/01/P3Pv11/finmgt"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gambling"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gaming"
			false,	//"http://www.w3.org/2002/01/P3Pv11/government"
			false,	//"http://www.w3.org/2002/01/P3Pv11/health"
			false,	//"http://www.w3.org/2002/01/P3Pv11/login"
			false,	//"http://www.w3.org/2002/01/P3Pv11/marketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/news"
			false,	//"http://www.w3.org/2002/01/P3Pv11/payment"
			false,	//"http://www.w3.org/2002/01/P3Pv11/sales"
			false,	//"http://www.w3.org/2002/01/P3Pv11/search"
			false,	//"http://www.w3.org/2002/01/P3Pv11/state"
			false,	//"http://www.w3.org/2002/01/P3Pv11/surveys"
			false	//"http://www.primelife.eu/purposes/unspecified"
			];

		var triggers = [];
		var obligations = [];

		var action = {
			actionID: "ActionAnonymizePersonalData"
		};

		triggers[0] = {
			triggerID : "TriggerAtTime",
			Start : "2012-12-11T00:00:00.00+00:00",
			MaxDelay : "P0Y0M8DT0H0M0S"
		};

		obligations[0] = {
			action : action,
			triggers : triggers
		};
		console.log(JSON.stringify(obligations));

		runs(function() {
			var res = checkFeature(policyList[19], userList[0], companyList[0], featureList[2], deviceList[0], purpose, obligations);
			expect(res).toEqual(4);
		});

	});

	it("DHPref: ActionNotifyDataSubject and TriggerPersonalDataAccessedForPurpose test 1", function() {
		var purpose = [
			true,	//"http://www.w3.org/2002/01/P3Pv1/current"
			false,	//"http://www.w3.org/2002/01/P3Pv1/admin"
			false,	//"http://www.w3.org/2002/01/P3Pv1/develop"
			false,	//"http://www.w3.org/2002/01/P3Pv1/tailoring"
			true,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/contact"
			false,	//"http://www.w3.org/2002/01/P3Pv1/historical"
			false,	//"http://www.w3.org/2002/01/P3Pv1/telemarketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/account"
			false,	//"http://www.w3.org/2002/01/P3Pv11/arts"
			false,	//"http://www.w3.org/2002/01/P3Pv11/browsing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/charity"
			false,	//"http://www.w3.org/2002/01/P3Pv11/communicate"
			false,	//"http://www.w3.org/2002/01/P3Pv11/custom"
			false,	//"http://www.w3.org/2002/01/P3Pv11/delivery"
			false,	//"http://www.w3.org/2002/01/P3Pv11/downloads"
			false,	//"http://www.w3.org/2002/01/P3Pv11/education"
			false,	//"http://www.w3.org/2002/01/P3Pv11/feedback"
			false,	//"http://www.w3.org/2002/01/P3Pv11/finmgt"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gambling"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gaming"
			false,	//"http://www.w3.org/2002/01/P3Pv11/government"
			false,	//"http://www.w3.org/2002/01/P3Pv11/health"
			false,	//"http://www.w3.org/2002/01/P3Pv11/login"
			false,	//"http://www.w3.org/2002/01/P3Pv11/marketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/news"
			false,	//"http://www.w3.org/2002/01/P3Pv11/payment"
			false,	//"http://www.w3.org/2002/01/P3Pv11/sales"
			false,	//"http://www.w3.org/2002/01/P3Pv11/search"
			false,	//"http://www.w3.org/2002/01/P3Pv11/state"
			false,	//"http://www.w3.org/2002/01/P3Pv11/surveys"
			false	//"http://www.primelife.eu/purposes/unspecified"
			];

		var trigger_purpose = [
			false,	//"http://www.w3.org/2002/01/P3Pv1/current"
			false,	//"http://www.w3.org/2002/01/P3Pv1/admin"
			false,	//"http://www.w3.org/2002/01/P3Pv1/develop"
			false,	//"http://www.w3.org/2002/01/P3Pv1/tailoring"
			true,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/contact"
			false,	//"http://www.w3.org/2002/01/P3Pv1/historical"
			false,	//"http://www.w3.org/2002/01/P3Pv1/telemarketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/account"
			false,	//"http://www.w3.org/2002/01/P3Pv11/arts"
			false,	//"http://www.w3.org/2002/01/P3Pv11/browsing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/charity"
			false,	//"http://www.w3.org/2002/01/P3Pv11/communicate"
			false,	//"http://www.w3.org/2002/01/P3Pv11/custom"
			false,	//"http://www.w3.org/2002/01/P3Pv11/delivery"
			false,	//"http://www.w3.org/2002/01/P3Pv11/downloads"
			false,	//"http://www.w3.org/2002/01/P3Pv11/education"
			false,	//"http://www.w3.org/2002/01/P3Pv11/feedback"
			false,	//"http://www.w3.org/2002/01/P3Pv11/finmgt"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gambling"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gaming"
			false,	//"http://www.w3.org/2002/01/P3Pv11/government"
			false,	//"http://www.w3.org/2002/01/P3Pv11/health"
			false,	//"http://www.w3.org/2002/01/P3Pv11/login"
			false,	//"http://www.w3.org/2002/01/P3Pv11/marketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/news"
			false,	//"http://www.w3.org/2002/01/P3Pv11/payment"
			false,	//"http://www.w3.org/2002/01/P3Pv11/sales"
			false,	//"http://www.w3.org/2002/01/P3Pv11/search"
			false,	//"http://www.w3.org/2002/01/P3Pv11/state"
			false,	//"http://www.w3.org/2002/01/P3Pv11/surveys"
			false	//"http://www.primelife.eu/purposes/unspecified"
			];

		var triggers = [];
		var obligations = [];

		var action = {
			actionID: "ActionNotifyDataSubject",
			Media: "email",
			Address: "user@webinos.org"
		};

		triggers[0] = {
			triggerID : "TriggerPersonalDataAccessedForPurpose",
			Purpose : trigger_purpose,
			MaxDelay : "P0Y0M5DT0H0M0S"
		};

		obligations[0] = {
			action : action,
			triggers : triggers
		};
		console.log(JSON.stringify(obligations));

		runs(function() {
			var res = checkFeature(policyList[20], userList[0], companyList[0], featureList[2], deviceList[0], purpose, obligations);
			expect(res).toEqual(0);
		});

	});

	it("DHPref: ActionNotifyDataSubject and TriggerPersonalDataAccessedForPurpose test 2", function() {
		var purpose = [
			true,	//"http://www.w3.org/2002/01/P3Pv1/current"
			false,	//"http://www.w3.org/2002/01/P3Pv1/admin"
			false,	//"http://www.w3.org/2002/01/P3Pv1/develop"
			false,	//"http://www.w3.org/2002/01/P3Pv1/tailoring"
			true,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/contact"
			false,	//"http://www.w3.org/2002/01/P3Pv1/historical"
			false,	//"http://www.w3.org/2002/01/P3Pv1/telemarketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/account"
			false,	//"http://www.w3.org/2002/01/P3Pv11/arts"
			false,	//"http://www.w3.org/2002/01/P3Pv11/browsing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/charity"
			false,	//"http://www.w3.org/2002/01/P3Pv11/communicate"
			false,	//"http://www.w3.org/2002/01/P3Pv11/custom"
			false,	//"http://www.w3.org/2002/01/P3Pv11/delivery"
			false,	//"http://www.w3.org/2002/01/P3Pv11/downloads"
			false,	//"http://www.w3.org/2002/01/P3Pv11/education"
			false,	//"http://www.w3.org/2002/01/P3Pv11/feedback"
			false,	//"http://www.w3.org/2002/01/P3Pv11/finmgt"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gambling"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gaming"
			false,	//"http://www.w3.org/2002/01/P3Pv11/government"
			false,	//"http://www.w3.org/2002/01/P3Pv11/health"
			false,	//"http://www.w3.org/2002/01/P3Pv11/login"
			false,	//"http://www.w3.org/2002/01/P3Pv11/marketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/news"
			false,	//"http://www.w3.org/2002/01/P3Pv11/payment"
			false,	//"http://www.w3.org/2002/01/P3Pv11/sales"
			false,	//"http://www.w3.org/2002/01/P3Pv11/search"
			false,	//"http://www.w3.org/2002/01/P3Pv11/state"
			false,	//"http://www.w3.org/2002/01/P3Pv11/surveys"
			false	//"http://www.primelife.eu/purposes/unspecified"
			];

		var trigger_purpose = [
			true,	//"http://www.w3.org/2002/01/P3Pv1/current"
			false,	//"http://www.w3.org/2002/01/P3Pv1/admin"
			false,	//"http://www.w3.org/2002/01/P3Pv1/develop"
			false,	//"http://www.w3.org/2002/01/P3Pv1/tailoring"
			true,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/contact"
			false,	//"http://www.w3.org/2002/01/P3Pv1/historical"
			false,	//"http://www.w3.org/2002/01/P3Pv1/telemarketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/account"
			false,	//"http://www.w3.org/2002/01/P3Pv11/arts"
			false,	//"http://www.w3.org/2002/01/P3Pv11/browsing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/charity"
			false,	//"http://www.w3.org/2002/01/P3Pv11/communicate"
			false,	//"http://www.w3.org/2002/01/P3Pv11/custom"
			false,	//"http://www.w3.org/2002/01/P3Pv11/delivery"
			false,	//"http://www.w3.org/2002/01/P3Pv11/downloads"
			false,	//"http://www.w3.org/2002/01/P3Pv11/education"
			false,	//"http://www.w3.org/2002/01/P3Pv11/feedback"
			false,	//"http://www.w3.org/2002/01/P3Pv11/finmgt"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gambling"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gaming"
			false,	//"http://www.w3.org/2002/01/P3Pv11/government"
			false,	//"http://www.w3.org/2002/01/P3Pv11/health"
			false,	//"http://www.w3.org/2002/01/P3Pv11/login"
			false,	//"http://www.w3.org/2002/01/P3Pv11/marketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/news"
			false,	//"http://www.w3.org/2002/01/P3Pv11/payment"
			false,	//"http://www.w3.org/2002/01/P3Pv11/sales"
			false,	//"http://www.w3.org/2002/01/P3Pv11/search"
			false,	//"http://www.w3.org/2002/01/P3Pv11/state"
			false,	//"http://www.w3.org/2002/01/P3Pv11/surveys"
			false	//"http://www.primelife.eu/purposes/unspecified"
			];

		var triggers = [];
		var obligations = [];

		var action = {
			actionID: "ActionNotifyDataSubject",
			Media: "email",
			Address: "user@webinos.org"
		};

		triggers[0] = {
			triggerID : "TriggerPersonalDataAccessedForPurpose",
			Purpose : trigger_purpose,
			MaxDelay : "P0Y0M5DT0H0M0S"
		};

		obligations[0] = {
			action : action,
			triggers : triggers
		};
		console.log(JSON.stringify(obligations));

		runs(function() {
			var res = checkFeature(policyList[20], userList[0], companyList[0], featureList[2], deviceList[0], purpose, obligations);
			expect(res).toEqual(0);
		});

	});

	it("DHPref: ActionNotifyDataSubject and TriggerPersonalDataAccessedForPurpose test 3", function() {
		var purpose = [
			true,	//"http://www.w3.org/2002/01/P3Pv1/current"
			false,	//"http://www.w3.org/2002/01/P3Pv1/admin"
			false,	//"http://www.w3.org/2002/01/P3Pv1/develop"
			false,	//"http://www.w3.org/2002/01/P3Pv1/tailoring"
			true,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/contact"
			false,	//"http://www.w3.org/2002/01/P3Pv1/historical"
			false,	//"http://www.w3.org/2002/01/P3Pv1/telemarketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/account"
			false,	//"http://www.w3.org/2002/01/P3Pv11/arts"
			false,	//"http://www.w3.org/2002/01/P3Pv11/browsing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/charity"
			false,	//"http://www.w3.org/2002/01/P3Pv11/communicate"
			false,	//"http://www.w3.org/2002/01/P3Pv11/custom"
			false,	//"http://www.w3.org/2002/01/P3Pv11/delivery"
			false,	//"http://www.w3.org/2002/01/P3Pv11/downloads"
			false,	//"http://www.w3.org/2002/01/P3Pv11/education"
			false,	//"http://www.w3.org/2002/01/P3Pv11/feedback"
			false,	//"http://www.w3.org/2002/01/P3Pv11/finmgt"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gambling"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gaming"
			false,	//"http://www.w3.org/2002/01/P3Pv11/government"
			false,	//"http://www.w3.org/2002/01/P3Pv11/health"
			false,	//"http://www.w3.org/2002/01/P3Pv11/login"
			false,	//"http://www.w3.org/2002/01/P3Pv11/marketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/news"
			false,	//"http://www.w3.org/2002/01/P3Pv11/payment"
			false,	//"http://www.w3.org/2002/01/P3Pv11/sales"
			false,	//"http://www.w3.org/2002/01/P3Pv11/search"
			false,	//"http://www.w3.org/2002/01/P3Pv11/state"
			false,	//"http://www.w3.org/2002/01/P3Pv11/surveys"
			false	//"http://www.primelife.eu/purposes/unspecified"
			];

		var trigger_purpose = [
			false,	//"http://www.w3.org/2002/01/P3Pv1/current"
			false,	//"http://www.w3.org/2002/01/P3Pv1/admin"
			false,	//"http://www.w3.org/2002/01/P3Pv1/develop"
			false,	//"http://www.w3.org/2002/01/P3Pv1/tailoring"
			true,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/contact"
			false,	//"http://www.w3.org/2002/01/P3Pv1/historical"
			false,	//"http://www.w3.org/2002/01/P3Pv1/telemarketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/account"
			false,	//"http://www.w3.org/2002/01/P3Pv11/arts"
			false,	//"http://www.w3.org/2002/01/P3Pv11/browsing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/charity"
			false,	//"http://www.w3.org/2002/01/P3Pv11/communicate"
			false,	//"http://www.w3.org/2002/01/P3Pv11/custom"
			false,	//"http://www.w3.org/2002/01/P3Pv11/delivery"
			false,	//"http://www.w3.org/2002/01/P3Pv11/downloads"
			false,	//"http://www.w3.org/2002/01/P3Pv11/education"
			false,	//"http://www.w3.org/2002/01/P3Pv11/feedback"
			false,	//"http://www.w3.org/2002/01/P3Pv11/finmgt"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gambling"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gaming"
			false,	//"http://www.w3.org/2002/01/P3Pv11/government"
			false,	//"http://www.w3.org/2002/01/P3Pv11/health"
			false,	//"http://www.w3.org/2002/01/P3Pv11/login"
			false,	//"http://www.w3.org/2002/01/P3Pv11/marketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/news"
			false,	//"http://www.w3.org/2002/01/P3Pv11/payment"
			false,	//"http://www.w3.org/2002/01/P3Pv11/sales"
			false,	//"http://www.w3.org/2002/01/P3Pv11/search"
			false,	//"http://www.w3.org/2002/01/P3Pv11/state"
			false,	//"http://www.w3.org/2002/01/P3Pv11/surveys"
			false	//"http://www.primelife.eu/purposes/unspecified"
			];

		var triggers = [];
		var obligations = [];

		var action = {
			actionID: "ActionNotifyDataSubject",
			Media: "email",
			Address: "anotherUser@webinos.org"
		};

		triggers[0] = {
			triggerID : "TriggerPersonalDataAccessedForPurpose",
			Purpose : trigger_purpose,
			MaxDelay : "P0Y0M5DT0H0M0S"
		};

		obligations[0] = {
			action : action,
			triggers : triggers
		};
		console.log(JSON.stringify(obligations));

		runs(function() {
			var res = checkFeature(policyList[20], userList[0], companyList[0], featureList[2], deviceList[0], purpose, obligations);
			expect(res).toEqual(4);
		});

	});

	it("DHPref: ActionNotifyDataSubject and TriggerPersonalDataAccessedForPurpose test 4", function() {
		var purpose = [
			true,	//"http://www.w3.org/2002/01/P3Pv1/current"
			false,	//"http://www.w3.org/2002/01/P3Pv1/admin"
			false,	//"http://www.w3.org/2002/01/P3Pv1/develop"
			false,	//"http://www.w3.org/2002/01/P3Pv1/tailoring"
			true,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/contact"
			false,	//"http://www.w3.org/2002/01/P3Pv1/historical"
			false,	//"http://www.w3.org/2002/01/P3Pv1/telemarketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/account"
			false,	//"http://www.w3.org/2002/01/P3Pv11/arts"
			false,	//"http://www.w3.org/2002/01/P3Pv11/browsing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/charity"
			false,	//"http://www.w3.org/2002/01/P3Pv11/communicate"
			false,	//"http://www.w3.org/2002/01/P3Pv11/custom"
			false,	//"http://www.w3.org/2002/01/P3Pv11/delivery"
			false,	//"http://www.w3.org/2002/01/P3Pv11/downloads"
			false,	//"http://www.w3.org/2002/01/P3Pv11/education"
			false,	//"http://www.w3.org/2002/01/P3Pv11/feedback"
			false,	//"http://www.w3.org/2002/01/P3Pv11/finmgt"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gambling"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gaming"
			false,	//"http://www.w3.org/2002/01/P3Pv11/government"
			false,	//"http://www.w3.org/2002/01/P3Pv11/health"
			false,	//"http://www.w3.org/2002/01/P3Pv11/login"
			false,	//"http://www.w3.org/2002/01/P3Pv11/marketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/news"
			false,	//"http://www.w3.org/2002/01/P3Pv11/payment"
			false,	//"http://www.w3.org/2002/01/P3Pv11/sales"
			false,	//"http://www.w3.org/2002/01/P3Pv11/search"
			false,	//"http://www.w3.org/2002/01/P3Pv11/state"
			false,	//"http://www.w3.org/2002/01/P3Pv11/surveys"
			false	//"http://www.primelife.eu/purposes/unspecified"
			];

		var trigger_purpose = [
			true,	//"http://www.w3.org/2002/01/P3Pv1/current"
			false,	//"http://www.w3.org/2002/01/P3Pv1/admin"
			false,	//"http://www.w3.org/2002/01/P3Pv1/develop"
			false,	//"http://www.w3.org/2002/01/P3Pv1/tailoring"
			true,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/contact"
			false,	//"http://www.w3.org/2002/01/P3Pv1/historical"
			false,	//"http://www.w3.org/2002/01/P3Pv1/telemarketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/account"
			false,	//"http://www.w3.org/2002/01/P3Pv11/arts"
			false,	//"http://www.w3.org/2002/01/P3Pv11/browsing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/charity"
			false,	//"http://www.w3.org/2002/01/P3Pv11/communicate"
			false,	//"http://www.w3.org/2002/01/P3Pv11/custom"
			false,	//"http://www.w3.org/2002/01/P3Pv11/delivery"
			false,	//"http://www.w3.org/2002/01/P3Pv11/downloads"
			false,	//"http://www.w3.org/2002/01/P3Pv11/education"
			false,	//"http://www.w3.org/2002/01/P3Pv11/feedback"
			false,	//"http://www.w3.org/2002/01/P3Pv11/finmgt"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gambling"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gaming"
			false,	//"http://www.w3.org/2002/01/P3Pv11/government"
			false,	//"http://www.w3.org/2002/01/P3Pv11/health"
			false,	//"http://www.w3.org/2002/01/P3Pv11/login"
			false,	//"http://www.w3.org/2002/01/P3Pv11/marketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/news"
			false,	//"http://www.w3.org/2002/01/P3Pv11/payment"
			false,	//"http://www.w3.org/2002/01/P3Pv11/sales"
			false,	//"http://www.w3.org/2002/01/P3Pv11/search"
			false,	//"http://www.w3.org/2002/01/P3Pv11/state"
			false,	//"http://www.w3.org/2002/01/P3Pv11/surveys"
			false	//"http://www.primelife.eu/purposes/unspecified"
			];

		var triggers = [];
		var obligations = [];

		var action = {
			actionID: "ActionNotifyDataSubject",
			Media: "email",
			Address: "anotherUser@webinos.org"
		};

		triggers[0] = {
			triggerID : "TriggerPersonalDataAccessedForPurpose",
			Purpose : trigger_purpose,
			MaxDelay : "P0Y0M5DT0H0M0S"
		};

		obligations[0] = {
			action : action,
			triggers : triggers
		};
		console.log(JSON.stringify(obligations));

		runs(function() {
			var res = checkFeature(policyList[20], userList[0], companyList[0], featureList[2], deviceList[0], purpose, obligations);
			expect(res).toEqual(4);
		});

	});

	it("DHPref: ActionNotifyDataSubject and TriggerPersonalDataAccessedForPurpose test 5", function() {
		var purpose = [
			true,	//"http://www.w3.org/2002/01/P3Pv1/current"
			false,	//"http://www.w3.org/2002/01/P3Pv1/admin"
			false,	//"http://www.w3.org/2002/01/P3Pv1/develop"
			false,	//"http://www.w3.org/2002/01/P3Pv1/tailoring"
			true,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/contact"
			false,	//"http://www.w3.org/2002/01/P3Pv1/historical"
			false,	//"http://www.w3.org/2002/01/P3Pv1/telemarketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/account"
			false,	//"http://www.w3.org/2002/01/P3Pv11/arts"
			false,	//"http://www.w3.org/2002/01/P3Pv11/browsing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/charity"
			false,	//"http://www.w3.org/2002/01/P3Pv11/communicate"
			false,	//"http://www.w3.org/2002/01/P3Pv11/custom"
			false,	//"http://www.w3.org/2002/01/P3Pv11/delivery"
			false,	//"http://www.w3.org/2002/01/P3Pv11/downloads"
			false,	//"http://www.w3.org/2002/01/P3Pv11/education"
			false,	//"http://www.w3.org/2002/01/P3Pv11/feedback"
			false,	//"http://www.w3.org/2002/01/P3Pv11/finmgt"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gambling"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gaming"
			false,	//"http://www.w3.org/2002/01/P3Pv11/government"
			false,	//"http://www.w3.org/2002/01/P3Pv11/health"
			false,	//"http://www.w3.org/2002/01/P3Pv11/login"
			false,	//"http://www.w3.org/2002/01/P3Pv11/marketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/news"
			false,	//"http://www.w3.org/2002/01/P3Pv11/payment"
			false,	//"http://www.w3.org/2002/01/P3Pv11/sales"
			false,	//"http://www.w3.org/2002/01/P3Pv11/search"
			false,	//"http://www.w3.org/2002/01/P3Pv11/state"
			false,	//"http://www.w3.org/2002/01/P3Pv11/surveys"
			false	//"http://www.primelife.eu/purposes/unspecified"
			];

		var trigger_purpose = [
			true,	//"http://www.w3.org/2002/01/P3Pv1/current"
			false,	//"http://www.w3.org/2002/01/P3Pv1/admin"
			false,	//"http://www.w3.org/2002/01/P3Pv1/develop"
			false,	//"http://www.w3.org/2002/01/P3Pv1/tailoring"
			false,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/contact"
			false,	//"http://www.w3.org/2002/01/P3Pv1/historical"
			false,	//"http://www.w3.org/2002/01/P3Pv1/telemarketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/account"
			false,	//"http://www.w3.org/2002/01/P3Pv11/arts"
			false,	//"http://www.w3.org/2002/01/P3Pv11/browsing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/charity"
			false,	//"http://www.w3.org/2002/01/P3Pv11/communicate"
			false,	//"http://www.w3.org/2002/01/P3Pv11/custom"
			false,	//"http://www.w3.org/2002/01/P3Pv11/delivery"
			false,	//"http://www.w3.org/2002/01/P3Pv11/downloads"
			false,	//"http://www.w3.org/2002/01/P3Pv11/education"
			false,	//"http://www.w3.org/2002/01/P3Pv11/feedback"
			false,	//"http://www.w3.org/2002/01/P3Pv11/finmgt"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gambling"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gaming"
			false,	//"http://www.w3.org/2002/01/P3Pv11/government"
			false,	//"http://www.w3.org/2002/01/P3Pv11/health"
			false,	//"http://www.w3.org/2002/01/P3Pv11/login"
			false,	//"http://www.w3.org/2002/01/P3Pv11/marketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/news"
			false,	//"http://www.w3.org/2002/01/P3Pv11/payment"
			false,	//"http://www.w3.org/2002/01/P3Pv11/sales"
			false,	//"http://www.w3.org/2002/01/P3Pv11/search"
			false,	//"http://www.w3.org/2002/01/P3Pv11/state"
			false,	//"http://www.w3.org/2002/01/P3Pv11/surveys"
			false	//"http://www.primelife.eu/purposes/unspecified"
			];

		var triggers = [];
		var obligations = [];

		var action = {
			actionID: "ActionNotifyDataSubject",
			Media: "email",
			Address: "user@webinos.org"
		};

		triggers[0] = {
			triggerID : "TriggerPersonalDataAccessedForPurpose",
			Purpose : trigger_purpose,
			MaxDelay : "P0Y0M5DT0H0M0S"
		};

		obligations[0] = {
			action : action,
			triggers : triggers
		};
		console.log(JSON.stringify(obligations));

		runs(function() {
			var res = checkFeature(policyList[20], userList[0], companyList[0], featureList[2], deviceList[0], purpose, obligations);
			expect(res).toEqual(4);
		});

	});

	it("DHPref: ActionNotifyDataSubject and TriggerPersonalDataAccessedForPurpose test 6", function() {
		var purpose = [
			true,	//"http://www.w3.org/2002/01/P3Pv1/current"
			false,	//"http://www.w3.org/2002/01/P3Pv1/admin"
			false,	//"http://www.w3.org/2002/01/P3Pv1/develop"
			false,	//"http://www.w3.org/2002/01/P3Pv1/tailoring"
			true,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/contact"
			false,	//"http://www.w3.org/2002/01/P3Pv1/historical"
			false,	//"http://www.w3.org/2002/01/P3Pv1/telemarketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/account"
			false,	//"http://www.w3.org/2002/01/P3Pv11/arts"
			false,	//"http://www.w3.org/2002/01/P3Pv11/browsing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/charity"
			false,	//"http://www.w3.org/2002/01/P3Pv11/communicate"
			false,	//"http://www.w3.org/2002/01/P3Pv11/custom"
			false,	//"http://www.w3.org/2002/01/P3Pv11/delivery"
			false,	//"http://www.w3.org/2002/01/P3Pv11/downloads"
			false,	//"http://www.w3.org/2002/01/P3Pv11/education"
			false,	//"http://www.w3.org/2002/01/P3Pv11/feedback"
			false,	//"http://www.w3.org/2002/01/P3Pv11/finmgt"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gambling"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gaming"
			false,	//"http://www.w3.org/2002/01/P3Pv11/government"
			false,	//"http://www.w3.org/2002/01/P3Pv11/health"
			false,	//"http://www.w3.org/2002/01/P3Pv11/login"
			false,	//"http://www.w3.org/2002/01/P3Pv11/marketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/news"
			false,	//"http://www.w3.org/2002/01/P3Pv11/payment"
			false,	//"http://www.w3.org/2002/01/P3Pv11/sales"
			false,	//"http://www.w3.org/2002/01/P3Pv11/search"
			false,	//"http://www.w3.org/2002/01/P3Pv11/state"
			false,	//"http://www.w3.org/2002/01/P3Pv11/surveys"
			false	//"http://www.primelife.eu/purposes/unspecified"
			];

		var trigger_purpose = [
			false,	//"http://www.w3.org/2002/01/P3Pv1/current"
			false,	//"http://www.w3.org/2002/01/P3Pv1/admin"
			false,	//"http://www.w3.org/2002/01/P3Pv1/develop"
			false,	//"http://www.w3.org/2002/01/P3Pv1/tailoring"
			true,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/contact"
			false,	//"http://www.w3.org/2002/01/P3Pv1/historical"
			false,	//"http://www.w3.org/2002/01/P3Pv1/telemarketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/account"
			false,	//"http://www.w3.org/2002/01/P3Pv11/arts"
			false,	//"http://www.w3.org/2002/01/P3Pv11/browsing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/charity"
			false,	//"http://www.w3.org/2002/01/P3Pv11/communicate"
			false,	//"http://www.w3.org/2002/01/P3Pv11/custom"
			false,	//"http://www.w3.org/2002/01/P3Pv11/delivery"
			false,	//"http://www.w3.org/2002/01/P3Pv11/downloads"
			false,	//"http://www.w3.org/2002/01/P3Pv11/education"
			false,	//"http://www.w3.org/2002/01/P3Pv11/feedback"
			false,	//"http://www.w3.org/2002/01/P3Pv11/finmgt"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gambling"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gaming"
			false,	//"http://www.w3.org/2002/01/P3Pv11/government"
			false,	//"http://www.w3.org/2002/01/P3Pv11/health"
			false,	//"http://www.w3.org/2002/01/P3Pv11/login"
			false,	//"http://www.w3.org/2002/01/P3Pv11/marketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/news"
			false,	//"http://www.w3.org/2002/01/P3Pv11/payment"
			false,	//"http://www.w3.org/2002/01/P3Pv11/sales"
			false,	//"http://www.w3.org/2002/01/P3Pv11/search"
			false,	//"http://www.w3.org/2002/01/P3Pv11/state"
			false,	//"http://www.w3.org/2002/01/P3Pv11/surveys"
			false	//"http://www.primelife.eu/purposes/unspecified"
			];

		var triggers = [];
		var obligations = [];

		var action = {
			actionID: "ActionNotifyDataSubject",
			Media: "email",
			Address: "user@webinos.org"
		};

		triggers[0] = {
			triggerID : "TriggerPersonalDataAccessedForPurpose",
			Purpose : trigger_purpose,
			MaxDelay : "P0Y0M8DT0H0M0S"
		};

		obligations[0] = {
			action : action,
			triggers : triggers
		};
		console.log(JSON.stringify(obligations));

		runs(function() {
			var res = checkFeature(policyList[20], userList[0], companyList[0], featureList[2], deviceList[0], purpose, obligations);
			expect(res).toEqual(4);
		});

	});

	it("DHPref: ActionLog and TriggerPersonalDataDeleted test 1", function() {
		var purpose = [
			true,	//"http://www.w3.org/2002/01/P3Pv1/current"
			false,	//"http://www.w3.org/2002/01/P3Pv1/admin"
			false,	//"http://www.w3.org/2002/01/P3Pv1/develop"
			false,	//"http://www.w3.org/2002/01/P3Pv1/tailoring"
			true,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/contact"
			false,	//"http://www.w3.org/2002/01/P3Pv1/historical"
			false,	//"http://www.w3.org/2002/01/P3Pv1/telemarketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/account"
			false,	//"http://www.w3.org/2002/01/P3Pv11/arts"
			false,	//"http://www.w3.org/2002/01/P3Pv11/browsing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/charity"
			false,	//"http://www.w3.org/2002/01/P3Pv11/communicate"
			false,	//"http://www.w3.org/2002/01/P3Pv11/custom"
			false,	//"http://www.w3.org/2002/01/P3Pv11/delivery"
			false,	//"http://www.w3.org/2002/01/P3Pv11/downloads"
			false,	//"http://www.w3.org/2002/01/P3Pv11/education"
			false,	//"http://www.w3.org/2002/01/P3Pv11/feedback"
			false,	//"http://www.w3.org/2002/01/P3Pv11/finmgt"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gambling"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gaming"
			false,	//"http://www.w3.org/2002/01/P3Pv11/government"
			false,	//"http://www.w3.org/2002/01/P3Pv11/health"
			false,	//"http://www.w3.org/2002/01/P3Pv11/login"
			false,	//"http://www.w3.org/2002/01/P3Pv11/marketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/news"
			false,	//"http://www.w3.org/2002/01/P3Pv11/payment"
			false,	//"http://www.w3.org/2002/01/P3Pv11/sales"
			false,	//"http://www.w3.org/2002/01/P3Pv11/search"
			false,	//"http://www.w3.org/2002/01/P3Pv11/state"
			false,	//"http://www.w3.org/2002/01/P3Pv11/surveys"
			false	//"http://www.primelife.eu/purposes/unspecified"
			];

		var triggers = [];
		var obligations = [];

		var action = {
			actionID: "ActionLog"
		};

		triggers[0] = {
			triggerID : "TriggerPersonalDataDeleted",
			MaxDelay : "P0Y0M5DT0H0M0S"
		};

		obligations[0] = {
			action : action,
			triggers : triggers
		};
		console.log(JSON.stringify(obligations));

		runs(function() {
			var res = checkFeature(policyList[21], userList[0], companyList[0], featureList[2], deviceList[0], purpose, obligations);
			expect(res).toEqual(0);
		});

	});

	it("DHPref: ActionLog and TriggerPersonalDataDeleted test 2", function() {
		var purpose = [
			true,	//"http://www.w3.org/2002/01/P3Pv1/current"
			false,	//"http://www.w3.org/2002/01/P3Pv1/admin"
			false,	//"http://www.w3.org/2002/01/P3Pv1/develop"
			false,	//"http://www.w3.org/2002/01/P3Pv1/tailoring"
			true,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/contact"
			false,	//"http://www.w3.org/2002/01/P3Pv1/historical"
			false,	//"http://www.w3.org/2002/01/P3Pv1/telemarketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/account"
			false,	//"http://www.w3.org/2002/01/P3Pv11/arts"
			false,	//"http://www.w3.org/2002/01/P3Pv11/browsing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/charity"
			false,	//"http://www.w3.org/2002/01/P3Pv11/communicate"
			false,	//"http://www.w3.org/2002/01/P3Pv11/custom"
			false,	//"http://www.w3.org/2002/01/P3Pv11/delivery"
			false,	//"http://www.w3.org/2002/01/P3Pv11/downloads"
			false,	//"http://www.w3.org/2002/01/P3Pv11/education"
			false,	//"http://www.w3.org/2002/01/P3Pv11/feedback"
			false,	//"http://www.w3.org/2002/01/P3Pv11/finmgt"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gambling"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gaming"
			false,	//"http://www.w3.org/2002/01/P3Pv11/government"
			false,	//"http://www.w3.org/2002/01/P3Pv11/health"
			false,	//"http://www.w3.org/2002/01/P3Pv11/login"
			false,	//"http://www.w3.org/2002/01/P3Pv11/marketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/news"
			false,	//"http://www.w3.org/2002/01/P3Pv11/payment"
			false,	//"http://www.w3.org/2002/01/P3Pv11/sales"
			false,	//"http://www.w3.org/2002/01/P3Pv11/search"
			false,	//"http://www.w3.org/2002/01/P3Pv11/state"
			false,	//"http://www.w3.org/2002/01/P3Pv11/surveys"
			false	//"http://www.primelife.eu/purposes/unspecified"
			];

		var triggers = [];
		var obligations = [];

		var action = {
			actionID: "ActionLog"
		};

		triggers[0] = {
			triggerID : "TriggerPersonalDataDeleted",
			MaxDelay : "P0Y0M8DT0H0M0S"
		};

		obligations[0] = {
			action : action,
			triggers : triggers
		};
		console.log(JSON.stringify(obligations));

		runs(function() {
			var res = checkFeature(policyList[21], userList[0], companyList[0], featureList[2], deviceList[0], purpose, obligations);
			expect(res).toEqual(4);
		});

	});

	it("DHPref: ActionSecureLog and TriggerPersonalDataDeleted test 1", function() {
		var purpose = [
			true,	//"http://www.w3.org/2002/01/P3Pv1/current"
			false,	//"http://www.w3.org/2002/01/P3Pv1/admin"
			false,	//"http://www.w3.org/2002/01/P3Pv1/develop"
			false,	//"http://www.w3.org/2002/01/P3Pv1/tailoring"
			true,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/contact"
			false,	//"http://www.w3.org/2002/01/P3Pv1/historical"
			false,	//"http://www.w3.org/2002/01/P3Pv1/telemarketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/account"
			false,	//"http://www.w3.org/2002/01/P3Pv11/arts"
			false,	//"http://www.w3.org/2002/01/P3Pv11/browsing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/charity"
			false,	//"http://www.w3.org/2002/01/P3Pv11/communicate"
			false,	//"http://www.w3.org/2002/01/P3Pv11/custom"
			false,	//"http://www.w3.org/2002/01/P3Pv11/delivery"
			false,	//"http://www.w3.org/2002/01/P3Pv11/downloads"
			false,	//"http://www.w3.org/2002/01/P3Pv11/education"
			false,	//"http://www.w3.org/2002/01/P3Pv11/feedback"
			false,	//"http://www.w3.org/2002/01/P3Pv11/finmgt"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gambling"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gaming"
			false,	//"http://www.w3.org/2002/01/P3Pv11/government"
			false,	//"http://www.w3.org/2002/01/P3Pv11/health"
			false,	//"http://www.w3.org/2002/01/P3Pv11/login"
			false,	//"http://www.w3.org/2002/01/P3Pv11/marketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/news"
			false,	//"http://www.w3.org/2002/01/P3Pv11/payment"
			false,	//"http://www.w3.org/2002/01/P3Pv11/sales"
			false,	//"http://www.w3.org/2002/01/P3Pv11/search"
			false,	//"http://www.w3.org/2002/01/P3Pv11/state"
			false,	//"http://www.w3.org/2002/01/P3Pv11/surveys"
			false	//"http://www.primelife.eu/purposes/unspecified"
			];

		var triggers = [];
		var obligations = [];

		var action = {
			actionID: "ActionSecureLog"
		};

		triggers[0] = {
			triggerID : "TriggerPersonalDataDeleted",
			MaxDelay : "P0Y0M5DT0H0M0S"
		};

		obligations[0] = {
			action : action,
			triggers : triggers
		};
		console.log(JSON.stringify(obligations));

		runs(function() {
			var res = checkFeature(policyList[21], userList[0], companyList[0], featureList[2], deviceList[0], purpose, obligations);
			expect(res).toEqual(0);
		});

	});

	it("DHPref: ActionSecureLog and TriggerPersonalDataDeleted test 2", function() {
		var purpose = [
			true,	//"http://www.w3.org/2002/01/P3Pv1/current"
			false,	//"http://www.w3.org/2002/01/P3Pv1/admin"
			false,	//"http://www.w3.org/2002/01/P3Pv1/develop"
			false,	//"http://www.w3.org/2002/01/P3Pv1/tailoring"
			true,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/contact"
			false,	//"http://www.w3.org/2002/01/P3Pv1/historical"
			false,	//"http://www.w3.org/2002/01/P3Pv1/telemarketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/account"
			false,	//"http://www.w3.org/2002/01/P3Pv11/arts"
			false,	//"http://www.w3.org/2002/01/P3Pv11/browsing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/charity"
			false,	//"http://www.w3.org/2002/01/P3Pv11/communicate"
			false,	//"http://www.w3.org/2002/01/P3Pv11/custom"
			false,	//"http://www.w3.org/2002/01/P3Pv11/delivery"
			false,	//"http://www.w3.org/2002/01/P3Pv11/downloads"
			false,	//"http://www.w3.org/2002/01/P3Pv11/education"
			false,	//"http://www.w3.org/2002/01/P3Pv11/feedback"
			false,	//"http://www.w3.org/2002/01/P3Pv11/finmgt"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gambling"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gaming"
			false,	//"http://www.w3.org/2002/01/P3Pv11/government"
			false,	//"http://www.w3.org/2002/01/P3Pv11/health"
			false,	//"http://www.w3.org/2002/01/P3Pv11/login"
			false,	//"http://www.w3.org/2002/01/P3Pv11/marketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/news"
			false,	//"http://www.w3.org/2002/01/P3Pv11/payment"
			false,	//"http://www.w3.org/2002/01/P3Pv11/sales"
			false,	//"http://www.w3.org/2002/01/P3Pv11/search"
			false,	//"http://www.w3.org/2002/01/P3Pv11/state"
			false,	//"http://www.w3.org/2002/01/P3Pv11/surveys"
			false	//"http://www.primelife.eu/purposes/unspecified"
			];

		var triggers = [];
		var obligations = [];

		var action = {
			actionID: "ActionSecureLog"
		};

		triggers[0] = {
			triggerID : "TriggerPersonalDataDeleted",
			MaxDelay : "P0Y0M8DT0H0M0S"
		};

		obligations[0] = {
			action : action,
			triggers : triggers
		};
		console.log(JSON.stringify(obligations));

		runs(function() {
			var res = checkFeature(policyList[21], userList[0], companyList[0], featureList[2], deviceList[0], purpose, obligations);
			expect(res).toEqual(4);
		});

	});

	it("DHPref: ActionLog and TriggerDatsSubjectAccess test 1", function() {
		var purpose = [
			true,	//"http://www.w3.org/2002/01/P3Pv1/current"
			false,	//"http://www.w3.org/2002/01/P3Pv1/admin"
			false,	//"http://www.w3.org/2002/01/P3Pv1/develop"
			false,	//"http://www.w3.org/2002/01/P3Pv1/tailoring"
			true,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/contact"
			false,	//"http://www.w3.org/2002/01/P3Pv1/historical"
			false,	//"http://www.w3.org/2002/01/P3Pv1/telemarketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/account"
			false,	//"http://www.w3.org/2002/01/P3Pv11/arts"
			false,	//"http://www.w3.org/2002/01/P3Pv11/browsing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/charity"
			false,	//"http://www.w3.org/2002/01/P3Pv11/communicate"
			false,	//"http://www.w3.org/2002/01/P3Pv11/custom"
			false,	//"http://www.w3.org/2002/01/P3Pv11/delivery"
			false,	//"http://www.w3.org/2002/01/P3Pv11/downloads"
			false,	//"http://www.w3.org/2002/01/P3Pv11/education"
			false,	//"http://www.w3.org/2002/01/P3Pv11/feedback"
			false,	//"http://www.w3.org/2002/01/P3Pv11/finmgt"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gambling"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gaming"
			false,	//"http://www.w3.org/2002/01/P3Pv11/government"
			false,	//"http://www.w3.org/2002/01/P3Pv11/health"
			false,	//"http://www.w3.org/2002/01/P3Pv11/login"
			false,	//"http://www.w3.org/2002/01/P3Pv11/marketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/news"
			false,	//"http://www.w3.org/2002/01/P3Pv11/payment"
			false,	//"http://www.w3.org/2002/01/P3Pv11/sales"
			false,	//"http://www.w3.org/2002/01/P3Pv11/search"
			false,	//"http://www.w3.org/2002/01/P3Pv11/state"
			false,	//"http://www.w3.org/2002/01/P3Pv11/surveys"
			false	//"http://www.primelife.eu/purposes/unspecified"
			];

		var triggers = [];
		var obligations = [];

		var action = {
			actionID: "ActionLog"
		};

		triggers[0] = {
			triggerID : "TriggerDataSubjectAccess",
			Uri : "http://webinos.org/user/data"
		};

		obligations[0] = {
			action : action,
			triggers : triggers
		};
		console.log(JSON.stringify(obligations));

		runs(function() {
			var res = checkFeature(policyList[22], userList[0], companyList[0], featureList[2], deviceList[0], purpose, obligations);
			expect(res).toEqual(4);
		});

	});

	it("DHPref: ActionLog and TriggerDataSubjectAccess test 2", function() {
		var purpose = [
			true,	//"http://www.w3.org/2002/01/P3Pv1/current"
			false,	//"http://www.w3.org/2002/01/P3Pv1/admin"
			false,	//"http://www.w3.org/2002/01/P3Pv1/develop"
			false,	//"http://www.w3.org/2002/01/P3Pv1/tailoring"
			true,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/contact"
			false,	//"http://www.w3.org/2002/01/P3Pv1/historical"
			false,	//"http://www.w3.org/2002/01/P3Pv1/telemarketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/account"
			false,	//"http://www.w3.org/2002/01/P3Pv11/arts"
			false,	//"http://www.w3.org/2002/01/P3Pv11/browsing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/charity"
			false,	//"http://www.w3.org/2002/01/P3Pv11/communicate"
			false,	//"http://www.w3.org/2002/01/P3Pv11/custom"
			false,	//"http://www.w3.org/2002/01/P3Pv11/delivery"
			false,	//"http://www.w3.org/2002/01/P3Pv11/downloads"
			false,	//"http://www.w3.org/2002/01/P3Pv11/education"
			false,	//"http://www.w3.org/2002/01/P3Pv11/feedback"
			false,	//"http://www.w3.org/2002/01/P3Pv11/finmgt"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gambling"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gaming"
			false,	//"http://www.w3.org/2002/01/P3Pv11/government"
			false,	//"http://www.w3.org/2002/01/P3Pv11/health"
			false,	//"http://www.w3.org/2002/01/P3Pv11/login"
			false,	//"http://www.w3.org/2002/01/P3Pv11/marketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/news"
			false,	//"http://www.w3.org/2002/01/P3Pv11/payment"
			false,	//"http://www.w3.org/2002/01/P3Pv11/sales"
			false,	//"http://www.w3.org/2002/01/P3Pv11/search"
			false,	//"http://www.w3.org/2002/01/P3Pv11/state"
			false,	//"http://www.w3.org/2002/01/P3Pv11/surveys"
			false	//"http://www.primelife.eu/purposes/unspecified"
			];

		var triggers = [];
		var obligations = [];

		var action = {
			actionID: "ActionLog"
		};

		triggers[0] = {
			triggerID : "TriggerDataSubjectAccess",
			Uri : "http://webinos.org/anotherUser/data"
		};

		obligations[0] = {
			action : action,
			triggers : triggers
		};
		console.log(JSON.stringify(obligations));

		runs(function() {
			var res = checkFeature(policyList[22], userList[0], companyList[0], featureList[2], deviceList[0], purpose, obligations);
			expect(res).toEqual(4);
		});

	});

	it("DHPref: ActionSecureLog and TriggerDatsSubjectAccess test 1", function() {
		var purpose = [
			true,	//"http://www.w3.org/2002/01/P3Pv1/current"
			false,	//"http://www.w3.org/2002/01/P3Pv1/admin"
			false,	//"http://www.w3.org/2002/01/P3Pv1/develop"
			false,	//"http://www.w3.org/2002/01/P3Pv1/tailoring"
			true,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/contact"
			false,	//"http://www.w3.org/2002/01/P3Pv1/historical"
			false,	//"http://www.w3.org/2002/01/P3Pv1/telemarketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/account"
			false,	//"http://www.w3.org/2002/01/P3Pv11/arts"
			false,	//"http://www.w3.org/2002/01/P3Pv11/browsing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/charity"
			false,	//"http://www.w3.org/2002/01/P3Pv11/communicate"
			false,	//"http://www.w3.org/2002/01/P3Pv11/custom"
			false,	//"http://www.w3.org/2002/01/P3Pv11/delivery"
			false,	//"http://www.w3.org/2002/01/P3Pv11/downloads"
			false,	//"http://www.w3.org/2002/01/P3Pv11/education"
			false,	//"http://www.w3.org/2002/01/P3Pv11/feedback"
			false,	//"http://www.w3.org/2002/01/P3Pv11/finmgt"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gambling"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gaming"
			false,	//"http://www.w3.org/2002/01/P3Pv11/government"
			false,	//"http://www.w3.org/2002/01/P3Pv11/health"
			false,	//"http://www.w3.org/2002/01/P3Pv11/login"
			false,	//"http://www.w3.org/2002/01/P3Pv11/marketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/news"
			false,	//"http://www.w3.org/2002/01/P3Pv11/payment"
			false,	//"http://www.w3.org/2002/01/P3Pv11/sales"
			false,	//"http://www.w3.org/2002/01/P3Pv11/search"
			false,	//"http://www.w3.org/2002/01/P3Pv11/state"
			false,	//"http://www.w3.org/2002/01/P3Pv11/surveys"
			false	//"http://www.primelife.eu/purposes/unspecified"
			];

		var triggers = [];
		var obligations = [];

		var action = {
			actionID: "ActionSecureLog"
		};

		triggers[0] = {
			triggerID : "TriggerDataSubjectAccess",
			Uri : "http://webinos.org/user/data"
		};

		obligations[0] = {
			action : action,
			triggers : triggers
		};
		console.log(JSON.stringify(obligations));

		runs(function() {
			var res = checkFeature(policyList[22], userList[0], companyList[0], featureList[2], deviceList[0], purpose, obligations);
			expect(res).toEqual(0);
		});

	});

	it("DHPref: ActionSecureLog and TriggerDataSubjectAccess test 2", function() {
		var purpose = [
			true,	//"http://www.w3.org/2002/01/P3Pv1/current"
			false,	//"http://www.w3.org/2002/01/P3Pv1/admin"
			false,	//"http://www.w3.org/2002/01/P3Pv1/develop"
			false,	//"http://www.w3.org/2002/01/P3Pv1/tailoring"
			true,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/contact"
			false,	//"http://www.w3.org/2002/01/P3Pv1/historical"
			false,	//"http://www.w3.org/2002/01/P3Pv1/telemarketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/account"
			false,	//"http://www.w3.org/2002/01/P3Pv11/arts"
			false,	//"http://www.w3.org/2002/01/P3Pv11/browsing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/charity"
			false,	//"http://www.w3.org/2002/01/P3Pv11/communicate"
			false,	//"http://www.w3.org/2002/01/P3Pv11/custom"
			false,	//"http://www.w3.org/2002/01/P3Pv11/delivery"
			false,	//"http://www.w3.org/2002/01/P3Pv11/downloads"
			false,	//"http://www.w3.org/2002/01/P3Pv11/education"
			false,	//"http://www.w3.org/2002/01/P3Pv11/feedback"
			false,	//"http://www.w3.org/2002/01/P3Pv11/finmgt"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gambling"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gaming"
			false,	//"http://www.w3.org/2002/01/P3Pv11/government"
			false,	//"http://www.w3.org/2002/01/P3Pv11/health"
			false,	//"http://www.w3.org/2002/01/P3Pv11/login"
			false,	//"http://www.w3.org/2002/01/P3Pv11/marketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/news"
			false,	//"http://www.w3.org/2002/01/P3Pv11/payment"
			false,	//"http://www.w3.org/2002/01/P3Pv11/sales"
			false,	//"http://www.w3.org/2002/01/P3Pv11/search"
			false,	//"http://www.w3.org/2002/01/P3Pv11/state"
			false,	//"http://www.w3.org/2002/01/P3Pv11/surveys"
			false	//"http://www.primelife.eu/purposes/unspecified"
			];

		var triggers = [];
		var obligations = [];

		var action = {
			actionID: "ActionSecureLog"
		};

		triggers[0] = {
			triggerID : "TriggerDataSubjectAccess",
			Uri : "http://webinos.org/anotherUser/data"
		};

		obligations[0] = {
			action : action,
			triggers : triggers
		};
		console.log(JSON.stringify(obligations));

		runs(function() {
			var res = checkFeature(policyList[22], userList[0], companyList[0], featureList[2], deviceList[0], purpose, obligations);
			expect(res).toEqual(4);
		});

	});

	it("Two features test", function() {
		var purpose = [
			false,	//"http://www.w3.org/2002/01/P3Pv1/current"
			false,	//"http://www.w3.org/2002/01/P3Pv1/admin"
			false,	//"http://www.w3.org/2002/01/P3Pv1/develop"
			false,	//"http://www.w3.org/2002/01/P3Pv1/tailoring"
			true,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/pseudo-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-analysis"
			false,	//"http://www.w3.org/2002/01/P3Pv1/individual-decision"
			false,	//"http://www.w3.org/2002/01/P3Pv1/contact"
			false,	//"http://www.w3.org/2002/01/P3Pv1/historical"
			false,	//"http://www.w3.org/2002/01/P3Pv1/telemarketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/account"
			false,	//"http://www.w3.org/2002/01/P3Pv11/arts"
			false,	//"http://www.w3.org/2002/01/P3Pv11/browsing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/charity"
			false,	//"http://www.w3.org/2002/01/P3Pv11/communicate"
			false,	//"http://www.w3.org/2002/01/P3Pv11/custom"
			false,	//"http://www.w3.org/2002/01/P3Pv11/delivery"
			false,	//"http://www.w3.org/2002/01/P3Pv11/downloads"
			false,	//"http://www.w3.org/2002/01/P3Pv11/education"
			false,	//"http://www.w3.org/2002/01/P3Pv11/feedback"
			false,	//"http://www.w3.org/2002/01/P3Pv11/finmgt"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gambling"
			false,	//"http://www.w3.org/2002/01/P3Pv11/gaming"
			false,	//"http://www.w3.org/2002/01/P3Pv11/government"
			false,	//"http://www.w3.org/2002/01/P3Pv11/health"
			false,	//"http://www.w3.org/2002/01/P3Pv11/login"
			false,	//"http://www.w3.org/2002/01/P3Pv11/marketing"
			false,	//"http://www.w3.org/2002/01/P3Pv11/news"
			false,	//"http://www.w3.org/2002/01/P3Pv11/payment"
			false,	//"http://www.w3.org/2002/01/P3Pv11/sales"
			false,	//"http://www.w3.org/2002/01/P3Pv11/search"
			false,	//"http://www.w3.org/2002/01/P3Pv11/state"
			false,	//"http://www.w3.org/2002/01/P3Pv11/surveys"
			false	//"http://www.primelife.eu/purposes/unspecified"
			];

		var obligations = [];
		var triggers = [];

		var action = {
			actionID: "ActionDeletePersonalData"
		};

		triggers[0] = {
			triggerID : "TriggerAtTime",
			Start : "StartNow",
			MaxDelay : "P0Y0M5DT0H0M0S"
		};

		obligations[0] = {
			action : action,
			triggers : triggers
		};
		runs(function() {
			var res = checkFeature(policyList[23], userList[0], companyList[0], featureList[1], deviceList[0], purpose, obligations);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[23], userList[0], companyList[0], featureList[2], deviceList[0], purpose, obligations);
			expect(res).toEqual(0);
		});
	});

	it("DHPref, allow all (default policy)", function() {

		runs(function() {
			var res = checkFeature(policyList[24], userList[0], companyList[0], featureList[0], deviceList[0]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[24], userList[0], companyList[0], featureList[3], deviceList[0]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[24], userList[1], companyList[0], featureList[1], deviceList[0]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[24], userList[1], companyList[0], featureList[4], deviceList[0]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[24], userList[2], companyList[0], featureList[2], deviceList[0]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[24], userList[2], companyList[0], featureList[5], deviceList[0]);
			expect(res).toEqual(0);
		});

	});
});

