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

// car info
var car = null;


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

function ParkSensorEvent(position, left, midLeft, midRight, right){
	this.position = position;
	this.left = left;
	this.midLeft = midLeft;
	this.midRight = midRight;
	this.right = right;
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
		vehicleDataHandler(generateGearEvent());
	  break;
	case "tripcomputer":
		vehicleDataHandler(generateTripComputerEvent());
	  break;
	case "parksensors-front":
		vehicleDataHandler(generateParkSensorsEvent(vehicleDataId[0]));
		break;
	case "parksensors-rear":
		vehicleDataHandler(generateParkSensorsEvent(vehicleDataId[0]));
		break;	
	case "destination-reached":
		vehicleDataHandler(generateNavigationReachedEvent(vehicleDataId[0]));
	  break;
	case "destination-changed":
		vehicleDataHandler(generateNavigationChangedEvent(vehicleDataId[0]));
	  break;
    case "destination-cancelled":
		vehicleDataHandler(generateNavigationCancelledEvent(vehicleDataId[0]));
	  break;
    case "climate-all":
		vehicleDataHandler(generateClimateControlallEvent(vehicleDataId[0]));
		break;
	case "climate-driver":
		vehicleDataHandler(generateClimateControldriverEvent(vehicleDataId[0]));
		break;		 
    case "climate-passenger-front":
		vehicleDataHandler(generateClimateControlfrontEvent(vehicleDataId[0]));
		break;
	case "climate-passenger-rear-left":
		vehicleDataHandler(generateClimateControlrearleftEvent(vehicleDataId[0]));
		break;
    case "climate-passenger-rear-right":
		vehicleDataHandler(generateClimateControlrearrightEvent(vehicleDataId[0]));
		break;	
    case "lights-fog-front":
		vehicleDataHandler(generateControlEvent(vehicleDataId[0]));
		break;
    case "lights-fog-rear":
		vehicleDataHandler(generateControlEvent(vehicleDataId[0]));
		break;	
    case "lights-signal-left":
		vehicleDataHandler(generateControlEvent(vehicleDataId[0]));
		break;		
    case "lights-signal-right":
		vehicleDataHandler(generateControlEvent(vehicleDataId[0]));
		break;
	case "lights-signal-warn":
		vehicleDataHandler(generateControlEvent(vehicleDataId[0]));
		break;
	case "lights-parking":
		vehicleDataHandler(generateControlEvent(vehicleDataId[0]));
		break;
	case "lights-hibeam":
		vehicleDataHandler(generateControlEvent(vehicleDataId[0]));
		break;
	case "lights-head":
		vehicleDataHandler(generateControlEvent(vehicleDataId[0]));
		break;
    case "wiper-front-wash":
		vehicleDataHandler(generateControlEvent(vehicleDataId[0]));
		break;
    case "wiper-rear-wash":
		vehicleDataHandler(generateControlEvent(vehicleDataId[0]));
		break;	
    case "wiper-automatic":
		vehicleDataHandler(generateControlEvent(vehicleDataId[0]));
		break;		
    case "wiper-front-once":
		vehicleDataHandler(generateControlEvent(vehicleDataId[0]));
		break;
	case "wiper-rear-once":
		vehicleDataHandler(generateControlEvent(vehicleDataId[0]));
		break;
	case "wiper-front-level1":
		vehicleDataHandler(generateControlEvent(vehicleDataId[0]));
		break;
	case "wiper-front-level2":
		vehicleDataHandler(generateControlEvent(vehicleDataId[0]));
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
					handleShiftEvents();		
				}			
				break;
			case "tripcomputer":
				objectRefs.push([objectRef.rpcId, 'tripcomputer']);
				if(!listeningToTripComputer){
					listeningToTripComputer = true;
					handleTripComputerEvents();						
				}
				break;
			case "parksensors-front":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToParkSensorsFront){
					listeningToParkSensorsFront = true;
					handleParkSensorsEvents(vehicleDataId);	
				}
				break;
			case "parksensors-rear":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToParkSensorsRear){
					listeningToParkSensorsRear = true;
					handleParkSensorsEvents(vehicleDataId);	
				}
				break;
            case "destination-reached":
				objectRefs.push([objectRef.rpcId, 'destination-reached']);
				if(!listeningToDestinationReached){
					listeningToDestinationReached = true;
					handleNavigationEvents(vehicleDataId);	
				}
				break;
			case "destination-changed":
				objectRefs.push([objectRef.rpcId, 'destination-changed']);
				if(!listeningToDestinationChanged){
					listeningToDestinationChanged = true;
					handleNavigationEvents(vehicleDataId);	
				}
				break;
			case "destination-cancelled":
				objectRefs.push([objectRef.rpcId, 'destination-cancelled']);
				if(!listeningToDestinationCancelled){
					listeningToDestinationCancelled = true;
					handleNavigationEvents(vehicleDataId);	
				}
				break;	
			case "climate-all":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToClimateControlAll){
					listeningToClimateControlAll = true;
					handleClimateControlEvents(vehicleDataId);	
				}
				break;
			case "climate-driver":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToClimateControlDriver){
					listeningToClimateControlDriver = true;
					handleClimateControlEvents(vehicleDataId);	
				}
				break;
			case "climate-passenger-front":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToClimateControlPassFront){
					listeningToClimateControlPassFront = true;
					handleClimateControlEvents(vehicleDataId);	
				}
				break;
			case "climate-passenger-rear-left":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToClimateControlPassRearLeft){
					listeningToClimateControlPassRearLeft = true;
					handleClimateControlEvents(vehicleDataId);	
				}
				break;
			case "climate-passenger-rear-right":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToClimateControlPassRearRight){
					listeningToClimateControlPassRearRight = true;
					handleClimateControlEvents(vehicleDataId);	
				}
				break;
			case "lights-fog-front":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToLightsFogFront){
					listeningToLightsFogRear = true;
					handleLightsWiperControlEvents(vehicleDataId);	
				}
				break;
			case "lights-fog-rear":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToLightsFogRear){
					listeningToLightsFogRear = true;
					handleLightsWiperControlEvents(vehicleDataId);	
				}
				break;
			case "lights-signal-left":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToLightsSignalLeft){
					listeningToLightsSignalLeft = true;
					handleLightsWiperControlEvents(vehicleDataId);	
				}
				break;
			case "lights-signal-right":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToLightsSignalRight){
					listeningToLightsSignalRight = true;
					handleLightsWiperControlEvents(vehicleDataId);	
				}
				break;
			case "lights-signal-warn":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToLightsSignalWarn){
					listeningToLightsSignalWarn = true;
					handleLightsWiperControlEvents(vehicleDataId);	
				}
				break;
			case "lights-parking":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToLightsParking){
					listeningToLightsParking = true;
					handleLightsWiperControlEvents(vehicleDataId);	
				}
				break;
			case "lights-hibeam":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToLightsHibeam){
					listeningToLightsHibeam = true;
					handleLightsWiperControlEvents(vehicleDataId);	
				}
				break;
			case "lights-head":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToLightsHead){
					listeningToLightsHead = true;
					handleLightsWiperControlEvents(vehicleDataId);	
				}
				break;
			case "wiper-front-wash":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToWiperFront){
					listeningToWiperFront = true;
					handleLightsWiperControlEvents(vehicleDataId);	
				}
				break;
			case "wiper-rear-wash":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToWiperRear){
					listeningToWiperRear = true;
					handleLightsWiperControlEvents(vehicleDataId);	
				}
				break;
			case "wiper-automatic":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToWiperAutomatic){
					listeningToWiperAutomatic = true;
					handleLightsWiperControlEvents(vehicleDataId);	
				}
				break;
			case "wiper-front-once":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToWiperFrontOnce){
					listeningToWiperFrontOnce = true;
					handleLightsWiperControlEvents(vehicleDataId);	
				}
				break;
			case "wiper-rear-once":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToWiperRearOnce){
					listeningToWiperRearOnce = true;
					handleLightsWiperControlEvents(vehicleDataId);	
				}
				break;
			case "wiper-front-level1":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToWiperFrontLevel1){
					listeningToWiperFrontLevel1 = true;
					handleLightsWiperControlEvents(vehicleDataId);	
				}
				break;
			case "wiper-front-level2":
				objectRefs.push([objectRef.rpcId, vehicleDataId]);
				if(!listeningToWiperFrontLevel2){
					listeningToWiperFrontLevel2 = true;
					handleLightsWiperControlEvents(vehicleDataId);	
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
		switch(arguments[1]){
			case "shift":
				listeningToGear = false;
				console.log('disabling shift - event generation');
				break;
			case "tripcomputer":
				listeningToTripComputer = false;
				console.log('disabling tripcomputer event generation');
				break;
			case "parksensors-front":
				listeningToParkSensorsFront = false;
				console.log('disabling ps front event generation');
				break;
			case "parksensors-rear":
				listeningToParkSensorsFront = false;
				console.log('disabling ps rear event generation');
				break;	
            case "destination-reached":
				listeningToDestinationReached = false;
				console.log('disabling Navigation Event - Destination reached generation');				
				break;
			case "destination-changed":
				listeningToDestinationChanged = false;
				console.log('disabling Navigation Event - Destination Changed generation');				
				break;
            case "destination-cancelled":
				listeningToDestinationCancelled = false;
				console.log('disabling Navigation Event - Destination Cancelled generation');				
				break;
			case "climate-all":
				listeningToClimateControlAll = false;
				console.log('disabling Climate All event generation');				
				break;
			case "climate-driver":
				listeningToClimateControlDriver = false;
				console.log('disabling Climate Driver event generation');				
				break;
			case "climate-passenger-front":
				listeningToClimateControlPassFront = false;
				console.log('disabling Climate Passenger Front event generation');				
				break;	
            case "climate-passenger-rear-left":
				listeningToClimateControlPassRearLeft = false;
				console.log('disabling Climate Passenger rear left event generation');				
				break;	
            case "climate-passenger-rear-right":
				listeningToClimateControlPassRearRight = false;
				console.log('disabling Climate Passenger rear right event generation');				
				break;		
            case "lights-fog-front":
				listeningToLightsFogFront = false;
				console.log('disabling Lights Fog Front event generation');				
				break;
			case "lights-fog-rear":
				listeningToLightsFogRear = false;
				console.log('disabling Lights Fog Rear event generation');				
				break;
			case "lights-signal-left":
				listeningToLightsSignalLeft = false;
				console.log('disabling Signal Left event generation');				
				break;	
			case "lights-signal-right":
				listeningToLightsSignalRight = false;
				console.log('disabling Signal Right event generation');				
				break;	
            case "lights-signal-warn":
				listeningToLightsSignalWarn = false;
				console.log('disabling Lights Signal Warn left event generation');				
				break;	
            case "lights-parking":
				listeningToLightsParking = false;
				console.log('disabling Lights Parking event generation');				
				break;
			case "lights-hibeam":
				listeningToLightsHibeam = false;
				console.log('disabling Lights Hibeam event generation');				
				break;
            case "lights-head":
				listeningToLightsHead = false;
				console.log('disabling Lights Head event generation');				
				break;
            case "wiper-front-wash":
				listeningToWiperFront = false;
				console.log('disabling Wiper Front Wash event generation');				
				break;
			case "wiper-rear-wash":
				listeningToWiperRear = false;
				console.log('disabling Wiper Rear Wash event generation');				
				break;
			case "wiper-automatic":
				listeningToWiperAutomatic = false;
				console.log('disabling Wiper Automatic event generation');				
				break;	
			case "wiper-front-once":
				listeningToWiperFront = false;
				console.log('disabling Wiper Front event generation');				
				break;	
            case "wiper-rear-once":
				listeningToWiperRear = false;
				console.log('disabling Wiper Rear event generation');				
				break;	
            case "wiper-front-level1":
				listeningToWiperFrontLevel1 = false;
				console.log('disabling Wiper Level1 event generation');				
				break;
			case "wiper-front-level2":
				listeningToWiperFrontLevel2 = false;
				console.log('disabling Wiper Front Level2 event generation');				
				break;				
			default:
				console.log("nothing found");
		
		}
	}
}


