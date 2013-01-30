/*******************************************************************************
 *  Code contributed to the webinos project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *	 http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright 2011 Alexander Futasz, Fraunhofer FOKUS
 ******************************************************************************/

function add$(success) {
	var done = false;
	var script = document.createElement("script");
	script.src = "//ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js";
	script.onload = script.onreadystatechange = function() {
		if (!done && (!this.readyState
				|| this.readyState == 'loaded'
					|| this.readyState == 'complete') ) {
			done = true;
			success();
			script.onload = script.onreadystatechange = null;
		}
	};
	document.head.appendChild(script);
};

beforeEach(function() {
	this.addMatchers({
		toHaveProp: function(expected) {
			return typeof this.actual[expected] !== "undefined";
		}
	});
});

describe("AppState Sync API", function() {
	var testSyncObj;

	var PROPVAL = "foo";
	var PROPVALOTHERAPP = "baz";
	var objTemplate = {
		"prop0": PROPVAL
	};

	it("is there", function() {
		expect(webinos.sync).toBeDefined();
	});

	it("has all the functions", function() {
		expect(webinos.sync.create).toBeDefined();
		expect(webinos.sync.find).toBeDefined();
		expect(webinos.sync.detach).toBeDefined();
		expect(webinos.sync.remove).toBeDefined();
	});

	it("creates a sync object", function() {
		webinos.sync.create("_testObjId", function(syncObj) {
			expect(syncObj).toEqual(jasmine.any(Object));
			expect(syncObj.watch).toEqual(jasmine.any(Function));
			expect(syncObj.unwatch).toEqual(jasmine.any(Function));
			expect(syncObj.data).toEqual(jasmine.any(Object));
			expect(syncObj.data.prop0).toEqual(PROPVAL);
			testSyncObj = syncObj;
		}, function(err) {
			console.log(err);
		}, { // options
			referenceObject: objTemplate
		});

		waitsFor(function() {
			return !!testSyncObj;
		}, "success callback called");
	});
	
	it("removes a sync object", function() {
		var removed;
		webinos.sync.remove("_testObjId", function() {
			removed = true;
		});

		waitsFor(function() {
			return removed;
		}, "success callback called");
	});

	it("can sync object between apps", function() {
		var testSyncObjOtherApp;
		var watched;
		var appended;
		var removed;

		webinos.sync.create("_testObjIdOtherApp", function(syncObj) {
			expect(syncObj).toEqual(jasmine.any(Object));
			expect(syncObj.watch).toEqual(jasmine.any(Function));
			expect(syncObj.unwatch).toEqual(jasmine.any(Function));
			expect(syncObj.data).toEqual(jasmine.any(Object));
			expect(syncObj.data.prop0).toEqual(PROPVAL);
			testSyncObjOtherApp = syncObj;
		}, function(err) {
			console.log(err);
		}, { // options
			referenceObject: objTemplate
		});

		waitsFor(function() {
			return !!testSyncObjOtherApp;
		}, "success callback called");
		
		runs(function() {
			testSyncObjOtherApp.watch("prop0", function(o) {
				expect(o).toEqual(jasmine.any(Object));
				expect(o.propertyPath).toEqual("prop0");
				expect(o.currentValue).toEqual(PROPVALOTHERAPP);
				watched = true;
			});
		});

		runs(function() {
			add$(function() {
				$('<iframe />', {
					name: "2ndsyncapp",
					src: "2ndsyncapp.html"
				}).appendTo("body");
				appended = true;
				$("iframe").hide();
			});
		});

		waitsFor(function() {
			return appended;
		});

		waitsFor(function() {
			return watched;
		}, "prop watch callback being called");

		runs(function() {
			webinos.sync.remove("_testObjIdOtherApp", function() {
				removed = true;
			});
		});

		waitsFor(function() {
			return removed;
		}, "success callback called");
	});
});