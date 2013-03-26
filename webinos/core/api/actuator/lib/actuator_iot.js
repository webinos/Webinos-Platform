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

        var name;
        var description;
        
        this.range = null;
        this.unit = null;
        this.vendor = null;  
        this.version = null;
        this.elementId = id;

        var type;
//        console.log("Called actuator ctor with params " + JSON.stringify(data));

        if(data.type) {
            type = data.type;
        }

        if(data.name) {
            name = data.name;
        }
        else{
            name = type+' actuator';
        }
    
        if(data.description) {
            description = data.description;
        }
        else{
            description = 'A webinos '+type+' actuator';
        }
        
        if(data.range){
            this.range = data.range;
        }

        if(data.unit){
            this.unit = data.unit;
        }

        if(data.vendor){
            this.vendor = data.vendor;
        }

        if(data.version){
            this.version = data.version;
        }

        var actuatorEvent = {};
        actuatorEvent.actuatorType = 'http://webinos.org/api/actuators.' + type;
        actuatorEvent.actuatorId = this.id;

        actuatorEvent.actualValue = null;
        
        this.base({
            api: 'http://webinos.org/api/actuators.'+type,
            displayName: name,
            description: description //+' - id '+id
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
        
        var CmdErrorHandler = function(rpcErrorCB) {
            this.rpcErrorCB = rpcErrorCB;      
            this.errorCB = function(message) {
                rpcErrorCB(message);
            };
        };
        this.setValue = function(value, successCB, errorCB) {
            driverInterface.sendCommand('value', this.elementId,
                    value, new CmdErrorHandler(errorCB).errorCB);
            actuatorEvent.actualValue = value;
            actuatorEvent.actuatorId = this.id;
            // If driver haven't called the error callback before returning
            // from it is assumed that everything went ok.
            successCB(actuatorEvent);
        };
    }


    ActuatorService.prototype = new RPCWebinosService;

    exports.ActuatorService = ActuatorService;

})();