/*handleShiftEvents*/
function handleShiftEvents(){
  		var shiftE = generateGearEvent();
        var randomTime = Math.floor(Math.random()*1000*10);
        console.log("random Gear:" + shiftE.gear);
        console.log("random Time:" + randomTime);
        var json = null;
        for(i = 0; i < objectRefs.length; i++){
			
				if(objectRefs[i][1] == "shift"){
                	json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", shiftE);
                 	rpcHandler.executeRPC(json);
				}
        }
        if(listeningToGear){
                setTimeout(function(){ handleShiftEvents(); }, randomTime);        
        }
}



/*handleTripComputerEvents*/
function handleTripComputerEvents(){
		var tcEvent = generateTripComputerEvent();
	    var randomTime = Math.floor(Math.random()*1000*10);
		console.log("random tcData:" + tcEvent);
        console.log("random Time:" + randomTime);
        var json = null;
        for(i = 0; i < objectRefs.length; i++){
				if(objectRefs[i][1] == "tripcomputer"){
                	json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", tcEvent);
                 	rpcHandler.executeRPC(json);
				}
        }
        if(listeningToTripComputer){
                setTimeout(function(){ handleTripComputerEvents(); }, randomTime);        
        }
}

/*handleParkSensorsEvent*/
function handleParkSensorsEvents(position){
	var randomTime = Math.floor(Math.random()*1000*10);
	for(i = 0; i < objectRefs.length; i++){
			if(objectRefs[i][1] == "parksensors-front"){
                	var psEvent = generateParkSensorsEvent(position);
					json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", psEvent);
                 	rpcHandler.executeRPC(json);
			}
			if(objectRefs[i][1] == "parksensors-rear"){
                	var psEvent = generateParkSensorsEvent(position);
					json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", psEvent);
                 	rpcHandler.executeRPC(json);
			}
    }
	if(listeningToParkSensorsFront || listeningToParkSensorsRear){
		setTimeout(function(){ handleParkSensorsEvents(position); }, randomTime);  
	}
}


