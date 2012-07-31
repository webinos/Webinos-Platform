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
 * Copyright 2012 Alexander Futasz, Fraunhofer FOKUS
 ******************************************************************************/

describe("Geolocation API", function() {
	var geolocationService;

	beforeEach(function() {
		this.addMatchers({
			toHaveProp: function(expected) {
				return typeof this.actual[expected] !== "undefined";
			}
		});

		webinos.discovery.findServices(new ServiceType("http://www.w3.org/ns/api-perms/geolocation"), {
			onFound: function (service) {
				geolocationService = service;
			}
		});

		waitsFor(function() {
			return !!geolocationService;
		}, "The discovery didn't find a Geolocation service", 5000);
	});

	afterEach(function() {
		geolocationService = undefined;
	});

	it("should be available from the discovery", function() {
		expect(geolocationService).toBeDefined();
	});

	it("has the necessary properties as service object", function() {
		expect(geolocationService).toHaveProp("state");
		expect(geolocationService.api).toEqual(jasmine.any(String));
		expect(geolocationService.id).toEqual(jasmine.any(String));
		expect(geolocationService.displayName).toEqual(jasmine.any(String));
		expect(geolocationService.description).toEqual(jasmine.any(String));
		expect(geolocationService.icon).toEqual(jasmine.any(String));
		expect(geolocationService.bindService).toEqual(jasmine.any(Function));
	});

	it("can be bound", function() {
		var bound = false;

		geolocationService.bindService({onBind: function(service) {
			geolocationService = service;
			bound = true;
		}});

		waitsFor(function() {
			return bound;
		}, "The service couldn't be bound", 500);

		runs(function() {
			expect(bound).toEqual(true);
		});
	});

	describe("with bound service", function() {
		beforeEach(function() {
			var bound = false;

			geolocationService.bindService({onBind: function(service) {
				geolocationService = service;
				bound = true;
			}});

			waitsFor(function() {
				return bound;
			}, "The service couldn't be bound", 500);
		});

		it("has the necessary properties and functions as Geolocation API service", function() {
			expect(geolocationService.getCurrentPosition).toEqual(jasmine.any(Function));
			expect(geolocationService.watchPosition).toEqual(jasmine.any(Function));
			expect(geolocationService.clearWatch).toEqual(jasmine.any(Function));
		});

		it("can return a valid position object, using getCurrentPosition", function() {
			var success;
			var position;

			geolocationService.getCurrentPosition(function(p) {
				success = true;
				position = p;
			});

			waitsFor(function() {
				return success;
			}, "getCurrentPosition failed", 500);

			runs(function() {
				expect(success).toEqual(true);
				expect(position.coords).toEqual(jasmine.any(Object));
				expect(position.timestamp).toEqual(jasmine.any(Number));
				var coords = position.coords;
				expect(coords.latitude).toEqual(jasmine.any(Number));
				expect(coords.longitude).toEqual(jasmine.any(Number));
				expect(coords.accuracy).toEqual(jasmine.any(Number));
			});
		});

		it("can get successive position updates using watchPosition", function() {
			var counter = 0;
			var position;

			var watchId = geolocationService.watchPosition(function(p) {
				counter++;
				position = p;
			});

			waitsFor(function() {
				return counter > 1;
			}, "watchPosition failed", 6000);

			runs(function() {
				expect(counter).toBeGreaterThan(1);
				expect(watchId).toEqual(jasmine.any(Number));
				geolocationService.clearWatch(watchId);
				var tmpCounter = counter;

				expect(position.coords).toEqual(jasmine.any(Object));
				expect(position.timestamp).toEqual(jasmine.any(Number));
				var coords = position.coords;
				expect(coords.latitude).toEqual(jasmine.any(Number));
				expect(coords.longitude).toEqual(jasmine.any(Number));
				expect(coords.accuracy).toEqual(jasmine.any(Number));

				expect(tmpCounter).toEqual(counter);
			});
		});
	});

});