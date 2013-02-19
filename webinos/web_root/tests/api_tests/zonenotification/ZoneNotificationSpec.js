describe("internal zone notification api", function () {
  var TIMEOUT = 1000;
  var zoneService;

  function findService() {
    runs(function () {
      webinos.discovery.findServices(
        new ServiceType("http://webinos.org/api/internal/zonenotification"), {
          onFound:function (ref) {
            zoneService = ref
          }
        })
    });

    waitsFor(function () {
      return !!zoneService
    }, "the service to be discovered")
  }

  function bindService() {
    var bound = false;
    runs(function () {
      zoneService.bindService({
        onBind:function () {
          bound = true
        }
      })
    });

    waitsFor(function () {
      return bound
    }, "the service to be bound", TIMEOUT)
  }

  function clearService() {
    var bound = true;
    runs(function () {
      zoneService.unbindService(
        function (s) {
          bound = false
        },
        function (e) { console.log(e.message) }
      )
    });

    waitsFor(function () {
      return !bound
    }, "the service to be unbound", TIMEOUT);

    runs(function () {
      zoneService = null
    });
  }

  describe("service initialization", function () {
    it("should be discoverable", function () {
      findService();
      clearService()
    });

    it("should be bindable", function () {
      findService();
      bindService();
      clearService()
    })
  });

  describe("contract", function () {
    beforeEach(findService);
    beforeEach(bindService);
    afterEach(clearService);

    it("has the necessary generic service methods and properties", function () {
      expect(zoneService.state).toBeDefined();
      expect(zoneService.api).toEqual(jasmine.any(String));
      expect(zoneService.id).toEqual(jasmine.any(String));
      expect(zoneService.displayName).toEqual(jasmine.any(String));
      expect(zoneService.description).toEqual(jasmine.any(String));
      expect(zoneService.icon).toEqual(jasmine.any(String));
      expect(zoneService.bindService).toEqual(jasmine.any(Function));
    });

    it("has the necessary api methods and properties", function () {
      expect(zoneService.subscribe).toEqual(jasmine.any(Function));
      expect(zoneService.respond).toEqual(jasmine.any(Function));
    });
  });

});
