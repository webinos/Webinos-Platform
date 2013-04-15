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
        this.gear = speedData;
        var d = new Date();
        var stamp = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
        var stamp = stamp + d.getUTCMilliseconds();
        SpeedEvent.parent.initEvent.call(this, 'gear', null, null, null, false, false, stamp);
    }

//    RPMEvent = function (rpm) {
//        this.initSpeedEvent(speed);
//    }
//    RPMEvent.prototype = new WDomEvent();
//    RPMEvent.prototype.constructor = SpeedEvent;
//    RPMEvent.parent = WDomEvent.prototype; // our "super" property
//    RPMEvent.prototype.initSpeedEvent = function (gear) {
//        this.gear = gear;
//        var d = new Date();
//        var stamp = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
//        var stamp = stamp + d.getUTCMilliseconds();
//        RPMEvent.parent.initEvent.call(this, 'gear', null, null, null, false, false, stamp);
//    }
//
//    SpeedEvent = function (load) {
//        this.initSpeedEvent(load);
//    }
//    SpeedEvent.prototype = new WDomEvent();
//    SpeedEvent.prototype.constructor = SpeedEvent;
//    SpeedEvent.parent = WDomEvent.prototype; // our "super" property
//    SpeedEvent.prototype.initSpeedEvent = function (gear) {
//        this.gear = gear;
//        var d = new Date();
//        var stamp = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
//        var stamp = stamp + d.getUTCMilliseconds();
//        SpeedEvent.parent.initEvent.call(this, 'gear', null, null, null, false, false, stamp);
//    }


    var _listeners = {}; //Listener object

    //Code for OBD.
    var OBDReader = require('serial-obd');
    var options = {};
    options.baudrate = 115200;
    var btOBDReader = new OBDReader('/dev/rfcomm0', options);

    //var OBDReader = require('bluetooth-obd');
    //var btOBDReader = new OBDReader('D8:0D:E3:80:19:B4', 14);

    var vehicleSpeed;
    var rpm;
    var engineLoad;

    btOBDReader.on('dataReceived', function (data) {
        //console.log(data);
        switch (data.name) {
        case "vss":
            vehicleSpeed = data.value;
            if (typeof _listeners.gear != 'undefined') {
                _listeners.gear(new SpeedEvent(vehicleSpeed));
            }
            break;
        case "rpm":
            rpm = data.value;
            break;
        case "load_pct":
            engineLoad = data.value;
            break;
        default:
            //console.log('No supported pid yet.');
            break;
        }
        //Huge switch case for all vars.
    });

    btOBDReader.on('connected', function () {
        this.addPoller("vss");
        this.addPoller("rpm");
        this.addPoller("load_pct");

        this.startPolling(1000);
    });

    btOBDReader.connect();

    function get(type) {

        switch (type) {
        case 'gear':
            //Gear is speed for now.
            return new SpeedEvent(vehicleSpeed);
//        case 'parksensors-front':
//            //RPM for now.
//            return new SpeedEvent(vehicleSpeed);
//        case 'parksensors-rear':
//            //Load for now.
//            return new SpeedEvent(vehicleSpeed);
        default:
            console.log('Nothing found...');
        }
    }

    function addListener(type, listener) {
        console.log('registering listener ' + type);
        switch (type) {
            case 'gear':
                _listeners.gear = listener;
                break;
            default:
                console.log('type ' + type + ' undefined.');
        }
    }
    exports.get = get;
    exports.addListener = addListener;
})(module.exports);
