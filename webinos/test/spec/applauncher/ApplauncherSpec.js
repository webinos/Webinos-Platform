describe('Applauncher API', function() {
	var applauncherService;

	beforeEach(function() {
		this.addMatchers({
			toHaveProp: function(expected) {
				return typeof this.actual[expected] !== "undefined";
			}
		});

		webinos.discovery.findServices(new ServiceType("http://webinos.org/api/applauncher"), {
			onFound: function (service) {
				applauncherService = service;
			}
		});

		waitsFor(function() {
			return !!applauncherService;
		}, "The discovery didn't find an Applauncher service", 5000);
	});

	it("should be available from the discovery", function() {
		expect(applauncherService).toBeDefined();
	});

	it("has the necessary properties as service object", function() {
		expect(applauncherService).toHaveProp("state");
		expect(applauncherService).toHaveProp("api");
		expect(applauncherService.api).toEqual(jasmine.any(String));
		expect(applauncherService).toHaveProp("id");
		expect(applauncherService.id).toEqual(jasmine.any(String));
		expect(applauncherService).toHaveProp("displayName");
		expect(applauncherService.displayName).toEqual(jasmine.any(String));
		expect(applauncherService).toHaveProp("description");
		expect(applauncherService.description).toEqual(jasmine.any(String));
		expect(applauncherService).toHaveProp("icon");
		expect(applauncherService.icon).toEqual(jasmine.any(String));
		expect(applauncherService).toHaveProp("bindService");
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
		expect(applauncherService).toHaveProp("launchApplication");
		expect(applauncherService.launchApplication).toEqual(jasmine.any(Function));
		expect(applauncherService).toHaveProp("appInstalled");
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