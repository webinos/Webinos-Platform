var PzhFarm      = require('../webinos/pzh/lib/pzh_farm.js');
var Pzh          = require('../webinos/pzh/lib/pzh_sessionHandling.js');
var pzp          = require('../webinos/pzp/lib/pzp_sessionHandling.js');

var pzhapis      = require('../webinos/pzh/lib/pzh_internal_apis.js');
var pzhConnecting= require('../webinos/pzh/lib/pzh_connecting.js');

var pzhModules = [
	{name: "get42", params: [99]},
	{name: "events", param: {}}
];
var pzpModules = [
    {name: "get42", param: {}},
    {name: "file", param: {}},
    {name: "geolocation", param: {}},
    {name: "applauncher", param: {}},
//    {name: "events", param: {}},
    {name: "sensors", param: {}},
    {name: "payment", param: {}},
    {name: "tv", param: {}},
    {name: "deviceorientation", param: {}},
    {name: "vehicle", param: {}},
    {name: "context", param: {}},
    {name: "authentication", param: {}},
    {name: "contacts", param: {}},
    {name: "devicestatus", param: {}},
    {name: "discovery", param: {}}
];
var pzhHabib;
var pzhJohn;
var contents ="country=UK\nstate=MX\ncity=ST\norganization=Webinos\norganizationUnit=WP4\ncommon=PzhFarm\nemail=internal@webinos.org\ndays=180\n"
PzhFarm.startFarm('localhost', contents, function(result) {
	console.log('******* PZH FARM STARTED *******');
	var contents1 ="country=UK\nstate=MX\ncity=ST\norganization=Webinos\norganizationUnit=WP4\ncommon=Pzh1\nemail=internal@webinos.org\ndays=180\n"
	Pzh.addPzh('localhost/Habib', contents1, pzhModules, function(result,instance) {
		console.log('******* PZH1 STARTED *******');
		pzhHabib = instance;
		var contents2 ="country=UK\nstate=MX\ncity=ST\norganization=Webinos\norganizationUnit=WP4\ncommon=Pzh2\nemail=internal@webinos.org\ndays=180\n"
		Pzh.addPzh('localhost/John', contents2, pzhModules, function(result,instance) {
			console.log('******* PZH2 STARTED *******');
			pzhJohn = instance;
			var contents3 ="country=UK\nstate=MX\ncity=ST\norganization=Webinos\norganizationUnit=WP4\ncommon=Pzp1\nemail=internal@webinos.org\ndays=180\n"

			pzp.startPzp('localhost/John', contents3, 'DEBUG', pzpModules, function() {
				console.log("=== PZP 1 started ===");


				//console.log(pzhJohn.serverContext);
				//pzhJohn.serverContext.pair.credentials.context.addCACert(pzhJohn.config.other_cert['localhost/Habib']);
				pzhConnecting.connectOtherPZH(pzhJohn, 'localhost/Habib', function(){
					console.log('Add & connect PZH certificate');	
				});
			});
		});
	});
});