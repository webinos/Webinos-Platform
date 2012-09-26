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
* Copyright 2012 TU München
******************************************************************************/

(function() {

// rpcHandler set be setRPCHandler
var rpcHandler = null;
var vs;



function ShiftEvent(value){
	this.gear = value;
}

function TripComputerEvent(avgCon1, avgCon2, avgSpeed1, avgSpeed2, tripDistance, mileage, range){
	this.averageConsumption1 = avgCon1;
	this.averageConsumption2 = avgCon2;
	this.averageSpeed1 = avgSpeed1;
	this.averageSpeed2 = avgSpeed2;
	this.tripDistance = tripDistance;
	this.mileage = mileage;
	this.range = range;
}

//Navigation Event - Destination Reached, Destination Changed, Destination Cancelled
function NavigationEvent(type, address){
    this.type = type;
	this.address = address;
	
}

function Address(contry, region, county, city, street, streetNumber, premises, addtionalInformation, postalCode){
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

function ParkSensorEvent(position, outLeft, left, midLeft, midRight, right, outRight){
	this.position = position;
	this.left = left;
	this.midLeft = midLeft;
	this.midRight = midRight;
	this.right = right;
	this.outRight = outRight;
	this.outLeft = outLeft;
}

function ClimateControlEvent(zone, desiredTemperature, acstatus, ventLevel, ventMode){
	this.zone = zone;
	this.desiredTemperature = desiredTemperature;
	this.acstatus = acstatus;
	this.ventLevel = ventLevel;
	this.ventMode = ventMode;
}

function ControlEvent(controlId, active){
	this.controlId = controlId;
	this.active = active;
}

function VehicleError(message){
	this.message = message;
}



function get(vehicleDataId, vehicleDataHandler, errorCB){
	switch(vehicleDataId[0])
	{
    case "shift":
      vehicleDataHandler(vs.get('gear'));
	  break;
	case "tripcomputer":
		vehicleDataHandler(vs.get('tripcomputer'));
	  break;
	case "parksensors-front":
		vehicleDataHandler(vs.get('parksensors-front'));
		break;
	case "parksensors-rear":
		vehicleDataHandler(vs.get('parksensors-rear'));
		break;	
	case "destination-reached":
		errorCB(new VehicleError(vehicleDataId[0] + 'not found'));
	  break;
	case "destination-changed":
		errorCB(new VehicleError(vehicleDataId[0] + 'not found'));
	  break;
    case "destination-cancelled":
		errorCB(new VehicleError(vehicleDataId[0] + 'not found'));
	  break;
    case "climate-all":
		errorCB(new VehicleError(vehicleDataId[0] + 'not found'));
		break;
	case "climate-driver":
		errorCB(new VehicleError(vehicleDataId[0] + 'not found'));
		break;		 
    case "climate-passenger-front":
		errorCB(new VehicleError(vehicleDataId[0] + 'not found'));
		break;
	case "climate-passenger-rear-left":
		errorCB(new VehicleError(vehicleDataId[0] + 'not found'));
		break;
    case "climate-passenger-rear-right":
        errorCB(new VehicleError(vehicleDataId[0] + 'not found'));
        break;	
    case "lights-fog-front":
    	vehicleDataHandler(vs.get(vehicleDataId[0]));
        break;
    case "lights-fog-rear":
    	vehicleDataHandler(vs.get(vehicleDataId[0]));
		break;	
    case "lights-signal-left":
    	vehicleDataHandler(vs.get(vehicleDataId[0]));
		break;		
    case "lights-signal-right":
    	vehicleDataHandler(vs.get(vehicleDataId[0]));
		break;
	case "lights-signal-warn":
		vehicleDataHandler(vs.get(vehicleDataId[0]));
		break;
	case "lights-parking":
		vehicleDataHandler(vs.get(vehicleDataId[0]));
		break;
	case "lights-hibeam":
		vehicleDataHandler(vs.get(vehicleDataId[0]));
		break;
	case "lights-head":
		vehicleDataHandler(vs.get(vehicleDataId[0]));
		break;
    case "wiper-front-wash":
		errorCB(new VehicleError(vehicleDataId[0] + 'not found'));
		break;
    case "wiper-rear-wash":
        errorCB(new VehicleError(vehicleDataId[0] + 'not found'));
		break;	
    case "wiper-automatic":
		errorCB(new VehicleError(vehicleDataId[0] + 'not found'));
        break;		
    case "wiper-front-once":
        errorCB(new VehicleError(vehicleDataId[0] + 'not found'));
		break;
	case "wiper-rear-once":
		errorCB(new VehicleError(vehicleDataId[0] + 'not found'));
        break;
	case "wiper-front-level1":
		errorCB(new VehicleError(vehicleDataId[0] + 'not found'));
		break;
	case "wiper-front-level2":
        errorCB(new VehicleError(vehicleDataId[0] + 'not found'));
		break;
	default:
	  errorCB(new VehicleError(vehicleDataId[0] + 'not found'));
	}

}

//Objects references for handling EventListeners
var objectRefs = new Array();


//BOOLs for handling listeners (are there active listeners)
var listeningToGear = false;
var listeningToTripComputer = false;
var listeningToParkSensorsFront = false;
var listeningToParkSensorsRear = false;
var listeningToDestinationReached = false;
var listeningToDestinationChanged = false;
var listeningToDestinationCancelled = false;
var listeningToClimateControlAll = false;
var listeningToClimateControlDriver = false;
var listeningToClimateControlPassFront = false;
var listeningToClimateControlPassRearLeft = false;
var listeningToClimateControlPassRearRight = false;

var listeningToLightsFogFront = false;
var listeningToLightsFogRear = false;
var listeningToLightsSignalLeft = false;
var listeningToLightsSignalRight = false;
var listeningToLightsSignalWarn = false;
var listeningToLightsParking = false;
var listeningToLightsHibeam = false;
var listeningToLightsHead = false;

var listeningToWiperFront = false;
var listeningToWiperRear = false;
var listeningToWiperAutomatic = false;
var listeningToWiperFrontOnce = false;
var listeningToWiperFrontOnce = false;
var listeningToWiperFrontLevel1 = false;
var listeningToWiperFrontLevel2 = false;

/*AddEventListener*/
addEventListener = function (vehicleDataId, successHandler, errorHandler, objectRef){
	console.log("vehicleDataId " + vehicleDataId);	
		switch(vehicleDataId){
			case "shift":
				objectRefs.push([objectRef.rpcId, 'shift']);
				if(!listeningToGear){ //Listener for gears not yet registered
					listeningToGear = true;
				}			
				break;
			case "tripcomputer":
				objectRefs.push([objectRef.rpcId, 'tripcomputer']);
				if(!listeningToTripComputer){
					listeningToTripComputer = true;
				}
				break;
			case "parksensors-front":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToParkSensorsFront){
					listeningToParkSensorsFront = true;
				}
				break;
			case "parksensors-rear":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToParkSensorsRear){
					listeningToParkSensorsRear = true;
				}
				break;
            case "destination-reached":
				objectRefs.push([objectRef.rpcId, 'destination-reached']);
				if(!listeningToDestinationReached){
					listeningToDestinationReached = true;
				}
				break;
			case "destination-changed":
				objectRefs.push([objectRef.rpcId, 'destination-changed']);
				if(!listeningToDestinationChanged){
					listeningToDestinationChanged = true;
				}
				break;
			case "destination-cancelled":
				objectRefs.push([objectRef.rpcId, 'destination-cancelled']);
				if(!listeningToDestinationCancelled){
					listeningToDestinationCancelled = true;
				}
				break;	
			case "climate-all":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToClimateControlAll){
					listeningToClimateControlAll = true;
				}
				break;
			case "climate-driver":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToClimateControlDriver){
					listeningToClimateControlDriver = true;
				}
				break;
			case "climate-passenger-front":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToClimateControlPassFront){
					listeningToClimateControlPassFront = true;
				}
				break;
			case "climate-passenger-rear-left":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToClimateControlPassRearLeft){
					listeningToClimateControlPassRearLeft = true;
				}
				break;
			case "climate-passenger-rear-right":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToClimateControlPassRearRight){
					listeningToClimateControlPassRearRight = true;
				}
				break;
			case "lights-fog-front":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToLightsFogFront){
					listeningToLightsFogFront = true;
				}
				
				
				break;
			case "lights-fog-rear":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToLightsFogRear){
					listeningToLightsFogRear = true;
				}
				break;
			case "lights-signal-left":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToLightsSignalLeft){
					listeningToLightsSignalLeft = true;
				}
				break;
			case "lights-signal-right":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToLightsSignalRight){
					listeningToLightsSignalRight = true;
				}
				break;
			case "lights-signal-warn":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToLightsSignalWarn){
					listeningToLightsSignalWarn = true;
				}
				break;
			case "lights-parking":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToLightsParking){
					listeningToLightsParking = true;
				}
				break;
			case "lights-hibeam":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToLightsHibeam){
					listeningToLightsHibeam = true;
				}
			
				break;
			case "lights-head":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToLightsHead){
					listeningToLightsHead = true;
				}
				break;
			case "wiper-front-wash":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToWiperFront){
					listeningToWiperFront = true;
				}
				break;
			case "wiper-rear-wash":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToWiperRear){
					listeningToWiperRear = true;
				}
				break;
			case "wiper-automatic":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToWiperAutomatic){
					listeningToWiperAutomatic = true;
				}
				break;
			case "wiper-front-once":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToWiperFrontOnce){
					listeningToWiperFrontOnce = true;
				}
				break;
			case "wiper-rear-once":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToWiperRearOnce){
					listeningToWiperRearOnce = true;
				}
				break;
			case "wiper-front-level1":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToWiperFrontLevel1){
					listeningToWiperFrontLevel1 = true;
				}
				break;
			case "wiper-front-level2":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToWiperFrontLevel2){
					listeningToWiperFrontLevel2 = true;
				}
				break;
			default:
				console.log('nothing to do: Errors...');
			
			}	
}


