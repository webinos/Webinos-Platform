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

    var driverId = null;
    var registerFunc = null;
    var callbackFunc = null;


    /*
     * This function is called to initialize the driver.
     * @param dId Identifier of the driver
     * @param regFunc This is the function to call to register a new sensor/actuator
     * @param cbkFunc This is the function to call to send back data
     *
     */
    exports.init = function(dId, regFunc, cbkFunc) {
        driverId = dId;
        console.log('Fake driver 2 init - id is '+driverId);
        registerFunc = regFunc;
        callbackFunc = cbkFunc;
        
        setTimeout(intReg, 3500);
    };


    /*
     * This function is called to execute a command
     * @param cmd The command
     * @param eId Identifier of the element that should execute the command
     * @param data Data of the command
     *
     *
     */
    exports.execute = function(cmd, eId, data) {
    }


    function intReg() {
        console.log('\nFake driver 2 - register new elements');
        registerFunc(driverId, 0, 'light');
        registerFunc(driverId, 1, 'linearmotor');
        registerFunc(driverId, 1, 'switch');
        registerFunc(driverId, 0, 'proximity');
    }

}());