/*generateParkSensorsEvent*/
function generateParkSensorsEvent(position){
	return new ParkSensorEvent(position, Math.floor(Math.random()*255), Math.floor(Math.random()*255), Math.floor(Math.random()*255), Math.floor(Math.random()*255));
}

/*generateGearEvent*/
function generateGearEvent(){
    var randomGear = Math.floor(Math.random()*7);
    return new ShiftEvent(randomGear);        
}

/*generateTripComputerEvent*/

var mileage = 50123;
var range = 233;	

function generateTripComputerEvent(){
	mileage++;
	range--
	//avgCon1, avgCon2, avgSpeed1, avgSpeed2, tripdistance, mileage, range
	return new TripComputerEvent(5.9, 5.6, 100.5, 122.2, 234.5, mileage, range);
}

/*Navigation Events - Destination Reached, Changed and Cancelled*/
function handleNavigationEvents(destinationId){
	    var randomTime = Math.floor(Math.random()*1000*10);
	//	console.log("random drData1:" + drEvent);
        console.log("random Time:" + randomTime);
     //   var json = null;
        for(i = 0; i < objectRefs.length; i++){
				if(objectRefs[i][1] == "destination-reached"){
					var drEvent = generateNavigationReachedEvent(destinationId);          	
					if(drEvent != null){
						json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", drEvent);
						console.log("random drData:" + drEvent.name);
						rpcHandler.executeRPC(json);	
					}
				}
				if(objectRefs[i][1] == "destination-changed"){
				var drEvent = generateNavigationChangedEvent(destinationId);
                	json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", drEvent);
					console.log("random drData:" + drEvent.name);
                 	rpcHandler.executeRPC(json);
				}
				if(objectRefs[i][1] == "destination-cancelled"){	
				destinationid = "destination-cancelled";
				var drEvent = generateNavigationCancelledEvent(destinationId);
                	json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", drEvent);
					console.log("random drData:" + drEvent);		
                 	rpcHandler.executeRPC(json);
				}
        }
        if(listeningToDestinationReached || listeningToDestinationChanged || listeningToDestinationCancelled){
                setTimeout(function(){ handleNavigationEvents(destinationId); }, randomTime);        
        } 
}

