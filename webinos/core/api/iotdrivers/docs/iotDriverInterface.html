IoT driver interface
====================

Drivers should be located in the directory /webinos/core/api/iotdrivers/lib/drivers.

Here is a skeleton of a new driver.

(function () {
    'use strict';

    var driverId = null;
    var registerFunc = null;
    var callbackFunc = null;

    exports.init = function(dId, regFunc, cbkFunc) {
        driverId = dId;
        registerFunc = regFunc;
        callbackFunc = cbkFunc;
    };

    exports.execute = function(cmd, eId, data) {

        switch(cmd) {
            case 'cfg':
			    //Data to configure the sensor
                break;
            case 'start':
                //Start data acquisition
                break;
            case 'stop':
                //Stop data acquisition
                break;
            case 'value':
                //Value for the actuator
                break;
            default:
        }

    }

}());

The nodejs module is exporting two functions: init and execute.

INIT
----

The init function receives three arguments:
* dId is an id assigned to the driver;
* registerFunc is a function to call to register a new driver on the webinos platform (see below the signature);
* cbkFunc is a function to call to send data to the webinos platform (see below the signature);

The registerFunc has the following signature:
int registerFunc(int driverId, int sa, DOMString type)
where:
* driverId is the id of the driver (set in the init function);
* sa identifies if the element is a sensor (0) or an actuator (1);
* type is the type of sensor/actuator, eg 'temperature', 'light', ... (the webinos platform will expose a service of type http://webinos.org/api/sensor.type or http://webinos.org/api/actuator.type
The register function will return an id assigned to the sensor/actuator.

The cbkFunc has the following signature:
void cbkFunc(DOMString cmd, int id, int value)
where:
* cmd is the command to send; at the moment only 'data' is supported (to send data to the platform);
* id id the id of the sensor assigned from the registerFunc;
* value is the value to send;

EXECUTE
-------

The execute function receives three arguments:
* cmd is a command sent to the sensor/actuator; at the moment are supported: 'cfg', 'start', 'stop', 'value';
* eId is the id of the sensor/actuator to address;
* data are data passed to the element: configuration data for cmd 'cfg'; acquisition mode for cmd 'start'; actuator value for cmd 'value';



 



