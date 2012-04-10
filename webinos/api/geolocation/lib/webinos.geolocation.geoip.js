/*******************************************************************************
*  Code contributed to the webinos project
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
* Copyright 2012 BMW AG
* Copyright 2011 Alexander Futasz, Fraunhofer FOKUS
*******************************************************************************/

// implemenation using geoip
(function() {
	
// rpcHandler set be setRPCHandler
var rpcHandler = null;

// store running timer objects in this table under given key from caller
var watchIdTable = {};

// var used for debugging only;
var counter = 0;

/**
 * Retrieve the current position.
 * @param params Optional options object for enabling higher accuracy.
 * @param successCB Success callback.
 * @param errorCB Error callback.
 * @param objectRef RPC object reference.
 */
function getCurrentPosition (params, successCB, errorCB, objectRef){
	var error = {};
	var geoip = null;
	var http = require('http');
	var freegeoip = http.createClient(80, 'freegeoip.net');
	var request = freegeoip.request('GET', '/json/', {'host': 'freegeoip.net'});
	request.end();
	request.on('response', function (response) {
		// console.log('STATUS: ' + response.statusCode);
		// console.log('HEADERS: ' + JSON.stringify(response.headers));
		response.setEncoding('utf8');
		response.on('data', function (chunk) {
			console.log('geoip chunk: ' + chunk);
			try { 
				geoip = JSON.parse(chunk);
			}
			catch(err) {
				error.code = 2; 
				error.message = "failed getting IP address based geolocation";
				console.log("error: " + JSON.stringify(error));
				errorCB(error);
				return;
			}

			var coords = new Object;
			if (params) {
				if (params.enableHighAccuracy) coords.accuracy = 1; else coords.accuracy = null; // simply reflect input for debugging
			}
			coords.altitude = counter++;
			coords.altitudeAccuracy = null;
			coords.heading = null;
			coords.speed = Math.floor(Math.random()*1000)/10;
			if (geoip) {
				if (geoip.latitude) coords.latitude = geoip.latitude; else coords.latitude = null; 
				if (geoip.longitude) coords.longitude = geoip.longitude; else coords.longitude = null; 
			}	
			var position = new Object;
			position.coords=coords;
			position.timestamp = new Date().getTime();

			if ((position.coords.latitude) && (position.coords.longitude)) {
				successCB(position);
				return;
			}
			else {
				error.code = 2; 
				error.message = "failed getting IP address based geolocation";
				console.log("error: " + JSON.stringify(error));
				errorCB(error);
				return;
			}

		});	 
	});			
}

/**
 * Continuously call back with the current position.
 * @param args Array, first item being the options object, second item being an id.
 * @param successCB Success callback.
 * @param errorCB Error callback.
 * @param objectRef RPC object reference.
 */
function watchPosition (args, successCB, errorCB, objectRef) {
    var tint = 2000;
	var params = args[0];
	if (params.maximumAge) tint = params.maximumAge;
	
	function getPos() {
		// call getCurrentPosition and pass back the position
		getCurrentPosition(params, function(e) {
			var rpc = rpcHandler.createRPC(objectRef, 'onEvent', e);
			rpcHandler.executeRPC(rpc);
		}, errorCB, objectRef);
	}
	
	// initial position
	getPos();

	var watchId = setInterval(function() {getPos(); }, tint);
	
	var watchIdKey = args[1];
	watchIdTable[watchIdKey] = watchId;
}

/**
 * Clear continuously position event for given listener id.
 * @param params Array, first item being the listener id.
 */
function clearWatch (params, successCB, errorCB, objectRef) {
	var watchIdKey = params[0];
	var watchId = watchIdTable[watchIdKey];
	delete watchIdTable[watchIdKey];

	clearInterval(watchId);
}

/**
 * Set the RPC handler
 * @private
 */
function setRPCHandler(rpcHdlr) {
	rpcHandler = rpcHdlr;
}

function setRequired() {
	// no needed
}

exports.getCurrentPosition = getCurrentPosition;
exports.watchPosition = watchPosition;
exports.clearWatch = clearWatch;
exports.setRPCHandler = setRPCHandler;
exports.setRequired = setRequired;
exports.serviceDesc = {
		api:'http://www.w3.org/ns/api-perms/geolocation',
		displayName:'Geolocation (by IP)',
		description:'Provides geolocation based on ip address.'
};

})(module.exports);