//setting the target destination
var destinations =new Array();
destinations.push({name:"BMW AG", address : {country: "DE", region: "Bayern", county: "Bayern", city: "Munich", street: "Petuelring", streetNumber: "130", premises: "Carparking", additionalInformation: "near to OEZ", postalCode: "80788"}});
destinations.push({name:"BMW Forschung und Technik", address : {country: "DE", region: "Bayern", county: "Bayern", city: "Munich", street: "Hanauer Strasse", streetNumber: "46", premises: "Carparking", additionalInformation: "near to OEZ", postalCode: "80992"}});
destinations.push({name:"BMW", address : {country: "DE", region: "Bayern", county: "Bayern", city: "Munich", street: "Petuelring", streetNumber: "130", premises: "Carparking", additionalInformation: "near to OEZ", postalCode: "80788"}});
destinations.push({name:"BMW AG", address : {country: "DE", region: "Bayern", county: "Bayern", city: "Munich", street: "Petuelring", streetNumber: "130", premises: "Carparking", additionalInformation: "near to OEZ", postalCode: "80788"}});

//list of destinations assigned - for the moment 2 destinations listed
var destination =new Array();
destination.push({name:"BMW AG", address : {country: "DE", region: "Bayern", county: "Bayern", city: "Munich", street: "Petuelring", streetNumber: "130", premises: "Carparking", additionalInformation: "near to OEZ", postalCode: "80788"}});
destination.push({name:"BMW Forschung und Technik", address : {country: "DE", region: "Bayern", county: "Bayern", city: "Munich", street: "Hanauer Strasse", streetNumber: "46", premises: "Carparking", additionalInformation: "near to OEZ", postalCode: "80992"}});
	
