/*******************************************************************************
 *  Code contributed to the webinos project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *	 http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright 2013 TNO
 * Author: Eric Smekens
 *
 * Webroot Jasmine TEST: http://localhost:8080/tests/api_tests/vehicle/SpecRunnerOBD.html
 ******************************************************************************/
(function () {

    // rpcHandler set be setRPCHandler
    var rpcHandler = null;
    // Connection to the OBD-II. Vehicle Obd
    var vo;

    /**
     * Called when an error should be printed.
     * @param message Message to be printed.
     */
    function VehicleError(message) {
        this.message = message;
    }

    /**
     * Get a value by PID-name.
     * @param vehicleDataId PID
     * @param vehicleDataHandler Succes callback
     * @param errorCB Error callback
     */
    function get(vehicleDataId, vehicleDataHandler, errorCB) {
        switch (vehicleDataId[0]) {
            case "rpm":
                vo.get('rpm', vehicleDataHandler);
                break;
            case "vss":
                vo.get('vss', vehicleDataHandler);
                break;
            case "load_pct":
                vo.get('load_pct', vehicleDataHandler);
                break;
            default:
                errorCB(new VehicleError(vehicleDataId[0] + ' not supported on this service implementation.'));
        }
    }

    //Objects references for handling EventListeners
    var objectRefs = [];
    var listeners = [];

    //BOOLs for handling listeners
    var listeningToRPM = false;
    var listeningToSpeed = false;
    var listeningToEngineLoad = false;


    /**
     * Add an event listener. This starts polling the OBD-II device!
     * @param vehicleDataId The PID.
     * @param successHandler
     * @param errorHandler
     * @param objectRef
     */
    addEventListener = function (vehicleDataId, successHandler, errorHandler, objectRef) {
        var supported = false;
        switch (vehicleDataId) {
        case "rpm":
            supported = true;
            if (!listeningToRPM) { //Listener for gears not yet registered
                listeningToRPM = true;
                vo.addListener(vehicleDataId, handleRPMEvents);
                console.log('now listening');
            }
            break;
        case "vss":
            supported = true;
            if (!listeningToSpeed) {
                listeningToSpeed = true;
                vo.addListener(vehicleDataId, handleSpeedEvents);
                console.log('now listening');
            }
            break;
        case "load_pct":
            supported = true;
            if (!listeningToEngineLoad) {
                listeningToEngineLoad = true;
                vo.addListener(vehicleDataId, handleEngineLoadEvents);
                console.log('now listening');
            }
            break;
        default:
            supported = false;
        }
        if (supported) {
            listeners.push([successHandler, errorHandler, objectRef, vehicleDataId]);
        } else {
            errorHandler(new VehicleError('Listener on ' + vehicleDataId + ' not supported.'));
        }
    }


    /**
     * Removes an event. This stops polling for that specific PID.
     * @param arguments [1] is PID.
     */
    removeEventListener = function (arguments) {

        // arguments[0] = objectReference, arguments[1] = vehicleDataId
        /*
         * this is inside a listener array:
         * [0]successHandler, [1]errorHandler, [2]objectRef, [3]vehicleDataId
         */
        var registeredListeners = 0;
        for (i = 0; i < listeners.length; i++) {
            if (listeners[i][2][0] == arguments[1]) {
                registeredListeners++;
            }
            if (listeners[i][0] == arguments[0]) {
                listeners.splice(i, 1);
                console.log('object# ' + arguments[1] + " removed.");
            }
        }

        if (registeredListeners <= 1) {
            console.log('disabling listening to ' + arguments[1] + " Events");
            switch (arguments[1]) {
                case "rpm":
                    listeningToRPM = false;
                    break;
                case "vss":
                    listeningToSpeed = false;
                    break;
                case "load_pct":
                    listeningToEngineLoad = false;
                    break;
                default:
                    console.log("nothing found");

            }
            vo.removeListener(arguments[1]);
        }
    }


    /*handlerpmEvents*/
    function handleRPMEvents(rpmEvent) {
        if (listeningToRPM) {
            for (var i = 0; i < listeners.length; i++) {
                if (listeners[i][3] == 'rpm') {
                    returnData(rpmEvent, function (rpmEvent) {
                        var rpc = rpcHandler.createRPC(listeners[i][2], 'onEvent', rpmEvent);
                        rpcHandler.executeRPC(rpc);
                    }, listeners[i][1], listeners[i][2]);
                }
            }
        }
    }
    /*handlespeedEvents*/
    function handleSpeedEvents(speedEvent) {
        if (listeningToSpeed) {
            for (var i = 0; i < listeners.length; i++) {
                if (listeners[i][3] == 'vss') {
                    returnData(speedEvent, function (speedEvent) {
                        var rpc = rpcHandler.createRPC(listeners[i][2], 'onEvent', speedEvent);
                        rpcHandler.executeRPC(rpc);
                    }, listeners[i][1], listeners[i][2]);
                }
            }
        }
    }
    /*handleengineLoadEvents*/
    function handleEngineLoadEvents(engineLoadEvent) {
        if (listeningToEngineLoad) {
            for (var i = 0; i < listeners.length; i++) {
                if (listeners[i][3] == 'load_pct') {
                    returnData(engineLoadEvent, function (engineLoadEvent) {
                        var rpc = rpcHandler.createRPC(listeners[i][2], 'onEvent', engineLoadEvent);
                        rpcHandler.executeRPC(rpc);
                    }, listeners[i][1], listeners[i][2]);
                }
            }
        }
    }

    function returnData(data, successCB, errorCB) {
        if (data === undefined) {
            errorCB('Position could not be retrieved');
        } else {
            successCB(data);
        }
    }

    function setRPCHandler(rpcHdlr) {
        rpcHandler = rpcHdlr;
    }

    function setRequired(obj) {
        vo = obj;
    }

    exports.addEventListener = addEventListener;
    exports.removeEventListener = removeEventListener;
    exports.get = get;

    exports.setRPCHandler = setRPCHandler;
    exports.setRequired = setRequired;

    exports.serviceDesc = {
        api: 'http://webinos.org/api/vehicle',
        displayName: 'Vehicle API (OBD)',
        description: 'Provides data from the vehicle OBD-II bus.'
    };

})(module.exports);