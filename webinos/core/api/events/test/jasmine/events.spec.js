describe('api.applauncher', function() {

	var webinos = require("find-dependencies")(__dirname);

	var RPCHandler = webinos.global.require(webinos.global.rpc.location).RPCHandler;
	var service = webinos.global.require(webinos.global.api.events.location).Service;
	var events = new service(RPCHandler);
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

	it('Events API has funtion createWebinosEvent', function() {
		expect(events.createWebinosEvent).toBeFunction();
	});

	it('Events API has funtion addWebinosEventListener', function() {
		expect(events.addWebinosEventListener).toBeFunction();
	});

	it('Events API has funtion removeWebinosEventListener', function() {
		expect(events.removeWebinosEventListener).toBeFunction();
	});

	it('Events API has funtion dispatchWebinosEvent', function() {
		expect(events.WebinosEvent.dispatchWebinosEvent).toBeFunction();
	});

	it('Events API equals http://webinos.org/api/events', function() {
		expect(events.api).toEqual('http://webinos.org/api/events');
	});

	it('Events API displayName is string', function() {
		expect(events.displayName).toBeString();
	});

	it('Events API description is string', function() {
		expect(events.description).toBeString();
	});

});
