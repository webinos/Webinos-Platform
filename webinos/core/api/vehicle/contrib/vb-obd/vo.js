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
    'use strict';

    //Code for OBD.
    var OBDReader = require('serial-obd');
    var options = {};
    options.baudrate = 115200;
    var btOBDReader = new OBDReader('/dev/rfcomm0', options);

    //var OBDReader = require('bluetooth-obd');
    //var btOBDReader = new OBDReader('D8:0D:E3:80:19:B4', 14);

    var speed;
    btOBDReader.on('dataReceived', function (data) {
        console.log(data);
        speed = data.value;
        //Huge switch case for all vars.
    });


//    btOBDReader.on('dataReceived', function (data) {
//        console.log(data);
//        dataReceivedMarker = data;
//    });

    btOBDReader.on('connected', function () {
        this.addPoller("vss");

        this.startPolling(1000);
    });

    btOBDReader.connect();

    function get(type) {

        switch (type) {
        case 'gear':
            var event = {};
            event.gear = speed;
            return event;
            break;
        default:
            console.log('nothing found...');
        }
    }

    function addListener(type, listener) {
//        console.log('registering listener ' + type);
//        switch (type) {
//            case 'gear':
//                _listeners.gear = listener;
//                break;
//            default:
//                console.log('type ' + type + ' undefined.');
//        }
    }
    exports.get = get;
    exports.addListener = addListener;
})(module.exports);
