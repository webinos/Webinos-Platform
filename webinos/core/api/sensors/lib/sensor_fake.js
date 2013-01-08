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
* Copyright 2011 Alexander Futasz, Fraunhofer FOKUS
******************************************************************************/
(function() {
var RPCWebinosService = require("webinos-jsonrpc2").RPCWebinosService;

/**
 * Webinos Sensor service constructor (server side).
 * @constructor
 * @alias SensorService
 * @param rpcHandler A handler for functions that use RPC to deliver their result.  
 */
var SensorService = function(rpcHandler) {
    // inherit from RPCWebinosService
    this.base = RPCWebinosService;
    this.base({
        api:'http://webinos.org/api/sensors.temperature',
        displayName:'Sensor',
        description:'A Webinos temperature sensor.'
    });
    
    var listenerActive = false;

    this.addEventListener = function (eventType, successHandler, errorHandler, objectRef){
        console.log("eventType " + eventType);    
        switch(eventType){
        case "temperature":
            listenerActive = true;
            simulateTemp(objectRef);        
            break;
        default:
            console.log('Requested EventType is ' + eventType + " but i am temprature");
        }    
    };

    this.removeEventListener = function (eventType, successHandler, errorHandler, objectRef){
        listenerActive = false;
    };

    function simulateTemp(objectRef) {
        if(listenerActive) {
            var tint = 2000;
            var tempE = generateTempEvent();
            var rpc = rpcHandler.createRPC(objectRef, "onEvent", tempE);
            rpcHandler.executeRPC(rpc);
        
            setTimeout(function(){
                simulateTemp(objectRef);
            }, tint);
        }
    }
};

SensorService.prototype = new RPCWebinosService;

/**
 * Configures a sensor.
 * @param params
 * @param successCB
 * @param errorCB
 */
SensorService.prototype.configureSensor = function (params, successCB, errorCB){
    console.log("configuring temperature sensor");
    
    successCB();
};

/**
 * Get some initial static sensor data.
 * @param params (unused)
 * @param successCB Issued when sensor configuration succeeded.
 * @param errorCB Issued if sensor configuration fails.
 */
SensorService.prototype.getStaticData = function (params, successCB, errorCB){
    var tmp = {};
    tmp.maximumRange = 100;
    tmp.minDelay = 10;
    tmp.power = 50;
    tmp.resolution = 0.05;
    tmp.vendor = "FhG";  
    tmp.version = "0.1"; 
    successCB(tmp);
};

function generateTempEvent(){
    var temp = Math.floor(Math.random()*100);
    return new TempEvent(temp);        
}

function TempEvent(value){
    this.SENSOR_STATUS_ACCURACY_HIGH = 4;
    this.SENSOR_STATUS_ACCURACY_MEDIUM = 3;
    this.SENSOR_STATUS_ACCURACY_LOW = 2;
    this.SENSOR_STATUS_UNRELIABLE = 1;
    this.SENSOR_STATUS_UNAVAILABLE = 0;

    this.sensorType = "temperature";
    this.sensorId = "sensorId (could we use same id as the unique service id here?)";
    this.accuracy = 4;
    this.rate = 2;
    this.interrupt = false;

    this.sensorValues = new Array();
    this.sensorValues[0] = value;
    this.sensorValues[1] = value/100; //because max range is 100
    
}

//export our object
exports.SensorService = SensorService;

})();
