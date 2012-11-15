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

var sensorEventManager = require('./sensor_event_manager.js');

(function() {

var DEF_MAXIMUM_RANGE = 0;
var DEF_MIN_DELAY = 0;
var DEF_POWER = 0;
var DEF_RESOLUTION = 0;
var DEF_VENDOR = 0;
var DEF_VERSION = 0;
var DEF_TIMEOUT = 0;
var DEF_RATE = 1000;
var DEF_EVENT_FIRE_MODE = "valuechange";

/**
 * Webinos Sensor service constructor (server side).
 * @constructor
 * @alias SensorModule
 * @param rpcHandler A handler for functions that use RPC to deliver their result.  
 */
var SensorModule = function(rpcHandler,params) {
        sensorEventManager.setRpcHandler(rpcHandler);
        
	// inherit from RPCWebinosService
        var eventFireMode;
	this.base = RPCWebinosService;
	this.base({
		api:'http://webinos.org/api/sensors.temperature',
		displayName:'Sensor',
		description:'A Webinos temperature sensor.'
	});
        
        this.maximumRange = DEF_MAXIMUM_RANGE;
        this.minDelay = DEF_MIN_DELAY;
        this.power = DEF_POWER;
        this.resolution = DEF_RESOLUTION;
        this.vendor = DEF_VENDOR;
        this.version = DEF_VERSION;
    
        /*
        ** PendingSensorConfigOp configureSensor(ConfigureSensorOptions options, VoidFunction successCB, SensorErrorCB errorCB)
        */
        this.configureSensor = function(options, successCB, errorCB){
//            event.rate = (typeof(options.rate) != 'undefined') ? options.rate : DEF_RATE;
//            event.timeout = (typeof(options.timeout) != 'undefined') ? options.timeout : DEF_TIMEOUT;
//            event.eventFireMode = (typeof(options.eventFireMode) != 'undefined') ? options.eventFireMode : DEF_EVENT_FIRE_MODE;
//            event.position = (typeof(options.position) != 'undefined') ? options.position : null;
//            event.config = (typeof(options.config) != 'undefined') ? options.config : null;
//            event.sensorType = "http://webinos.org/api/sensors.temperature";

            var rate = (typeof(options.rate) != 'undefined') ? options.rate : DEF_RATE;
            var timeout = (typeof(options.timeout) != 'undefined') ? options.timeout : DEF_TIMEOUT;
            
//            eventFireMode = (typeof(options.eventFireMode) != 'undefined') ? options.eventFireMode : DEF_EVENT_FIRE_MODE;
            if(options.eventFireMode == "fixedinterval")
                this.eventFireMode = "fixedinterval";
            else
                this.eventFireMode = "valuechange"; // is the default value
                
            var type = "sensor";
            var sensorType = "http://webinos.org/api/sensors.temperature";
            var sensorId = 1;
            
//            event.eventFireMode = "fixedinterval"; //for test only
//            eventFireMode = "valuechanges"; //for test only
            console.log("[GLT] firemode : " + this.eventFireMode);
//            event.initSensorEvent(type, -1, -1, sensorType, sensorId, -1, rate, eventFireMode, sensorValues, -1);
//            if(event.eventFireMode == "fixedinterval"){
            if(this.eventFireMode == "fixedinterval"){
                console.log("[GLT] Reading from sensor every " + this.rate + " seconds");
                setInterval(function(){
//                    console.log("Reading temperature : "+event.sensorValues[0]);
//                    event.sensorValues[0] = 30; //TODO get sensor value
//                    sensorEventManager.handlePeriodicEvent(event);
                    sensorEventManager.handlePeriodicEvent();
//                }, event.rate);
                }, rate);
            }
            else{
                console.log("[GLT] Reading from sensor when value changes");
            }
        
            successCB();
            
//            void SensorErrorCB(DOMError error);
//            error
//            Optional: No.
//            Nullable: No
//            Type: DOMError
//            Description: DOMError object detailing what went wrong in an unsuccessful configureSensor() asynchronous operation. The following error names cold be issued:
//            - "SyntaxError": Input parameters did not match the expected pattern.
//            - "NotSupportedError": Sensor configuration not supported.
//            - "InvalidModificationError": Sensor can not be configured in this way.
//            - "AbortError": Operation was aborted by the user.
//            - "TimeoutError": The operation timed out.
        };
	
	this.addEventListener = function (eventType, successHandler, errorHandler, objectRef){
            console.log("[GLT] addEventListener to "+eventType);
            console.log("[GLT] eventFireMode : " + this.eventFireMode);
            
            if(eventType == "sensor"){
                console.log("[GLT] Updated listeners");
                if(this.eventFireMode == "valuechange")
                    sensorEventManager.addValueChangesListener(eventType, successHandler, errorHandler, objectRef);
                else if(this.eventFireMode == "fixedinterval")
                    sensorEventManager.addFixedIntervalListener(eventType, successHandler, errorHandler, objectRef);
            }
	};
};

SensorModule.prototype = new RPCWebinosService;


/**
 * Get some initial static sensor data.
 * @param params (unused)
 * @param successCB Issued when sensor configuration succeeded.
 * @param errorCB Issued if sensor configuration fails.
 */
SensorModule.prototype.getStaticData = function (params, successCB, errorCB){
	console.log("[GLT] getStaticData");
        var tmp = {};
	tmp.maximumRange = 100;
	tmp.minDelay = 10;
	tmp.power = 50;
	tmp.resolution = 0.05;
	tmp.vendor = "FhG";  
	tmp.version = "0.1"; 
    successCB(tmp);
    
};

//export our object
exports.Service = SensorModule;

})();
