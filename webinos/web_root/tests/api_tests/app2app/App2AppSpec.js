describe("app2app messaging api", function () {
  var TIMEOUT = 1000;
  var app2appService;

  function addMatchers() {
    this.addMatchers({
      toHaveProp:function (expected) {
        return typeof this.actual[expected] !== "undefined"
      }
    })
  }

  function findService() {
    runs(function () {
      webinos.discovery.findServices(
        new ServiceType("http://webinos.org/api/app2app"), {
          onFound:function (ref) {
            app2appService = ref
          }
        })
    });

    waitsFor(function () {
      return !!app2appService
    }, "the service to be discovered", TIMEOUT)
  }

  function bindService() {
    var bound = false;
    runs(function () {
      app2appService.bindService({
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
      app2appService.unbindService(
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
      app2appService = null
    });
  }

  function disconnectFromChannel(channel) {
    var disconnected = false;
    runs(function () {
      channel.disconnect(
        function (s) { disconnected = true },
        function (e) { console.log(e.message) }
      )
    });

    waitsFor(function () {
      return disconnected
    }, "disconnect from channel", TIMEOUT);
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
    beforeEach(addMatchers);
    beforeEach(findService);
    beforeEach(bindService);
    afterEach(clearService);

    it("has the necessary generic service methods and properties", function () {
      expect(app2appService).toHaveProp("state");
      expect(app2appService.api).toEqual(jasmine.any(String));
      expect(app2appService.id).toEqual(jasmine.any(String));
      expect(app2appService.displayName).toEqual(jasmine.any(String));
      expect(app2appService.description).toEqual(jasmine.any(String));
      expect(app2appService.icon).toEqual(jasmine.any(String));
      expect(app2appService.bindService).toEqual(jasmine.any(Function))
    });

    it("has the necessary api methods and properties", function () {
      expect(app2appService.createChannel).toEqual(jasmine.any(Function));
      expect(app2appService.searchForChannels).toEqual(jasmine.any(Function));
    });
  });

  describe("basic channel usage", function () {
    beforeEach(addMatchers);
    beforeEach(findService);
    beforeEach(bindService);
    afterEach(clearService);

    it("can send and receive", function () {
      var testNamespace = "urn:sendreceive:1";
      var createSuccess = false;
      var createdChannel;
      var sendSuccess = false;
      runs(function () {
        var config = {};
        config.namespace = testNamespace;
        config.properties = { mode: "send-receive" };
        config.appInfo = {};

        app2appService.createChannel(config,
          function (r) {
            return true
          },
          function (m) {
            sendSuccess = true;
          },
          function (c) {
            createdChannel = c;
            createSuccess = true

          },
          function (e) { console.log(e.message) }
        )
      });

      waitsFor(function () {
        return createSuccess
      }, "channel to be created.", TIMEOUT);


      runs(function () {
        expect(createdChannel).toHaveProp("client");
        expect(createdChannel).toHaveProp("namespace");
        expect(createdChannel).toHaveProp("properties");
        expect(createdChannel).toHaveProp("appInfo");
        expect(createdChannel.connect).toEqual(jasmine.any(Function));
        expect(createdChannel.send).toEqual(jasmine.any(Function));
        expect(createdChannel.disconnect).toEqual(jasmine.any(Function));

        expect(createdChannel.namespace).toMatch(testNamespace)
      });

      var searchSuccess = false;
      var pendingOperation;
      var foundChannel;
      runs(function () {
        pendingOperation = app2appService.searchForChannels(testNamespace, "",
          function (c) {
            foundChannel = c;
            searchSuccess = true
          },
          function (s) {},
          function (e) { console.log(e.message) }
        )
      });

      waitsFor(function () {
        return searchSuccess
      }, "channel to be found.", TIMEOUT);

      runs(function() {
        pendingOperation.cancel();
      });

      runs(function () {
        expect(foundChannel).toHaveProp("client");
        expect(foundChannel).toHaveProp("namespace");
        expect(foundChannel).toHaveProp("properties");
        expect(foundChannel).toHaveProp("appInfo");
        expect(foundChannel.connect).toEqual(jasmine.any(Function));
        expect(foundChannel.send).toEqual(jasmine.any(Function));
        expect(foundChannel.disconnect).toEqual(jasmine.any(Function))
      });

      var connectSuccess = false;
      runs(function () {
        foundChannel.connect({ source:"me" },
          function (m) {},
          function (s) {
            connectSuccess = true
          },
          function (e) { console.log(e.message) }
        )
      });

      waitsFor(function () {
        return connectSuccess
      }, "channel to be created.", TIMEOUT);

      runs(function () {
        foundChannel.send({ message:"something" },
          function (s) {},
          function (e) { console.log(e.message) }
        )
      });

      waitsFor(function () {
        return sendSuccess
      }, "sending to channel.", TIMEOUT);

      runs(function() {
        disconnectFromChannel(createdChannel);
      });

    })
  })

  describe("channel search", function () {
    beforeEach(addMatchers);
    beforeEach(findService);
    beforeEach(bindService);
    afterEach(clearService);

    it("can search using wildcards", function () {
      var testNamespacePrefix = "urn:wildcard:";
      var numChannels = 0;
      var channel1, channel2;

      runs(function () {
        var config = {};
        config.namespace = testNamespacePrefix + "1";
        config.properties = { mode: "send-receive" };
        config.appInfo = {};

        app2appService.createChannel(config,
          function (r) {},
          function (m) {},
          function (c) {
            channel1 = c;
            numChannels += 1;
          },
          function (e) {
            console.log(e.message)
          }
        )
      });

      runs(function () {
        var config = {};
        config.namespace = testNamespacePrefix + "2";
        config.properties = { mode: "receive-only" };
        config.appInfo = {};

        app2appService.createChannel(config,
          function (r) {},
          function (m) {},
          function (c) {
            channel2 = c;
            numChannels += 1;
          },
          function (e) {
            console.log(e.message)
          }
        )
      });

      waitsFor(function () {
        return numChannels === 2;
      }, "channels to be created.", TIMEOUT);

      var pendingOperation;
      var foundChannels = 0;
      runs(function () {
        pendingOperation = app2appService.searchForChannels(testNamespacePrefix + "*", "",
          function (c) {
            foundChannels += 1;
          },
          function (s) {},
          function (e) {
            console.log(e.message)
          }
        )
      });

      waitsFor(function () {
        return foundChannels === 2;
      }, "channels to be found.", TIMEOUT);

      runs(function() {
        pendingOperation.cancel();
      });

      runs(function() {
        disconnectFromChannel(channel1);
        disconnectFromChannel(channel2);
      });

    })
  })

  describe("sending to single client", function () {
    beforeEach(addMatchers);
    beforeEach(findService);
    beforeEach(bindService);
    afterEach(clearService);

    it("can send to a single client", function () {
      var testNamespace = "urn:singlesend:1";
      var createSuccess = false;
      var createdChannel;
      var numReceived = 0;
      runs(function () {
        var config = {};
        config.namespace = testNamespace;
        config.properties = { mode: "send-receive" };
        config.appInfo = {};

        app2appService.createChannel(config,
          function (r) {
            return true
          },
          function (m) {
            numReceived += 1;
            console.log("creator received message: " + m.contents.source);
          },
          function (c) {
            createdChannel = c;
            createSuccess = true
          },
          function (e) { console.log(e.message) }
        )
      });

      waitsFor(function () {
        return createSuccess
      }, "channel to be created.", TIMEOUT);

      var searchSuccess1 = false;
      var pendingOperation1;
      var foundChannel1;
      runs(function () {
        pendingOperation1 = app2appService.searchForChannels(testNamespace, "",
          function (c) {
            foundChannel1 = c;
            searchSuccess1 = true
          },
          function (s) {},
          function (e) { console.log(e.message) }
        )
      });

      waitsFor(function () {
        return searchSuccess1
      }, "channel to be found by first client.", TIMEOUT);

      runs(function() {
        pendingOperation1.cancel();
      });

      var searchSuccess2 = false;
      var pendingOperation2;
      var foundChannel2;
      runs(function () {
        pendingOperation2 = app2appService.searchForChannels(testNamespace, "",
          function (c) {
            foundChannel2 = c;
            searchSuccess2 = true
          },
          function (s) {},
          function (e) { console.log(e.message) }
        )
      });

      waitsFor(function () {
        return searchSuccess2
      }, "channel to be found by second client.", TIMEOUT);

      runs(function() {
        pendingOperation2.cancel();
      });

      var connectSuccess1 = false;
      runs(function () {
        foundChannel1.connect({ source:"client1" },
          function (m) {
            numReceived += 1;
            console.log("client1 received message: " + m.contents.source);
          },
          function (s) {
            connectSuccess1 = true
          },
          function (e) { console.log(e.message) }
        )
      });

      waitsFor(function () {
        return connectSuccess1
      }, "client1 to connect.", TIMEOUT);

      var connectSuccess2 = false;
      runs(function () {
        foundChannel2.connect({ source:"client2" },
          function (m) {
            numReceived += 1;
            console.log("client2 received message: " + m.contents.source);
          },
          function (s) {
            connectSuccess2 = true
          },
          function (e) { console.log(e.message) }
        )
      });

      waitsFor(function () {
        return connectSuccess2
      }, "client2 to connect.", TIMEOUT);

      runs(function () {
        foundChannel1.send({ source:"client1" },
          function (s) {},
          function (e) { console.log(e.message) }
        )
      });

      waitsFor(function () {
        return numReceived === 2;
      }, "sending to all clients.", TIMEOUT);

      runs(function () {
        console.log("=== single send === ");
        numReceived = 0;
        foundChannel2.sendTo(foundChannel2.creator, { source:"client2" },
          function (s) {},
          function (e) { console.log(e.message) }
        )
      });

      waitsFor(function () {
        return numReceived === 1;
      }, "sending to single client.", TIMEOUT);

      runs(function() {
        disconnectFromChannel(createdChannel);
      });

    })
  })
});