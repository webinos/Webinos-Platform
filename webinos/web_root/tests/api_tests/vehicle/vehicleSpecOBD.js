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
 * Copyright 2012 BMW AG
 *
 * Additions and changes had been made to support he bluetooth-obd module.
 *
 * Copyright 2013 TNO
 * Author: Eric Smekens
 *
 * LINK: http://localhost:8080/tests/api_tests/vehicle/SpecRunnerOBD.html
 ******************************************************************************/
describe("Vehicle API", function() {
	var vehicleService;
	var boundVehicleService;
	
	webinos.discovery.findServices(new ServiceType("http://webinos.org/api/vehicle"), {
		onFound: function (service) {
			vehicleService = service;
			vehicleService.bindService({onBind: function(service) {
				boundVehicleService = service;
			}});
		}
	});

	beforeEach(function () {
		waitsFor(function () {
			return vehicleService;
		}, "The discovery didn't find a Vehicle service", 5000);
		waitsFor(function () {
			return boundVehicleService;
		}, "The found Vehicle service couldn't be bound", 5000);
	});

	it("should be available from the discovery", function () {
		expect(vehicleService).toBeDefined();
	});

	it("has the necessary properties as service object", function () {
		expect(vehicleService.state).toBeDefined();
		expect(vehicleService.api).toEqual(jasmine.any(String));
		expect(vehicleService.id).toEqual(jasmine.any(String));
		expect(vehicleService.displayName).toEqual(jasmine.any(String));
		expect(vehicleService.description).toEqual(jasmine.any(String));
		expect(vehicleService.icon).toEqual(jasmine.any(String));
		expect(vehicleService.bindService).toEqual(jasmine.any(Function));
	});

	it("can be bound", function () {
		var bound = false;

		vehicleService.bindService({onBind: function (service) {
			vehicleService = service;
			bound = true;
		}});
		waitsFor(function () {
			return bound;
		}, "The service couldn't be bound", 500);

		runs(function () {
			expect(bound).toEqual(true);
		});
	});

	it("has the necessary properties and functions as Vehicle API service", function () {
		expect(boundVehicleService.addEventListener).toEqual(jasmine.any(Function));
		expect(boundVehicleService.removeEventListener).toEqual(jasmine.any(Function));
		expect(boundVehicleService.get).toEqual(jasmine.any(Function));
	});


    it("can get speed data", function () {
        var speedEvent = null;

        boundVehicleService.get('vss', function (event) { speedEvent = event; });

        waitsFor(function () {
			return speedEvent;
		}, "successCallback to be called.", 3000);

		runs(function () {
			expect(speedEvent).toEqual(jasmine.any(Object));
			expect(speedEvent.type).toEqual('vss');
			expect(speedEvent.vss).toEqual(jasmine.any(Number));
			expect(speedEvent.timestamp).toEqual(jasmine.any(Number));
		});
    });
    it("can get rpm data", function () {
        var rpmEvent = null;

        boundVehicleService.get('rpm', function (event) { rpmEvent = event; });

        waitsFor(function () {
            return rpmEvent;
        }, "successCallback to be called.", 3000);

        runs(function () {
            expect(rpmEvent).toEqual(jasmine.any(Object));
            expect(rpmEvent.type).toEqual('rpm');
            expect(rpmEvent.rpm).toEqual(jasmine.any(Number));
            expect(rpmEvent.timestamp).toEqual(jasmine.any(Number));
        });
    });
    it("can get engineLoad data", function () {
        var engineLoadEvent = null;

        boundVehicleService.get('load_pct', function (event) { engineLoadEvent = event; });

        waitsFor(function () {
            return engineLoadEvent;
        }, "successCallback to be called.", 3000);

        runs(function () {
            expect(engineLoadEvent).toEqual(jasmine.any(Object));
            expect(engineLoadEvent.type).toEqual('load_pct');
            expect(engineLoadEvent.load_pct).toEqual(jasmine.any(Number));
            expect(engineLoadEvent.timestamp).toEqual(jasmine.any(Number));
        });
    });



    var listenerEvent;
    function handleSpeedEvent(event) {
        listenerEvent = event;
    }
    it("can add a listener and receive events for speed data", function () {
		listenerEvent = null;
		boundVehicleService.addEventListener('vss', handleSpeedEvent, false);
		waitsFor(function () {
			return listenerEvent;
		}, "onEvent callback to be called. ", 10000);

		runs(function () {
			expect(listenerEvent).toEqual(jasmine.any(Object));
			expect(listenerEvent.type).toEqual('vss');
			expect(listenerEvent.vss).toEqual(jasmine.any(Number));
			expect(listenerEvent.timestamp).toEqual(jasmine.any(Number));
		});

    });

    it("can remove a listener", function () {
        listenerEvent = null;
        boundVehicleService.removeEventListener('vss', handleSpeedEvent, false);
        waits(1000);
        runs(function () {
           expect(listenerEvent).toEqual(null);
        });
    });
});