describe("Events API", function() {
	var eventsService;

	beforeEach(function() {
		this.addMatchers({
			toHaveProp: function(expected) {
				return typeof this.actual[expected] !== "undefined";
			}
		});

		webinos.discovery.findServices(new ServiceType("http://webinos.org/api/events"), {
			onFound: function (service) {
				eventsService = service;
			}
		});
	});

	it("should be available from the discovery", function() {
		waitsFor(function() {
			return !!eventsService;
		}, "The discovery didn't find an Events service", 5000);

		runs(function() {
			expect(eventsService).toBeDefined();
		})
	});

	it("has the necessary properties as service object", function() {
		expect(eventsService).toHaveProp("state");
		expect(eventsService).toHaveProp("api");
		expect(eventsService.api).toEqual(jasmine.any(String));
		expect(eventsService).toHaveProp("id");
		expect(eventsService.id).toEqual(jasmine.any(String));
		expect(eventsService).toHaveProp("displayName");
		expect(eventsService.displayName).toEqual(jasmine.any(String));
		expect(eventsService).toHaveProp("description");
		expect(eventsService.description).toEqual(jasmine.any(String));
		expect(eventsService).toHaveProp("icon");
		expect(eventsService.icon).toEqual(jasmine.any(String));
		expect(eventsService).toHaveProp("bind");
		expect(eventsService.bind).toEqual(jasmine.any(Function));
	});

	it("can be bound", function() {
		var bound = false;
		
		eventsService.bind({onBind: function(service) {
			eventsService = service;
			bound = true;
		}});
		
		waitsFor(function() {
			return bound;
		}, "The service couldn't be bound", 500);
		
		runs(function() {
			expect(bound).toEqual(true);
		});
	});
	
	it("has the necessary properties and functions as Events API service", function() {
		expect(eventsService).toHaveProp("createWebinosEvent");
		expect(eventsService.createWebinosEvent).toEqual(jasmine.any(Function));
		expect(eventsService).toHaveProp("addWebinosEventListener");
		expect(eventsService.addWebinosEventListener).toEqual(jasmine.any(Function));
		expect(eventsService).toHaveProp("removeWebinosEventListener");
		expect(eventsService.removeWebinosEventListener).toEqual(jasmine.any(Function));
	});
	
	it("can create an event", function() {
		var ev = eventsService.createWebinosEvent();
		expect(ev).toHaveProp("type");
		expect(ev).toHaveProp("addressing");
		expect(ev).toHaveProp("id");
		expect(ev).toHaveProp("inResponseTo");
		expect(ev).toHaveProp("timestamp");
		expect(ev).toHaveProp("expiryTimeStamp");
		expect(ev).toHaveProp("addressingSensitive");
		expect(ev).toHaveProp("forwarding");
		expect(ev).toHaveProp("forwardingTimeStamp");
		expect(ev).toHaveProp("payload");
		expect(ev).toHaveProp("dispatchWebinosEvent");
		expect(eventsService.dispatchWebinosEvent).toEqual(jasmine.any(Function));
		expect(ev).toHaveProp("forwardWebinosEvent");
		expect(eventsService.forwardWebinosEvent).toEqual(jasmine.any(Function));
	});
	
	it("can send an event", function() {
		var sent = false;
		var delivered = false;
		
		var ev = eventsService.createWebinosEvent();
		ev.dispatchWebinosEvent({
			onSending: function(event, recipient) {
				sent = true;
			},
			onDelivery: function(event, recipient) {
				delivered = true;
			}
		});
		
		waitsFor(function() {
			return sent & delivered;
		}, "Event couldn't be sent or delivered.", 3000);
		
		runs(function() {
			expect(sent).toEqual(true);
			expect(delivered).toEqual(true);
		});
	});

});