/*RemoveEventListener*/
removeEventListener = function(arguments){
	
	// arguments[1] = objectReference, arguments[1] = vehicleDataId
	
	console.log('Removing object# from listener ' + arguments[0] + " vehicleDataId: " + arguments[1]);
	var registeredListeners = 0;
	for(i = 0; i < objectRefs.length; i++ ){
		if(objectRefs[i][1] == arguments[1]){
			registeredListeners++;
		}
		if(objectRefs[i][0] == arguments[0]){
			objectRefs.splice(i,1);
			console.log('object# ' + arguments[1] + " removed.");
		}

	}
	
	console.log(registeredListeners);
	if(registeredListeners  <= 1){
        console.log('disabling listening to ' + arguments[1] + " Events");
		switch(arguments[1]){
			case "shift":
				listeningToGear = false;
								break;
			case "tripcomputer":
				listeningToTripComputer = false;
				break;
			case "parksensors-front":
				listeningToParkSensorsFront = false;
				break;
			case "parksensors-rear":
				listeningToParkSensorsFront = false;
				break;	
            case "destination-reached":
				listeningToDestinationReached = false;
				break;
			case "destination-changed":
				listeningToDestinationChanged = false;
				break;
            case "destination-cancelled":
				listeningToDestinationCancelled = false;
				break;
			case "climate-all":
				listeningToClimateControlAll = false;
				break;
			case "climate-driver":
				listeningToClimateControlDriver = false;
				break;
			case "climate-passenger-front":
				listeningToClimateControlPassFront = false;
				break;	
            case "climate-passenger-rear-left":
				listeningToClimateControlPassRearLeft = false;
				break;	
            case "climate-passenger-rear-right":
				listeningToClimateControlPassRearRight = false;
				break;		
            case "lights-fog-front":
				listeningToLightsFogFront = false;
				break;
			case "lights-fog-rear":
				listeningToLightsFogRear = false;
				break;
			case "lights-signal-left":
				listeningToLightsSignalLeft = false;
				break;	
			case "lights-signal-right":
				listeningToLightsSignalRight = false;
				break;	
            case "lights-signal-warn":
				listeningToLightsSignalWarn = false;
				break;	
            case "lights-parking":
				listeningToLightsParking = false;
				break;
			case "lights-hibeam":
				listeningToLightsHibeam = false;
				break;
            case "lights-head":
				listeningToLightsHead = false;
				break;
            case "wiper-front-wash":
				listeningToWiperFront = false;
				break;
			case "wiper-rear-wash":
				listeningToWiperRear = false;
				break;
			case "wiper-automatic":
				listeningToWiperAutomatic = false;
				break;	
			case "wiper-front-once":
				listeningToWiperFront = false;
				break;	
            case "wiper-rear-once":
				listeningToWiperRear = false;
				break;	
            case "wiper-front-level1":
				listeningToWiperFrontLevel1 = false;
				break;
			case "wiper-front-level2":
				listeningToWiperFrontLevel2 = false;
				break;				
			default:
				console.log("nothing found");
		
		}
	}
}


