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
* Copyright 2012 BMW AG
******************************************************************************/

(function() {

WDomEvent = function(type, target, currentTarget, eventPhase, bubbles, cancelable, timestamp){
	this.initEvent(type, target, currentTarget, eventPhase, bubbles, cancelable, timestamp);
}

WDomEvent.prototype.initEvent = function(type, target, currentTarget, eventPhase, bubbles, cancelable, timestamp){
    this.type = type;
    this.target = target;
    this.currentTarget = currentTarget;
    this.eventPhase = eventPhase;
    this.bubbles = bubbles;
    this.cancelable  = cancelable;
    this.timestamp = timestamp; 
}

ShiftEvent = function(gear){
	this.initShiftEvent(gear);
}

ShiftEvent.prototype = new WDomEvent();
ShiftEvent.prototype.constructor = ShiftEvent;
ShiftEvent.parent = WDomEvent.prototype; // our "super" property

ShiftEvent.prototype.initShiftEvent = function(gear){
	this.gear = gear;
    var d = new Date();
    var stamp = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
    var stamp = stamp + d.getUTCMilliseconds();
	ShiftEvent.parent.initEvent.call(this, 'gear', null, null, null, false, false, stamp);
}

/*
* RELEVAT OBJECTS FOR TRIPCOMPUTER EVENTS
*
*/
TripComputerEvent = function(tcData){
	this.initTripComputerEvent(tcData);
}

TripComputerEvent.prototype = new WDomEvent();
TripComputerEvent.prototype.constructor = ShiftEvent;
TripComputerEvent.parent = WDomEvent.prototype; // our "super" property

TripComputerEvent.prototype.initTripComputerEvent = function(tcData){
    this.averageConsumption1 = tcData.c1;
    this.averageConsumption2 = tcData.c2;
    this.averageSpeed1 = tcData.s1;
    this.averageSpeed2 = tcData.s2;
    this.tripDistance = tcData.d;
    this.mileage = tcData.m;
    this.range = tcData.r;
    var d = new Date();
    var stamp = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
    var stamp = stamp + d.getUTCMilliseconds();

	ShiftEvent.parent.initEvent.call(this, 'tripcomputer', null, null, null, false, false, stamp);
}


function Address(country, region, county, city, street, streetNumber, premises, additionalInformation, postalCode){
	this.country = country;
	this.region = region;
	this.county = county;
	this.city = city;
	this.street = street;
	this.streetNumber = streetNumber;
	this.premises = premises;
	this.additionalInformation = additionalInformation;
	this.postalCode = postalCode;
}

ParkSensorEvent = function(position, psData){
	this.initParkSensorEvent(position, psData);
}

ParkSensorEvent.prototype = new WDomEvent();
ParkSensorEvent.prototype.constructor = ParkSensorEvent;
ParkSensorEvent.parent = WDomEvent.prototype; // our "super" property

ParkSensorEvent.prototype.initParkSensorEvent = function(position, psData){
    this.position = position;
    this.outLeft = psData.ol;
    this.left = psData.l;
    this.midLeft = psData.ml;
    this.midRight = psData.mr;
    this.right = psData.r;
    this.outRight = psData.or;
    
    var d = new Date();
    var stamp = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
    var stamp = stamp + d.getUTCMilliseconds();

	ParkSensorEvent.parent.initEvent.call(this, 'parksensor', null, null, null, false, false, stamp);
}


NavigationEvent = function(type, data){
	this.initNavigationEvent(type, data);
}

NavigationEvent.prototype = new WDomEvent();
NavigationEvent.prototype.constructor = NavigationEvent;
NavigationEvent.parent = WDomEvent.prototype; // our "super" property

NavigationEvent.prototype.initNavigationEvent = function(type, data){
    this.type = type;
    this.address = new Address(data.country, data.region, data.county, data.city, data.street, data.streetnumber, data.premises, data.additionals, data.postalcode);
    
      
    var d = new Date();
    var stamp = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
    var stamp = stamp + d.getUTCMilliseconds();
	NavigationEvent.parent.initEvent.call(this, type, null, null, null, false, false, stamp);
}


ControlEvent = function(controlId, active){
	this.initControlEvent(controlId, active);
}

ControlEvent.prototype = new WDomEvent();
ControlEvent.prototype.constructor = ControlEvent;
ControlEvent.parent = WDomEvent.prototype; // our "super" property

ControlEvent.prototype.initControlEvent = function(controlId, active){
    this.controlId = controlId;
	this.active = active;
   
    var d = new Date();
    var stamp = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
    var stamp = stamp + d.getUTCMilliseconds();

	ControlEvent.parent.initEvent.call(this, 'control-event', null, null, null, false, false, stamp);
}


DeviceOrientationEvent = function(alpha, beta, gamma){
	this.initDeviceOrientationEvent(alpha, beta, gamma);
}

DeviceOrientationEvent.prototype = new WDomEvent();
DeviceOrientationEvent.prototype.constructor = DeviceOrientationEvent;
DeviceOrientationEvent.parent = WDomEvent.prototype; // our "super" property

DeviceOrientationEvent.prototype.initDeviceOrientationEvent = function(alpha, beta, gamma){
	this.alpha = alpha;
	this.beta = beta;
	this.gamma = gamma;
    
    var d = new Date();
    var stamp = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
    var stamp = stamp + d.getUTCMilliseconds();
    
	DeviceOrientationEvent.parent.initEvent.call(this,'deviceorientation', null, null, null, false, false, stamp);
}
Acceleration = function(x,y,z){
	this.x = x;
	this.y = y;
	this.z = z;
}
RotationRate = function(alpha, beta, gamma){
	this.alpha = alpha;
	this.beta = beta;
	this.gamma = gamma;
}
DeviceMotionEvent = function(data){
	this.initDeviceMotionEvent(data);
}
DeviceMotionEvent.prototype = new WDomEvent();
DeviceMotionEvent.prototype.constructor = DeviceOrientationEvent;
DeviceMotionEvent.parent = WDomEvent.prototype; // our "super" property

DeviceMotionEvent.prototype.initDeviceMotionEvent = function(data){
	this.acceleration = data.acceleration;
	this.accelerationIncludingGravity = null;
	this.rotationRate = data.rotationRate;
	this.interval = data.interval;
 
	DeviceOrientationEvent.parent.initEvent.call(this,'devicemotion', null, null, null, false, false, data.stamp);
}


var fs = require('fs'), url = require('url'), path = require('path');
var nPathV = parseFloat(process.versions.node);
if (nPathV >= 0.7) { nPathV = fs;} else { nPathV = path;}

		function getContentType(uri) {
			var contentType = {"Content-Type": "text/plain"};
			switch (uri.substr(uri.lastIndexOf('.'))) {
			case '.js':
				contentType = {"Content-Type": "application/x-javascript"};
				break;
			case '.html':
				contentType = {"Content-Type": "text/html"};
				break;
			case '.css':
				contentType = {"Content-Type": "text/css"};
				break;
			case '.jpg':
				contentType = {"Content-Type": "image/jpeg"};
				break;
			case '.png':
				contentType = {"Content-Type": "image/png"};
				break;
			case '.gif':
				contentType = {"Content-Type": "image/gif"};
				break;
		    }
		    return contentType;
		}



var httpServer = require('http').createServer(function(request, response) {  
			var uri = url.parse(request.url).pathname;  
			var filename = path.join(__dirname, uri);  
			nPathV.exists(filename, function(exists) {  
				if(!exists) {  
					response.writeHead(404, {"Content-Type": "text/plain"});
					response.write("404 Not Found\n");
					response.end();
					return;
				}  
				fs.readFile(filename, "binary", function(err, file) {  
					if(err) {  
						response.writeHead(500, {"Content-Type": "text/plain"});  
						response.write(err + "\n");  
						response.end();  
						return;  
					}
					response.writeHead(200, getContentType(filename));  
					response.write(file, "binary");  
					response.end();
				});
			});  
		});
        
httpServer.on('error', function(err) {
	// this catches EADDRINUSE and makes sure node doesn't quit
	console.log('verhicle api: error on vehicle sim server: ' + err);
});

try{
	// FIXME this fails when this service is loaded more than once on one host
	// as the port will already be taken
    httpServer.listen(9898);
    var nowjs = require('now');
    var everyone = nowjs.initialize(httpServer);
    var _listeners = new Object();

}catch(e){
    console.log('The Vehicle Simulator requires the node-module now. You can install it by the following command: npm install now.');
}
var gear = '11';

var tcData = new Object();
tcData.s1 = 48.5;
tcData.s2 = 46.5;
tcData.c1 = 5.7;
tcData.c2 = 6.1;
tcData.d = 33.3;
tcData.m = 11298;
tcData.r = 456;


var psrData = new Object();

var psfData = new Object();

//LIGHTS
var lfrData = false;
var lffData = false;
var lhData = false;
var lpData = false;
var lslData = false;
var lsrData = false;
var lswData = false;
var lheadData = false;

//GEOLOCATION
var gData = new Object();
gData.coords = new Object();
gData.coords.latitude = 41.38765942141657;
gData.coords.longitude = 2.1694680888855373;
gData.coords.accuracy = 99;
gData.coords.heading = 90;
gData.coords.speed = 0.0;
gData.coords.altitude = 12;


//DEVICE ORIENTATION & MOTION
var dmData = new Object();

dmData.acceleration = new Object();
dmData.acceleration.x = 0.0;
dmData.acceleration.y = 0.0;
dmData.acceleration.z = 0.0;
dmData.rotationRate = new Object();
dmData.rotationRate.alpha = 0;
dmData.rotationRate.beta = 0;
dmData.rotationRate.gamma = 0;
dmData.interval = 500;

var doData = new Object();
var cnData = new Object();

	everyone.now.setGear = function(val){
        gear = val;
        console.log(gear);
        if(typeof _listeners.gear != 'undefined'){
            _listeners.gear(new ShiftEvent(val));
        }
    }
    everyone.now.setTripComputer = function(data){
        tcData = data;
        console.log(data);
        if(typeof _listeners.tripcomputer != 'undefined'){
            _listeners.tripcomputer(new TripComputerEvent(tcData));
        }
    }
    
    everyone.now.setPsFront = function(data){
        psfData = data;
        console.log(data);
        if(typeof _listeners.parksensorsFront != 'undefined'){
            _listeners.parksensorsFront(new ParkSensorEvent('parksensors-front',psfData));
        }
    }

    everyone.now.setPsRear = function(data){
        psrData = data;
        console.log(data);
        if(typeof _listeners.parksensorsRear != 'undefined'){
            _listeners.parksensorsRear(new ParkSensorEvent('parksensors-rear',psrData));
        }
    }    
    
    everyone.now.setDestinationReached = function(data){
        dData = data;
        console.log(data);
        if(typeof _listeners.destinationReached != 'undefined'){
            _listeners.destinationReached(new NavigationEvent('destination-reached',dData));
        }
    }
    
    
     everyone.now.setdestinationCancelled = function(data){
        dData = data;
        console.log(data);
        if(typeof _listeners.destinationCancelled != 'undefined'){
            _listeners.destinationCancelled(new NavigationEvent('destination-cancelled',dData));
        }
    }
    
     everyone.now.setDestinationChanged = function(data){
        dData = data;
        if(typeof _listeners.destinationChanged != 'undefined'){
            _listeners.destinationChanged(new NavigationEvent('destination-changed',dData));
        }
    }
     
    everyone.now.setLightsFogRear = function(data){
        lfrData = data;
    	if(typeof _listeners.lightsFogRear != 'undefined'){
             _listeners.lightsFogRear(new ControlEvent('lights-fog-rear', data));
         }
    }     
    
    everyone.now.setLightsFogFront = function(data){
    	lffData = data;
    	
    	if(typeof _listeners.lightsFogFront != 'undefined'){
            _listeners.lightsFogFront(new ControlEvent('lights-fog-front', data));
        }
    }     
    
    everyone.now.setLightsParking = function(data){
    	lpData = data;
    	
    	if(typeof _listeners.lightsParking != 'undefined'){
            _listeners.lightsParking(new ControlEvent('lights-parking', data));
        }
    }     

    everyone.now.setLightsHibeam = function(data){
    	lhData = data;
    	if(typeof _listeners.lightsHibeam != 'undefined'){
            _listeners.lightsHibeam(new ControlEvent('lights-hibeam', data));
        }
    }     

    everyone.now.setLightsHead = function(data){
    	lheadData = data;
    	console.log('set head');
    	
    	if(typeof _listeners.lightsHead != 'undefined'){
            _listeners.lightsHead(new ControlEvent('lights-head', data));
        }
    }  

    everyone.now.setLightsSignalLeft = function(data){
    	lslData = data;
    	if(typeof _listeners.lightsSignalLeft != 'undefined'){
            _listeners.lightsSignalLeft(new ControlEvent('lights-signal-left', data));
        }
    }
    
    everyone.now.setLightsSignalRight = function(data){
    	lsrData = data;
    	if(typeof _listeners.lightsSignalRight != 'undefined'){
            _listeners.lightsSignalRight(new ControlEvent('lights-signal-right', data));
        }
    }

    everyone.now.setLightsSignalWarn = function(data){
    	lswData = data;
    	if(typeof _listeners.lightsSignalWarn != 'undefined'){
            _listeners.lightsSignalWarn(new ControlEvent('lights-signal-warn', data));
        }
    }
    
    everyone.now.setGeolocation = function(data){
 	   	console.log('setting geolocation');
    	gData = data;
   		var d = new Date();
		var stamp = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
		var stamp = stamp + d.getUTCMilliseconds();
		gData.timestamp = stamp;
		if(typeof _listeners.geolocation != 'undefined'){
            _listeners.geolocation(gData);
        }
    }
    
    everyone.now.setMotion = function(data){
    	console.log('setting DeviceMotion');
    	dmData = data;
   		var d = new Date();
		var stamp = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
		var stamp = stamp + d.getUTCMilliseconds();
		dmData.timestamp = stamp;
		if(typeof _listeners.devicemotion != 'undefined'){
            _listeners.devicemotion(dmData);
        }
		
    }
        
    	
    
    
    
    
    function get(type){
        switch(type){
            case 'gear': 
                return new ShiftEvent(gear);
                break;
            case 'tripcomputer':
                return new TripComputerEvent(tcData);
                break;
            case 'parksensors-front':
                return new ParkSensorEvent(type, psfData);
                break;
            case 'parksensors-rear':
                return new ParkSensorEvent(type, psrData);
                break;
            case 'parksensors-rear':
                return new ParkSensorEvent(type, psrData);
                break;
            case 'lights-fog-rear':
            	return new ControlEvent(type, lfrData);
            	break;
            case 'lights-fog-front':
            	return new ControlEvent(type, lffData);
            	break;
            case 'lights-parking':
            	return new ControlEvent(type, lpData);
            	break;            
            case 'lights-hibeam':
            	return new ControlEvent(type, lhData);
            	break;            
            case 'lights-head':
            	return new ControlEvent(type, lheadData);
            	break;
            case 'lights-signal-left':
            	return new ControlEvent(type, lslData);
            	break;
            case 'lights-signal-right':
            	return new ControlEvent(type, lsrData);
            	break;
            case 'lights-signal-warn':
            	return new ControlEvent(type, lswData);
            	break;
 			case 'geolocation':
            	return gData;
            	break;
			default:
                console.log('nothing found...');
            
        }
    }   
    function addListener(type, listener){
       console.log('registering listener ' + type);
        switch(type){
            case 'gear':
                _listeners.gear = listener;
                break;
            case 'tripcomputer':
                _listeners.tripcomputer = listener;
                break;
            case 'parksensors-front':
                _listeners.parksensorsFront = listener;
                break;
            case 'parksensors-rear':
                _listeners.parksensorsRear = listener;
                break;
             case 'destination-reached':
                _listeners.destinationReached = listener;
                break;
             case 'destination-reached':
                _listeners.destinationReached = listener;
                break;
             case 'destination-changed':
                _listeners.destinationChanged = listener;
                break;
            case 'destination-cancelled':
                _listeners.destinationCancelled = listener;
                break;
            case 'lights-fog-rear':
            	_listeners.lightsFogRear = listener;
                break;
            case 'lights-fog-front':
            	_listeners.lightsFogFront = listener;
            	break;
            case 'lights-hibeam':
            	_listeners.lightsHibeam = listener;
            	break;
            case 'lights-parking':
            	_listeners.lightsParking = listener;
            	break;
            case 'lights-head':
            	_listeners.lightsHead = listener;
            	break;
            case 'lights-signal-left':
            	_listeners.lightsSignalLeft = listener;
            	break;
            case 'lights-signal-right':
            	_listeners.lightsSignalRight = listener;
            	break;
            case 'lights-signal-warn':
            	_listeners.lightsSignalWarn = listener;
            	break;
            case 'geolocation':
            	_listeners.geolocation = listener;
            	break;
			case 'devicemotion':
            	_listeners.devicemotion = listener;
            	break;
			case 'deviceorientation':
            	_listeners.deviceorientation = listener;
            	break;
			case 'compassneedscalibration':
            	_listeners.compassneedscalibration = listener;
            	break;

            default:
                console.log('type ' + type + ' undefined.');
        }
    }
     exports.get = get;
    exports.addListener = addListener;
})(module.exports);
