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

	// Mapping of local listenerId to remote listenerId
	var registeredListeners = {};

	// Mapping of listenerId to RPC callback obj
	var registeredRPCCallbacks = {};

	var eventService = null;

	/**
	 * Webinos Event service constructor (client side).
	 * @constructor
	 * @param obj Object containing displayName, api, etc.
	 */
	EventsModule = function(obj) {
		this.base = WebinosService;
		this.base(obj);
		eventService = this;
		this.idCount = 0;
		//this.myAppID = "TestApp" + webinos.messageHandler.getOwnId();

		//TODO, this is the actuall messaging/session app id but should be replaced with the Apps unique ID (config.xml)
		this.myAppID = webinos.messageHandler.getOwnId();
		console.log("MyAppID: " + this.myAppID);
	};

	EventsModule.prototype = new WebinosService;

	/**
	 * To bind the service.
	 * @param bindCB BindCallback object.
	 */
	EventsModule.prototype.bind = function(bindCB) {

		if (typeof bindCB.onBind === 'function') {
			bindCB.onBind(this);
		};
		
	};

	/**
	 * Creates a webinos Event.
	 * @param type Event type identifier.
	 * @param addressing References to the sending entity on the behalf of which the application wants to create the event and to the event recipients.
	 * @param payload Event type-specific data or null (undefined is considered as equivalent to null).
	 * @param inResponseTo Event that this event is a response to (undefined is considered as equivalent to null).
	 * @param withTimeStamp Whether to set the generation timestamp (undefined is considered as equivalent to false).
	 * @param expiryTimeStamp Moment in time past which the event is no more valid or meaningful (undefined is considered as equivalent to null).
	 * @param addressingSensitive Whether the addressing information is part of the informative content of the event (undefined is considered as equivalent to false).
	 */
	EventsModule.prototype.createWebinosEvent = function (type, addressing, payload, inResponseTo, withTimeStamp, expiryTimeStamp, addressingSensitive){

		var anEvent = new WebinosEvent();
		anEvent.type = type;
		anEvent.addressing = addressing;
		anEvent.payload = payload;
		anEvent.inResponseTo = inResponseTo;
		anEvent.timeStamp = new Date().getTime();
		anEvent.expiryTimeStamp = expiryTimeStamp;
		anEvent.addressingSensitive = addressingSensitive;


		//  raises(WebinosEventException);
		//	returns WebinosEvent
		return anEvent;
	};

	/**
	 * Registers an event listener.
	 * @param listener The event listener.
	 * @param type Specific event type or null for any type (undefined is considered as null).
	 * @param source Specific event source or null for any source (undefined is considered as null).
	 * @param destination Specific event recipient (whether primary or not) or null for any destination (undefined is considered as null).
	 * @returns Listener identifier.
	 */
	EventsModule.prototype.addWebinosEventListener = function(listener, type, source, destination) {

		if (this.idCount === Number.MAX_VALUE) this.idCount = 0;
		this.idCount++;

		var listenerId = this.myAppID + ":" + this.idCount;

		var reqParams = {
			type: type,
			source: source,
			destination: destination
		};
		if (!source) reqParams.source = this.myAppID;

		var rpc = webinos.rpcHandler.createRPC(this, "addWebinosEventListener",  reqParams);

		rpc.handleEvent = function(params, scb, ecb) {
			console.log("Received a new WebinosEvent");
			listener(params.webinosevent);
			scb();
		};

		webinos.rpcHandler.registerCallbackObject(rpc);

		// store RPC callback obj to unregister it when removing event listener
		registeredRPCCallbacks[listenerId] = rpc;

		webinos.rpcHandler.executeRPC(rpc,
			function(remoteId) {
				console.log("New WebinosEvent listener registered. Mapping remote ID", remoteId, " localID ", listenerId);

				registeredListeners[listenerId] = remoteId;
			},
			function(error) {
				console.log("Error while registering new WebinosEvent listener");
			}
		);

		// raises(WebinosEventException);
		return listenerId;
	};

	/**
     * Unregisters an event listener.
     * @param listenerId Listener identifier as returned by addWebinosEventListener().
     */
	EventsModule.prototype.removeWebinosEventListener = function(listenerId) {

		if (!listenerId || typeof listenerId !== "string") {
			throw new WebinosEventException(WebinosEventException.INVALID_ARGUMENT_ERROR, "listenerId must be string type");
		}

		var rpc = webinos.rpcHandler.createRPC(this, "removeWebinosEventListener",  registeredListeners[listenerId]);
		webinos.rpcHandler.executeRPC(rpc);

		// unregister RPC callback obj
		webinos.rpcHandler.unregisterCallbackObject(registeredRPCCallbacks[listenerId]);
		registeredRPCCallbacks[listenerId] = undefined;
		registeredListeners[listenerId] = undefined;

		// returns void
	};

	/**
	 * Webinos event exception constructor.
	 * @constructor
	 * @param code Error code.
	 * @param message Descriptive error message.
	 */
	WebinosEventException = function(code, message) {
		this.code = code;
		this.message = message;
	};
	// constants
	WebinosEventException.__defineGetter__("INVALID_ARGUMENT_ERROR",  function() {return 1});
	WebinosEventException.__defineGetter__("PERMISSION_DENIED_ERROR", function() {return 2});

	/**
	 * Webinos Event constructor.
	 * @constructor
	 */
	WebinosEvent = function() {
		this.id =  Math.floor(Math.random()*1001);  //DOMString
		this.type = null;					//DOMString
		this.addressing = {};  			//WebinosEventAddressing
		this.addressing.source = eventService.myAppID;
		this.inResponseTo = null;			//WebinosEvent
		this.timeStamp = null;				//DOMTimeStamp
		this.expiryTimeStamp = null;		//DOMTimeStamp
		this.addressingSensitive = null;	//bool
		this.forwarding = null;			//WebinosEventAddressing
		this.forwardingTimeStamp = null;	//DOMTimeStamp
		this.payload = null;				//DOMString
	};

	/**
	 * Sends an event.
	 * @param callbacks Set of callbacks to monitor sending status (null and undefined are considered as equivalent to a WebinosEventCallbacks object with all attributes set to null).
	 * @param referenceTimeout Moment in time until which the Webinos runtime SHALL ensure that the WebinosEvent object being sent is not garbage collected for the purpose of receiving events in response to the event being sent (null, undefined and values up to the current date/time mean that no special action is taken by the runtime in this regard).
	 * @param sync If false or undefined, the function is non-blocking, otherwise if true it will block.
	 */
	WebinosEvent.prototype.dispatchWebinosEvent = function(callbacks, referenceTimeout, sync) {

		var params = {
			webinosevent: {
				id: this.id,
				type: this.type,
				addressing: this.addressing,
				inResponseTo: this.inResponseTo,
				timeStamp: this.timeStamp,
				expiryTimeStamp: this.expiryTimeStamp,
				addressingSensitive: this.addressingSensitive,
				forwarding: this.forwarding,
				forwardingTimeStamp: this.forwardingTimeStamp,
				payload: this.payload
			},
			referenceTimeout: referenceTimeout,
			sync: sync
		};

		if (!params.webinosevent.addressing) {
			params.webinosevent.addressing = {};
		}
		params.webinosevent.addressing.source = {};
		params.webinosevent.addressing.source.id = eventService.myAppID;

		// check that callbacks has the right type
		if (callbacks) {
			if (typeof callbacks !== "object") {
				throw new WebinosEventException(WebinosEventException.INVALID_ARGUMENT_ERROR, "callbacks must be of type WebinosEventCallbacks");
			}
			var cbNames = ["onSending", "onCaching", "onDelivery", "onTimeout", "onError"];
			for (var cbName in cbNames) {
				var cb = callbacks[cbName];
				if (cb && typeof cb !== "function") {
					throw new WebinosEventException(WebinosEventException.INVALID_ARGUMENT_ERROR, "cb is not a function");
				}
			}
			params.withCallbacks = true;
		}

		var rpc = webinos.rpcHandler.createRPC(eventService, "WebinosEvent.dispatchWebinosEvent", params);

		if (callbacks) {

			console.log("Registering delivery callback");

			rpc.onSending = function (params) {
				// params.event, params.recipient
				if (callbacks.onSending) {
					callbacks.onSending(params.event, params.recipient);
				}
			};
			rpc.onCaching = function (params) {
				// params.event
				if (callbacks.onCaching) {
					callbacks.onCaching(params.event);
				}
			};
			rpc.onDelivery = function (params) {
				// params.event, params.recipient
				if (callbacks.onDelivery) {
					callbacks.onDelivery(params.event, params.recipient);
				}
				webinos.rpcHandler.unregisterCallbackObject(rpc);
			};
			rpc.onTimeout = function (params) {
				// params.event, params.recipient
				if (callbacks.onTimeout) {
					callbacks.onTimeout(params.event, params.recipient);
				}
				webinos.rpcHandler.unregisterCallbackObject(rpc);
			};
			rpc.onError = function (params) {
				// params.event, params.recipient, params.error
				if (callbacks.onError) {
					callbacks.onError(params.event, params.recipient, params.error);
				}
				webinos.rpcHandler.unregisterCallbackObject(rpc);
			};

			webinos.rpcHandler.registerCallbackObject(rpc);
		}

		webinos.rpcHandler.executeRPC(rpc);

		//raises(WebinosEventException);
		//returns void
    };

	/**
	 * Forwards an event.
	 * [not yet implemented]
	 */
	WebinosEvent.prototype.forwardWebinosEvent = function(forwarding, withTimeStamp, callbacks, referenceTimeout, sync){

    	//returns void
    	//raises(WebinosEventException);
    };

}());
