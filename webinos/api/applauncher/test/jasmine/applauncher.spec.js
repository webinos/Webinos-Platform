describe('api.applauncher', function() {

	var webinos = require('webinos')(__dirname);
	
	var RPCHandler = webinos.global.require(webinos.global.rpc.location).RPCHandler;
	var service = webinos.global.require(webinos.global.api.applauncher.location).Service;
	var applauncher = new service(RPCHandler);
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
	
	it('Applauncher has funtion launchApplication', function() {
		expect(applauncher.launchApplication).toBeFunction();
	});
	
	
	it('Applauncher has funtion appInstalled', function() {
		expect(applauncher.appInstalled).toBeFunction();
	});
	
	
	it('Applauncher api equals http://webinos.org/api/applauncher', function() {
		expect(applauncher.api).toEqual('http://webinos.org/api/applauncher');
	});
	
	it('Applauncher displayName is string', function() {
		expect(applauncher.displayName).toBeString();
	});
	
	it('Applauncher description is string', function() {
		expect(applauncher.description).toBeString();
	});
	
	
	
});