/*handleShiftEvents*/
function handleShiftEvents(shiftE){
	if(listeningToGear){
        for(i = 0; i < objectRefs.length; i++){
				if(objectRefs[i][1] == "shift"){
                	json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", shiftE);
                 	rpcHandler.executeRPC(json);
				}
        }
	}
}



/*handleTripComputerEvents*/
function handleTripComputerEvents(tcEvent){
    if(listeningToTripComputer){
        for(i = 0; i < objectRefs.length; i++){
				if(objectRefs[i][1] == "tripcomputer"){
                	json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", tcEvent);
                 	rpcHandler.executeRPC(json);
				}
        }
    }
}

/*handleParkSensorsEvent*/
function handleParkSensorsEvents(psEvent){
	if(listeningToParkSensorsFront || listeningToParkSensorsRear){
        for(i = 0; i < objectRefs.length; i++){
			if(objectRefs[i][1] == "parksensors-front"){
   				json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", psEvent);
                rpcHandler.executeRPC(json);
			}
			if(objectRefs[i][1] == "parksensors-rear"){
                    json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", psEvent);
                 	rpcHandler.executeRPC(json);
			}
        }
	}
}

function handleDestinationReached(psEvent){
	if(listeningToDestinationReached){
        for(i = 0; i < objectRefs.length; i++){
			if(objectRefs[i][1] == "destination-reached"){
   				json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", psEvent);
                rpcHandler.executeRPC(json);
			}

        }
	}
}
function handleDestinationCancelled(psEvent){
	if(listeningToDestinationCancelled){
        for(i = 0; i < objectRefs.length; i++){
			if(objectRefs[i][1] == "destination-cancelled"){
   				json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", psEvent);
                rpcHandler.executeRPC(json);
			}

        }
	}
}

