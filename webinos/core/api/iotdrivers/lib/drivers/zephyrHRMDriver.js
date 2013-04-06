/*******************************************************************************
 *  Code contributed to the webinos project
 * 
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0
 *  
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * Author: Giuseppe La Torre - giuseppe.latorre@dieei.unict.it
 * 
 ******************************************************************************/

(function () {
    'use strict';

    //var serialPort = require("serialport2").SerialPort;
    var serialport_module = require('serialport');
    var serialPort = serialport_module.SerialPort;

    var path = require("path");
    var fs = require("fs");
    //var BT_DEV = "/dev/cu.HXM002536-BluetoothSeri";
    //var BT_SPEED = 115200;
    var SERIAL_PORT;
    var SERIAL_RATE;

    var buffer = [];
    var index = 0;
    var STX = 0x02;
    var MSGID = 0x26;
    var DLC = 0x37;
    var ETX = 0x03;
    var start = false;
    var prevIsStart = false;
    var prevIsMsgId = false;
    var prevIsDlc = false;
    var prevIsCrc = false;
    var counter = 0;

    var driverId = null;
    var registerFunc = null;
    var callbackFunc = null;

    var elementsList = new Array;

    var serial;

    elementsList[0] = {
        'type': 'heartratemonitor',
        'name': 'Zephyr HXM',
        'description': 'Bluetooth heart rate monitor',
        'sa': 0,
        'interval': 1000,
        'value': 0,
        'running': false,
        'id': 0
    };

    exports.init = function(dId, regFunc, cbkFunc) {
        console.log('Zephyr HRM driver init - id is '+dId);
        driverId = dId;
        registerFunc = regFunc;
        callbackFunc = cbkFunc;
        //intReg();
        setTimeout(intReg, 2000);
    };


    exports.execute = function(cmd, eId, data, errorCB, successCB) {
        switch(cmd) {
            case 'cfg':
                //In this case cfg data are transmitted to the sensor/actuator
                //this data is in json(???) format
                console.log('Zephyr HRM driver - Received cfg for element '+eId+', cfg is '+data);
                successCB(eId);
                break;
            case 'start':
                //In this case the sensor should start data acquisition
                //the parameter data has value 'fixed' (in case of fixed interval
                // acquisition) or 'change' (in case od acquisition on value change)
                console.log('Zephyr HRM driver - Received start for element '+eId+', mode is '+data);

                var elementIndex = -1;
                for(var i in elementsList) {
                    if(elementsList[i].id == eId)
                        elementIndex = i;
                };
                elementsList[elementIndex].running = true;

                try{
                    var filePath = path.resolve(__dirname, "./serial_devices.json");
                    fs.readFile(filePath, function(err,data) {
                        if (!err) {
                            var settings = JSON.parse(data.toString());
                            SERIAL_PORT = settings.bluetooth[0].port;
                            SERIAL_RATE = settings.bluetooth[0].rate;

                            try{
                                serial = new serialPort(SERIAL_PORT, {baudrate: SERIAL_RATE}, false);

                                /*
                                serial = new serialPort();
                                serial.open(SERIAL_PORT, {
                                  baudRate: SERIAL_RATE,
                                  dataBits: 8,
                                  parity: 'none',
                                  stopBits: 1
                                });
                                */

                                serial.on('close', function (err) {
                                    console.log("Serial port ["+SERIAL_PORT+"] was closed");
                                    //TODO handle board disconnection
                                    //TODO start listening for incoming boards
                                });

                                serial.on('error', function (err) {
                                    if(err.path == SERIAL_PORT){
                                        console.log("Serial port ["+SERIAL_PORT+"] is not ready. Err Code: " + err.code);
                                    }
                                });

                                /*
                                serial.on('open', function () {
                                    start_serial();
                                });*/

                                serial.open(function () {
                                    start_serial();
                                });

                                serial.on( "data", function( chunk ) {
                                    for(var i=0; i<chunk.length; i++){
                                        if(chunk[i] == STX){
                                            start = true;
                                            prevIsStart = true;
                                            buffer[index++] = chunk[i];
                                            continue;
                                        }
                                        if(start){
                                            if(prevIsStart){
                                                if(chunk[i] != MSGID){
                                                    start = false;
                                                    prevIsStart = false;
                                                    prevIsMsgId = false;
                                                    continue;
                                                }
                                                else{
                                                    buffer[index++] = chunk[i];
                                                    prevIsStart = false;
                                                    prevIsMsgId = true;
                                                }
                                            }
                                            else if(prevIsMsgId){
                                                if(chunk[i] != DLC){
                                                    start = false;
                                                    prevIsStart = false;
                                                    prevIsMsgId = false;
                                                    continue;
                                                }
                                                else{
                                                    buffer[index++] = chunk[i].toString(16);
                                                    prevIsMsgId = false;
                                                    prevIsDlc = true;
                                                }
                                            }

                                            else if(prevIsDlc){
                                                if(counter < 55){
                                                    buffer[index++] = chunk[i];
                                                    counter++;
                                                }
                                                else{
                                                    counter = 0;
                                                    prevIsDlc = false;
                                                    buffer[index++] = chunk[i];
                                                    prevIsCrc = true;
                                                }
                                            }
                                            else if(prevIsCrc){
                                                prevIsCrc = false;
                                                if(chunk[i] != ETX){
                                                    continue;
                                                }
                                                else{
                                                    buffer[index++] = chunk[i];
                                                    start = false;
                                                    var values = getParsedValues(buffer);
                                                    if(values != undefined){
                                                        //console.log("Pars : " + values);
                                                        elementsList[elementIndex].value = values[8];
                                                        callbackFunc('data', elementsList[elementIndex].id, elementsList[elementIndex].value);
                                                    }
                                                    index = 0;
                                                }
                                            }
                                        }
                                    }
                                });
                            }
                            catch(e){
                                console.log("catch : " + e);
                            }
                        }
                    });
                }
                catch(err){
                    console.log("Error : "+err);
                }
                break;
            case 'stop':
                //In this case the sensor should stop data acquisition
                //the parameter data can be ignored
                console.log('Zephyr HRM driver - Received stop for element '+eId);
                //serial.close();
                break;
            case 'value':
                //In this case the actuator should store the value
                //the parameter data is the value to store
                console.log('Received value for element '+eId+'; value is '+data);
                break;
            default:
                console.log('Zephyr HRM driver - unrecognized cmd');
        }
    };


    function intReg() {
        console.log('\nZephyr HRM driver - register new elements');
        for(var i in elementsList) {
            var json_info = {type:elementsList[i].type, name:elementsList[i].name, description:elementsList[i].description, range:elementsList[i].range};
            //console.log("Register " + JSON.stringify(json_info));
            elementsList[i].id = registerFunc(driverId, elementsList[i].sa, json_info);
        };
    }

    function getParsedValues(buffer){
        var bufferIndex = 0;
        var values = [];
        try {
            values[0]   = buffer[bufferIndex++];    //stx
            values[1]   = buffer[bufferIndex++];    //msgId
            values[2]   = buffer[bufferIndex++];    //dlc
            values[3]   = Number(((0x000000FF & buffer[bufferIndex++]) | (0x000000FF & buffer[bufferIndex++])<< 8)).toString(10);    //firmwareId
            values[4]   = ((0x000000FF & buffer[bufferIndex++]) | (0x000000FF & buffer[bufferIndex++])<< 8);    //firmwareVersion
            values[5]   = ((0x000000FF & buffer[bufferIndex++]) | (0x000000FF & buffer[bufferIndex++])<< 8);    //hardwareId
            values[6]   = ((0x000000FF & buffer[bufferIndex++]) | (0x000000FF & buffer[bufferIndex++])<< 8);    //hardwareVersion
            values[7]   = (0x000000FF & (buffer[bufferIndex++]));     //batteryIndicator
            values[8]   = (0x000000FF & (buffer[bufferIndex++]));     //heartRate
            values[9]   = (0x000000FF & (buffer[bufferIndex++]));     //heartNumber
            values[10]  =  ((0x000000FF & buffer[bufferIndex++]) | (0x000000FF & buffer[bufferIndex++])<< 8);     //hbTime1
            values[11]  =  ((0x000000FF & buffer[bufferIndex++]) | (0x000000FF & buffer[bufferIndex++])<< 8);     //hbTime2
            values[12]  =  ((0x000000FF & buffer[bufferIndex++]) | (0x000000FF & buffer[bufferIndex++])<< 8);     //hbTime3
            values[13]  =  ((0x000000FF & buffer[bufferIndex++]) | (0x000000FF & buffer[bufferIndex++])<< 8);     //hbTime4
            values[14]  =  ((0x000000FF & buffer[bufferIndex++]) | (0x000000FF & buffer[bufferIndex++])<< 8);
            values[15]  =  ((0x000000FF & buffer[bufferIndex++]) | (0x000000FF & buffer[bufferIndex++])<< 8);
            values[16]  =  ((0x000000FF & buffer[bufferIndex++]) | (0x000000FF & buffer[bufferIndex++])<< 8);
            values[17]  =  ((0x000000FF & buffer[bufferIndex++]) | (0x000000FF & buffer[bufferIndex++])<< 8);
            values[18]  =  ((0x000000FF & buffer[bufferIndex++]) | (0x000000FF & buffer[bufferIndex++])<< 8);
            values[19]  =  ((0x000000FF & buffer[bufferIndex++]) | (0x000000FF & buffer[bufferIndex++])<< 8);
            values[20]  =  ((0x000000FF & buffer[bufferIndex++]) | (0x000000FF & buffer[bufferIndex++])<< 8);
            values[21]  =  ((0x000000FF & buffer[bufferIndex++]) | (0x000000FF & buffer[bufferIndex++])<< 8);
            values[22]  =  ((0x000000FF & buffer[bufferIndex++]) | (0x000000FF & buffer[bufferIndex++])<< 8);
            values[23]  =  ((0x000000FF & buffer[bufferIndex++]) | (0x000000FF & buffer[bufferIndex++])<< 8);
            values[24]  =  ((0x000000FF & buffer[bufferIndex++]) | (0x000000FF & buffer[bufferIndex++])<< 8);     //hbTime15
            values[25]  =  ((0x000000FF & buffer[bufferIndex++]) | (0x000000FF & buffer[bufferIndex++])<< 8);     //reserved1
            values[26]  =  ((0x000000FF & buffer[bufferIndex++]) | (0x000000FF & buffer[bufferIndex++])<< 8);     //reserved2
            values[27]  =  ((0x000000FF & buffer[bufferIndex++]) | (0x000000FF & buffer[bufferIndex++])<< 8);     //reserved3
            values[28]  =  ((0x000000FF & buffer[bufferIndex++]) | (0x000000FF & buffer[bufferIndex++])<< 8);     //distance
            values[29]  =  ((0x000000FF & buffer[bufferIndex++]) | (0x000000FF & buffer[bufferIndex++])<< 8);     //speed
            values[30]  = buffer[bufferIndex++];    //strides
            values[31]  = buffer[bufferIndex++];    //reserved4
            values[32]  = ((0x000000FF & buffer[bufferIndex++]) | (0x000000FF & buffer[bufferIndex++])<< 8);      //reserved5
            values[33]  = buffer[bufferIndex++];    //crc
            values[34]  = buffer[bufferIndex];      //ext

        } catch (err) {
            console.log(err.message);
            return undefined;
        }    
        return values;
    }
}());
