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
var common = require("../../../../../pzp/lib/session_common");
var policyFile = common.webinosConfigPath()+"/policy.xml";
var policyBackup = common.webinosConfigPath()+"/policy.bak";

var featureList = [
	"http://webinos.org/api/discovery",
	"http://www.w3.org/ns/api-perms/geolocation",
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
	"policy13.xml"
	];


function loadManager() {
	pmlib = require("../../lib/policymanager.js");
	pm = new pmlib.policyManager();
	return pm;
}


function changepolicy(fileName) {
	console.log("Change policy to file "+fileName);
	var data = fs.readFileSync("./"+fileName);
	fs.writeFileSync(policyFile, data);
}


function backuppolicy() {
	console.log("Backup policy");
	var data = fs.readFileSync(policyFile);
	fs.writeFileSync(policyBackup, data);
}


function restorepolicy() {
	console.log("Restore policy");
	var data = fs.readFileSync(policyBackup);
	fs.writeFileSync(policyFile, data);
	fs.unlinkSync(policyBackup);
}


function setRequest(userId, certCn, feature, deviceId) {
	console.log("Setting request for user "+userId+", device "+deviceId+", application released by "+certCn+" and feature "+feature);
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
	return req;
}


function checkFeature(policyName, userName, certName, featureName, deviceId) {
	changepolicy(policyName);
	pm = loadManager();

	var req = setRequest(userName, certName, featureName, deviceId);
	var res = pm.enforceRequest(req);
	console.log("result is "+res);
	return res;
}


describe("Manager.PolicyManager", function() {

	it("Policy backup", function() {
		runs(function() {
			backuppolicy();
		});
	});

	it("Every user can access every feature", function() {
		runs(function() {
			var res = checkFeature(policyList[0], userList[0], companyList[0], featureList[0], deviceList[0]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[0], userList[0], companyList[0], featureList[3], deviceList[0]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[0], userList[1], companyList[0], featureList[1], deviceList[0]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[0], userList[1], companyList[0], featureList[4], deviceList[0]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[0], userList[2], companyList[0], featureList[2], deviceList[0]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[0], userList[2], companyList[0], featureList[5], deviceList[0]);
			expect(res).toEqual(0);
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
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[1], userList[0], companyList[0], featureList[1], deviceList[0]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[1], userList[1], companyList[0], featureList[0], deviceList[0]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[1], userList[1], companyList[0], featureList[1], deviceList[0]);
			expect(res).toEqual(0);
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

	it("Test with generic uris (pzowner and pzfriend are allowed, untrusted user denied)", function() {
		runs(function() {
			var res = checkFeature(policyList[3], userList[0], companyList[0], featureList[0], deviceList[0]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[3], userList[0], companyList[0], featureList[1], deviceList[0]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[3], userList[1], companyList[0], featureList[0], deviceList[0]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[3], userList[1], companyList[0], featureList[1], deviceList[0]);
			expect(res).toEqual(0);
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


	it("Users mixed permissions", function() {
		runs(function() {
			var res = checkFeature(policyList[4], userList[0], companyList[0], featureList[0], deviceList[0]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[4], userList[0], companyList[0], featureList[3], deviceList[0]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[4], userList[0], companyList[0], featureList[6], deviceList[0]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[4], userList[0], companyList[0], featureList[7], deviceList[0]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[4], userList[0], companyList[0], featureList[1], deviceList[0]);
			expect(res).toEqual(0);
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
			expect(res).toEqual(0);
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
			expect(res).toEqual(0);
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


	it("Test with generic uris (trusted app can access every feature, others are denied)", function() {
		runs(function() {
			var res = checkFeature(policyList[6], userList[0], companyList[0], featureList[0], deviceList[0]);
			expect(res).toEqual(0);
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


	it("Applications mixed permissions", function() {
		runs(function() {
			var res = checkFeature(policyList[7], userList[0], companyList[0], featureList[1], deviceList[0]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[7], userList[0], companyList[0], featureList[3], deviceList[0]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[7], userList[0], companyList[1], featureList[0], deviceList[0]);
			expect(res).toEqual(0);
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
			expect(res).toEqual(0);
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


	it("test with generic uris (device from pz is allowed, others are denied)", function() {
		runs(function() {
			var res = checkFeature(policyList[9], userList[0], companyList[0], featureList[1], deviceList[0]);
			expect(res).toEqual(0);
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
			expect(res).toEqual(0);
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


	it("Device mixed permissions", function() {
		runs(function() {
			var res = checkFeature(policyList[11], userList[0], companyList[0], featureList[1], deviceList[0]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[11], userList[0], companyList[0], featureList[3], deviceList[0]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[11], userList[0], companyList[0], featureList[0], deviceList[1]);
			expect(res).toEqual(0);
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
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[12], userList[0], companyList[1], featureList[4], deviceList[2]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[12], userList[0], companyList[0], featureList[4], deviceList[1]);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[12], userList[1], companyList[0], featureList[3], deviceList[1]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[12], userList[1], companyList[0], featureList[1], deviceList[0]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[12], userList[1], companyList[1], featureList[0], deviceList[1]);
			expect(res).toEqual(1);
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
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[12], userList[2], companyList[0], featureList[7], deviceList[0]);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[12], userList[2], companyList[0], featureList[0], deviceList[1]);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[12], userList[2], companyList[1], featureList[4], deviceList[1]);
			expect(res).toEqual(1);
		});

	});

	it("Restore policy", function() {
		runs(function() {
			restorepolicy();
		});
	});
});