function generateNavigationReachedEvent(destinationId){
		
		random1 = Math.floor(Math.random()*destinations.length);
		random2 = Math.floor(Math.random()*destination.length);
		
		if (destinations[random1].name == destination[random2].name) {
              console.log("Reached the Desired Destination");
			  return new NavigationEvent(destinationId, destinations[random1].address);
		}else{
		//	return null;
		    var destinationId_NotReached = "Desired Destination Not Reached";
			console.log("Desired Destination Not Reached");
			return new NavigationEvent(destinationId_NotReached);
		}
}

function generateNavigationChangedEvent(destinationId){

        random1 = Math.floor(Math.random()*destinations.length);
		random2 = Math.floor(Math.random()*destinations.length);
		
		if (destinations[random1].name == destinations[random2].name) {
              console.log("Destination Changed");
			  return new NavigationEvent(destinationId, destinations[random2].address);
		}else{
		//	return null;
		    var destinationId_NotReached = "Desired Destination Not Reached";
			console.log("Desired Destination Not Reached");
			return new NavigationEvent(destinationId_NotReached);
		}
}		
	
function generateNavigationCancelledEvent(destinationId){
		var j=0;
        var i=1;		 
		 if (destinations[j].name == destination[i].name) {
              console.log("Destination Cancelled");
			  return new NavigationEvent(destinationId,destination[i].name,destination[i].address.country,destination[i].address.region,destination[i].address.county,destination[i].address.city,destination[i].address.street,destination[i].address.streetNumber,destination[i].address.premises,destination[i].address.additionalInformation,destination[i].address.postalCode);
        }	  
		else {
                console.log("Destination is Cancelled or Not Found");
				return new NavigationEvent(destinationId);
        }
}

