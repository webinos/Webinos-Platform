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
 * Copyright 2012 Telecom Italia SpA
 * 
 ******************************************************************************/


(function () {
    'use strict';

    var driverId = null;
    var registerFunc = null;
    var callbackFunc = null;

    var elementsList = new Array;

    elementsList[0] = {
        'type': 'temperature',
        'name': 'Fake temperature sensor',
        'description': 'Fake sensor for emulation',
        'sa': 0,
        'interval': 1,
        'value': 10,
        'running': false,
        'id': 0
    };

    elementsList[1] = {
        'type': 'light',
        'name': 'Fake light sensor',
        'description': 'Fake sensor for emulation',
        'sa': 0,
        'interval': 3,
        'value': 55,
        'running': false,
        'id': 0
    };

    elementsList[2] = {
        'type': 'linearmotor',
        'name': 'Fake linear motor',
        'description': 'Fake actuator for emulation',
        'sa': 1,
        'interval': 0,
        'value': 0,
        'running': false,
        'id': 0
    };

    elementsList[3] = {
        'type': 'temperature',
        'name': 'Fake temperature sensor',
        'description': 'Fake sensor for emulation',
        'sa': 0,
        'interval': 2,
        'value': 28,
        'running': false,
        'id': 0
    };


    exports.init = function(dId, regFunc, cbkFunc) {
        console.log('Fake driver 1 init - id is '+dId);
        driverId = dId;
        registerFunc = regFunc;
        callbackFunc = cbkFunc;
        setTimeout(intReg, 2000);
    };


    exports.execute = function(cmd, eId, data) {
        //console.log('Fake driver 1 data - element is '+eId+', data is '+data);
        switch(cmd) {
            case 'cfg':
                //In this case cfg data are transmitted to the sensor/actuator
                //this data is in json(???) format
                console.log('Received cfg for element '+eId+', cfg is '+data);
                break;
            case 'start':
                //In this case the sensor should start data acquisition
                //the parameter data has value 'fixed' (in case of fixed interval
                // acquisition) or 'change' (in case od acquisition on value change)
                console.log('Received start for element '+eId+', mode is '+data);
                var index = -1;
                for(var i in elementsList) {
                    if(elementsList[i].id == eId)
                        index = i;
                };
                elementsList[index].running = true;
                dataAcquisition(index);
                break;
            case 'stop':
                //In this case the sensor should stop data acquisition
                //the parameter data can be ignored
                console.log('Received stop for element '+eId);
                var index = -1;
                for(var i in elementsList) {
                    if(elementsList[i].id == eId)
                        index = i;
                };
                elementsList[index].running = false;
                break;
            case 'value':
                //In this case the actuator should store the value
                //the parameter data is the value to store
                console.log('Received value for element '+eId+'; value is '+data);
                break;
            default:
                console.log('Fake driver 1 - unrecognized cmd');
        }
    }


    function intReg() {
        console.log('\nFake driver 1 - register new elements');
        for(var i in elementsList) {
            var json_info = {type:elementsList[i].type, name:elementsList[i].name, description:elementsList[i].description};
            elementsList[i].id = registerFunc(driverId, elementsList[i].sa, JSON.stringify(json_info));
            //elementsList[i].id = registerFunc(driverId, elementsList[i].sa, elementsList[i].type);
        };
    }


    function dataAcquisition(index) {
        //If not stopped send data and call again after interval...
        if(elementsList[index].running) {
            //Send data value...
            callbackFunc('data', elementsList[index].id, elementsList[index].value);
            nextValue(index);
            setTimeout(function(){dataAcquisition(index);}, (elementsList[index].interval)*1000);
        }
    }


    function nextValue(index) {
        switch(elementsList[index].type) {
            case 'temperature':
                elementsList[index].value+=incDec();
                if(elementsList[index].value < -10) {
                    elementsList[index].value = -10;
                }
                else if(elementsList[index].value > 40) {
                    elementsList[index].value = 40;
                }
                break;
            case 'light':
                elementsList[index].value+=incDec();
                if(elementsList[index].value < 0) {
                    elementsList[index].value = 0;
                }
                else if(elementsList[index].value > 100) {
                    elementsList[index].value = 100;
                }
                break;
            default:
                elementsList[index].value = '-1';
        };
    }


    function incDec() {
        var upProb = 25;
        var downProb = 25;
        var rnd = Math.floor(Math.random()*100);
        if (rnd < downProb) {
            return -1;
        }
        else if (rnd > (100-upProb)) {
            return 1;
        }
        else {
            return 0;
        }
    }


}());
