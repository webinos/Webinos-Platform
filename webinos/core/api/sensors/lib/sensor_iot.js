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
 * Copyright 2012 Telecom Italia
 *
 ******************************************************************************/

(function() {
var RPCWebinosService = require("webinos-jsonrpc2").RPCWebinosService;

    var configureSensorHandlers = new Array();
    var addEventListenerHandlers = new Array();
    var removeEventListenerHandlers = new Array();

    var SensorService = function(rpcHandler, data, id, drvInt) {

        // inherit from RPCWebinosService
        this.base = RPCWebinosService;
        var driverInterface = drvInt;
        this.objRef = null;
        this.listenerActive = false;
        this.maximumRange = "na";
        this.minDelay = "na";
        this.power = "na";
        this.resolution = "na";
        this.vendor = "na";  
        this.version = "na";
        this.elementId = id;

        var type;
        var name;
        var description;
        
//        console.log("Called sensor ctor with params " + JSON.stringify(data));

        if(data.type) {
            type = data.type;
        }
        
        if(data.name) {
            name = data.name;
        }
        else{
            name = type+' sensor';
        }
        
        if(data.description) {
            description = data.description;
        }
        else{
            description = 'A webinos '+type+' sensor';
        }
        
        if(data.maximumRange){
            this.maximumRange = data.maximumRange;
        }
        
        if(data.minDelay){
            this.minDelay = data.minDelay;
        }
        
        if(data.power){
            this.power = data.power;
        }
        
        if(data.resolution){
            this.resolution = data.resolution;
        }
        
        if(data.vendor){
            this.vendor = data.vendor;
        }
        
        if(data.version){
            this.version = data.version;
        }

        var sensorEvent = {};
        sensorEvent.sensorType = "http://webinos.org/api/sensors."+type;
        sensorEvent.sensorId = this.id;
        sensorEvent.accuracy = 0;
        sensorEvent.rate = 0;
        sensorEvent.eventFireMode = null;
        sensorEvent.sensorValues = null;
        sensorEvent.position = null;
        
        this.base({
            api: 'http://webinos.org/api/sensors.'+type,
            displayName: name,
            description: description+' - id '+id
        });

        /**
        * Get some initial static sensor data.
        * @param params (unused)
        * @param successCB Issued when sensor configuration succeeded.
        * @param errorCB Issued if sensor configuration fails.
        */
        this.getStaticData = function (params, successCB, errorCB){
            try{
                var tmp = {};
                tmp.maximumRange = this.maximumRange;
                tmp.minDelay = this.minDelay;
                tmp.power = this.power;
                tmp.resolution = this.resolution;
                tmp.vendor = this.vendor;  
                tmp.version = this.version;
                successCB(tmp);
            }
            catch(err){
                errorCB();
            }
            
        };
        
        this.getEvent = function (data) {
            if(data != null) {
                try {
                    var tmp = JSON.parse(data);
                    if(tmp instanceof Array) {
                        sensorEvent.sensorValues = tmp;
                    }
                    else {
                        sensorEvent.sensorValues = new Array;
                        sensorEvent.sensorValues[0] = tmp;
                    }
                }
                catch(e) {
                    //console.log('Sensor event error: cannot convert data to array of values');
                    //sensorEvent.sensorValues = null;
                    sensorEvent.sensorValues = new Array;
                    sensorEvent.sensorValues[0] = tmp;
                }
            }
            
            sensorEvent.sensorId = this.id;
            return sensorEvent;
        }
        
        var CmdErrorHandler = function(rpcErrorCB) {
            this.rpcErrorCB = rpcErrorCB;      
            this.errorCB = function(message) {
                rpcErrorCB(message);
            };
        };
        
        /**
        * Configures a sensor.
        * @param params
        * @param successCB
        * @param errorCB
        */
        this.configureSensor = function(params, successCB, errorCB) {
            console.log("Configuring sensor with params : "+JSON.stringify(params));
            configureSensorHandlers.succCB = successCB; 
            configureSensorHandlers.errCB  = errorCB;
            driverInterface.sendCommand('cfg', this.elementId, params, configureSensorErrorHandler, configureSensorSuccessHandler);
        };
        
        this.addEventListener = function (eventType, successCB, errorCB, objectRef) {
            console.log('Sensor '+sensorEvent.sensorId+': addEventListener');
            this.objRef = objectRef;
            this.listenerActive = true;
            addEventListenerHandlers.succCB = successCB;
            addEventListenerHandlers.errCB  = errorCB;
            driverInterface.sendCommand('start', this.elementId, null,addEventListenerErrorHandler,addEventListenerSuccessHandler);
        };

        this.removeEventListener = function (eventType, successCB, errorCB, objectRef) {
            this.listenerActive = false;
            removeEventListenerHandlers.succCB = successCB;
            removeEventListenerHandlers.errCB  = errorCB;
            driverInterface.sendCommand('stop', this.elementId, null, removeEventListenerErrorHandler, removeEventListenerSuccessHandler);
        };
    }

    function configureSensorSuccessHandler(){
        configureSensorHandlers.succCB();
    }

    function configureSensorErrorHandler(){
        configureSensorHandlers.errCB();
    }
    
    function addEventListenerSuccessHandler(){
        addEventListenerHandlers.succCB();
    }

    function addEventListenerErrorHandler(){
        addEventListenerHandlers.errCB();
    }

    function removeEventListenerSuccessHandler(){
        removeEventListenerHandlers.succCB();
    }

    function removeEventListenerErrorHandler(){
        removeEventListenerHandlers.errCB();
    }

    SensorService.prototype = new RPCWebinosService;

    exports.SensorService = SensorService;

})();
