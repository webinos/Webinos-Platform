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

    var initialized = false;

    var driversLocation = __dirname+'/drivers/';
    var driversList = new Array;
    var newDriverId = 0;

    var apiListener = new Array;

    var newElementId = 0;
    var elementList = new Array;


    /*
     * Interface for handling IoT drivers.
     * It is supposed that this interface is loaded by the actuator and/or
     * sensor api.
     * @param sensorActuator identifies if this is instantiated by the actuator or sensor api
     * @param listener listener of the sensor/actuator api to be called when needed
     */
    var driverInterface = function(sensorActuator, listener) {
        console.log('Driver Interface constructor');
        if(!initialized) {
            loadDrivers();
            initialized = true;
        }

        // The listener function (implmeted in the api) has the signature:
        // listener(DOMString cmd, int id, DOMString data) where
        // cmd is the command (register, data, ...)
        // id is the is of the element(it's assigned at registration time)
        // data are data (their value depend on the command)
        apiListener[sensorActuator] = listener;


        this.sendCommand = function(cmd, elementId, data) {
            driversList[elementList[elementId].driverId].execute(cmd, elementId, data);
        }


        function loadDrivers() {
            console.log('loadDrivers');
            var fileList = fs.readdirSync(driversLocation);
            for(var i in fileList) {
                console.log('File found: '+fileList[i]+' - id is '+newDriverId);
                try {
                    var newDriver = require(driversLocation+fileList[i]);
                    newDriver.init(newDriverId, register, command);
                    driversList[newDriverId++] = newDriver;
                }
                catch(e) {
                    console.log('Error: cannot load driver '+fileList[i]);
                }
            }
            console.log('loadDrivers: '+driversList.length+' drivers successfully loaded');
        }


        /*
         * Register a new element (sensor or actuator)
         * This function is called from the driver
         * @param driverId the id of the driver calling the function
         * @param sensorActuator specify if it's a sensor(0) or an actuator(1)
         * @param type the type of sensor/actuator (eg light, temperature, ...)
         */
        function register(driverId, sensorActuator, type) {
            var newElement = {};
            newElement.driverId = driverId;
            newElement.sensorActuator = sensorActuator;
            newElement.type = type;
            elementList[newElementId] = newElement;
            //Sending up the register command; in this case data is the type of sensor/actuator
            if(apiListener[sensorActuator] != null) {
                (apiListener[sensorActuator])('register', newElementId, type);
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

    };

    exports.driverInterface = driverInterface;

}());
