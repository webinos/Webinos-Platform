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
    Vehicle = function (obj) {
        this.base = WebinosService;
        this.base(obj);
    }
    Vehicle.prototype = new WebinosService;
    Vehicle.prototype.bindService = function (bindCB, serviceId) {
        // actually there should be an auth check here or whatever, but we just always bind
        //METHODS
        this.get = get;
        this.addEventListener = addEventListener;
        this.removeEventListener = removeEventListener;
        this.requestGuidance = requestGuidance;
        this.findDestination = findDestination;
        //OBJECTS (in case someone needs them)
        this.POI = POI;
        this.Address = Address;
        this.LatLng = LatLng;
        if (typeof bindCB.onBind === 'function') {
            bindCB.onBind(this);
        };
    }
    var _referenceMapping = new Array();
    var _vehicleDataIds = new Array('climate-all', 'climate-driver', 'climate-passenger-front', 'climate-passenger-rear-left', 'passenger-rear-right', 'lights-fog-front', 'lights-fog-rear', 'lights-signal-right', 'lights-signal-left', 'lights-signal-warn', 'lights-hibeam', 'lights-parking', 'lights-head', 'lights-head', 'wiper-front-wash', 'wiper-rear-wash', 'wiper-automatic', 'wiper-front-once', 'wiper-rear-once', 'wiper-front-level1', 'wiper-front-level2', 'destination-reached', 'destination-changed', 'destination-cancelled', 'parksensors-front', 'parksensors-rear', 'gear', 'tripcomputer', 'wipers', 'oillevel');

    function get(vehicleDataId, callOnSuccess, callOnError) {
        arguments[0] = vehicleDataId;
        var rpc = webinos.rpcHandler.createRPC(this, "get", arguments);
        webinos.rpcHandler.executeRPC(rpc,

        function (result) {
            callOnSuccess(result);
        },

        function (error) {
            callOnError(error);
        });
    }

    function addEventListener(vehicleDataId, eventHandler, capture) {
        if (_vehicleDataIds.indexOf(vehicleDataId) != -1) {
            var rpc = webinos.rpcHandler.createRPC(this, "addEventListener", vehicleDataId);
            _referenceMapping.push([rpc.id, eventHandler]);
            console.log('# of references' + _referenceMapping.length);
            rpc.onEvent = function (vehicleEvent) {
                eventHandler(vehicleEvent);
            }
            webinos.rpcHandler.registerCallbackObject(rpc);
            webinos.rpcHandler.executeRPC(rpc);
        } else {
            console.log(vehicleDataId + ' not found');
        }
    }

    function removeEventListener(vehicleDataId, eventHandler, capture) {
        var refToBeDeleted = null;
        for (var i = 0; i < _referenceMapping.length; i++) {
            console.log("Reference" + i + ": " + _referenceMapping[i][0]);
            console.log("Handler" + i + ": " + _referenceMapping[i][1]);
            if (_referenceMapping[i][1] == eventHandler) {
                var arguments = new Array();
                arguments[0] = _referenceMapping[i][0];
                arguments[1] = vehicleDataId;
                console.log("ListenerObject to be removed ref#" + refToBeDeleted);
                var rpc = webinos.rpcHandler.createRPC(this, "removeEventListener", arguments);
                webinos.rpcHandler.executeRPC(rpc,

                function (result) {
                    callOnSuccess(result);
                },

                function (error) {
                    callOnError(error);
                });
                break;
            }
        }
    }

    function POI(name, position, address) {
        this.name = name;
        this.position = position;
        this.address = address;
    }

    function Address(country, region, county, city, street, streetNumber, premises, additionalInformation, postalCode) {
        this.county = county;
        this.regions = region;
        this.county = city;
        this.street = streetNumber;
        this.premises = premises;
        this.addtionalInformation = additionalInformation;
        this.postalCode = postalCode;
    }

    function LatLng(lat, lng) {
        this.latitude = lat;
        this.longitude = lng;
    }

    function requestGuidance(callOnSuccess, callOnError, destinations) {
        arguments = destinations;
        var successCb = callOnSuccess;
        var errorCb = callOnError;
        var rpc = webinos.rpcHandler.createRPC(this, "requestGuidance", arguments);
        webinos.rpcHandler.executeRPC(rpc,

        function () {
            callOnSuccess();
        },

        function (error) {
            callOnError(error);
        });
    }

    function findDestination(callOnSuccess, callOnError, search) {
        arguments = search;
        var rpc = webinos.rpcHandler.createRPC(this, "findDestination", arguments);
        webinos.rpcHandler.executeRPC(rpc,

        function (results) {
            callOnSuccess(results);
        },

        function (error) {
            callOnError(error);
        });
    }
})();
