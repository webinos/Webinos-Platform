var localPzp = "";
var localPzh = "";

function fillPZAddrs(data) {
	var pzpId = data.from;
	var pzhId, connectedPzh , connectedPzp;
	if (pzpId !== "virgin_pzp") {
        // TODO: There used to be a PzhID property in the message which was deleted
      localPzh = data.payload.message.connectedPzh[0];
	  // connectedPzp = data.payload.message.connectedPzp; // all connected pzp
      // data.payload.message.connectedPzh; // all connected pzh

	  console.log('registeredBrowser msg from ' + pzpId);
	  console.log('availablePZPs: ' + data.payload.message.connectedPzp);
	  localPzp = pzpId;
	}
}
webinos.session.addListener('registeredBrowser', fillPZAddrs);


var contextService = {};
var localService;
var pzhService;




(function (exports) {
	'use strict';

	function test_contextAPI_isModuleDiscoveredAndLoaded(completeCB){
        var results = { foundPZP: false, foundPZH: false };
		webinos.discovery.findServices( new ServiceType('http://webinos.org/api/context'),{
			onFound: function (service) {
				console.log("---DISCOVERY---");
				console.log("Service: ",service," found!!");
				contextService[service.serviceAddress] = service;
				console.log(service.serviceAddress);
				console.log("---------------");

				if(service.serviceAddress === localPzp) {
					console.log("------BIND-----");
					localService = contextService[service.serviceAddress];
					localService.bindService({onBind:function(service) {
                        results.foundPZP = true;
						console.log('Bound to: ' + service.api + ' on localPzp ' + service.serviceAddress);
					}});
					console.log("---------------");
				}
                if(service.serviceAddress === localPzh) {
                    console.log("------BIND-----");
                    pzhService = contextService[service.serviceAddress];
                    pzhService.bindService({onBind:function(service) {
                        results.foundPZH = true;
                        console.log('Bound to: ' + service.api + ' on localPzh ' + service.serviceAddress);
                    }});
                    console.log("---------------");
                }
			},
			onError: function(error) {
				console.log("Error, cannot load Context API: " + error);
				completeCB(false, "cannot load Context API:" + error);
			}
		});
        // Give 3 seconds to bind the service
        var timer = setTimeout(function(){
            var msg = "";
            if (!results.foundPZP)
                msg += "Couldn't bind on localPZP context service.";
            if (!results.foundPZH)
                msg += "Couldn't bind on localPZH context service.";
            if (results.foundPZH && results.foundPZP)
                completeCB(true, "Bound on both local pzp and pzh");
            else
                completeCB(false,msg);
        }, 3000);
	}

    function test_contextAPI_interceptsAPICalls(completeCB){
        // Make a call to the geolocation API to see if context logs the api call and response
        webinos.discovery.findServices( new ServiceType('http://www.w3.org/ns/api-perms/geolocation'),{
            onFound: function (service) {
                console.log("---DISCOVERY---");
                console.log("Service: ",service," found!!");
                console.log(service.serviceAddress);
                console.log("---------------");

                if(service.serviceAddress === localPzp) {
                    console.log("------BIND-----");
                    var geoService = service;
                    geoService.bindService({onBind:function(service) {
                        console.log('Bound to: ' + service.api + ' on localPzp ' + service.serviceAddress);
                        var PositionOptions = {};
                        PositionOptions.maximumAge = 5000;
                        PositionOptions.timeout = 1000;
                        service.getCurrentPosition(function(position){
                            //position.coords.latitude;
                            //position.coords.longitude;
                            var query = {};
                            query.type = "query";
                            query.data = {
                                select: '*',
                                where:[{
                                    type:'and',
                                    field:'MyPositions.latitude',
                                    op: 'eq',
                                    value:position.coords.latitude
                                },{
                                    type:'and',
                                    field:'MyPositions.longitude',
                                    op: 'eq',
                                    value: position.coords.longitude
                                }]
                            };
                            localService.executeQuery(query, function(result) {
                                if (result.length>0)
                                    completeCB(true, "geolocation api call was intercepted");
                                else
                                    completeCB(false, "geolocation api call was not intercepted");
                                console.log(result);
                            });
                        }, function(error){
                            completeCB(false, "cannot call geolocation API:" + error);
                        }, PositionOptions);

                    }});
                    console.log("---------------");
                }
            },
            onError: function(error) {
                console.log("Error, cannot load geolocation API: " + error);
                completeCB(false, "cannot load geolocation API:" + error);
            }
        });
    }


	
	
	// Define an example user-interactive test.
	function test_UI(completeCB) {
		if (confirm('did the test pass?')) {
			completeCB(true,'user said it passed');
		} else {
			completeCB(false,'user said it failed');
		}
	}

	// Define each test in this array, with a descriptive name followed by the test method itself.
	var tests = [ 	{ testName: 'Contacts Module', testMethod: test_contextAPI_isModuleDiscoveredAndLoaded },
				{ testName: 'geolocation api calls are intercepted', testMethod: test_contextAPI_interceptsAPICalls }
			];

	// Export a function to trigger the tests, passing on the output logger.
	exports.runContextTests = function(logTo) { runTests(tests, logTo); };
	
}(window))