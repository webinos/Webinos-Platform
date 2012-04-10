Pzh        = require('../../../pzh/lib/pzh_sessionHandling.js');
WebSocket  = require('../../../pzh/lib/pzh_websocket.js');
Pzp        = require('../../lib/pzp_sessionHandling.js');
PzpWebsocket = require('../../lib/pzp_websocket.js');

var ipAddr = 'localhost', port = 8000, serverPort = 8083, webServerPort = 8082;
var contents ="country=UK\nstate=MX\ncity=ST\norganization=Webinos\norganizationUnit=WP4\ncommon=WebinosPzh\nemail=internal@webinos.org\ndays=180\n" ;
var PzpContents ="pzh_name=localhost\ncountry=UK\nstate=MX\ncity=ST\norganization=Webinos\norganizationUnit=WP4\ncommon=WebinosPzp\nemail=internal@webinos.org\ndays=180\n"
 
var PzpServerPort = 8081, PzpWebServerPort = 8080; 

var pzhModules = [
    {name: "get42", params: [99]}
];

var pzpModules = [
    {name: "get42", param: {}},
    {name: "file", param: {}},
    {name: "geolocation", param: {}},
    {name: "events", param: {}},
    {name: "sensors", param: {}},
    {name: "payment", param: {}},
    {name: "tv", param: {}},
    {name: "deviceorientation", param: {}},
    {name: "vehicle", param: {}},
    {name: "context", param: {}},
    {name: "authentication", param: {}},
    {name: "contacts", param: {}},
    {name: "devicestatus", param: {}}
];

var pzh;
var pzp;
var code = "DEBUG";

describe("delete cert", function() {
	it("delete cert", function() {
		process.exec("rm -r ../../../../demo/certificates");
	});
});
describe("PZH Web Socket Server", function() {
	it("start pzh websocket server", function() {
		WebSocket.startServer(ipAddr, serverPort, webServerPort, pzhModules, function(result) {
			expect(result).not.toBeNull();
			expect(result).not.toEqual(false);
			expect(result).toEqual(true);
		});
	});
});

describe("PZP Web Socket Server", function() {
	it("start pzp websocket server", function() {
		PzpWebsocket.startPzpWebSocketServer(ipAddr, PzpServerPort, PzpWebServerPort, function(result) {
			expect(result).not.toBeNull();
			expect(result).toEqual("startedWebSocketServer");
		});
	});
});

describe("PZH functionalities", function() {	
	it("start PZH & list connected devices & list crash log", function() {
		runs( function () {
			Pzh.startPzh(contents, ipAddr, port, function(result, pzh1) {
				expect(result).not.toBeNull();
				expect(result).toEqual("startedPzh");
				pzh = pzh1;
			});
		});
		
		waits(500);
		
		runs( function() {
			Pzp.startPzp(PzpContents, ipAddr, port, code, pzpModules, function(result, pzp1) {
				expect(result).not.toBeNull();
				expect(result).toEqual("startedPZP");
				pzp = pzp1;   
			});
		});
		
		waits(500);
		runs( function() {
			process.exit(0);
		});
 	});
});