function handleDestinationChanged(psEvent){
	if(listeningToDestinationChanged){
        for(i = 0; i < objectRefs.length; i++){
			if(objectRefs[i][1] == "destination-changed"){
   				json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", psEvent);
                rpcHandler.executeRPC(json);
			}

        }
	}
}

function requestGuidance(pois,successCb, errorCb){
	if(setDestination(pois[0])){
		successCb();
	}else{
		errorCb(new VehicleError('Destination could not be changed'));
	}
}


function findDestination(search, successCb, errorCb){
	

}


function handleLightsFogFront(event){
	if(listeningToLightsFogFront){
        for(i = 0; i < objectRefs.length; i++){
				if(objectRefs[i][1] == "lights-fog-front"){
                	json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", event);
                 	rpcHandler.executeRPC(json);
				}
        }
	}
}



function handleLightsFogRear(event){
	if(listeningToLightsFogRear){
        for(i = 0; i < objectRefs.length; i++){
				if(objectRefs[i][1] == "lights-fog-rear"){
                	json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", event);
                 	rpcHandler.executeRPC(json);
				}
        }
	}
}
function handleLightsHibeam(event){
	if(listeningToLightsHibeam){
        for(i = 0; i < objectRefs.length; i++){
				if(objectRefs[i][1] == "lights-hibeam"){
                	json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", event);
                 	rpcHandler.executeRPC(json);
				}
        }
	}
}
function handleLightsParking(event){
	if(listeningToLightsParking){
        for(i = 0; i < objectRefs.length; i++){
				if(objectRefs[i][1] == "lights-parking"){
                	json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", event);
                 	rpcHandler.executeRPC(json);
				}
        }
	}
}

