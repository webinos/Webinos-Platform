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

describe("AppState Sync API", function() {
	var testSyncObj;

	var OBJID = "_testObjId";
	var OBJIDOTHER = "_testObjIdOtherApp";
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
		webinos.sync.create(OBJID, function(syncObj) {
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
		webinos.sync.remove(OBJID, function() {
			removed = true;
		});

		waitsFor(function() {
			return removed;
		}, "success callback called");
	});

	describe("test syncing with other app", function() {
		var testSyncObjOtherApp;
		var appended;

		runs(function() {
			add$(function() {
				$('<iframe />', {
					name: "2ndsyncapp",
					src: "2ndsyncapp.html"
				}).appendTo("body");
				$("iframe").hide();

				appended = true;
			});
		});

		waitsFor(function() {
			return appended;
		});

		it("creates sync obj", function() {
			webinos.sync.create(OBJIDOTHER, function(syncObj) {
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
		});

		it("watching and unwatching a property change", function() {
			var otherCreated;
			var watched;

			var propChanged = function(syncProp) {
				expect(syncProp).toEqual(jasmine.any(Object));
				expect(syncProp.propertyPath).toEqual("prop0");
				expect(syncProp.currentValue).toEqual(PROPVALOTHERAPP);
				watched = true;
			};
			testSyncObjOtherApp.watch("prop0", propChanged);

			// create sync obj in other app
			window.addEventListener("message", function(event) {
				otherCreated = true;
				window.removeEventListener("message", this);
			}, false);
			$("iframe")[0].contentWindow.postMessage("create:" + OBJIDOTHER, "*");

			waitsFor(function() {
				return otherCreated;
			}, "sync obj created in other app");

			runs(function() {
				$("iframe")[0].contentWindow.postMessage("setprop:" + PROPVALOTHERAPP, "*");
			});

			waitsFor(function() {
				return watched;
			}, "prop watch callback being called");

			runs(function() {
				watched = false;
				testSyncObjOtherApp.unwatch("prop0");

				window.postMessage("setprop:" + PROPVAL, "*");
			})

			waits(3000); // wait some more to see if propChanged is called again

			runs(function() {
				expect(watched).toEqual(false);
				$("iframe")[0].contentWindow.postMessage("remove:", "*");
			});
		});

		it("remove sync obj", function() {
			var removed;
			webinos.sync.remove(OBJIDOTHER, function() {
				removed = true;
			});

			waitsFor(function() {
				return removed;
			}, "success callback called");
		});
	});
});
