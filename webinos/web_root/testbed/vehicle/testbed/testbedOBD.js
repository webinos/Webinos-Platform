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
 * Copyright 2012 BMW AG
 *
 * Additions and changes had been made to support he bluetooth-obd module.
 *
 * Copyright 2013 TNO
 * Author: Eric Smekens
 ******************************************************************************/
var vehicle;
var services;
var listeners;
var listenersDeviceOrientation;
var _vehicleDataIds;
$(document).ready(function () {
    $('#vt_registerBrowser').bind('click', function () {
        services = {};
        vehicle = null;
        $('#serviceList').empty();
        webinos.discovery.findServices(new ServiceType('http://webinos.org/api/vehicle'), {
            onFound: function (service) {
                $('#serviceList').removeAttr('disabled');
                $('#vt_initVehicle').removeAttr('disabled');
                services[service.serviceAddress] = service;
                $('#serviceList').append($('<option>' + service.serviceAddress + '</option>'));
                postMessage('Info', 'Service found at ' + service.serviceAddress + '. Please bind to one service to continue.');
                console.log(service);
            }
        });
    });

    function printInfo(data) {
        $('#vt_message').append('<li>' + data.payload.message + '</li>');
    }
    webinos.session.addListener('info', printInfo);
    vehicle = null;
    listeners = new Array(); //FOR VEHICLE EVENTS
    _vehicleDataIds = [{
        type: 'rpm',
        supported: true
    }, {
        type: 'vss',
        supported: true
    }, {
        type: 'load_pct',
        supported: true
    }];
    postMessage('Info', 'Page loaded. Please Initialize');
    var counter = 0;
    var handleRPMData = function (event) {
        rpm = parseInt(event.rpm);
        postMessage("info", "new RPM-Event received.");
        $('#vt_info').html("RPM: <br />" + rpm);
    };
    var handleSpeedData = function (event) {
        speed = parseInt(event.vss);
        postMessage("info", "new Speed-Event received.");
        $('#vt_info').html("Speed: <br />" + speed + " km/h");
    };
    var handleEngineLoadData = function (event) {
        engineLoad = parseInt(event.load_pct);
        postMessage("info", "new EngineLoad-Event received.");
        $('#vt_info').html("Engine Load: <br />" + engineLoad + " %");
    };

    var errorCB = function (error) {
        postMessage('error', "ERROR:" + error.message);
        console.log('error' + error.message);
    };
    $('#vt_vehicleDataId').change(function () {
        var listenerRegistered = false;
        for (i = 0; i < listeners.length; i++) {
            if (listeners[i] == $('#vt_vehicleDataId').val()) {
                listenerRegistered = true;
                break;
            }
        }
        if (listenerRegistered) {
            $('#vt_removeListener').removeAttr('disabled');
            $('#vt_addListener').attr('disabled', 'true');
        } else {
            $('#vt_addListener').removeAttr('disabled');
            $('#vt_removeListener').attr('disabled', 'true');
        }
    });
    $('#serviceList').change(function () {
        if ($('#vt_pzh_pzp_list').val() != '') {
            $('#vt_initVehicle').removeAttr('disabled');
        } else {
            $('#vt_initVehicle').attr('disabled', 'true');
        }
    });
    $('#vt_vehicleDataId').change(function () {
        $('#vt_getData').removeAttr('disabled');
    });
    $('#vt_clear').bind('click', function () {
        $('#vt_info').empty();
    });
    $('#vt_getData').bind('click', function () {
        vehicle.get($('#vt_vehicleDataId').val(), getMessageHandler($('#vt_vehicleDataId').val()), errorCB);
    });
    $('#vt_initVehicle').click(function (e) {
        vehicle = services[$('#serviceList option:selected').val()];
        vehicle.bindService({
            onBind: function (service) {
                postMessage('Info', 'Connection to Vehicle Service at ' + service.serviceAddress + ' has been established.');
                $('#vt_addListener').removeAttr('disabled');
                $('#vt_getData').removeAttr('disabled');
                $('#vt_vehicleDataId').removeAttr('disabled');
                if (service.displayName.indexOf("Simulator") != -1) {
                    $('#simulatorHint').removeClass('disabled');
                }
                $('#vt_info').html("Select a vehicle property or start an app!");
                $('#vt_play').removeClass('disabled');
                $('#vt_outer_info').removeClass('disabled');
            }
        });
    });
    var disableInit = function (name, btnId, pzx) {
        btnId.val(name + ' connected to ' + pzx);
        btnId.addClass('running');
        btnId.attr('disabled', 'true');
    }
    $('#vt_addListener').bind('click', function () {
        vehicle.addEventListener($('#vt_vehicleDataId').val(), getMessageHandler($('#vt_vehicleDataId').val()), false);
        listeners.push($('#vt_vehicleDataId').val());
        $('#vt_removeListener').removeAttr('disabled');
        $('#vt_addListener').attr('disabled', 'true');
        postMessage('info', 'Listener added for' + $('#vehicleDataId').val());
    });
    $('#vt_removeListener').bind('click', function () {
        vehicle.removeEventListener($('#vt_vehicleDataId').val(), getMessageHandler($('#vt_vehicleDataId').val()), false);
        postMessage('info', 'Listener removed for' + $('#vehicleDataId').val());
        $('#vt_info').html("<img src='/client/vehicle/general/ajaxloader.gif'>");
        for (i = 0; listeners.length; i++) {
            if (listeners[i] == $('#vt_vehicleDataId').val()) {
                listeners.splice(i, 1);
                break;
            }
        }
        $('#vt_addListener').removeAttr('disabled');
        $('#vt_removeListener').attr('disabled', 'true');
    });
    $(window).unload(function (e) {
        for (i = 0; i < listeners.length; i++) {
            console.log('Removing listener for ' + listeners[i]);
            vehicle.removeEventListener(listeners[i], getMessageHandler(listeners[i]), false);
        }
    });

    function postMessage(type, message) {
        var time = new Date();
        $("#vt_message").html(message + " (" + time.toUTCString() + ")");
        if (type == "error") {
            $("#vt_status").addClass('error');
        } else {
            $("#vt_status").removeClass('error');
        }
    }

    function getMessageHandler(type) {
        switch (type) {
            case "rpm":
                return handleRPMData;
                break;
            case "vss":
                return handleSpeedData;
                break;
            case "load_pct":
                return handleEngineLoadData;
                break;
            default:
                return handleGeneric;
        }
    }

    function handleGeneric(data) {
        console.log('Generic: ')
        console.log(data);
    }

    function fillSelectionBoxAdvanced(id, values) {
        for (i = 0; i < values.length; i++) {
            var opt = new Option(values[i].type, values[i].type, false, false);
            if (values[i].supported) {
                $(id).append(opt);
            }
        }
    }
    fillSelectionBoxAdvanced('#vt_vehicleDataId', _vehicleDataIds);

});
