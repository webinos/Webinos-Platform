describe('api.applauncher', function() {

	var webinos = require("find-dependencies")(__dirname);

	// make sure RPCWebinosService is defined as it is needed by applauncher.js
	webinos.global.require(webinos.global.rpc.location).RPCHandler;
	var WebinosAppLauncher = webinos.global.require(webinos.global.api.applauncher.location).Service;

	var applauncher;

	beforeEach(function() {
		applauncher = new WebinosAppLauncher(undefined, {});
	});

	it('has funtion launchApplication', function() {
		expect(applauncher.launchApplication).toEqual(jasmine.any(Function));
	});

	it('has funtion appInstalled', function() {
		expect(applauncher.appInstalled).toEqual(jasmine.any(Function));
	});

	it('api property has right ServiceType', function() {
		expect(applauncher.api).toEqual('http://webinos.org/api/applauncher');
	});

	it('displayName property is string', function() {
		expect(applauncher.displayName).toEqual(jasmine.any(String));
	});

	it('description property is string', function() {
		expect(applauncher.description).toEqual(jasmine.any(String));
	});

	it('can launch the default web browser', function() {
		waitsFor(function() {
			return !!applauncher.browserExecPath;
		});

		runs(function() {
			expect(applauncher.browserExecPath).toBeDefined();
		})
	});
});
