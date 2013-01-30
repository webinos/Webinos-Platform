describe('Applauncher API', function() {
	var applauncherService;

	webinos.discovery.findServices(new ServiceType("http://webinos.org/api/applauncher"), {
		onFound: function (service) {
			applauncherService = service;
		}
	});

	beforeEach(function() {
		waitsFor(function() {
			return !!applauncherService;
		}, "finding Applauncher service", 5000);
	});

	it("should be available from the discovery", function() {
		expect(applauncherService).toBeDefined();
	});

	it("has the necessary properties as service object", function() {
		expect(applauncherService.state).toBeDefined();
		expect(applauncherService.api).toEqual(jasmine.any(String));
		expect(applauncherService.id).toEqual(jasmine.any(String));
		expect(applauncherService.displayName).toEqual(jasmine.any(String));
		expect(applauncherService.description).toEqual(jasmine.any(String));
		expect(applauncherService.icon).toEqual(jasmine.any(String));
		expect(applauncherService.bindService).toEqual(jasmine.any(Function));
	});

	it("can be bound", function() {
		var bound = false;

		applauncherService.bindService({onBind: function(service) {
			applauncherService = service;
			bound = true;
		}});

		waitsFor(function() {
			return bound;
		}, "The service couldn't be bound", 500);

		runs(function() {
			expect(bound).toEqual(true);
		});
	});

	it("has the necessary properties and functions as Applauncher API service", function() {
		expect(applauncherService.launchApplication).toBeDefined();
		expect(applauncherService.launchApplication).toEqual(jasmine.any(Function));
		expect(applauncherService.appInstalled).toBeDefined();
		expect(applauncherService.appInstalled).toEqual(jasmine.any(Function));
	});

	it('cat launch default web browser via launchApplication', function() {
		var success;
		applauncherService.launchApplication(function() {
			success = true;
		}, function(){}, "http://www.google.com");

		waitsFor(function() {
			return success;
		});

		runs(function() {
			expect(success).toEqual(true);
		});
	});
});