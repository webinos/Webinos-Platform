
var dilib = require('./driverInterface.js');
var diSensor;
var diActuator;

var selectedElement = 3;
var counter;


try {
    diSensor = new dilib.driverInterface(0, sensorListener);
    console.log('Driver interface: load success from sensor\n');

    diActuator = new dilib.driverInterface(1, actuatorListener);
    console.log('Driver interface: load success from actuator\n');

}
catch(e) {
    console.log('Decision storage error: '+e.message);
    return;
}



function sensorListener(cmd, id, data) {
    //console.log('sensorListener, command: '+cmd+', type: '+type);
    switch(cmd) {
        case 'register':
            //If cmd is register, then data is the type of sensor (temperature, light, ...)
            console.log('sensorListener: register sensor of type '+data);
            if(id == selectedElement)
                setTimeout(function(){configureSensor(id);}, 3800);
            break;
        case 'data':
            console.log('sensorListener: sensor '+id+' sent value '+data);
            break;
        default:
            console.log('sensorListener: unrecognized command');
    }
}


function actuatorListener(cmd, id, data) {
    //console.log('actuatorListener, command: '+cmd+', data: '+data);
    switch(cmd) {
        case 'register':
            //If cmd is register, then data is the type of actuator (linearmotor, ...)
            console.log('actuatorListener: register actuator of type '+data);
            if(id == selectedElement) {
                counter = 0;
                setTimeout(function(){sendDataActuator(id);}, 3800);
            }
            break;
        default:
            console.log('actuatorListener: unrecognized command');
    }
}


function configureSensor(id) {
    console.log('\nconfigureSensor');
    diSensor.sendCommand('cfg', id, 'cfgString');
    //Start data acquisition
    diSensor.sendCommand('start', id, 'fixed');
    setTimeout(function(){stopSensor(id);}, 25800);
}


function stopSensor(id) {
    diSensor.sendCommand('stop', id, null);
}


function sendDataActuator(id) {
    //console.log('sendDataActuator - id is '+id+', counter is '+counter);
    diActuator.sendCommand('value', id, 1111+counter*13);
    if(counter < 5) {
        counter++;
        setTimeout(function(){sendDataActuator(id);}, 2800);
    }
}


