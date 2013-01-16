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

    var ActuatorService = function(rpcHandler, data, id, drvInt) {

        // inherit from RPCWebinosService
        this.base = RPCWebinosService;
        var driverInterface = drvInt;
        this.objRef = null;
        var type = data;
        var name = type+' actuator';
        var description = 'A webinos '+type+' actuator';
        
        this.range = null;
        this.unit = null;
        this.vendor = null;  
        this.version = null;

        var type;
        try {
            var tmp = JSON.parse(data);
            console.log("Data : "+data);

            if(tmp.type) {
                type = tmp.type;
            }
            if(tmp.range){
                this.range = tmp.range;
            }
            if(tmp.unit){
                this.unit = tmp.unit;
            }
            if(tmp.vendor){
                this.vendor = tmp.vendor;
            }
            if(tmp.version){
                this.version = tmp.version;
            }
        }
        catch(e) {
            console.log('ActuatorService constructor - error parsing data');
        }

        var actuatorEvent = {};
        actuatorEvent.actuatorType = type;
        actuatorEvent.actuatorId = id;
        actuatorEvent.actualValue = null;
        
        this.base({
            api: 'http://webinos.org/api/actuators.'+type,
            displayName: name,
            description: description+' - id '+id
        });

        /**
        * Get some initial static actuator data.
        * @param params (unused)
        * @param successCB Issued when actuator configuration succeeded.
        * @param errorCB Issued if actuator configuration fails.
        */
        this.getStaticData = function (params, successCB, errorCB){
            var tmp = {};
            tmp.range = this.range;
            tmp.unit = this.unit;
            tmp.vendor = this.vendor;  
            tmp.version = this.version;
            successCB(tmp);
        };
        

        this.setValue = function(value, successCB, errorCB) {
            console.log('actuator.setValue');
            driverInterface.sendCommand('value', actuatorEvent.actuatorId, value);
            //TODO wait a callback from driver before sending the callback?
            actuatorEvent.avtualValue = value;
            successCB(actuatorEvent);
        }

    }


    ActuatorService.prototype = new RPCWebinosService;

    exports.ActuatorService = ActuatorService;

})();
