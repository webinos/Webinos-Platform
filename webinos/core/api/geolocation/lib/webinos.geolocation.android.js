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
* Copyright 2012 Paddy Byers
******************************************************************************/

(function() {
// rpcHandler set be setRPCHandler
var rpcHandler = null;
var androidImpl = null;
// store watch ids in this table under given key from caller
var watchIdTable = {};

try {
  androidImpl = require('bridge').load('org.webinos.impl.GeolocationImpl', this);
} catch(e) {
  console.log("error loading native android module: " + e);
}

function getCurrentPosition (params, successCB, errorCB, objectRef){
  if(!androidImpl) {
    errorCB(new Error('Android geolocation service not available'));
    return;
  }
  var inCall;
  var implSuccess = function(position) {
  	if(inCall) {
  		successCB(position);
  		return;
  	}
  	/* it will complete asynchronously */
	var rpc = rpcHandler.createRPC(objectRef, 'onEvent', position);
	rpcHandler.executeRPC(rpc);
  };
  var implErr = function(err) {

  	if(inCall) {
  		errorCB(err);
  		return;
  	}
  	/* it will complete asynchronously */
	var rpc = rpcHandler.createRPC(objectRef, 'onError', err);
	rpcHandler.executeRPC(rpc);
  };
  inCall = true;
  androidImpl.getCurrentPosition(implSuccess, implErr, params);
  inCall = false;
}

function watchPosition (args, successCB, errorCB, objectRef) {
  if(!androidImpl) {
    errorCB(new Error('Android geolocation service not available'));
    return 0;
  }
  watchIdTable[objectRef.rpcId] = androidImpl.watchPosition(function(position) {
    //console.log('GeolocationImpl watchPosition returned position: ' + position);
	var rpc = rpcHandler.createRPC(objectRef, 'onEvent', position);
	rpcHandler.executeRPC(rpc);
  }, function(err) {
    //console.log('GeolocationImpl watchPosition returned err: ' + err);
	var rpc = rpcHandler.createRPC(objectRef, 'onError', err);
	rpcHandler.executeRPC(rpc);
  }, args[0]);
  successCB();
}

function clearWatch(params, successCB, errorCB) {
  if(!androidImpl) {
    errorCB(new Error('Android geolocation service not available'));
    return;
  }
  var watchIdKey = params[0];
  var watchId = watchIdTable[watchIdKey];
  delete watchIdTable[watchIdKey];
  androidImpl.clearWatch(watchId);
}

function setRPCHandler(rpcHdlr) {
	rpcHandler = rpcHdlr;
}

function setRequired(obj) {
}

exports.getCurrentPosition = getCurrentPosition;
exports.watchPosition = watchPosition;
exports.clearWatch = clearWatch;
exports.setRPCHandler = setRPCHandler;
exports.setRequired = setRequired;
exports.serviceDesc = {
		api:'http://webinos.org/api/w3c/geolocation',
		displayName:'Geolocation (by phone location service)',
		description:'Provides geolocation based on phone location service.'
};

})(module.exports);
