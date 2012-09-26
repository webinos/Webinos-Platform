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
******************************************************************************/

(function() {
// rpcHandler set be setRPCHandler
var rpcHandler = null;

// car info
var car = null;

function getCurrentPosition (params, successCB, errorCB){
	var position = new Object();
	var d = new Date();
	var stamp = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
	var stamp = stamp + d.getUTCMilliseconds();
	position.timestamp = stamp;
	position.coords = new Object();
	position.coords.latitude = Math.floor((car.position.latitude.get() / Math.pow(2,32) * 360) * 10000)/10000; 
	position.coords.longitude = Math.floor((car.position.longitude.get() / Math.pow(2,32) * 360) * 10000)/10000;
	
	//USING INFO FROM GPS RECEIVER
	extension = car.position.extensions.get();
    position.coords.altitude = extension.altitude;
    position.coords.accuracy = extension.quality;
    //position.coords.heading = extension.heading;
    //position.coords.speed = extension.speed;
    
    //speed from GPS DATA
    //position.coords.speed = extension.speed;
	
	position.coords.heading = car.heading.get();
	position.coords.speed = Math.floor(((car.speed.get() / 10) / 3600) * 1000 *1000) / 1000 ; // meters per second 

	returnPosition(position, successCB, errorCB);
	return;
}

function watchPosition (args, successCB, errorCB, objectRef) {
	listeners.push([successCB, errorCB, objectRef, args[1]]);	
	if(!listeningToPosition){
		car.position.bind(vehicleBusHandler);
		listeningToPosition = true;
	}
	console.log(listeners.length + " listener(s) watching");
}

function returnPosition(position, successCB, errorCB){
	if(position === undefined){
		errorCB('Position could not be retrieved');		
	}else{
		successCB(position);
	}
}

var listeners = new Array();
var listeningToPosition = false;

function vehicleBusHandler(data){
	var position = new Object();
 
    var d = new Date();
    var stamp = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
    var stamp = stamp + d.getUTCMilliseconds();
    position.timestamp = stamp;
  	position.coords = new Object();
            
  	position.coords.latitude = Math.floor((data.latitude / Math.pow(2,32) * 360) * 10000)/10000;
  	position.coords.longitude = Math.floor((data.longitude / Math.pow(2,32) * 360) * 10000)/10000;
	position.coords.accuracy = 99;
	position.coords.heading = car.heading.get();
	position.coords.speed = Math.floor(((car.speed.get() / 10) / 3600) * 1000 *1000) / 1000 ; // meters per second
	
	extension = car.position.extensions.get();
    position.coords.altitude = extension.altitude;
    position.coords.accuracy = extension.quality;

	
	
	for(var i = 0; i < listeners.length; i++){
		returnPosition(position, function(position) {var rpc = rpcHandler.createRPC(listeners[i][2], 'onEvent', position); rpcHandler.executeRPC(rpc);}, listeners[i][1], listeners[i][2]);
	}
}

function clearWatch(params, successCB, errorCB) {
	var watchIdKey = params[0];

	for(var i = 0; i < listeners.length; i++){
		if(listeners[i][3] == watchIdKey){
			listeners.splice(i,1);
			console.log('object# ' + watchIdKey + " removed.");
			break;
		}
	}
	if(listeners.length == 0){
		car.position.unbind(vehicleBusHandler);
		listeningToPosition = false;
		console.log('disabled geolocation listening');
	}
}

function setRPCHandler(rpcHdlr) {
	rpcHandler = rpcHdlr;
}

function setRequired(obj) {
	car = obj;
}

exports.getCurrentPosition = getCurrentPosition;
exports.watchPosition = watchPosition;
exports.clearWatch = clearWatch;
exports.setRPCHandler = setRPCHandler;
exports.setRequired = setRequired;
exports.serviceDesc = {
		api:'http://www.w3.org/ns/api-perms/geolocation',
		displayName:'Geolocation (by car input)',
		description:'Provides geolocation based on car location.'
};

})(module.exports);