// Climate All, Climate Driver, Climate Passenger Front, Climate Passenger Rear Left, Climate Passenger Rear Right

function handleClimateControlEvents(zone){
	var randomTime = Math.floor(Math.random()*1000*10);
        console.log("random Time:" + randomTime);
	for(i = 0; i < objectRefs.length; i++){
			if(objectRefs[i][1] == "climate-all"){
                	var ccEvent = generateClimateControlallEvent(zone);
					json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", ccEvent);
					console.log("random ccData:" + ccEvent.ventLevel);
                 	rpcHandler.executeRPC(json);
			}
			if(objectRefs[i][1] == "climate-driver"){
                	var cc1Event = generateClimateControldriverEvent(zone);
					json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", cc1Event);
					console.log("random ccData:" + cc1Event.ventLevel);
                 	rpcHandler.executeRPC(json);
			}
			if(objectRefs[i][1] == "climate-passenger-front"){
                	var cc2Event = generateClimateControlfrontEvent(zone);
					json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", cc2Event);
					console.log("random ccData:" + cc2Event.ventLevel);
                 	rpcHandler.executeRPC(json);
			}
			if(objectRefs[i][1] == "climate-passenger-rear-left"){
                	var cc3Event = generateClimateControlrearleftEvent(zone);
					json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", cc3Event);
					console.log("random ccData:" + cc3Event.ventLevel);
                 	rpcHandler.executeRPC(json);
			}
			if(objectRefs[i][1] == "climate-passenger-rear-right"){
                	var cc4Event = generateClimateControlrearrightEvent(zone);
					json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", cc4Event);
					console.log("random ccData:" + cc4Event.ventLevel);
                 	rpcHandler.executeRPC(json);
			}
    }
	if(listeningToClimateControlAll || listeningToClimateControlDriver || listeningToClimateControlPassFront || listeningToClimateControlPassRearLeft || listeningToClimateControlPassRearRight){
		setTimeout(function(){ handleClimateControlEvents(zone); }, randomTime);  
	}
}
	
 function generateClimateControlallEvent(zone){
                var desiredTemperatureall = Math.floor(Math.random()*22);
				var acstatus = Math.round(Math.random()*true); 
	            var ventMode = Math.round(Math.random()*true);   
                var ventLevel = Math.floor(Math.random()*10);
				if (desiredTemperatureall > 16 && acstatus == 0 && ventMode == 0){
                console.log(zone + " desired temperature is " + desiredTemperatureall);   
                return new ClimateControlEvent(zone, desiredTemperatureall, acstatus, ventLevel, ventMode);
                }else{
		        var ControlEvent = "Not a desired setting";
			    console.log("Not a desired setting");
			    return new ClimateControlEvent(ControlEvent, desiredTemperatureall, acstatus, ventLevel, ventMode);
		}				
        } 
		
 function generateClimateControldriverEvent(zone){
                var desiredTemperaturedriver =  Math.floor(Math.random()*20);
				var acstatus = Math.round(Math.random()*true); 
	            var ventMode = Math.round(Math.random()*true);   
                var ventLevel = Math.floor(Math.random()*10);
                if (desiredTemperaturedriver > 16 && acstatus == 0 && ventMode == 0){
                console.log(zone + " desired temperature is " + desiredTemperaturedriver);   
                return new ClimateControlEvent(zone, desiredTemperaturedriver, acstatus, ventLevel, ventMode);
                }else{
		        var ControlEvent = "Not a desired setting";
			    console.log("Not a desired setting");
			    return new ClimateControlEvent(ControlEvent, desiredTemperaturedriver, acstatus, ventLevel, ventMode);
		}							
        } 

