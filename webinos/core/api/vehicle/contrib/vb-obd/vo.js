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
 * Author: Eric Smekens
 ******************************************************************************/

(function () {
    //'use strict';

    //Events
    /**
     * WDomEvent. Every PID specific event inherits this event.
     */
    WDomEvent = function (type, target, currentTarget, eventPhase, bubbles, cancelable, timestamp) {
        this.initEvent(type, target, currentTarget, eventPhase, bubbles, cancelable, timestamp);
    }
    WDomEvent.prototype.initEvent = function (type, target, currentTarget, eventPhase, bubbles, cancelable, timestamp) {
        this.type = type;
        this.target = target;
        this.currentTarget = currentTarget;
        this.eventPhase = eventPhase;
        this.bubbles = bubbles;
        this.cancelable = cancelable;
        this.timestamp = timestamp;
    }

    SpeedEvent = function (speedData) {
        this.initSpeedEvent(speedData);
    }
    SpeedEvent.prototype = new WDomEvent();
    SpeedEvent.prototype.constructor = SpeedEvent;
    SpeedEvent.parent = WDomEvent.prototype; // our "super" property
    SpeedEvent.prototype.initSpeedEvent = function (speedData) {
        this.vss = speedData;
        var d = new Date();
        var stamp = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
        var stamp = stamp + d.getUTCMilliseconds();
        SpeedEvent.parent.initEvent.call(this, 'vss', null, null, null, false, false, stamp);
    }

    RPMEvent = function (rpmData) {
        this.initRPMEvent(rpmData);
    }
    RPMEvent.prototype = new WDomEvent();
    RPMEvent.prototype.constructor = RPMEvent;
    RPMEvent.parent = WDomEvent.prototype; // our "super" property
    RPMEvent.prototype.initRPMEvent = function (rpmData) {
        this.rpm = rpmData;
        var d = new Date();
        var stamp = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
        var stamp = stamp + d.getUTCMilliseconds();
        RPMEvent.parent.initEvent.call(this, 'rpm', null, null, null, false, false, stamp);
    }

    EngineLoadEvent = function (engineLoadData) {
        this.initEngineLoadEvent(engineLoadData);
    }
    EngineLoadEvent.prototype = new WDomEvent();
    EngineLoadEvent.prototype.constructor = EngineLoadEvent;
    EngineLoadEvent.parent = WDomEvent.prototype; // our "super" property
    EngineLoadEvent.prototype.initEngineLoadEvent = function (engineLoadData) {
        this.load_pct = engineLoadData;
        var d = new Date();
        var stamp = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
        var stamp = stamp + d.getUTCMilliseconds();
        EngineLoadEvent.parent.initEvent.call(this, 'load_pct', null, null, null, false, false, stamp);
    }


    var _listeners = {}; //Listener object

//    //Code for OBD.
//    var OBDReader = require('serial-obd');
//    var options = {};
//    options.baudrate = 115200;
//    var btOBDReader = new OBDReader('/dev/rfcomm0', options);


      //Code for bluetooth-serial-port, doesn't work atm.
    //TODO: Move settings to webinos.config.json, or let it scan.
    //
    var OBDReader = require('bluetooth-obd');
    var btOBDReader = new OBDReader('D8:0D:E3:80:19:B4', 14);

    /**
     * The listener for 'dataReceived'. This is for events.
     */
    btOBDReader.on('dataReceived', function (data) {
        switch (data.name) {
        case "rpm":
            if (typeof _listeners.rpm != 'undefined') {
                _listeners.rpm(new RPMEvent(data.value));
            }
            break;
        case "vss":
            if (typeof _listeners.vss != 'undefined') {
                _listeners.vss(new SpeedEvent(data.value));
            }
            break;
        case "load_pct":
            if (typeof _listeners.load_pct != 'undefined') {
                _listeners.load_pct(new EngineLoadEvent(data.value));
            }
            break;
        default:
            if(data.value === "OK" || data.value === "NO DATA") {
                break;
            } else if (data.value === "?") {
                console.log('Unknown answer!');
            } else {
                console.log('No supported pid yet:');
                console.log(data);
            }


            break;
        }
    });

    /**
     * On connected, start polling.
     */
    btOBDReader.on('connected', function () {
        //For now start polling here.
        //TODO: When all listeners are disabled, stopPolling. Etc.
        console.log('OBD-II device is connected');
        this.startPolling(600);
    });

    btOBDReader.connect();

    /**
     * Get method. Makes use of 'once'. (Eventlistener that only triggers once, and then removes itself.)
     * @param {string} type
     * @param {Function} callback
     */
    function get(type, callback) {

        //Event for callback, removes listener after triggered.
        btOBDReader.once('dataReceived', function (data) {
            if(data.name === type) {
                switch (data.name) {
                    case "rpm":
                        callback(new RPMEvent(data.value));
                        break;
                    case "vss":
                        callback(new SpeedEvent(data.value));
                        break;
                    case "load_pct":
                        callback(new EngineLoadEvent(data.value));
                        break;
                    default:
                        console.log('No supported pid yet.');
                        break;
                }
            } else {
                console.log('Collision with listener and get. Not supported yet.');
            }
        });

        //Request value after callback.
        btOBDReader.requestValueByName(type);
    }

    /**
     * Adds listener to listener array.
     * @param {string} type Type you want the add the listener off.
     * @param listener Eventhandler
     */
    function addListener(type, listener) {
        var shouldAdd = false;
        switch (type) {
            case 'rpm':
                _listeners.rpm = listener;
                shouldAdd = true;
                break;
            case 'vss':
                _listeners.vss = listener;
                shouldAdd = true;
                break;
            case 'load_pct':
                _listeners.load_pct = listener;
                shouldAdd = true;
                break;
            default:
                console.log('type ' + type + ' undefined.');
        }
        if(shouldAdd) {
            btOBDReader.addPoller(type);
        }
    }

    /**
     * Function to remove a listener
     * @param {string} type Type you want the listener removed.
     */
    function removeListener(type) {
        var shouldRemove = false;
        switch (type) {
            case 'rpm':
                _listeners.rpm = undefined;
                shouldRemove = true;
                break;
            case 'vss':
                _listeners.vss = undefined;
                shouldRemove = true;
                break;
            case 'load_pct':
                _listeners.load_pct = undefined;
                shouldRemove = true;
                break;
            default:
                console.log('type ' + type + ' undefined.');
        }
        if(shouldRemove) {
            btOBDReader.removePoller(type);
        }
    }

    //Exports
    exports.get = get;
    exports.addListener = addListener;
    exports.removeListener = removeListener;
})(module.exports);
