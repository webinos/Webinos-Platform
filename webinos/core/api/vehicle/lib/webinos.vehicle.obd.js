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
 * Copyright 2013 TNO
 ******************************************************************************/
(function () {

    // rpcHandler set be setRPCHandler
    var rpcHandler = null;
    var vs;

    function VehicleError(message) {
        this.message = message;
    }

    function get(vehicleDataId, vehicleDataHandler, errorCB) {
        switch (vehicleDataId[0]) {
            case "gear":
                vehicleDataHandler(vs.get('gear'));
                break;
            default:
                errorCB(new VehicleError(vehicleDataId[0] + ' not supported on this service implementation.'));
        }
    }

    //Objects references for handling EventListeners
    var objectRefs = new Array();
    var listeners = [];

    //BOOLs for handling listeners (are there active listeners)
    var listeningToGear = false;
//    var listeningToTripComputer = false;
//    var listeningToParkSensorsFront = false;
//    var listeningToParkSensorsRear = false;
//    var listeningToDestinationReached = false;
//    var listeningToDestinationChanged = false;
//    var listeningToDestinationCancelled = false;
//    var listeningToClimateControlAll = false;
//    var listeningToClimateControlDriver = false;
//    var listeningToClimateControlPassFront = false;
//    var listeningToClimateControlPassRearLeft = false;
//    var listeningToClimateControlPassRearRight = false;
//
//    var listeningToLightsFogFront = false;
//    var listeningToLightsFogRear = false;
//    var listeningToLightsSignalLeft = false;
//    var listeningToLightsSignalRight = false;
//    var listeningToLightsSignalWarn = false;
//    var listeningToLightsParking = false;
//    var listeningToLightsHibeam = false;
//    var listeningToLightsHead = false;
//
//    var listeningToWipers = false;
//    var listeningToDoors = false;
//    var listeningToWindows = false;
//    var listeningToEngineOil = false;


    /*AddEventListener*/
    addEventListener = function (vehicleDataId, successHandler, errorHandler, objectRef) {
        var supported = false;
        switch (vehicleDataId) {
        case "gear":
            supported = true;
            if (!listeningToGear) { //Listener for gears not yet registered
                listeningToGear = true;
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


    /*RemoveEventListener*/
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
                case "gear":
                    listeningToGear = false;
                    break;
                default:
                    console.log("nothing found");

            }
        }
    }


    /*handlegearEvents*/
//    function handleGearEvents(gearE) {
//        if (listeningToGear) {
//            for (var i = 0; i < listeners.length; i++) {
//                if (listeners[i][3] == 'gear') {
//                    returnData(gearE, function (gearE) {
//                        var rpc = rpcHandler.createRPC(listeners[i][2], 'onEvent', gearE);
//                        rpcHandler.executeRPC(rpc);
//                    }, listeners[i][1], listeners[i][2]);
//                }
//            }
//        }
//    }

    function returnData(data, successCB, errorCB) {
        if (data === undefined) {
            errorCB('Position could not be retrieved');
        } else {
            successCB(data);
        }
    }



    /*handleTripComputerEvents*/
//    function handleTripComputerEvents(data) {
//        if (listeningToTripComputer) {
//            for (var i = 0; i < listeners.length; i++) {
//                if (listeners[i][3] == 'tripcomputer') {
//                    returnData(data, function (data) {
//                        var rpc = rpcHandler.createRPC(listeners[i][2], 'onEvent', data);
//                        rpcHandler.executeRPC(rpc);
//                    }, listeners[i][1], listeners[i][2]);
//                }
//            }
//        }
//    }

    /*handleParkSensorsEvent*/
//    function handleParkSensorsEvents(data) {
//        console.log('handle ps data');
//        if (listeningToParkSensorsFront || listeningToParkSensorsRear) {
//            for (var i = 0; i < listeners.length; i++) {
//                if (listeners[i][3] == 'parksensors-front') {
//                    returnData(data, function (data) {
//                        var rpc = rpcHandler.createRPC(listeners[i][2], 'onEvent', data);
//                        rpcHandler.executeRPC(rpc);
//                    }, listeners[i][1], listeners[i][2]);
//                }
//                if (listeners[i][3] == 'parksensors-rear') {
//                    returnData(data, function (data) {
//                        var rpc = rpcHandler.createRPC(listeners[i][2], 'onEvent', data);
//                        rpcHandler.executeRPC(rpc);
//                    }, listeners[i][1], listeners[i][2]);
//                }
//            }
//        }
//    }


    function setRPCHandler(rpcHdlr) {
        rpcHandler = rpcHdlr;
    }

    function setRequired(obj) {
        vs = obj;
        //vs.addListener('gear', handleGearEvents);
        //vs.addListener('tripcomputer', handleTripComputerEvents);
        //vs.addListener('parksensors-rear', handleParkSensorsEvents);
        //vs.addListener('parksensors-front', handleParkSensorsEvents);
    }


    exports.addEventListener = addEventListener;
    exports.removeEventListener = removeEventListener;
    exports.get = get;

    exports.setRPCHandler = setRPCHandler;
    exports.setRequired = setRequired;

    exports.serviceDesc = {
        api: 'http://webinos.org/api/vehicle',
        displayName: 'Vehicle API (OBD)',
        description: 'Provides data from the vehicle simulator.'
    };

})(module.exports);