function handleLightsHead(event){
	if(listeningToLightsHead){
        for(i = 0; i < objectRefs.length; i++){
				if(objectRefs[i][1] == "lights-head"){
                	json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", event);
                 	rpcHandler.executeRPC(json);
				}
        }
	}
}

function handleLightsSignalLeft(event){
	if(listeningToLightsSignalLeft){
        for(i = 0; i < objectRefs.length; i++){
				if(objectRefs[i][1] == "lights-signal-left"){
                	json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", event);
                 	rpcHandler.executeRPC(json);
				}
        }
	}
}

function handleLightsSignalRight(event){
	if(listeningToLightsSignalRight){
        for(i = 0; i < objectRefs.length; i++){
				if(objectRefs[i][1] == "lights-signal-right"){
                	json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", event);
                 	rpcHandler.executeRPC(json);
				}
        }
	}
}

function handleLightsSignalWarn(event){
	if(listeningToLightsSignalWarn){
        for(i = 0; i < objectRefs.length; i++){
				if(objectRefs[i][1] == "lights-signal-warn"){
                	json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", event);
                 	rpcHandler.executeRPC(json);
				}
        }
	}
}

function setRPCHandler(rpcHdlr) {
	rpcHandler = rpcHdlr;
}

function setRequired(obj) {
	vs = obj;
    vs.addListener('gear', handleShiftEvents);
    vs.addListener('tripcomputer', handleTripComputerEvents);
    vs.addListener('parksensors-rear', handleParkSensorsEvents);
    vs.addListener('parksensors-front', handleParkSensorsEvents);
    vs.addListener('destination-reached', handleDestinationReached);
    vs.addListener('destination-changed', handleDestinationChanged);
    vs.addListener('destination-cancelled', handleDestinationCancelled);
    vs.addListener('lights-fog-front', handleLightsFogFront);
    vs.addListener('lights-fog-rear', handleLightsFogRear);
    vs.addListener('lights-hibeam', handleLightsHibeam);
    vs.addListener('lights-parking', handleLightsParking);
    vs.addListener('lights-head', handleLightsHead);
    vs.addListener('lights-signal-left', handleLightsSignalLeft);
    vs.addListener('lights-signal-right', handleLightsSignalRight);
    vs.addListener('lights-signal-warn', handleLightsSignalWarn);
}


exports.addEventListener = addEventListener;
exports.removeEventListener = removeEventListener;
exports.get = get;

exports.findDestination = findDestination;
exports.requestGuidance = requestGuidance;
exports.setRPCHandler = setRPCHandler;
exports.setRequired = setRequired;

exports.serviceDesc = {
		api:'http://webinos.org/api/vehicle',
		displayName:'Vehicle API (Simulator)',
		description:'Provides data from the vehicle simulator.'
};

})(module.exports);
