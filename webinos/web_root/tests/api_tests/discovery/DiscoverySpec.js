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

describe("Discovery API", function() {

	beforeEach(function() {
	});

	it("is available as webinos.discovery namespace", function() {
		expect(webinos.discovery).toBeDefined();
	});

	it("has findServices function", function() {
		expect(webinos.discovery.findServices).toEqual(jasmine.any(Function));
	});

	it("ServiceType constructor is available", function() {
		expect(ServiceType).toEqual(jasmine.any(Function));
	});

	it("returns a PendingOperation object from findServices", function() {
		var pendingOp = webinos.discovery.findServices(new ServiceType("non-existing service"), {
			onFound: function () {}
		});

		expect(pendingOp).toBeDefined();
		expect(pendingOp).toEqual(jasmine.any(Object));
		expect(pendingOp.cancel).toEqual(jasmine.any(Function));
	});

	it("can cancel a findServices PendingOperation", function() {
		var error;

		var pendingOp = webinos.discovery.findServices(new ServiceType("*"), {
			onFound: function (service) {},
			onLost: function (service) {},
			onError: function (err) {
				error = err;
			}
		});

		pendingOp.cancel();

		waitsFor(function() {
			return !!error;
		});

		runs(function() {
			expect(error).toBeDefined();
			expect(error.name).toEqual("AbortError");
		});
	});

	it("can find any services", function() {
		var found;

		webinos.discovery.findServices(new ServiceType("*"), {
			onFound: function (service) {
				found = true;
			}
		});

		waitsFor(function() {
			return found;
		});

		runs(function() {
			expect(found).toEqual(true);
		});
	});

	it("will timeout if no service is found", function() {
		var error;

		webinos.discovery.findServices(new ServiceType("non-existing service"), {
			onFound: function (service) {},
			onLost: function (service) {},
			onError: function (err) {
				error = err;
			}
		}, {timeout: 0});

		waitsFor(function() {
			return !!error;
		});

		runs(function() {
			expect(error).toBeDefined();
			expect(error.name).toEqual("TimeoutError");
		});
	});
});
