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
 * Copyright 2012 BMW AG
 ******************************************************************************/ 
(function () {
	var RPCWebinosService = require("webinos-jsonrpc2").RPCWebinosService;

    function VehicleModule(rpcHandler, params) {
        var implFile = 'fake';
        var car = null;
        var conncector = null;
        if (typeof params.connector === 'undefined') {
            connector = 'simulator';
        } else {
            connector = params.connector;
        }
        if (connector == 'most') {
            try {
                var vehicleSystem = require('../../vehicle/contrib/vb-con/vc.js');
                car = vehicleSystem.most;
                implFile = 'most';
            } catch (e) {
                console.log(e.stack);
            }
        } else if (connector == 'simulator') {
            try {
                car = require('../../vehicle/contrib/vb-sim/vs.js');
                implFile = 'sim';
                console.log('connecting to simulator');
                console.log('simulator available at http://localhost:9898/simulator/vehicle.html');
            } catch (e) {
                console.log(e);
            }
        } else if (connector == 'fake') {
            implFile = 'fake';
            console.log('connecting to fake data generator');
        }
        var implModule = require('./webinos.vehicle.' + implFile + '.js');
        implModule.setRPCHandler(rpcHandler);
        implModule.setRequired(car);
        // inherit from RPCWebinosService
        this.base = RPCWebinosService;
        this.base(implModule.serviceDesc);
        this.get = function (vehicleDataId, vehicleDataHandler, errorCB) {
            implModule.get(vehicleDataId, vehicleDataHandler, errorCB);
        };
        this.addEventListener = function (params, successCB, errorCB, objectRef) {
            implModule.addEventListener(params, successCB, errorCB, objectRef);
        };
        this.removeEventListener = function (args) {
            implModule.removeEventListener(args);
        };
    }
    VehicleModule.prototype = new RPCWebinosService;
    exports.Service = VehicleModule;
})();
