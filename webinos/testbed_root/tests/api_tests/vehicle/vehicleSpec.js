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
 ******************************************************************************/

describe("Vehicle API", function() {
	var vehicleService;
	var boundVehicleService;
	
	beforeEach(function() {
		this.addMatchers({
			toHaveProp: function(expected) {
				return typeof this.actual[expected] !== "undefined";
			}
		});

		webinos.discovery.findServices(new ServiceType("http://webinos.org/api/vehicle"), {
			onFound: function (service) {
				vehicleService = service;
				vehicleService.bindService({onBind: function(service) {
					boundVehicleService = service;
				}});
			}
		});

		waitsFor(function() {
			return !!vehicleService;
		}, "The discovery didn't find a Vehicle service", 5000);
		
		waitsFor(function() {
			return !!boundVehicleService;
		}, "The found Vehicle service couldn't be bound", 5000);

		
	});

	it("should be available from the discovery", function() {
		expect(vehicleService).toBeDefined();
	});

	it("has the necessary properties as service object", function() {
		expect(vehicleService).toHaveProp("state");
		expect(vehicleService).toHaveProp("api");
		expect(vehicleService.api).toEqual(jasmine.any(String));
		expect(vehicleService).toHaveProp("id");
		expect(vehicleService.id).toEqual(jasmine.any(String));
		expect(vehicleService).toHaveProp("displayName");
		expect(vehicleService.displayName).toEqual(jasmine.any(String));
		expect(vehicleService).toHaveProp("description");
		expect(vehicleService.description).toEqual(jasmine.any(String));
		expect(vehicleService).toHaveProp("icon");
		expect(vehicleService.icon).toEqual(jasmine.any(String));
		expect(vehicleService).toHaveProp("bindService");
		expect(vehicleService.bindService).toEqual(jasmine.any(Function));
	});

	it("can be bound", function() {
		var bound = false;

		vehicleService.bindService({onBind: function(service) {
			vehicleService = service;
			bound = true;
		}});

		waitsFor(function() {
			return bound;
		}, "The service couldn't be bound", 500);

		runs(function() {
			expect(bound).toEqual(true);
		});
	});

	it("has the necessary properties and functions as Vehicle API service", function() {
		expect(boundVehicleService).toHaveProp("addEventListener");
		expect(boundVehicleService.addEventListener).toEqual(jasmine.any(Function));
		expect(boundVehicleService).toHaveProp("removeEventListener");
		expect(boundVehicleService.removeEventListener).toEqual(jasmine.any(Function));
		expect(boundVehicleService).toHaveProp("get");
		expect(boundVehicleService.get).toEqual(jasmine.any(Function));
		
		//currently not implemented functions
		expect(boundVehicleService.brand).toEqual(jasmine.any(String));
		expect(boundVehicleService.model).toEqual(jasmine.any(String));
		expect(boundVehicleService.year).toEqual(jasmine.any(String));
		expect(boundVehicleService.fuel).toEqual(jasmine.any(String));
		expect(boundVehicleService.transmission).toEqual(jasmine.any(String));
	});


	
	it("can get gear data", function() {
		var shiftEvent = null;
		
		boundVehicleService.get('shift', function(event){ shiftEvent=event;});
		waitsFor(function() {
			return shiftEvent;
		}, "successCallback to be called.", 3000);

		runs(function() {
			expect(shiftEvent).toEqual(jasmine.any(Object));
			expect(shiftEvent.type).toEqual('gear');
			expect(shiftEvent.gear).toEqual(jasmine.any(String));
			expect(shiftEvent.timestamp).toEqual(jasmine.any(Number));
		});
	});
	
	it("can get trip computer data", function() {
		var evObj = null;
		boundVehicleService.get('tripcomputer', function(event){ evObj=event;});
		waitsFor(function() {
			return evObj;
		}, "onDelivery callback to be called.", 3000);

		runs(function() {
			expect(evObj).toEqual(jasmine.any(Object));
			expect(evObj.type).toEqual('tripcomputer');
			expect(parseFloat(evObj.averageSpeed1)).toEqual(jasmine.any(Number));
			expect(parseFloat(evObj.averageSpeed2)).toEqual(jasmine.any(Number));
			expect(parseFloat(evObj.averageConsumption1)).toEqual(jasmine.any(Number));
			expect(parseFloat(evObj.averageConsumption2)).toEqual(jasmine.any(Number));
			expect(parseFloat(evObj.mileage)).toEqual(jasmine.any(Number));
			expect(parseFloat(evObj.range)).toEqual(jasmine.any(Number));
			expect(parseFloat(evObj.tripDistance)).toEqual(jasmine.any(Number));
		});
	});

	it("can get parksensor data", function() {
		var evObj = null;
		boundVehicleService.get('parksensors-front', function(event){ evObj=event;});
		waitsFor(function() {
			return evObj;
		}, "onDelivery callback to be called.", 3000);

		runs(function() {
			expect(evObj).toEqual(jasmine.any(Object));
			expect(evObj.type).toEqual('parksensor');
			expect(evObj.position).toEqual('parksensors-front');
			expect(parseFloat(evObj.outLeft)).toEqual(jasmine.any(Number));
			expect(parseFloat(evObj.left)).toEqual(jasmine.any(Number));
			expect(parseFloat(evObj.midLeft)).toEqual(jasmine.any(Number));
			expect(parseFloat(evObj.midRight)).toEqual(jasmine.any(Number));
			expect(parseFloat(evObj.right)).toEqual(jasmine.any(Number));
			expect(parseFloat(evObj.outRight)).toEqual(jasmine.any(Number));
			expect(evObj.timestamp).toEqual(jasmine.any(Number));
		});
	});
	
	//not implemented for simulator
	it("can get control data (e.g. lights)", function() {
		var evObj = null;
		boundVehicleService.get('lights-fog-front', function(event){ evObj=event;});
		waitsFor(function() {
			return evObj;
		}, "onDelivery callback to be called. (not implemented)", 3000);

		runs(function() {
			expect(evObj).toEqual(jasmine.any(Object));
			expect(evObj.controlId).toEqual('lights-fog-front');
			expect(evObj.active).toEqual(jasmine.any(Boolean));
		});
	});

	//not implemented for simulator
	it("can get climate data", function() {
		var evObj = null;
		boundVehicleService.get('climate-driver', function(event){ evObj=event;});
		waitsFor(function() {
			return evObj;
		}, "onDelivery callback to be called. (not implemented)" , 3000);

		runs(function() {
			expect(evObj).toEqual(jasmine.any(Object));
			expect(evObj.zone).toEqual('climate-driver');
			expect(evObj.desiredTemperature).toEqual(jasmine.any(Number));
			expect(evObj.acStatus).toEqual(jasmine.any(Boolean));
			expect(evObj.ventLevel).toEqual(jasmine.any(Number));
			expect(evObj.ventMode).toEqual(jasmine.any(Boolean));
		});
	});


	it("can register and receive events on gear data", function() {
		var evObj = null;
		boundVehicleService.addEventListener('shift', function(event){evObj = event;}, false);
		waitsFor(function() {
			return evObj;
		}, "onEvent callback to be called. (Use simulator to generate data)", 10000);

		runs(function() {
			expect(evObj).toEqual(jasmine.any(Object));
			expect(evObj.type).toEqual('gear');
			expect(evObj.gear).toEqual(jasmine.any(String));
			expect(evObj.timestamp).toEqual(jasmine.any(Number));
		});
		
		
	});
	
	it("can register and receive events on trip computer data", function() {
		var evObj = null;
		boundVehicleService.addEventListener('tripcomputer', function(event){evObj = event;}, false);
		
		waitsFor(function() {
			return evObj;
		}, "onDelivery callback to be called.", 10000);

		runs(function() {
			expect(evObj).toEqual(jasmine.any(Object));
			expect(parseFloat(evObj.averageSpeed1)).toEqual(jasmine.any(Number));
			expect(parseFloat(evObj.averageSpeed2)).toEqual(jasmine.any(Number));
			expect(parseFloat(evObj.averageConsumption1)).toEqual(jasmine.any(Number));
			expect(parseFloat(evObj.averageConsumption2)).toEqual(jasmine.any(Number));
			expect(parseFloat(evObj.mileage)).toEqual(jasmine.any(Number));
			expect(parseFloat(evObj.range)).toEqual(jasmine.any(Number));
			expect(parseFloat(evObj.tripDistance)).toEqual(jasmine.any(Number));
		});
	});
	

	it("can register and receive events on parksensor data", function() {
		var evObj = null;
		boundVehicleService.addEventListener('parksensors-front', function(event){evObj = event;}, false);
		
		waitsFor(function() {
			return evObj;
		}, "onEvent callback to be called. (Use simulator to generate data)", 10000);

		runs(function() {
			expect(evObj).toEqual(jasmine.any(Object));
			expect(evObj.type).toEqual('parksensor');
			expect(evObj.position).toEqual('parksensors-front');
			expect(parseFloat(evObj.outLeft)).toEqual(jasmine.any(Number));
			expect(parseFloat(evObj.left)).toEqual(jasmine.any(Number));
			expect(parseFloat(evObj.midLeft)).toEqual(jasmine.any(Number));
			expect(parseFloat(evObj.midRight)).toEqual(jasmine.any(Number));
			expect(parseFloat(evObj.right)).toEqual(jasmine.any(Number));
			expect(parseFloat(evObj.outRight)).toEqual(jasmine.any(Number));
			expect(evObj.timestamp).toEqual(jasmine.any(Number));
		});
	});

	//not implemented for simulator
	it("can register and receive events on control data", function() {
		var evObj = null;
		boundVehicleService.addEventListener('lights-fog-front', function(event){evObj = event;}, false);
		
		waitsFor(function() {
			return evObj;
		}, "onEvent callback to be called. (not implemented)", 10000);

		runs(function() {
			expect(evObj).toEqual(jasmine.any(Object));
			expect(evObj).toEqual(jasmine.any(Object));
			expect(evObj.controlId).toEqual('lights-fog-front');
			expect(evObj.active).toEqual(jasmine.any(Boolean));		
		});
	});

	//not implemented for simulator
	it("can register and receive events on control data", function() {
		var evObj = null;
		boundVehicleService.addEventListener('climate-driver', function(event){evObj = event;}, false);
		
		waitsFor(function() {
			return evObj;
		}, "onEvent callback to be called. (not implemented)", 10000);

		runs(function() {
			expect(evObj.zone).toEqual('climate-driver');
			expect(evObj.desiredTemperature).toEqual(jasmine.any(Number));
			expect(evObj.acStatus).toEqual(jasmine.any(Boolean));
			expect(evObj.ventLevel).toEqual(jasmine.any(Number));
			expect(evObj.ventMode).toEqual(jasmine.any(Boolean));	
		});
	});

	//Currently not implemented
	it("can find a POI", function() {
		var results = null;
		boundVehicleService.findDestionation(function(data){results = data;}, function(err){}, 'Test');
		
		waitsFor(function() {
			return results;
		}, "onEvent callback to be called. (not implemented)", 10000);

		runs(function() {
			expect(results).toEqual(jasmine.any(Array));
		});
	});
	
	//Currently not implemented
	it("can request guidance to a POI", function() {
		var destinationSet = false;
		boundVehicleService.requestGuidance(function(){destinationSet=true;}, function(err){destinationSet=false;}, 'Test');
		
		waitsFor(function() {
			return destinationSet;
		}, "onEvent callback to be called. (not implemented)", 10000);

		runs(function() {
			expect(destinationSet).toEqual(true);
		});
	});

});