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
	"policy_dhp_1.xml",
	"policy_dhp_2.xml",
	"policy_dhp_3.xml",
	"policy_dhp_4.xml",
	"policy_dhp_5.xml",
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


function setRequest(userId, certCn, feature, deviceId, purpose) {
	console.log("Setting request for user "+userId+", device "+deviceId+", application released by "+certCn+", feature "+feature+" and purpose "+purpose);
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
	req.purpose = purpose
	return req;
}


function checkFeature(policyName, userName, certName, featureName, deviceId, purpose) {
	changepolicy(policyName);
	pm = loadManager();

	var req = setRequest(userName, certName, featureName, deviceId, purpose);

	// noprompt (third parameter) set to true
	var res = pm.enforceRequest(req, 0, true);
	console.log("result is "+res);
	return res;
}


describe("Manager.PolicyManager", function() {

	it("Every user can access every feature", function() {
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
			var res = checkFeature(policyList[0], userList[0], companyList[0], featureList[0], deviceList[0], purpose);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[0], userList[0], companyList[0], featureList[3], deviceList[0], purpose);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[0], userList[1], companyList[0], featureList[1], deviceList[0], purpose);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[0], userList[1], companyList[0], featureList[4], deviceList[0], purpose);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[0], userList[2], companyList[0], featureList[2], deviceList[0], purpose);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[0], userList[2], companyList[0], featureList[5], deviceList[0], purpose);
			expect(res).toEqual(0);
		});

	});

	it("Every feature is denied to every user", function() {
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
			var res = checkFeature(policyList[1], userList[0], companyList[0], featureList[2], deviceList[0], purpose);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[1], userList[0], companyList[0], featureList[3], deviceList[0], purpose);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[1], userList[1], companyList[0], featureList[4], deviceList[0], purpose);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[1], userList[1], companyList[0], featureList[5], deviceList[0], purpose);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[1], userList[2], companyList[0], featureList[6], deviceList[0], purpose);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[1], userList[2], companyList[0], featureList[7], deviceList[0], purpose);
			expect(res).toEqual(1);
		});
	});

	it("user1 allowed, user2 prompted due to DHPref, user3 denied", function() {
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
			var res = checkFeature(policyList[2], userList[0], companyList[0], featureList[0], deviceList[0], purpose);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[2], userList[0], companyList[0], featureList[1], deviceList[0], purpose);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[2], userList[1], companyList[0], featureList[0], deviceList[0], purpose);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[2], userList[1], companyList[0], featureList[1], deviceList[0], purpose);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[2], userList[2], companyList[0], featureList[0], deviceList[0], purpose);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[2], userList[2], companyList[0], featureList[1], deviceList[0], purpose);
			expect(res).toEqual(1);
		});

	});

	it("Users mixed permissions", function() {
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
			var res = checkFeature(policyList[3], userList[0], companyList[0], featureList[0], deviceList[0], purpose);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[3], userList[0], companyList[0], featureList[3], deviceList[0], purpose);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[3], userList[0], companyList[0], featureList[6], deviceList[0], purpose);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[3], userList[0], companyList[0], featureList[7], deviceList[0], purpose);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[3], userList[0], companyList[0], featureList[1], deviceList[0], purpose);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[3], userList[0], companyList[0], featureList[2], deviceList[0], purpose);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[3], userList[0], companyList[0], featureList[4], deviceList[0], purpose);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[3], userList[1], companyList[0], featureList[7], deviceList[0], purpose);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[3], userList[1], companyList[0], featureList[6], deviceList[0], purpose);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[3], userList[2], companyList[0], featureList[7], deviceList[0], purpose);
			expect(res).toEqual(1);
		});
	});

	it("mixed policy", function() {
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
			var res = checkFeature(policyList[4], userList[0], companyList[0], featureList[0], deviceList[0], purpose);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[4], userList[0], companyList[1], featureList[4], deviceList[2], purpose);
			expect(res).toEqual(0);
		});

		runs(function() {
			var res = checkFeature(policyList[4], userList[0], companyList[0], featureList[4], deviceList[1], purpose);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[4], userList[1], companyList[0], featureList[3], deviceList[1], purpose);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[4], userList[1], companyList[0], featureList[1], deviceList[0], purpose);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[4], userList[1], companyList[1], featureList[0], deviceList[1], purpose);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[4], userList[1], companyList[0], featureList[6], deviceList[2], purpose);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[4], userList[1], companyList[0], featureList[4], deviceList[1], purpose);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[4], userList[2], companyList[2], featureList[1], deviceList[2], purpose);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[4], userList[2], companyList[0], featureList[7], deviceList[0], purpose);
			expect(res).toEqual(1);
		});

		runs(function() {
			var res = checkFeature(policyList[4], userList[2], companyList[0], featureList[0], deviceList[1], purpose);
			expect(res).toEqual(4);
		});

		runs(function() {
			var res = checkFeature(policyList[4], userList[2], companyList[1], featureList[4], deviceList[1], purpose);
			expect(res).toEqual(1);
		});
	});
});

