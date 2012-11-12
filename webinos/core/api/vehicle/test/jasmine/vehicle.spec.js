describe('api.vehicle', function() {

	var webinos = require("find-dependencies")(__dirname);
	var params = {};
	params.connector = 'simulator';

	var RPCHandler = webinos.global.require(webinos.global.rpc.location).RPCHandler;
	var service = webinos.global.require(webinos.global.api.vehicle.location).Service;
	var vehicle = new service(RPCHandler, params);


	beforeEach(function() {
		this.addMatchers({
			toBeFunction: function() {
				return typeof this.actual === 'function';
			},
			toBeObject: function() {
				return typeof this.actual === 'object';
			},
			toBeString: function() {
				return typeof this.actual === 'string';
			},
			toBeNumber: function() {
				return typeof this.actual === 'number';
			}
		});
	});

	it('Vehicle API equals http://webinos.org/api/events', function() {
		expect(vehicle.api).toEqual('http://webinos.org/api/vehicle');
	});

	it('Vehicle API displayName is string', function() {
		expect(vehicle.displayName).toBeString();
	});

	it('Vehicle API description is string', function() {
		expect(vehicle.description).toBeString();
	});

	it('Vehicle API has function addEventListener', function() {
    	expect(vehicle.addEventListener).toBeFunction();
	});

	it('Vehicle API has function removeEventListener', function() {
    	expect(vehicle.removeEventListener).toBeFunction();
	});

	it('Vehicle API has function get', function() {
    	expect(vehicle.get).toBeFunction();
	});

  	it("get function supports gear data", function(done) {
      vehicle.get(['shift'], function(event){
	    expect(event.type).toEqual('gear');
	    expect(event.gear).toBeString;
      }, function(err){console.log('error' + err.message)});
    });

  	it("get function supports tripcomputer data", function(done) {
      vehicle.get(['tripcomputer'], function(event){
      	expect(event.type).toEqual('tripcomputer');
      	expect(event.averageConsumption1).toBeNumber();
      	expect(event.averageConsumption2).toBeNumber();
		expect(event.averageSpeed1).toBeNumber();
		expect(event.averageSpeed2).toBeNumber();
		expect(event.tripDistance).toBeNumber();
		expect(event.mileage).toBeNumber();
		expect(event.range).toBeNumber();
		expect(event.timestamp).toBeNumber();
      }, function(err){

      });
    });

	it("get function supports park sensors data", function(done) {
      vehicle.get(['parksensors-front'], function(event){
      	expect(event.type).toEqual('parksensor');
      	expect(event.timestamp).toBeNumber();
      	expect(event.position).toEqual('parksensors-front');
      	expect(event.outLeft).toBeNumber();
      	expect(event.left).toBeNumber();
     	expect(event.midLeft).toBeNumber();
     	expect(event.midRight).toBeNumber();
     	expect(event.right).toBeNumber();
     	expect(event.outRight).toBeNumber();
      }, function(err){

      });
    });

	it("get function supports park sensors data", function(done) {
      vehicle.get(['parksensors-front'], function(event){
      	expect(event.type).toEqual('parksensor');
      	expect(event.timestamp).toBeNumber();
      	expect(event.position).toEqual('parksensors-front');
      	expect(event.outLeft).toBeNumber();
      	expect(event.left).toBeNumber();
     	expect(event.midLeft).toBeNumber();
     	expect(event.midRight).toBeNumber();
     	expect(event.right).toBeNumber();
     	expect(event.outRight).toBeNumber();
      }, function(err){

      });
    });


  	it("get function throws error for not supported data property", function(done) {
      vehicle.get(['tripcomputers'], function(TripEvent){
      	expect(TripEvent).toBeObject();
      }, function(err){
      	expect(err).toBeObject();
      });
    });

	/*
	* TODO: Write tests for yet unsupported methods: LightEvents, StatusEvents (engine oil level, wipers)
	*/

	/*
	Currently unimplemented methods

	it('Vehicle API requestGuidance', function() {
    	expect(vehicle.requestGuidance).toBeFunction();
	});

	it('Vehicle API findDestination', function() {
    	expect(vehicle.findDestination).toBeFunction();
	});

	*/
	/* Currently unimplemented attributes

	it('Vehicle has attribute brand ', function() {
    	expect(vehicle.brand).toBeString();
	});

	it('Vehicle has attribute model ', function() {
    	expect(vehicle.brand).toBeString();
	});

	it('Vehicle has attribute brand ', function() {
    	expect(vehicle.model).toBeString();
	});

	it('Vehicle has attribute brand ', function() {
    	expect(vehicle.year).toBeString();
	});

	it('Vehicle has attribute fuel ', function() {
    	expect(vehicle.fuel).toBeString();
	});

	it('Vehicle has attribute transmission ', function() {
    	expect(vehicle.transmission).toBeString();
	});
	*/
});
