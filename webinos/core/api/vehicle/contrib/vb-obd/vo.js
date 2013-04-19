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
        this.speed = speedData;
        var d = new Date();
        var stamp = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
        var stamp = stamp + d.getUTCMilliseconds();
        SpeedEvent.parent.initEvent.call(this, 'speed', null, null, null, false, false, stamp);
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
        this.engineLoad = engineLoadData;
        var d = new Date();
        var stamp = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
        var stamp = stamp + d.getUTCMilliseconds();
        EngineLoadEvent.parent.initEvent.call(this, 'engineLoad', null, null, null, false, false, stamp);
    }


    var _listeners = {}; //Listener object

    //Code for OBD.
    var OBDReader = require('serial-obd');
    var options = {};
    options.baudrate = 115200;
    var btOBDReader = new OBDReader('/dev/rfcomm0', options);

//    var OBDReader = require('bluetooth-obd');
//    var btOBDReader = new OBDReader('D8:0D:E3:80:19:B4', 14);

    btOBDReader.on('dataReceived', function (data) {
        switch (data.name) {
        case "rpm":
            if (typeof _listeners.rpm != 'undefined') {
                _listeners.rpm(new RPMEvent(data.value));
            }
            break;
        case "vss":
            if (typeof _listeners.speed != 'undefined') {
                _listeners.speed(new SpeedEvent(data.value));
            }
            break;
        case "load_pct":
            if (typeof _listeners.load_pct != 'undefined') {
                _listeners.load_pct(new EngineLoadEvent(data.value));
            }
            break;
        default:
            console.log('No supported pid yet.');
            break;
        }
    });

    btOBDReader.on('connected', function () {

    });

    btOBDReader.connect();

    /**
     * Get method. Makes uses of once. (Eventlistener that only triggers once, and then removes itself.)
     * @param type String
     * @param callback Function
     */
    function get(type, callback) {

        //Event for callback, removes listener after triggered.
        btOBDReader.once('dataReceived', function (data) {
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
        });

        btOBDReader.requestValueByName(type);
    }

    /**
     * Adds listener to listener array.
     * @param type
     * @param listener
     */
    function addListener(type, listener) {
        console.log('registering listener ' + type);
        switch (type) {
            case 'rpm':
                _listeners.rpm = listener;
                break;
            case 'speed':
                _listeners.speed = listener;
                break;
            case 'load_pct':
                _listeners.load_pct = listener;
                break;
            default:
                console.log('type ' + type + ' undefined.');
        }
    }

    function removeListener(type) {

    }
    exports.get = get;
    exports.addListener = addListener;
    exports.removeListener = removeListener;
})(module.exports);
