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

function checkPosition(position) {
	expect(position.timestamp).toEqual(jasmine.any(Number));
	expect(position.coords).toEqual(jasmine.any(Object));
	var coords = position.coords;
	expect(coords.latitude).toEqual(jasmine.any(Number));
	expect(coords.longitude).toEqual(jasmine.any(Number));
	expect(coords.accuracy).toEqual(jasmine.any(Number));
}

beforeEach(function() {
	this.addMatchers({
		toHaveProp: function(expected) {
			return typeof this.actual[expected] !== "undefined";
		}
	});
});

describe("Geolocation API", function() {
	var geolocationService;

	webinos.discovery.findServices(new ServiceType("http://www.w3.org/ns/api-perms/geolocation"), {
		onFound: function (service) {
			geolocationService = service;
		}
	});

	beforeEach(function() {
		waitsFor(function() {
			return !!geolocationService;
		}, "found service", 5000);
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

	describe("with bound service", function() {
		var geolocationServiceBound;

		beforeEach(function() {
			if (!geolocationService) {
				waitsFor(function() {
					return !!geolocationService;
				}, "found service", 5000);
			}
			if (!geolocationServiceBound) {
				geolocationService.bindService({onBind: function(service) {
					geolocationServiceBound = service;
				}});
				waitsFor(function() {
					return !!geolocationServiceBound;
				}, "the service to be bound", 500);
			}
		});

		it("can be bound", function() {
			expect(geolocationServiceBound).toBeDefined();
		});

		it("has the necessary properties and functions as Geolocation API service", function() {
			expect(geolocationServiceBound.getCurrentPosition).toEqual(jasmine.any(Function));
			expect(geolocationServiceBound.watchPosition).toEqual(jasmine.any(Function));
			expect(geolocationServiceBound.clearWatch).toEqual(jasmine.any(Function));
		});

		it("can return a valid position object, using getCurrentPosition", function() {
			var success;
			var position;

			geolocationServiceBound.getCurrentPosition(function(p) {
				success = true;
				position = p;
			});

			waitsFor(function() {
				return success;
			}, "getCurrentPosition success callback", 1000);

			runs(function() {
				expect(success).toEqual(true);
				checkPosition(position);
			});
		});

		it("can get successive position updates using watchPosition", function() {
			var counter = 0;
			var position;

			var watchId = geolocationServiceBound.watchPosition(function(p) {
				counter++;
				position = p;
			});

			waitsFor(function() {
				return counter > 1;
			}, "watchPosition being called multiple times", 6000);

			runs(function() {
				expect(counter).toBeGreaterThan(1);
				expect(watchId).toEqual(jasmine.any(Number));
				geolocationServiceBound.clearWatch(watchId);
				var tmpCounter = counter;

				checkPosition(position);
				expect(tmpCounter).toEqual(counter);
			});
		});

		it("can clear a watchPosition listener", function() {
			var counter = 0;

			var watchId = geolocationServiceBound.watchPosition(function() {
				counter++;
				geolocationServiceBound.clearWatch(watchId);
			});

			waitsFor(function() {
				return counter > 0;
			}, "watchPosition being called", 5000);

			waits(3000); // wait some more to see if watchPosition is called again

			runs(function() {
				expect(watchId).toEqual(jasmine.any(Number));
				expect(counter).toEqual(1);
			});
		});

		it("can support multiple watchPosition listeners", function() {
			var position1, position2;
			var watchId1 = geolocationServiceBound.watchPosition(function(p) {
				position1 = p;
			});
			var watchId2 = geolocationServiceBound.watchPosition(function(p) {
				position2 = p;
			});

			waitsFor(function() {
				return !!position1 & !!position2;
			}, "all listeners being called", 5000);

			runs(function() {
				expect(watchId1).not.toEqual(watchId2);
				expect(watchId1).toEqual(jasmine.any(Number));
				expect(watchId2).toEqual(jasmine.any(Number));
				geolocationServiceBound.clearWatch(watchId1);
				geolocationServiceBound.clearWatch(watchId2);

				expect(position1).not.toEqual(position2);
				checkPosition(position1);
				checkPosition(position2);
			});
		});
	});

});