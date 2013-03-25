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
var vs;

function getCurrentPosition (params, successCB, errorCB){
	
	returnPosition(vs.get('geolocation'), successCB, errorCB);
	return;
}

function watchPosition (args, successCB, errorCB, objectRef) {
	listeners.push([successCB, errorCB, objectRef, args[1]]);	
	if(!listeningToPosition){
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

function vehicleBusHandler(position){
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
		listeningToPosition = false;
		console.log('disabled geolocation listening');
	}
}


function setRPCHandler(rpcHdlr) {
	rpcHandler = rpcHdlr;
}

function setRequired(obj) {
	vs = obj;
    vs.addListener('geolocation', vehicleBusHandler);
}


exports.getCurrentPosition = getCurrentPosition;
exports.watchPosition = watchPosition;
exports.clearWatch = clearWatch;
exports.setRPCHandler = setRPCHandler;
exports.setRequired = setRequired;
exports.setRPCHandler = setRPCHandler;
exports.setRequired = setRequired;

exports.serviceDesc = {
		api:'http://webinos.org/api/w3c/geolocation',
		displayName:'Geolocation (by car input)',
		description:'Provides geolocation by a simulator.'
};

})(module.exports);
