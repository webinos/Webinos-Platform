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
******************************************************************************/

(function() {
var RPCWebinosService = require('webinos-jsonrpc2').RPCWebinosService;

/**
 * Webinos Geolocation service constructor  (server side).
 * @constructor
 * @alias GeolocationModule
 * @param rpcHandler A handler for functions that use RPC to deliver their result.
 */
var GeolocationModule = function(rpcHandler, params) {
    var implFile;
    var car = null;
    var connector = null;
    
    if(typeof params.connector === 'undefined' ){
        connector = 'simulator';
    }else{
        connector = params.connector;
    }
        

    if(process.platform == 'android') {
      implFile = 'android';
      console.log('************** android platform *************');
    } else if(connector == 'most'){
        try{
            var vehicleSystem = require('../../vehicle/contrib/vb-con/vc.js');
            vehicleBusAvailable = vehicleSystem.available;
            car = vehicleSystem.most;
            implFile = 'vehicle';
        }catch(e){
            console.log(e);
        }
    }else if(connector == 'simulator'){
        try{
            car = require('../../vehicle/contrib/vb-sim/vs.js');
            implFile = 'sim';
            console.log('connecting to simulator');
            console.log('simulator available at http://localhost:9898/simulator/vehicle.html');
        }catch(e){
            console.log(e);
        }
    }else if(connector == 'geoip'){
        implFile = 'geoip';    
        console.log('connecting to fake data generator');
     }
    

    
	var implModule = require('./webinos.geolocation.' + implFile + '.js');

    
	implModule.setRPCHandler(rpcHandler);
	implModule.setRequired(car);
	
	// inherit from RPCWebinosService
	this.base = RPCWebinosService;
	this.base(implModule.serviceDesc);
	
	/**
	 * Get the current position.
	 */
	this.getCurrentPosition = function(params, successCB, errorCB, objectRef) {
		implModule.getCurrentPosition(params, successCB, errorCB, objectRef);
	};
	
	/**
	 * Continuously call a listener with the current position. 
	 */
	this.watchPosition = function(args, successCB, errorCB, objectRef) {
		implModule.watchPosition(args, successCB, errorCB, objectRef);
	};
	
	/**
	 * Stop calling a listener.
	 */
	this.clearWatch = function(params, successCB, errorCB, objectRef) {
		implModule.clearWatch(params, successCB, errorCB, objectRef);
	};
	
};

GeolocationModule.prototype = new RPCWebinosService;
exports.Service = GeolocationModule;

})();
