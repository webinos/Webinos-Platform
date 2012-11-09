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
 * Copyright 2012 TU München
 ******************************************************************************/ 
(function () {

    // rpcHandler set be setRPCHandler
    var rpcHandler = null;
    var vs;





    function gearEvent(value) {
        this.gear = value;
    }

    function TripComputerEvent(avgCon1, avgCon2, avgSpeed1, avgSpeed2, tripDistance, mileage, range) {
        this.averageConsumption = avgCon1;
        this.tripConsumption = avgCon2;
        this.averageSpeed = avgSpeed1;
        this.tripSpeed = avgSpeed2;
        this.tripDistance = tripDistance;
        this.mileage = mileage;
        this.range = range;
    }

    //Navigation Event - Destination Reached, Destination Changed, Destination Cancelled
    function NavigationEvent(type, address) {
        this.type = type;
        this.address = address;

    }

    function Address(contry, region, county, city, street, streetNumber, premises, addtionalInformation, postalCode) {
        this.country = country;
        this.region = region;
        this.county = county;
        this.city = city;
        this.street = street;
        this.streetNumber = streetNumber;
        this.premises = premises;
        this.additionalInformation = additionalInformation;
        this.postalCode = postalCode;
    }

    function ParkSensorEvent(position, outLeft, left, midLeft, midRight, right, outRight) {
        this.position = position;
        this.left = left;
        this.midLeft = midLeft;
        this.midRight = midRight;
        this.right = right;
        this.outRight = outRight;
        this.outLeft = outLeft;
    }

    function ClimateControlEvent(zone, desiredTemperature, acstatus, ventLevel, ventMode) {
        this.zone = zone;
        this.desiredTemperature = desiredTemperature;
        this.acstatus = acstatus;
        this.ventLevel = ventLevel;
        this.ventMode = ventMode;
    }

    function ControlEvent(controlId, active) {
        this.controlId = controlId;
        this.active = active;
    }

    function VehicleError(message) {
        this.message = message;
    }



    function get(vehicleDataId, vehicleDataHandler, errorCB) {
        switch (vehicleDataId[0]) {
            case "gear":
                vehicleDataHandler(vs.get('gear'));
                break;
            case "tripcomputer":
                vehicleDataHandler(vs.get('tripcomputer'));
                break;
            case "parksensors-front":
                vehicleDataHandler(vs.get('parksensors-front'));
                break;
            case "parksensors-rear":
                vehicleDataHandler(vs.get('parksensors-rear'));
                break;
            case "climate-all":
                errorCB(new VehicleError(vehicleDataId[0] + 'not found'));
                break;
            case "climate-driver":
                errorCB(new VehicleError(vehicleDataId[0] + 'not found'));
                break;
            case "climate-passenger-front":
                errorCB(new VehicleError(vehicleDataId[0] + 'not found'));
                break;
            case "climate-passenger-rear-left":
                errorCB(new VehicleError(vehicleDataId[0] + 'not found'));
                break;
            case "climate-passenger-rear-right":
                errorCB(new VehicleError(vehicleDataId[0] + 'not found'));
                break;
            case "lights-fog-front":
                vehicleDataHandler(vs.get(vehicleDataId[0]));
                break;
            case "lights-fog-rear":
                vehicleDataHandler(vs.get(vehicleDataId[0]));
                break;
            case "lights-signal-left":
                vehicleDataHandler(vs.get(vehicleDataId[0]));
                break;
            case "lights-signal-right":
                vehicleDataHandler(vs.get(vehicleDataId[0]));
                break;
            case "lights-signal-warn":
                vehicleDataHandler(vs.get(vehicleDataId[0]));
                break;
            case "lights-parking":
                vehicleDataHandler(vs.get(vehicleDataId[0]));
                break;
            case "lights-hibeam":
                vehicleDataHandler(vs.get(vehicleDataId[0]));
                break;
            case "lights-head":
                vehicleDataHandler(vs.get(vehicleDataId[0]));
                break;
            case "wipers":
                errorCB(new VehicleError(vehicleDataId[0] + 'not found'));
                break;
            case "doors":
                errorCB(new VehicleError(vehicleDataId[0] + 'not found'));
                break;
            case "windows":
                errorCB(new VehicleError(vehicleDataId[0] + 'not found'));
                break;
            case "engineoil":
                errorCB(new VehicleError(vehicleDataId[0] + 'not found'));
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
    var listeningToTripComputer = false;
    var listeningToParkSensorsFront = false;
    var listeningToParkSensorsRear = false;
    var listeningToDestinationReached = false;
    var listeningToDestinationChanged = false;
    var listeningToDestinationCancelled = false;
    var listeningToClimateControlAll = false;
    var listeningToClimateControlDriver = false;
    var listeningToClimateControlPassFront = false;
    var listeningToClimateControlPassRearLeft = false;
    var listeningToClimateControlPassRearRight = false;

    var listeningToLightsFogFront = false;
    var listeningToLightsFogRear = false;
    var listeningToLightsSignalLeft = false;
    var listeningToLightsSignalRight = false;
    var listeningToLightsSignalWarn = false;
    var listeningToLightsParking = false;
    var listeningToLightsHibeam = false;
    var listeningToLightsHead = false;

    var listeningToWipers = false;
    var listeningToDoors = false;
    var listeningToWindows = false;
    var listeningToEngineOil = false;


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
            case "tripcomputer":
                supported = true;
                if (!listeningToTripComputer) {
                    listeningToTripComputer = true;
                }
                break;
            case "parksensors-front":
                supported = true;
                if (!listeningToParkSensorsFront) {
                    listeningToParkSensorsFront = true;
                }
                break;
            case "parksensors-rear":
                supported = true;
                if (!listeningToParkSensorsRear) {
                    listeningToParkSensorsRear = true;
                }
                break;
            case "destination-reached":
                supported = false;
                break;
            case "destination-changed":
                supported = false;
                break;
            case "destination-cancelled":
                supported = false;
                break;
            case "climate-all":
                supported = false;
                break;
            case "climate-driver":
                supported = false;
                break;
            case "climate-passenger-front":
                supported = false;
                break;
            case "climate-passenger-rear-left":
                supported = false;
                break;
            case "climate-passenger-rear-right":
                supported = false;
                break;
            case "lights-fog-front":
                supported = false;
                break;
            case "lights-fog-rear":
                supported = false;
                break;
            case "lights-signal-left":
                supported = false;
                break;
            case "lights-signal-right":
                supported = false;
                break;
            case "lights-signal-warn":
                supported = false;
                break;
            case "lights-parking":
                supported = false;
                break;
            case "lights-hibeam":
                supported = false;
                break;
            case "lights-head":
                supported = false;
                break;
            case "wipers":
                supported = false;
                break;
            case "engineoil":
                supported = false;
                break;
            case "doors":
                supported = false;
                break;
            case "windows":
                supported = false;
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
                case "tripcomputer":
                    listeningToTripComputer = false;
                    break;
                case "parksensors-front":
                    listeningToParkSensorsFront = false;
                    break;
                case "parksensors-rear":
                    listeningToParkSensorsFront = false;
                    break;
                case "destination-reached":
                    listeningToDestinationReached = false;
                    break;
                case "destination-changed":
                    listeningToDestinationChanged = false;
                    break;
                case "destination-cancelled":
                    listeningToDestinationCancelled = false;
                    break;
                case "climate-all":
                    listeningToClimateControlAll = false;
                    break;
                case "climate-driver":
                    listeningToClimateControlDriver = false;
                    break;
                case "climate-passenger-front":
                    listeningToClimateControlPassFront = false;
                    break;
                case "climate-passenger-rear-left":
                    listeningToClimateControlPassRearLeft = false;
                    break;
                case "climate-passenger-rear-right":
                    listeningToClimateControlPassRearRight = false;
                    break;
                case "lights-fog-front":
                    listeningToLightsFogFront = false;
                    break;
                case "lights-fog-rear":
                    listeningToLightsFogRear = false;
                    break;
                case "lights-signal-left":
                    listeningToLightsSignalLeft = false;
                    break;
                case "lights-signal-right":
                    listeningToLightsSignalRight = false;
                    break;
                case "lights-signal-warn":
                    listeningToLightsSignalWarn = false;
                    break;
                case "lights-parking":
                    listeningToLightsParking = false;
                    break;
                case "lights-hibeam":
                    listeningToLightsHibeam = false;
                    break;
                case "lights-head":
                    listeningToLightsHead = false;
                    break;
                case "wipers":
                    listeningToWipers = false;
                    break;
                case "doors":
                    listeningToWipers = false;
                    break;
                case "windows":
                    listeningToWipers = false;
                    break;
                case "engineoil":
                    listeningToWipers = false;
                    break;
                default:
                    console.log("nothing found");

            }
        }
    }


    /*handlegearEvents*/
    function handleGearEvents(gearE) {
        if (listeningToGear) {
            for (var i = 0; i < listeners.length; i++) {
                if (listeners[i][3] == 'gear') {
                    returnData(gearE, function (gearE) {
                        var rpc = rpcHandler.createRPC(listeners[i][2], 'onEvent', gearE);
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



    /*handleTripComputerEvents*/
    function handleTripComputerEvents(data) {
        if (listeningToTripComputer) {
            for (var i = 0; i < listeners.length; i++) {
                if (listeners[i][3] == 'tripcomputer') {
                    returnData(data, function (data) {
                        var rpc = rpcHandler.createRPC(listeners[i][2], 'onEvent', data);
                        rpcHandler.executeRPC(rpc);
                    }, listeners[i][1], listeners[i][2]);
                }
            }
        }
    }

    /*handleParkSensorsEvent*/
    function handleParkSensorsEvents(data) {
        console.log('handle ps data');
        if (listeningToParkSensorsFront || listeningToParkSensorsRear) {
            for (var i = 0; i < listeners.length; i++) {
                if (listeners[i][3] == 'parksensors-front') {
                    returnData(data, function (data) {
                        var rpc = rpcHandler.createRPC(listeners[i][2], 'onEvent', data);
                        rpcHandler.executeRPC(rpc);
                    }, listeners[i][1], listeners[i][2]);
                }
                if (listeners[i][3] == 'parksensors-rear') {
                    returnData(data, function (data) {
                        var rpc = rpcHandler.createRPC(listeners[i][2], 'onEvent', data);
                        rpcHandler.executeRPC(rpc);
                    }, listeners[i][1], listeners[i][2]);
                }
            }
        }
    }


    function setRPCHandler(rpcHdlr) {
        rpcHandler = rpcHdlr;
    }

    function setRequired(obj) {
        vs = obj;
        vs.addListener('gear', handleGearEvents);
        vs.addListener('tripcomputer', handleTripComputerEvents);
        vs.addListener('parksensors-rear', handleParkSensorsEvents);
        vs.addListener('parksensors-front', handleParkSensorsEvents);
    }


    exports.addEventListener = addEventListener;
    exports.removeEventListener = removeEventListener;
    exports.get = get;

    exports.setRPCHandler = setRPCHandler;
    exports.setRequired = setRequired;

    exports.serviceDesc = {
        api: 'http://webinos.org/api/vehicle',
        displayName: 'Vehicle API (Simulator)',
        description: 'Provides data from the vehicle simulator.'
    };

})(module.exports);