function generateClimateControlfrontEvent(zone){
				var desiredTemperaturefront =  Math.floor(Math.random()*21);
				var acstatus = Math.round(Math.random()*true); 
	            var ventMode = Math.round(Math.random()*true);   
                var ventLevel = Math.floor(Math.random()*10);
                if (desiredTemperaturefront > 16 && acstatus == 0 && ventMode == 0){
                console.log(zone + " desired temperature is " + desiredTemperaturefront);   
                return new ClimateControlEvent(zone, desiredTemperaturefront, acstatus, ventLevel, ventMode);
                }else{
		        var ControlEvent = "Not a desired setting";
			    console.log("Not a desired setting");
			    return new ClimateControlEvent(ControlEvent, desiredTemperaturefront, acstatus, ventLevel, ventMode);
		}							
        } 

function generateClimateControlrearleftEvent(zone){
                var desiredTemperaturerearleft =  Math.floor(Math.random()*23);
				var acstatus = Math.round(Math.random()*true); 
	            var ventMode = Math.round(Math.random()*true);   
                var ventLevel = Math.floor(Math.random()*10);
                if (desiredTemperaturerearleft > 16 && acstatus == 0 && ventMode == 0){
                console.log(zone + " desired temperature is " + desiredTemperaturerearleft);   
                return new ClimateControlEvent(zone, desiredTemperaturefront, acstatus, ventLevel, ventMode);
                }else{
		        var ControlEvent = "Not a desired setting";
			    console.log("Not a desired setting");
			    return new ClimateControlEvent(ControlEvent, desiredTemperaturerearleft, acstatus, ventLevel, ventMode);
		}								
        } 

function generateClimateControlrearrightEvent(zone){
                var desiredTemperaturerearright =  Math.floor(Math.random()*23);
				var acstatus = Math.round(Math.random()*true); 
	            var ventMode = Math.round(Math.random()*true);   
                var ventLevel = Math.floor(Math.random()*10);
                if (desiredTemperaturerearright > 16 && acstatus == 0 && ventMode == 0){
                console.log(zone + " desired temperature is " + desiredTemperaturerearright);   
                return new ClimateControlEvent(zone, desiredTemperaturerearright, acstatus, ventLevel, ventMode);
                }else{
		        var ControlEvent = "Not a desired setting";
			    console.log("Not a desired setting");
			    return new ClimateControlEvent(ControlEvent, desiredTemperaturerearright, acstatus, ventLevel, ventMode);
		}								
        } 

// Lights - Fog Front, Rear, Hibeam, Signal Right, Warn, Head, Wiper - Front wash, Rear wash, Automatic, Front Once, Rear Once, Front Level1, Front Level2 

