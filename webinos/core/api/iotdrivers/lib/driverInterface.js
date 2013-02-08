/*******************************************************************************
 *  Code contributed to the webinos project
 * 
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0
 *  
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * Copyright 2012 Telecom Italia SpA
 * 
 ******************************************************************************/


(function () {
    'use strict';

    var fs = require('fs');

    var driversLoaded = false;

    var driversLocation = __dirname+'/drivers/';
    var driversList = new Array;
    var newDriverId = 0;

    var apiListener = new Array;

    var handlers = {};//new Array();

    var newElementId = 0;
    var elementList = new Array;


    /*
     * Interface for handling IoT drivers.
     * It is supposed that this interface is loaded by the actuator and/or
     * sensor api.
     * @param sensorActuator identifies if this is instantiated by the actuator or sensor api
     * @param listener listener of the sensor/actuator api to be called when needed
     */
    var driverInterface = function() {
        if(!driversLoaded) {
            loadDrivers();
            driversLoaded = true;
        }
        
        function loadDrivers() {
            var fileList = fs.readdirSync(driversLocation);
            for(var i in fileList) {
                console.log('File found: '+fileList[i]+' - id is '+newDriverId);
                try {
                    var newDriver = require(driversLocation+fileList[i]);
                    driversList[newDriverId++] = newDriver;
                }
                catch(e) {
                    console.log('Error: cannot load driver '+fileList[i]);
                }
            }
            console.log('loadDrivers: '+driversList.length+' drivers successfully loaded');
        }
        
        this.connect = function (sensorActuator, listener) {
//            console.log('connect sa is '+sensorActuator);
            // The listener function (implmeted in the api) has the signature:
            // listener(DOMString cmd, int id, DOMString data) where
            // cmd is the command (register, data, ...)
            // id is the is of the element(it's assigned at registration time)
            // data are data (their value depend on the command)
            apiListener[sensorActuator] = listener;
            
            // Since each driver can host sensors or actuators or even both
            // we have to make sure that listeners for both sensors and actuators 
            // is set up (module loaded) before we start initializing and receive 
            // callbacks from drivers.
            var allListenersLoaded = true;
            for (var i = 0; i < 2; i++) {
                if (apiListener[i] == 'undefined' || apiListener[i] == null) {
                    allListenersLoaded = false;
                    break;
                }
            }
            if (allListenersLoaded) {
                initDrivers();
            }
        }
        
        function initDrivers() {
            for(var i in driversList) {
                try {
                    driversList[i].init(i, register, command);
                }
                catch(e) {
                    console.log('Error: cannot initialize driver '+ driversList[i]);
                }
            }
        }
 

        this.sendCommand = function(cmd, elementId, data, errorCB, successCB) {
            handlers[elementId] = {succCB : successCB, errCB : errorCB};
            driversList[elementList[elementId].driverId].execute(cmd, elementId, data, handleError, handleSuccess);
        }


        /*
         * Register a new element (sensor or actuator)
         * This function is called from the driver
         * @param driverId the id of the driver calling the function
         * @param sensorActuator specify if it's a sensor(0) or an actuator(1)
         * @param type the type of sensor/actuator (eg light, temperature, ...)
         */
        function register(driverId, sensorActuator, info) {
//            console.log('driverInterface register - did '+driverId+', sa '+sensorActuator+', type '+info.type);
            var newElement = {};
            newElement.driverId = driverId;
            newElement.sensorActuator = sensorActuator;
            newElement.type = info.type;
            elementList[newElementId] = newElement;
            //Sending up the register command; in this case data is the type of sensor/actuator
            if(apiListener[sensorActuator] != null) {
                (apiListener[sensorActuator])('register', newElementId, info);
                return newElementId++;
            }
            else {
                //api not present - return error
                return -1;
            };
        }


        /*
         * Receives a command from the driver and sends it to the api
         * @param cmd The command
         * @param id Identifier of the sensor sending the command
         * @param data Data of the command
         */
        function command(cmd, id, data) {
            //console.log('command '+cmd+', id is '+id+', data is '+data);
            (apiListener[elementList[id].sensorActuator])(cmd, id, data);
        }

        function handleSuccess(id){
            handlers[id].succCB();
        }

        function handleError(id, err){
            handlers[id].errCB(err);
        }
    };

    exports.driverInterface = driverInterface;

}());
