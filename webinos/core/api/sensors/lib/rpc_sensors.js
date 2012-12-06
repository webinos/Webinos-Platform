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

    var SensorModule = function(rpcH, par) {

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
        var sslib = null;
        var serviceList = new Array;

        if (impl == 'iot') {
            dilib = require(__dirname+'/../../iotdrivers/lib/driverInterface.js');
            sslib = require(__dirname+'/sensor_iot.js');
            driverInterface = new dilib.driverInterface(0, driverListener);
        }
        else if (impl == 'fake') {
            sslib = require(__dirname+'/sensor_fake.js');
        }


        this.init = function(register, unregister) {
            regFunc = register;
            unregFunc = unregister;
            if (impl == 'fake') {
                var service = new sslib.SensorService(rpcHandler);
                regFunc(service);
            }
        };


        function driverListener(cmd, id, data) {
            if (impl == 'iot') {
                switch(cmd) {
                    case 'register':
                        //If cmd is register, then data is the type of sensor (temperature, light, ...)
                        //console.log('sensor api listener: register sensor of type '+data);
                        var service = new sslib.SensorService(rpcHandler, data, id, driverInterface);
                        regFunc(service);
                        serviceList[id] = service;
                        break;
                    case 'data':
                        //console.log('sensor api listener: sensor '+id+' sent value '+data);
                        if(serviceList[id].listenerActive == true) {
                            var sensorEvent = serviceList[id].getEvent(data);
                            var rpc = rpcHandler.createRPC(serviceList[id].objRef, "onEvent", sensorEvent);
                            rpcHandler.executeRPC(rpc);
                        }
                        break;
                    default:
                        console.log('sensor api listener: unrecognized command');
                }
            }
        };


    };


    exports.Module = SensorModule;

})();
