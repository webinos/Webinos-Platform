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
 * Author: Giuseppe La Torre - University of Catania
 * 
 ******************************************************************************/

var PZP_IOT_IP                  = "192.168.1.130";
var PZP_IOT_PORT                = 1984;
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

// Module dependencies.
var express = require('express');
var http = require("http");

(function () {
    'use strict';

    var driverId = null;
    var registerFunc = null;
    var callbackFunc = null;

    /*
    * This function is called to initialize the driver.
    * @param dId Identifier of the driver
    * @param regFunc This is the function to call to register a new sensor/actuator
    * @param cbkFunc This is the function to call to send back data
    *
    */
    exports.init = function(dId, regFunc, cbkFunc) {
        console.log('HTTP driver init - id is ' + dId);
        driverId = dId;
        registerFunc = regFunc;
        callbackFunc = cbkFunc;        
        app.listen(PZP_IOT_PORT);
    };

    /*
    * This function is called to execute a command
    * @param cmd The command
    * @param eId Identifier of the element that should execute the command
    * @param data Data of the command
    *
    */
    exports.execute = function(cmd, eId, data) {
        console.log("pippo : " + eId);
        var native_element_id = elementsList[eId].id.split("_")[1];  //eg nativeid = "000001_001"
        var board_id = elementsList[eId].id.split("_")[0];
        switch(cmd) {
            case 'cfg':
                //In this case cfg data are transmitted to the sensor/actuator
                //this data is in json(???) format
                
                console.log('Received cfg for element '+eId+', cfg is '+JSON.stringify(data));
                makeHTTPRequest(boards[board_id].ip, boards[board_id].port, CONFIGURE_CMD, native_element_id, data);  
                break;
            case 'start':                                 
                //In this case the sensor should start data acquisition
                //the parameter data has value 'fixed' (in case of fixed interval
                // acquisition) or 'change' (in case od acquisition on value change)
            
                console.log('Received start command from API. Element : '+eId+', mode : '+data);
                var mode = (data === "fixed") ? FIXEDINTERVAL_MODE : VALUECHANGE_MODE;                
                makeHTTPRequest(boards[board_id].ip, boards[board_id].port, START_LISTENING_CMD, native_element_id, mode);  
                elementsList[eId].running = true;
                break;
            case 'stop':
                //In this case the sensor should stop data acquisition
                //the parameter data can be ignored
                
                console.log('Received stop command from API. Element : '+eId);
                var native_element_id = elementsList[eId].id.split("_")[1];  //eg nativeid = "000001_001"
                makeHTTPRequest(boards[i].ip, boards[i].port, STOP_LISTENING_CMD, native_element_id, NO_VALUE);                                
                elementsList[eId].running = false;                
                break;
            case 'value':
                //In this case the actuator should store the value
                //the parameter data is the value to store                
                console.log('Received value for element '+eId+'; value is '+data);
                break;
            default:
                console.log('HTTP driver 1 - unrecognized cmd');
        }
     }

    //var app = express.createServer("192.168.1.130");
    var app = express(PZP_IOT_IP);

    // Configuration
    app.configure( function() {
    });

    app.post('/sensor', function(req,res){
        try{            
            var index;
            for(var i in elementsList){
                if(elementsList[i].id === req.param('id')){
                    index = i;
                    break;
                }
            }            
            callbackFunc('data', index, req.param('data'));
            console.log("Received data from sensor");
            console.log("id : " + req.param('id'));
            console.log("data : " + req.param('data'));
            res.end();
        }
        catch(err){
            console.log("Received values from non configured board. Please restart the board");
        } 
    });

    app.get('/newboard', function(req, res) {
        console.log("New board : "+req.param('jsondata'));
        var jsondata = req.param('jsondata').replace(/'/g, "\"");		
        var boardinfo = JSON.parse(jsondata);
        console.log("BOARD ID : " + boardinfo.id);
//      console.log("BOARD LANGUAGE : " + boardinfo.language);
        console.log("BOARD PROTOCOL : " + boardinfo.protocol);
        console.log("BOARD NAME : " + boardinfo.name);
        console.log("BOARD IP : " + boardinfo.ip);
        console.log("BOARD PORT : " + boardinfo.port);
	
        var board = new Array();
        board["id"] = boardinfo.id;
//      board["language"] = boardinfo.language;
        board["protocol"] = boardinfo.protocol;
        board["name"] = boardinfo.name;
        board["ip"] = boardinfo.ip;
        board["port"] = boardinfo.port;
        board["elements"] = new Array();

        boards[boardinfo.id] = board;
	
//      if(boardinfo.language == 'webinos'){
            console.log("PZP accepted board with ID : " + boardinfo.id);
            res.send("{\"ack\":\"newboard\"}\n");        
            setTimeout(makeHTTPRequest, 5000, boardinfo.ip, boardinfo.port, GET_ELEMENTS_CMD, NO_VALUE, NO_VALUE);
//          makeHTTPRequest(boardinfo.ip, boardinfo.port, GET_ELEMENTS_CMD, NO_VALUE, NO_VALUE);
//      }
//      else{
//          console.log("PZP rejected request from board with ID : " + boardinfo.id);
//	    res.send("{\"ack\":\"err\"}\n");
//      }
    });

    app.get('/info', function(req,res){
	for(var i in boards){
		console.log(boards[i]);
	}
	res.send();
    });
    
    function isAlreadyRegistered(nativeid){
        for(var i in elementsList)
            if(elementsList[i].id === nativeid)
                return true;
        return false;
    }
    
    function makeHTTPRequest(ip, port, cmd, id, data){
        var options = {
            hostname: ip,
            port: port,
            path: "/?cmd="+cmd+"&eid="+id+"&dat="+data,
        };

        var req = http.request(options, function(res) {
            var str = '';
            res.setEncoding('utf8');
            console.log('STATUS: ' + res.statusCode);
            console.log('HEADERS: ' + JSON.stringify(res.headers));
            
            res.on('data', function (chunk) {
                str += chunk;
            });
            
            res.on('end', function () {
                try{
                    var data = JSON.parse(str);
                    console.log("data.cmd : " + data.cmd); 
                    if(data.cmd === GET_ELEMENTS_CMD){
                        console.log("Received response for cmd=ele");                
                        boards[data.bid].elements = data.elements;                      
                        for(var i=0; i<data.elements.length ;i++){   
                            console.log("Board ["+data.bid+"] - Adding element : " + JSON.stringify(data.elements[i]));                           
                            var tmp_ele = data.elements[i];
                            if(!isAlreadyRegistered(tmp_ele.id)){
                                tmp_ele.element.name = "ELEMENT_NAME";
                                tmp_ele.element.description = "ELEMENT_DESCR";
                                var id = registerFunc(driverId, tmp_ele.element.sa, JSON.stringify(tmp_ele.element));   
                                elementsList[id] = tmp_ele;
                            }
                            else
                                console.log("Element is already registered");
                        }        
                    }
                    else if(data.cmd === CONFIGURE_CMD){
                        console.log("Configured element " + data.id);                            
                    }
                    else if(data.cmd === START_LISTENING_CMD){
                        console.log("Started element " + data.id);
                    }
                    else if(data.cmd === STOP_LISTENING_CMD){
                        console.log("Stopped element " + data.id);
                    }
                    else{
                        console.log("Unrecognized command");
                    }
                }
                catch(err){
                    console.log(err);
                }
            });
        });
    
        req.on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });
        
        console.log("Making HTTP request, cmd: "+cmd+", id: "+id+", data: "+data);
        req.end();
    }
}());