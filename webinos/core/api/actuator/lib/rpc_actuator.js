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
var RPCWebinosService = require('webinos-jsonrpc2').RPCWebinosService;

    var ActuatorsModule = function(rpcH, par) {

        var rpcHandler = rpcH;
        var params = par;

        var impl = 'iot';
        if(typeof params.impl != 'undefined') {
            impl = params.impl;
        }

        var regFunc;
        var unregFunc;
        var dilib = null;
        var driverInterface = null;
        var actlib = null;
        var serviceList = new Array;

        if (impl == 'iot') {
            dilib = require(__dirname+'/../../iotdrivers/lib/driverInterface.js');
            actlib = require(__dirname+'/actuator_iot.js');
        }
        else if (impl == 'old') {
            actlib = require(__dirname+'/actuator_old.js');
        }


        this.init = function(register, unregister) {
            console.log('Init old actuator service');
            regFunc = register;
            unregFunc = unregister;
            if (impl == 'iot') {
                driverInterface = new dilib.driverInterface();
                driverInterface.connect(1, driverListener);
            }
            else if (impl == 'old') {
                var service = new actlib.ActuatorService(rpcHandler);
                regFunc(service);
            }
        };


        function driverListener(cmd, id, data) {
            if (impl == 'iot') {
                switch(cmd) {
                    case 'register':
                        //If cmd is register, then data is the type of sensor (temperature, light, ...)
//                        console.log('actuator api listener: register actuator of type '+data);
                        var service = new actlib.ActuatorService(rpcHandler, data, id, driverInterface);
//                        console.log('actuator api listener: register - 03');
                        regFunc(service);
//                        console.log('actuator api listener: register - 04');
                        serviceList[id] = service;
                        break;
                    case 'data':
                        console.log('error: actuator api should not send data...');
                        //if(serviceList[id].listenerActive == true) {
                        //    var sensorEvent = serviceList[id].getEvent(data);
                        //    var rpc = rpcHandler.createRPC(serviceList[id].objRef, "onEvent", sensorEvent);
                        //    rpcHandler.executeRPC(rpc);
                        //}
                        break;
                    default:
                        console.log('actuator api listener: unrecognized command');
                }
            }
        };


    };


    exports.Module = ActuatorsModule;

})();
