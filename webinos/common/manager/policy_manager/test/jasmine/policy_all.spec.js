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


var policyList = [
	"policy1.xml",
	"policy2.xml",
	"policy3.xml",
	"policy4.xml",
	"policy5.xml"
	];


function loadManager() {
	pmlib = require("../../lib/policymanager.js");
	pm = new pmlib.policyManager();
	return pm;
}


function changepolicy(fileName) {
	console.log("Change policy to file "+fileName);
	var data = fs.readFileSync("./"+fileName);
	fs.writeFileSync("./"+"policy.xml", data);
}


function setRequest(userId, feature) {
	console.log("Setting request for user "+userId+" and feature "+feature);
	var req = {};
	var ri = {};
	var si = {};
	si.userId = userId;
	req.subjectInfo = si;
	ri.apiFeature = feature;
	req.resourceInfo = ri;
	return req;
}


function checkFeature(policyName, userName, featureName) {
	changepolicy(policyName);
	pm = loadManager();

	var req = setRequest(userName, featureName);
	var res = pm.enforceRequest(req);
	console.log("result is "+res);
	return res;
}


describe("Manager.PolicyManager", function() {
	it("Every user can access every feature", function() {
		runs(function() {
			var res = checkFeature(policyList[0], userList[0], featureList[0]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[0], userList[0], featureList[3]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[0], userList[1], featureList[1]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[0], userList[1], featureList[4]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[0], userList[2], featureList[2]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[0], userList[2], featureList[5]);
			expect(res).toEqual(0);
		});


	});

	it("Every feature is denied to every user", function() {
		runs(function() {
			var res = checkFeature(policyList[2], userList[0], featureList[2]);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[2], userList[0], featureList[3]);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[2], userList[1], featureList[4]);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[2], userList[1], featureList[5]);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[2], userList[2], featureList[6]);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[2], userList[2], featureList[7]);
			expect(res).toEqual(1);
		});

	});

	it("user1 is allowed, user2 prompted, user3 denied", function() {
		runs(function() {
			var res = checkFeature(policyList[1], userList[0], featureList[0]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[1], userList[0], featureList[1]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[1], userList[1], featureList[0]);
			expect(res).toBeGreaterThan(1);
			expect(res).toBeLessThan(5);
		});

		runs(function() {
			var res = checkFeature(policyList[1], userList[1], featureList[1]);
			expect(res).toBeGreaterThan(1);
			expect(res).toBeLessThan(5);
		});

		runs(function() {
			var res = checkFeature(policyList[1], userList[2], featureList[0]);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[1], userList[2], featureList[1]);
			expect(res).toEqual(1);
		});

	});

	it("pzowner is allowed, pzfriend prompted, untrusted user denied", function() {
		runs(function() {
			var res = checkFeature(policyList[3], userList[0], featureList[0]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[3], userList[0], featureList[1]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[3], userList[1], featureList[0]);
			expect(res).toBeGreaterThan(1);
			expect(res).toBeLessThan(5);
		});

		runs(function() {
			var res = checkFeature(policyList[3], userList[1], featureList[1]);
			expect(res).toBeGreaterThan(1);
			expect(res).toBeLessThan(5);
		});

		runs(function() {
			var res = checkFeature(policyList[3], userList[2], featureList[0]);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[3], userList[2], featureList[1]);
			expect(res).toEqual(1);
		});

	});


	it("Mixed permissions", function() {
		runs(function() {
			var res = checkFeature(policyList[4], userList[0], featureList[0]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[4], userList[0], featureList[3]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[4], userList[0], featureList[6]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[4], userList[0], featureList[7]);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[4], userList[0], featureList[1]);
			expect(res).toBeGreaterThan(1);
			expect(res).toBeLessThan(5);
		});

		runs(function() {
			var res = checkFeature(policyList[4], userList[0], featureList[2]);
			expect(res).toBeGreaterThan(1);
			expect(res).toBeLessThan(5);
		});

		runs(function() {
			var res = checkFeature(policyList[4], userList[0], featureList[4]);
			expect(res).toBeGreaterThan(1);
			expect(res).toBeLessThan(5);
		});

		runs(function() {
			var res = checkFeature(policyList[4], userList[1], featureList[7]);
			expect(res).toBeGreaterThan(1);
			expect(res).toBeLessThan(5);
		});

		runs(function() {
			var res = checkFeature(policyList[4], userList[1], featureList[6]);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[4], userList[2], featureList[7]);
			expect(res).toEqual(1);
		});

	});


});

