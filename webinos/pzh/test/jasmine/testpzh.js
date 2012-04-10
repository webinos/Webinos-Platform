Pzh        = require('../../lib/pzh_sessionHandling.js');
WebSocket  = require('../../lib/pzh_websocket.js');
ConnectPzh = require('../../lib/pzh_connecting.js');
Helper     = require('../../lib/pzh_helper.js');
Revoker    = require('../../lib/pzh_revoke.js');
Pzp        = require('../../../pzp/lib/pzp_sessionHandling.js');
PzpWebsocket = require('../../../pzp/lib/pzp_websocket.js');

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
		WebSocket.startServer(ipAddr, serverPort, webServerPort, function(result) {
			expect(result).not.toBeNull();
			expect(result).not.toEqual(false);
			expect(result).toEqual(true);
		});
	});
});

describe("PZH functionalities", function() {	
	it("start PZH & list connected devices & list crash log", function() {
		runs( function () {
			Pzh.startPzh(contents, ipAddr, port, pzhModules, function(result, pzh1) {
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
			expect(pzh.config).not.toBeNull();
			Revoker.listAllPzps(pzh.config.pzhSignedCertDir, function(result) {
				expect(result).not.toBeNull();
			});
		});
		
		waits(500);
		runs( function() {
			Helper.connectedPzhPzp(WebSocket.instance, function(result) {
				expect(result).not.toBeNull();
				expect(result.payload.message.name).toEqual("WebinosPzh");
			});
		});
		
		waits(500);
		runs(function(){		
			Helper.crashLog(WebSocket.instance, function(msg) {
				expect(msg.payload.status).toEqual("crashLog");
			});				
		});
		
		waits(500);
		runs(function() {
			Revoker.revokePzp(pzp.sessionId.split('/')[1], pzh, function(msg) {
	    		expect(msg).not.toBeNull();
	    		expect(msg.payload.success).toEqual(true);	    		
	    		expect(msg.payload.message).toEqual("Successfully revoked");	    		
			});
		});
		
		waits(500);
		runs( function() {			
			Revoker.listAllPzps(pzh.config.pzhRevokedCertDir, function(result) {
				expect(result).not.toBeNull();
			});
		});
		
		waits(500);
		runs ( function() {
			Pzh.restartPzh(pzh, function(err, result, pzh1) {
				expected(err).toBeNull();
				expect(result).not.toBeNull();
				expect(result).toEqual("startedPzh");
				pzh = pzh1;				
			});
		});
		
		waits(500);
		runs(function(){
			Pzp.startPzp(PzpContents, ipAddr, port, code, pzpModules, function(result, pzp1) {				
				expect(result).not.toEqual("startedPZP");					
				process.exit(0);
			});
		});
		
		waits(1000);
		runs( function() {
			process.exit(0);
		});
 	});
});

