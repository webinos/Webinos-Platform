#!/usr/bin/env node
var mdns    = require('../lib/mdns');
var http = require('http');

 httpserver = http.createServer(function(request, response) {
		log('INFO',  "[PZP WSServer]: Received request for " + request.url);
		response.writeHead(404);
		response.end();
	});

function getelement(service, element)
{
	var srv = JSON.stringify(service);
	var ret = null;
	if(element === 'name')
	{
	  var nm = srv.split(element)[2];
	  var index = nm.indexOf(","); 
	  ret = nm.slice(2, index); 
	}
	else
	{
	  var el = srv.split(element)[1];
	  var index = el.indexOf(","); 
	  ret = el.slice(2, index); 
	} 
	return ret;	
}

httpserver.listen(4321, function() {
	
	var msg = {};
	var msgarr = [];
	var i = 0;

	var ad = mdns.createAdvertisement(mdns.tcp('http'), 4321);

	ad.on('error', function(err) {
	console.log("advertisement error: ", err);
	});
	console.log("created avertisement");

	// watch all http servers
	var browser = mdns.createBrowser(mdns.tcp('http')); 
	browser.on('error', function(err) {
	console.log("browser error: ", err);
	});
	browser.on('serviceUp', function(service) {
	console.log("service up");
	var nm = getelement(service, 'name');
	var port = getelement(service, 'port');
	var address = getelement(service, 'addresses');
	console.log("name:" + nm);
	console.log("address:" + address);
	console.log("port:" + port);

	msg.name = nm;
	msg.port = port;
	msg.address = address; 
	msgarr[i] = msg;
	i++;

	console.log("msg is:" + JSON.stringify(msg));
	
	});
	browser.on('serviceDown', function(service) {
	console.log("service down: ", service);
	});
	browser.on('serviceChanged', function(service) {
	console.log("service changed: ", service);
	});
	console.log("created browser");

	//Start
	ad.start();
	browser.start();

	});


