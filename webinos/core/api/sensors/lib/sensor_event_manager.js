
var express = require('express');

function returnData(data, successCB, errorCB) {
    
    if (data === undefined) {
        errorCB('Position could not be retrieved');
    } 
    else{
        successCB(data);
    }
} 

var current_temperature = 0;
var last_temperature = -273;
    
(function () {
    
    
    var DEF_RATE = 1000;
    var SensorEvent = function(){
        this.sensorType = 0;
        this.sensorId = 0;
        this.accuracy = 0;
        this.rate = DEF_RATE;
        this.eventFireMode = undefined;
        this.sensorValues = new Array();
        this.position = 0;
    
        /*
        ** void initSensorEvent(DOMString type, boolean bubbles, boolean cancelable, DOMString sensorType, DOMString sensorId, 
        **                      Accuracy accuracy, unsigned long rate, EventFireMode eventFireMode, float[] sensorValues, GeoPosition position)
        */
        this.initSensorEvent = function(type, bubbles, cancelable, sensorType, sensorId, accuracy, rate, eventFireMode, sensorValues, position){
//            this.type = type;
//            this.bubble = bubbles;
//            this.cancelable = cancelable;
            this.sensorType = sensorType;
            this.sensorId = sensorId;
            this.rate = rate;
            this.sensorValues = sensorValues;
            this.position = position;
        
            if(eventFireMode == "fixedinterval")
                this.eventFireMode = "fixedinterval";
            else
                this.eventFireMode = "valuechange"; // is the default value
            
            if(accuracy in {"high":1,"medium":1,"low":1,"unreliable":1})
                this.accuracy = accuracy;
            else
                this.accuracy = "unavailable";
        
            console.log("[GLT] Event configured");
        };
    };


    function getTemperatureFromSensor(){
        //currentTemperature = driver.getTemperature();
        var current_temperature = 29;
        if(current_temperature != last_temperature)
            last_temperature = current_temperature;
        return current_temperature;
    }
    
    function createTemperatureEvent(){
        var Tevent = new SensorEvent();
        var values = new Array();
        
        
        values[0] = getTemperatureFromSensor();
        
        Tevent.initSensorEvent("sensor", false, false, "http://webinos.org/api/sensors.temperature", 1, -1, 1, -1, values, null);
        return Tevent;
    }
    
    var current_temp = 0;
    var last_temp = 0;


    fixedinterval_listeners = [];
    valuechanges_listeners = [];
    rpcHandler = null;
    
    function setRpcHandler(handler){
        rpcHandler = handler;
    };
    
    function handlePeriodicEvent(){ 
        console.log("Periodic");
        if(fixedinterval_listeners.length == 0)
            console.log("[GLT] empty fixedinterval_listeners");
        for (var i = 0; i < fixedinterval_listeners.length; i++) {
            if (fixedinterval_listeners[i][3] == 'sensor') {
                //if bla bla == temperature
                currentTemperaure = 23;
                var evt = createTemperatureEvent();
                returnData(evt, function (evt) {
                    console.log("[GLT] Executing RPC");
                    var rpc = rpcHandler.createRPC(fixedinterval_listeners[i][2], 'onEvent', evt);
                    rpcHandler.executeRPC(rpc);
                }, fixedinterval_listeners[i][1], fixedinterval_listeners[i][2]);
            }
        }
    };
    
    function handleOnChangeEvent(){ 
        if(valuechanges_listeners.length == 0)
            console.log("[GLT] empty valuechanges_listeners");
        for (var i = 0; i < valuechanges_listeners.length; i++) {
            if (valuechanges_listeners[i][3] == 'sensor') {
                var evt = createTemperatureEvent();
                returnData(evt, function (evt) {
                    console.log("[GLT] Executing RPC");
                    var rpc = rpcHandler.createRPC(valuechanges_listeners[i][2], 'onEvent', evt);
                    rpcHandler.executeRPC(rpc);
                }, valuechanges_listeners[i][1], valuechanges_listeners[i][2]);
            }
        }
    };
    
    function addFixedIntervalListener(eventType, successHandler, errorHandler, objectRef){
        fixedinterval_listeners.push([successHandler, errorHandler, objectRef, eventType]);
    };
    
    function addValueChangesListener(eventType, successHandler, errorHandler, objectRef){
        valuechanges_listeners.push([successHandler, errorHandler, objectRef, eventType]);
    };

    
//    setInterval(handleOnChangeEvent,5000);
    
exports.handlePeriodicEvent = handlePeriodicEvent;
exports.setRpcHandler = setRpcHandler;
exports.addFixedIntervalListener = addFixedIntervalListener;
exports.addValueChangesListener = addValueChangesListener;

var sensor_manager = express();

sensor_manager.get('/temperature', function(req, res) {
//	sensors.temperature = req.param("value");
//	console.log("Arduino sends Temperature : " + sensors.temperature + "\n");
//        console.log("Varabile : " + variabile + "\n");
        handleOnChangeEvent();
        res.end();
//        myHandler.execute( { "sensorType":"temperature", "sensorValue":sensors.temperature} );
//    res.send('Current Temperature = 23 °C');
});
sensor_manager.listen(1984);

})(module.exports);

