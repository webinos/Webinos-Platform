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
* Copyright 2012 André Paul, Fraunhofer FOKUS
******************************************************************************/
(function() {

	/**
	 * Webinos Event service constructor (server side).
	 * @constructor
	 * @alias WebinosEventsModule
	 * @param rpcHandler A handler for functions that use RPC to deliver their result.  
	 */
	var WebinosEventsModule = function(rpcHandler) {
		// inherit from RPCWebinosService
		this.base = RPCWebinosService;
		this.base({
			api:'http://webinos.org/api/events',
			displayName:'Events API',
			description:'The events API for exchanging simple events between applications running on multiple or the same device.'
		});

		this.WebinosEvent = {};
		
		/**
		 * Sends an event.
		 * @param params Event payload.
		 * @param successCB Success callback.
		 * @param errorCB Error callback.
		 * @param objectRef RPC object reference.
		 */
		this.WebinosEvent.dispatchWebinosEvent = function(params, successCB, errorCB, objectRef) {
			//callbacks, referenceTimeout, sync
			console.log("dispatchWebinosEvent was invoked: Payload: " + params.webinosevent.payload + " Type: " + params.webinosevent.type + " from: " + params.webinosevent.addressing.source.id);

			var useEventCallbacks = params.withCallbacks ? true : false;
			console.log("WebinosEventCallbacks was defined: " + useEventCallbacks);

			var i,j;
			var foundDestination = false;

			console.log("Available Listeners:" + registeredListener.length);
			for (i = 0; i < registeredListener.length; i++){
				console.log("Listener@" + registeredListener[i].source + " listening on: " + registeredListener[i].type);
			}
			
			if (typeof params.webinosevent.addressing.to !== 'undefined'){
				for (i = 0; i < params.webinosevent.addressing.to.length; i++){
					console.log("Destination " + (i+1) + " " + params.webinosevent.addressing.to[i].id);
				}
			}


			//TODO, check conditions like type etc.
			//going through all registered subscribers and forward event
			for (i = 0; i < registeredListener.length; i++){
				console.log("Dispatch type: " + params.webinosevent.type + " vs listener type: " + registeredListener[i].type);
				
				
				//checking for registered type
				if (params.webinosevent.type != registeredListener[i].type){
					if (typeof registeredListener[i].type !== 'undefined' || registeredListener[i].type != null){ 
						continue;
					}
				}
				
				//checking for recipient
				if (typeof params.webinosevent.addressing.to !== 'undefined' && params.webinosevent.addressing.to.length > 0){
					for (j = 0; j < params.webinosevent.addressing.to.length; j++){
						console.log("Listener Source: " + registeredListener[i].source + " addressing id: " + params.webinosevent.addressing.to[j].id);
						
						
						if (registeredListener[i].source === params.webinosevent.addressing.to[j].id){
							//	forward event
								foundDestination = true;
								forwardEventMessage(registeredListener[i],params.webinosevent, params, useEventCallbacks, rpcHandler, objectRef);
						}
						
						if (!foundDestination && j != params.webinosevent.addressing.to.length-1){
							foundDestination = true;
							var outCBParams = {};
							outCBParams.event = params.webinosevent;
							outCBParams.recipient = params.webinosevent.addressing.to[j].id
							outCBParams.error = "An ERROR occured: Destination Not Registered";
							var cbjson = rpcHandler.createRPC(objectRef, "onError", outCBParams);
							rpcHandler.executeRPC(cbjson);
						}
					}
					
				}
				else{
					foundDestination = true;
					forwardEventMessage(registeredListener[i],params.webinosevent, params, useEventCallbacks, rpcHandler, objectRef);
				}
			}


			//if delivery notification is requested (callback is defined) and no recipient could be identified then send onError notification
			if (!foundDestination && useEventCallbacks){
				var outCBParams = {};
				outCBParams.event = params.webinosevent;
				outCBParams.error = "An ERROR occured: No listeners at all";
				var cbjson = rpcHandler.createRPC(objectRef, "onError", outCBParams);
				rpcHandler.executeRPC(cbjson);
			}
		};
	};
	
	function forwardEventMessage(listenerToInvoke, webinosevent, params, useEventCallbacks, rpcHandler, objectRef) {
		console.log("Sending to LISTENER: " + listenerToInvoke.source);


		//if delivery notification is requested (callback is defined) then send onSending notification
		if (useEventCallbacks){
			var outCBParams = {};
			outCBParams.event = webinosevent;
			outCBParams.recipient = listenerToInvoke.source;
			var cbjson = rpcHandler.createRPC(objectRef, "onSending", outCBParams);
			rpcHandler.executeRPC(cbjson);
		}

		console.log("Sending event to connected app " + listenerToInvoke.objectRef);

		
		var json = rpcHandler.createRPC(listenerToInvoke.objectRef, "handleEvent", params);
		
		var outParams = {};
		outParams.event = webinosevent;
		outParams.recipient = listenerToInvoke.source;
		rpcHandler.executeRPC(json, 
				getSuccessCB(rpcHandler,objectRef, outParams, useEventCallbacks),
				getErrorCB(rpcHandler,objectRef, outParams, useEventCallbacks)
		);
	}
	
	/**
	 * Create and return success calback for event delivery notification.
	 * @param rpcHandler The RPC handler.
	 * @param objectRef RPC object reference.
	 * @param params Callback params.
	 * @param useEventCallbacks Boolean indicating whether this callback shall be used.
	 * @private
	 */
	function getSuccessCB(rpcHandler, objectRef, params, useEventCallbacks) {
		var cbParams = params;
		function successCB() {  
			//	event was successfully delivered, so send delivery notification if requested
			console.log("Delivered Event successfully");
			if (useEventCallbacks){
				console.log("Sending onDelivery to " + objectRef.rpcId);
				var cbjson = rpcHandler.createRPC(objectRef, "onDelivery", cbParams);
				rpcHandler.executeRPC(cbjson);
			}
		}
		return successCB;  
	}  


	/**
	 * Create and return error calback for event delivery notification.
	 * @param rpcHandler The RPC handler.
	 * @param objectRef RPC object reference.
	 * @param params Callback params.
	 * @param useEventCallbacks Boolean indicating whether this callback shall be used.
	 * @private
	 */
	function getErrorCB(rpcHandler, objectRef, params, useEventCallbacks) {
		var cbParams = params;
		function errorCB() {  
			//event was not successfully delivered, so send error notification if requested
			console.log("Delivering Event not successful");
			if (useEventCallbacks){
				outCBParams.error = "Some ERROR";
				var cbjson = rpcHandler.createRPC(objectRef, "onError", outCBParams);
				rpcHandler.executeRPC(cbjson);
			}
		}
		return errorCB;  
	}  


	WebinosEventsModule.prototype = new RPCWebinosService;

	var registeredListener = [];
	var listenerCount = 0;

	/**
	 * Create a new event.
	 * 
	 * [not yet implemented]
	 */
	WebinosEventsModule.prototype.createWebinosEvent = function(params, successCB, errorCB, objectRef) {
		console.log("createWebinosEvent was invoked");
	};

	/**
	 * Registers an event listener.
	 * @param params Object expecting type field.
	 * @param ref Object expecting destination field.
	 */
	WebinosEventsModule.prototype.addWebinosEventListener = function(params, successCB, errorCB, objectRef) {
		
		
		console.log("addWebinosEventListener was invoked with params type: " + params.type + " source: " + params.source + " dest: " + params.destination);
		
		
		/*
		 * params attributes
	req.type = type;
	req.source = source;
	req.destination = destination;
	req.listenerID = listenerID;*/
		params.objectRef = objectRef;
		
		if (listenerCount == Number.MAX_VALUE) listenerCount = 0;
		params.listenerID = listenerCount++;
		registeredListener.push(params);
		
		
		console.log("Registered listener with id: " + params.listenerID);
		successCB(params.listenerID);
	};

	/**
	 * Unregisters an event listener.
	 * 
	 * [not yet implemented]
	 */
	WebinosEventsModule.prototype.removeWebinosEventListener = function(params, successCB, errorCB, objectRef) {
		console.log("removeWebinosEventListener was invoked: " + params);
		var idx = -1;
		for (i = 0; i < registeredListener.length; i++){
			
			console.log("Listener id: " + registeredListener[i].listenerID + " vs " + params);
			
			if (registeredListener[i].listenerID == params){
				idx = i;
				break;
			}
		}
		
		if (idx > -1){
			console.log("Removing listener: " + registeredListener[idx].type + " id: " + registeredListener[idx].listenerID);
			registeredListener.splice(idx,1);
		}
		
	};

	exports.Service = WebinosEventsModule;

})();
