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

	var serialport_module = require('serialport');
	var serialPort = serialport_module.SerialPort;

    var path = require("path");
    var fs = require("fs");
    var intervalId;

    var driverId = null;
    var registerFunc = null;
    var callbackFunc = null;
	
	var SERIAL_PORT;
	var SERIAL_RATE;
	var serial = 0;
	var incoming_data = "";

	var START_LISTENING_CMD         = "str";
	var STOP_LISTENING_CMD          = "stp";
	var GET_ELEMENTS_CMD            = "ele";
	var CONFIGURE_CMD               = "cfg";
	var GET_SENSOR_VALUE_CMD        = "get";
	var SET_ACTUATOR_VALUE_CMD      = "set";
	var VALUECHANGE_MODE            = "vch";
	var FIXEDINTERVAL_MODE          = "fix";
	var NO_VALUE                    = "000";

	var boards = new Array();
	var elementsList = new Array();
	var handlers = {};

	function isAlreadyRegistered(nativeid){
        for(var i in elementsList)
            if(elementsList[i].id === nativeid)
                return true;
        return false;
    }

	function init_serial(){
		try{
            var filePath = path.resolve(__dirname, "./serial_devices.json");
            fs.readFile(filePath, function(err,data) {
                if (!err) {
                    var settings = JSON.parse(data.toString());
                    SERIAL_PORT = settings.usb[0].port;
                    SERIAL_RATE = settings.usb[0].rate;
                    //console.log("\n\nPORT : "+SERIAL_PORT);
                    //console.log("RATE : "+SERIAL_RATE);
                    try{
	                    serial = new serialPort(SERIAL_PORT, {baudrate: SERIAL_RATE}, false);
	                    intervalId = setInterval(waiting_for_serial,2000);
					}
					catch(e){
						console.log("catch : " + e);
					}
                }
            });
		}
		catch(e2){
			console.log("Serial port " +  SERIAL_PORT + " is not ready");
		}	
	}

	function waiting_for_serial(){
		//console.log("Searching "+ SERIAL_PORT);
		serialport_module.list(function (err, ports) {
    		ports.forEach(function(port) {
      			if(port.comName == SERIAL_PORT){
      				//console.log("FOUND PORT");
      				
      				clearInterval(intervalId);

      				serial.open(function () {
      					serial.on('close', function (err) {
							console.log("Serial port ["+SERIAL_PORT+"] was closed");
							//TODO handle board disconnection
							//TODO start listening for incoming boards
						});

						serial.on('error', function (err) {
							if(err.path == SERIAL_PORT){
								//console.log("Serial port ["+SERIAL_PORT+"] is not ready. Err code : "+err.code);
								setTimeout(init_serial,2000);
							}
						});
						start_serial();
					});
      			}
    		});
  		});
  		
	}

	function start_serial(){
		serial.on( "data", function( chunk ) {
			incoming_data += chunk.toString().replace(/\n/g,'');
			try{
				var start = incoming_data.indexOf("<");
				var stop = incoming_data.indexOf(">", start);
				if(start != -1 && stop != -1){
					var temp = incoming_data.substring(start+1, stop);
					incoming_data = incoming_data.slice(stop+1);
					var data = JSON.parse(temp);
					if(data.cmd === "con"){
						var board = new Array();
        				board["id"] = data.id;
//      				board["language"] = data.language;
				        board["protocol"] = data.protocol;
				        board["name"] = data.name;
				        board["elements"] = new Array();
        				boards[data.id] = board;

        				console.log("\nNew board was connected to local PZP");
        				console.log("BOARD ID : " + board.id);
				//      console.log("BOARD LANGUAGE : " + board.language);
				        console.log("BOARD PROTOCOL : " + board.protocol);
				        console.log("BOARD NAME : " + board.name);
						send_con_ack();
					}
					else if(data.cmd === "ele"){
						console.log("\nSerial driver - register new elements");
						boards[data.id].elements = data.elements;
                        for(var i=0; i<data.elements.length ;i++){   
                            var tmp_ele = data.elements[i];
                            if(!isAlreadyRegistered(tmp_ele.id)){
                                var str_type = (tmp_ele.element.sa == 0) ? "sensor" : "actuator";
                                tmp_ele.element.description = "A webinos " + tmp_ele.element.type + " "  + str_type + " on " + boards[data.id].name + " [" + data.id + "]";
                                try{
                                    tmp_ele.element.range = [tmp_ele.element.range.split("-")];
                                }catch(e){}
                                var id = registerFunc(driverId, tmp_ele.element.sa, tmp_ele.element);
                                elementsList[id] = tmp_ele;
                            }
                            else
                                console.log("Element is already registered");
                        }
						send_ele_ack();
					}
					else if(data.cmd === "str"){
						console.log("arduino sent ack for start");
						console.log(JSON.stringify(data));
					}
					else if(data.cmd === "stp"){
						console.log("arduino sent ack for stop");
						console.log(JSON.stringify(data));
					}
					else if(data.cmd === "cfg"){
						console.log("arduino sent ack for configure : " + JSON.stringify(data));
						handlers[data.id].succCB(handlers[data.id].eId);
					}
					else if(data.cmd === "set"){
						console.log("arduino sent ack for set");
						console.log(JSON.stringify(data));
					}
					else if(data.cmd === "val"){
						try{            
				            for(var i in elementsList){
				                if(elementsList[i].id === data.id){
				                	var date = new Date();
									var now = date.getMinutes() + ":" + date.getSeconds();
									console.log("Received sensor value from arduino - " + JSON.stringify(data));
				                    callbackFunc('data', i, data.dat);
				                    break;
				                }
				            }
				        }
				        catch(err){
				            console.log("Received values from non configured board. Please restart the board");
				        } 
					}
					incoming_data = "";
				}
			}
			catch(e){
				console.log(e);
			}	
		});
	}

	function send_command(cmd, eid, dat){
		if(serial)
			serial.write("cmd="+cmd+"&eid="+eid+"&dat="+dat+"\n");
	}

	function send_con_ack(){
//		console.log("pzp sent ack for incoming connection");
		if(serial)
			serial.write("cmd=con&eid=000&dat=ack\n");
	}

	function send_ele_ack(){
//		console.log("pzp sent ack for incoming elements");
		if(serial)
			serial.write("cmd=ele&eid=000&dat=ack\n");
	}

    /*
    * This function is called to initialize the driver.
    * @param dId Identifier of the driver
    * @param regFunc This is the function to call to register a new sensor/actuator
    * @param cbkFunc This is the function to call to send back data
    *
    */
    exports.init = function(dId, regFunc, cbkFunc) {
        console.log('Serial driver init - id is ' + dId);
        driverId = dId;
        registerFunc = regFunc;
        callbackFunc = cbkFunc;
        init_serial();
    };


    /*
    * This function is called to execute a command
    * @param cmd The command
    * @param eId Identifier of the element that should execute the command
    * @param data Data of the command
    *
    */
    exports.execute = function(cmd, eId, data, errorCB, successCB) {
        var native_element_id = elementsList[eId].id.split("_")[1];  //eg nativeid = "000001_001"
        var board_id = elementsList[eId].id.split("_")[0];
        switch(cmd) {
            case 'cfg':
                //In this case cfg data are transmitted to the sensor/actuator
                //this data is in json(???) format
                console.log('Received cfg for element '+eId+', cfg is '+JSON.stringify(data));
                handlers[elementsList[eId].id] = {"succCB" : successCB, "errCB" : errorCB, "eId" : eId};
                var eventmode = (data.eventFireMode === "valuechange") ? VALUECHANGE_MODE:FIXEDINTERVAL_MODE;
                var param_data = data.timeout+":"+data.rate+":"+eventmode;
                send_command(CONFIGURE_CMD,native_element_id,param_data);
                break;
            case 'start':                                 
                //In this case the sensor should start data acquisition
                //the parameter data has value 'fixed' (in case of fixed interval
                // acquisition) or 'change' (in case od acquisition on value change)
                console.log('Received start command from API. Element : '+eId+', mode : '+data);
                send_command(START_LISTENING_CMD,native_element_id,NO_VALUE);
                break;
            case 'stop':
                //In this case the sensor should stop data acquisition
                //the parameter data can be ignored
                console.log('Received stop command from API. Element : '+eId);
                send_command(STOP_LISTENING_CMD,native_element_id,NO_VALUE);
                break;
            case 'value':
                //In this case the actuator should store the value
                //the parameter data is the value to store                
                console.log('Sent value for actuator '+eId+'; value is '+data);
                send_command(SET_ACTUATOR_VALUE_CMD,native_element_id,data);
                break;
            default:
                console.log('Serial driver - unrecognized cmd');
        }
     }
}());
