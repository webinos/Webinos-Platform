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
 ******************************************************************************/

describe("DeviceStatus API", function() {
	var devicestatusService;

	beforeEach(function() {
		this.addMatchers({
			toHaveProp: function(expected) {
				return typeof this.actual[expected] !== "undefined";
			}
		});

		webinos.discovery.findServices(new ServiceType("http://wacapps.net/api/devicestatus"), {
			onFound: function (service) {
				devicestatusService = service;
			}
		});

		waitsFor(function() {
			return !!devicestatusService;
		}, "The discovery didn't find a DeviceStatus service", 5000);
	});

	it("should be available from the discovery", function() {
		expect(devicestatusService).toBeDefined();
	});

	it("has the necessary properties as service object", function() {
		expect(devicestatusService).toHaveProp("state");
		expect(devicestatusService.api).toEqual(jasmine.any(String));
		expect(devicestatusService.id).toEqual(jasmine.any(String));
		expect(devicestatusService.displayName).toEqual(jasmine.any(String));
		expect(devicestatusService.description).toEqual(jasmine.any(String));
		expect(devicestatusService.icon).toEqual(jasmine.any(String));
		expect(devicestatusService.bindService).toEqual(jasmine.any(Function));
	});

	it("can be bound", function() {
		var bound = false;

		devicestatusService.bindService({onBind: function(service) {
			devicestatusService = service;
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

			devicestatusService.bindService({onBind: function(service) {
				devicestatusService = service;
				bound = true;
			}});

			waitsFor(function() {
				return bound;
			}, "The service couldn't be bound", 500);
		});
		
		describe("has the necessary properties and functions as DeviceStatus API service:", function() {	
			it("getComponents()", function() {
				expect(devicestatusService.getComponents).toEqual(jasmine.any(Function));
			});

			it("isSupported()", function() {
				expect(devicestatusService.isSupported).toEqual(jasmine.any(Function));
			});

			it("getPropertyValue()", function() {
				expect(devicestatusService.getPropertyValue).toEqual(jasmine.any(Function));
			});
	
			it("watchPropertyChange()", function() {
				expect(devicestatusService.watchPropertyChange).toEqual(jasmine.any(Function));
			});

			it("clearPropertyChange()", function() {
				expect(devicestatusService.clearPropertyChange).toEqual(jasmine.any(Function));
			});
		});

		it("can retrieve the _default component of a supported aspect (eg. Battery)", function() {
			var components;

			devicestatusService.getComponents("Battery", function(c) {
				components = c;
			});

			waitsFor(function() {
				return components;
			}, "getComponents failed", 500);

			runs(function() {
				expect(components).toContain("_default");
			});
		});

		it("doesn't retrieve components for not supported aspects", function() {
			var components;

			devicestatusService.getComponents("A not supported aspect", function(c) {
				components = c;
			});

			waitsFor(function() {
				return components;
			}, "getComponents failed", 500);

			runs(function() {
				expect(components.length).not.toBeDefined();
			});
		});

		it("let the user know if an aspect is supported", function() {
			var isAspectSupported;

			devicestatusService.isSupported("Battery", null, function(ret) {
				isAspectSupported = ret.isSupported;
			});

			waitsFor(function() {
				return isAspectSupported;
			}, "isSupported failed", 500);

			runs(function() {
				expect(typeof(isAspectSupported)).toEqual("boolean");
			});
		});

		it("let the user know if an aspect's property is supported", function() {
			var isPropertySupported;

			devicestatusService.isSupported("Battery", "batteryLevel", function(ret) {
				isPropertySupported = ret.isSupported;
			});

			waitsFor(function() {
				return isPropertySupported;
			}, "isSupported failed", 500);

			runs(function() {
				expect(typeof(isPropertySupported)).toEqual("boolean");
			});
		});

		it("can retrieve the value for a supported property", function() {
			var propertyValue;

			var prop = {component:"_default", aspect:"Battery", property:"batteryLevel"};
			successCB = function (value) { propertyValue = value };
			devicestatusService.getPropertyValue(successCB, null, prop);

			waitsFor(function() {
				return propertyValue;
			}, "getPropertyValue failed", 500);

			runs(function() {
				expect(typeof(propertyValue)).toEqual("string");
			});
		});

		it("can add/remove a watcher to monitor properties changes", function() {
			var propertyValue;
			var watchId;

			var prop = {component:"_default", aspect:"Battery", property:"batteryLevel"};
			successCB = function (value, ref) {
				propertyValue = value;
				devicestatusService.clearPropertyChange(watchId);
			};

			watchId = devicestatusService.watchPropertyChange(successCB, null, prop);

			waitsFor(function() {
				return propertyValue;
			}, "watchPropertyChange failed", 5000);

			runs(function() {
				expect(typeof(propertyValue)).toEqual("string");
			});
		});

	});

});