function handleLightsWiperControlEvents(controlId){
	var randomTime = Math.floor(Math.random()*1000*10);
        console.log("random Time:" + randomTime);
	for(i = 0; i < objectRefs.length; i++){
			if(objectRefs[i][1] == "lights-fog-front"){
                	var lcEvent = generateControlEvent(controlId);
					json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", lcEvent);
					console.log("random lcData:" + lcEvent.active);
                 	rpcHandler.executeRPC(json);
			}
			if(objectRefs[i][1] == "lights-fog-rear"){
                	var lcEvent = generateControlEvent(controlId);
					json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", lcEvent);
					console.log("random lcData:" + lcEvent.active);
                 	rpcHandler.executeRPC(json);
			}
			if(objectRefs[i][1] == "lights-signal-left"){
                	var lcEvent = generateControlEvent(controlId);
					json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", lcEvent);
					console.log("random lcData:" + lcEvent.active);
                 	rpcHandler.executeRPC(json);
			}
			if(objectRefs[i][1] == "lights-signal-right"){
                	var lcEvent = generateControlEvent(controlId);
					json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", lcEvent);
					console.log("random lcData:" + lcEvent.active);
                 	rpcHandler.executeRPC(json);
			}
			if(objectRefs[i][1] == "lights-signal-warn"){
                	var lcEvent = generateControlEvent(controlId);
					json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", lcEvent);
					console.log("random lcData:" + lcEvent.active);
                 	rpcHandler.executeRPC(json);
			}
			if(objectRefs[i][1] == "lights-parking"){
                	var lcEvent = generateControlEvent(controlId);
					json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", lcEvent);
					console.log("random lcData:" + lcEvent.active);
                 	rpcHandler.executeRPC(json);
			}
			if(objectRefs[i][1] == "light-Hibeam"){
                	var lcEvent = generateControlEvent(controlId);
					json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", lcEvent);
					console.log("random lcData:" + lcEvent.active);
                 	rpcHandler.executeRPC(json);
			}
			if(objectRefs[i][1] == "lights-Head"){
                	var lcEvent = generateControlEvent(controlId);
					json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", lcEvent);
					console.log("random lcData:" + lcEvent.active);
                 	rpcHandler.executeRPC(json);
			}
			if(objectRefs[i][1] == "wiper-front-wash"){
                	var wcEvent = generateControlEvent(controlId);
					json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", wcEvent);
					console.log("random wcData:" + wcEvent.active);
                 	rpcHandler.executeRPC(json);
			}
			if(objectRefs[i][1] == "wiper-rear-wash"){
                	var wcEvent = generateControlEvent(controlId);
					json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", wcEvent);
					console.log("random wcData:" + wcEvent.active);
                 	rpcHandler.executeRPC(json);
			}
			if(objectRefs[i][1] == "wiper-automatic"){
                	var wcEvent = generateControlEvent(controlId);
					json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", wcEvent);
					console.log("random wcData:" + wcEvent.active);
                 	rpcHandler.executeRPC(json);
			}
			if(objectRefs[i][1] == "wiper-front-once"){
                	var wcEvent = generateControlEvent(controlId);
					json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", wcEvent);
					console.log("random wcData:" + wcEvent.active);
                 	rpcHandler.executeRPC(json);
			}
			if(objectRefs[i][1] == "wiper-rear-once"){
                	var wcEvent = generateControlEvent(controlId);
					json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", wcEvent);
					console.log("random wcData:" + wcEvent.active);
                 	rpcHandler.executeRPC(json);
			}
			if(objectRefs[i][1] == "wiper-front-level1"){
                	var wcEvent = generateControlEvent(controlId);
					json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", wcEvent);
					console.log("random wcData:" + wcEvent.active);
                 	rpcHandler.executeRPC(json);
			}
			if(objectRefs[i][1] == "wiper-front-level2"){
                	var wcEvent = generateControlEvent(controlId);
					json = rpcHandler.createRPC(objectRefs[i][0], "onEvent", wcEvent);
					console.log("random wcData:" + wcEvent.active);
                 	rpcHandler.executeRPC(json);
			}
    }
	if(listeningToLightsFogFront || listeningToLightsFogRear || listeningToLightsSignalLeft || listeningToLightsSignalRight || listeningToLightsSignalWarn || listeningToLightsParking || listeningToLightsHibeam || listeningToLightsHead || listeningToWiperFront || listeningToWiperRear || listeningToWiperAutomatic || listeningToWiperFrontOnce || listeningToWiperRearOnce || listeningToWiperFrontLeve1 || listeningToWiperRearLevel2){
		setTimeout(function(){ handleLightsWiperControlEvents(controlId); }, randomTime);  
	}
}

function generateControlEvent(controlId){
			var active = Math.round(Math.random()*true);
			//var lcEvent; //    if(cEvent.controlId == "lights-hibeam"){
                        if(active == 0){
                            console.log("Turned ON");
							return new ControlEvent(controlId,active);	
                     }else{
                            console.log("Turned OFF");
							return new ControlEvent(controlId,active);	
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


function setRPCHandler(rpcHdlr) {
	rpcHandler = rpcHdlr;
}

function setRequired(obj) {
	car = obj;
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
		displayName:'Vehicle API (fake data)',
		description:'Provides faked vehicle data'
};

})(module.exports);
