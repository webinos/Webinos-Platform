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

    var SensorService = function(rpcHandler, data, id, drvInt) {

        // inherit from RPCWebinosService
        this.base = RPCWebinosService;
        var driverInterface = drvInt;
        this.objRef = null;
        this.listenerActive = false;
        var type = data;
        var name = type+' sensor';
        var description = 'A webinos '+type+' sensor';

        try {
            var tmp = JSON.parse(data);
            if(tmp.type) {
                type = tmp.type;
            }
            if(tmp.name) {
                name = tmp.name;
            }
            if(tmp.description) {
                description = tmp.description;
            }
        }
        catch(e) {
            console.log('SensorService constructor - error parsing data');
        }

        var sensorEvent = {};
        sensorEvent.sensorType = data;
        sensorEvent.sensorId = id;
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


        this.getStaticData = function (params, successCB, errorCB) {
            successCB(null);
        }


        this.getEvent = function (data) {
            if(data != null) {
                try {
                    var tmp = JSON.parse(data);
                    if(tmp instanceof Array) {
                        //console.log('sensor data is array');
                        sensorEvent.sensorValues = tmp;
                    }
                    else {
                        //console.log('sensor data is NOT array');
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
            return sensorEvent;
        }


        this.addEventListener = function (eventType, successHandler, errorHandler, objectRef) {
            console.log('Sensor '+sensorEvent.sensorId+': addEventListener');
            this.objRef = objectRef;
            this.listenerActive = true;
            driverInterface.sendCommand('start', sensorEvent.sensorId, 'fixed');
        }


        this.removeEventListener = function (eventType, successHandler, errorHandler, objectRef) {
            this.listenerActive = false;
            driverInterface.sendCommand('stop', sensorEvent.sensorId, null);
        }

    }

    SensorService.prototype = new RPCWebinosService;


    exports.SensorService = SensorService;

})();
