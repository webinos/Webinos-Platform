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
* Copyright 2012 Samsung Electronics(UK) Ltd
******************************************************************************/
(function ()	{
"use strict";

	function logObj(obj, name)	{
		for (var myKey in obj)	{
			if (typeof obj[myKey] === 'object')
			{
				console.log(name + "["+myKey +"] = "+obj[myKey]);
				logObj(obj[myKey], name + "." + myKey);
			}
		}
	}

	/** Message fields:
	 *
	 * var message = {
	 * register: false    //register sender if true
	 * ,type: "JSONRPC"   // JSONRPC message or other
	 * ,id:   0           // messageid used to
	 * ,from:  null       // sender address
	 * ,to:    null       // reciever address
	 * ,resp_to:   null   // the destination to pass RPC result back to
	 * ,timestamp:  0     // currently this parameter is not used
	 * ,timeout:  null    // currently this parameter is not used
	 * ,payload:  null    // message body - RPC object
	 * };
	 */

	/** Address description:

	 * address format in current session Manager code - PZH/PZP/appid/instanceid
	 * address format defined in http://dev.webinos.org/redmine/projects/wp4/wiki/Entity_Naming_for_Messaging is:
	 * https://her_domain.com/webinos/other_user/urn:services-webinos-org:calender
	 *
	 * other_user@her_domain.com                        <-- name of user identity (PZH?)
	 *  |
	 * +-- laptop                                     <-- name of the PZP
	 *         |
	 *        +-- urn:services-webinos-org:calender    <-- service type
	 *              |
	 *              +-- A0B3
	 * other_user@her_domain.com/laptop/urn:services-webinos-org:calender/
	 * @param rpcHandler RPC handler manager.
	 */

	 /**
	 * MessageHandler constructor
	 *  @constructor
	 *  @param rpcHandler RPC handler manager.
	 */

	var MessageHandler = function (rpcHandler) {
		this.sendMsg = null;
		this.objectRef = null;

		this.ownId = null;
		this.separator = null;

		this.rpcHandler = rpcHandler;
		this.rpcHandler.setMessageHandler(this);

		/**
		 * To store the session id after registration. e.g. PZP registers with
		 * PZH, PZH creates a session id X for PZP. client[PZP->PZH] = X
		 *
		 *  TODO need to adjust clients[] to accommodate PZH farm, PZP farm scenarios
		 */
		this.clients = {};

		this.message = {};

		/**
		 * To Store callback functions associated with each message.
		 */
		this.messageCallbacks = {};
	};

	/**
	 * Set the sendMessage function that should be used to send message.
	 * Developers use this function to call different sendmessage APIs under
	 * different communication environment. e.g. in socket.io, the
	 * sendMessageFunction could be: io.sockets.send(sessionid);
	 * @param sendMessageFunction A function that used for sending messages.
	 */
	MessageHandler.prototype.setSendMessage = function (sendMessageFunction) {
		this.sendMsg = sendMessageFunction;
	};

	MessageHandler.prototype.sendMessage = function (message, sessionid, objectRef) {
		this.sendMsg(message, sessionid, objectRef);
	};

	/**
	 * To set the reference to different objects.
	 * @param objref A object reference to referring different PZH or PZP instances.
	 */
	MessageHandler.prototype.setObjectRef = function (objref) {
		this.objectRef = objref;
	};

	/**
	 * Function to get own identity.
	 * @param OwnIdGetter A function that used to get own identification.
	 */
	MessageHandler.prototype.setGetOwnId = function (OwnIdGetter) {
		this.ownId = OwnIdGetter;
	};

	/**
	 * Function to get own identity.
	 * @param
	 */
	MessageHandler.prototype.getOwnId = function () {
		return this.ownId;
	};


	/**
	 * Set separator used to in Addressing to separator different part of the address.
	 * e.g. PZH/PZP/APPID, "/" is the separator here
	 * @param sep The separator that used in address representation
	 */

	MessageHandler.prototype.setSeparator = function (sep) {
		this.separator = sep;
	};

	/**
	 *  Create new message. Refer Message fields above for more details.
	 *  @param options An array that contains elements to define fields in a message
	 */
	MessageHandler.prototype.createMessage = function (options) {
		var message = {};

		for (var i in options ) {
			message[i] = options[i];
		}
		return message;
	};

	/**
	 *  Create messageid. This messageid is used as an identifier for callback function associated
	 *  with the message.
	 *  @param message Message
	 *  @param successHandler Success handler
	 *  @param errorHandler	Error handler
	 */
	MessageHandler.prototype.createMessageId = function(message, successHandler, errorHandler) {
		message.id =  1 + Math.floor(Math.random() * 1024);
		if (errorHandler || successHandler)	{
			this.messageCallbacks[message.id] = {onError: errorHandler, onSuccess: successHandler};
		}
	};

	/**
	 *  Only need to call this once. This will result a sessionid in the receiver's storage.
	 *  @param from Message originator
	 *  @param to  Message destination
	 */
	MessageHandler.prototype.registerSender = function(from, to) {
		var options = {};
		options.register = true;
		options.to = to;
		options.from = from;
		options.type = "JSONRPC";
		options.payload = null;

		var message = this.createMessage(options);
		return message;
	};

	/**
	 *  Remove stored session route. This function is called once session is closed.
	 *  @param Message sender or fowarder
	 *  @param Message recipient
	 */
	MessageHandler.prototype.removeRoute = function (sender, receiver) {
		var session = [sender, receiver];
		session.join("->");
		if (this.clients[session]) {
			this.clients[session] = null;
		}
	};

	/**
	 * RPC writer - referto write function in  RPC
	 * @param rpc Message body
	 * @param respto Destination for rpc result to be sent to
	 * @param msgid Message id
	 */
	MessageHandler.prototype.write = function (rpc, respto, msgid) {
		//TODO calling write function from RPC does not allow to register call-backs yet

		//create response message
		var options = {};
		options.to = respto;
//	options.resp_to = respto; // used to be respto... FIXME
		options.resp_to = this.ownId; // used to be respto... FIXME
		options.from = this.ownId;

		if (!msgid) {
			msgid = 1 + Math.floor(Math.random() * 1024);
		}
		options.id = msgid;

		if (typeof rpc.jsonrpc !== "undefined") {
			options.type = "JSONRPC";
		}

		options.payload = rpc;
		var message = this.createMessage(options);

		if (message.to !== undefined) {
			var to = message.to;
			var session1 = [to, this.self];
			session1.join("->");
			var session2 = [this.self, to];
			session2.join("->");

			if ((!this.clients[session1]) && (!this.clients[session2]))  // not registered either way
			{
				console.log("MSGHANDLER:  session not set up");
				var occurences = (message.to.split(this.separator).length - 1);

				var data = message.to.split(this.separator);
				var id = data[0];
				var forwardto = data[0];

				for (var i = 1; i < occurences; i++)	{
					id = id + this.separator + data[i];
					var new_session1 = [id, this.self];
					new_session1.join("->");
					var new_session2 = [this.self, id];
					new_session2.join("->");

					if (this.clients[new_session1] || this.clients[new_session2]) {
						forwardto = id;
						console.log("MSGHANDLER:  forwardto", forwardto);
					}
				}
				if (forwardto === data[0]) {
					var s1 = [forwardto, this.self];
					s1.join("->");
					var s2 = [this.self, forwardto];
					s2.join("->");
					if (this.clients[s1] || this.clients[s2])
						forwardto = data[0];
					else
					{
						var own_addr = this.self.split(this.separator);
						var own_pzh = own_addr[0]
						if (forwardto !== own_pzh) {
							forwardto = own_pzh;
						}
					}
				}
				this.sendMsg(message, forwardto, this.objectRef);
			}
			else if (this.clients[session2]) {
				console.log("MSGHANDLER:  clients[session2]:" + this.clients[session2]);
				this.sendMsg(message, this.clients[session2], this.objectRef);
			}
			else if (this.clients[session1]) {
				console.log("MSGHANDLER:  clients[session1]:" + this.clients[session1]);
				this.sendMsg(message, this.clients[session1], this.objectRef);
			}
		}
	};


	/**
	 *  Handle message routing on receiving message. it does -
	 *  [1] Handle register message and create session path for newly registered party
	 *  [2] Forward messaging if not message destination
	 *  [3] Handle message  by calling RPC handler if it is message destination
	 *  @param message	Received message
	 *  @param sessionid session id
	 */
	MessageHandler.prototype.onMessageReceived = function (message, sessionid) {
		if (typeof message === "string") {
			try {
				message = JSON.parse(message);
			} catch (e) {
				console.log("JSON.parse (message) - error: "+ e.message);
			}
		}

		if (message.hasOwnProperty("register") && message.register) {
			var from = message.from;
			var to = message.to;
			if (to !== undefined) {
				var regid = [from, to];
				regid.join("->");

				//Register message to associate the address with session id
				if (message.from) {
					this.clients[regid] = message.from;
				}
				else if (sessionid) {
					this.clients[regid] = sessionid;
				}

				console.log("register Message");
			}
			return;
		}
		// check message destination
		else if (message.hasOwnProperty("to") && (message.to)) {
			this.self = this.ownId;

			//check if a session with destination has been stored
			if(message.to !== this.self) {
				console.log("forward Message");

				//if no session is available for the destination, forward to the hop nearest,
				//i.e A->D, if session for D is not reachable, check C, then check B if C is not reachable
				var to = message.to;
				var session1 = [to, this.self];
				session1.join("->");
				var session2 = [this.self, to];
				session2.join("->");

				// not registered either way
				if ((!this.clients[session1]) && (!this.clients[session2])) {
					logObj(message, "Sender, receiver not registered either way");
					//check occurances of separator used in addressing
					var occurences = (message.to.split(this.separator).length - 1);
					var data = message.to.split(this.separator);
					var id = data[0];
					var forwardto = data[0];

					//strip from right side
					for (var i = 1; i < occurences; i++) {
						id = id + this.separator + data[i];
						var new_session1 = [id, this.self];
						new_session1.join("->");
						var new_session2 = [this.self, id];
						new_session2.join("->");

						if (this.clients[new_session1] || this.clients[new_session2]) {
							forwardto = id;
						}
					}


					if (forwardto === data[0]) {
						var s1 = [forwardto, this.self];
						s1.join("->");
						var s2 = [this.self, forwardto];
						s2.join("->");
						if (this.clients[s1] || this.clients[s2])
							forwardto = data[0];
						else
						{
							var own_addr = this.self.split(this.separator);
							var own_pzh = own_addr[0]
							if (forwardto !== own_pzh) {
								forwardto = own_pzh;
							}
						}
					}
					console.log("message forward to:" + forwardto);
					this.sendMsg(message, forwardto, this.objectRef);
				}
				else if (this.clients[session2]) {
					this.sendMsg(message, this.clients[session2], this.objectRef);
				}
				else if (this.clients[session1]) {
					this.sendMsg(message, this.clients[session1], this.objectRef);
				}
				return;
			}
			//handle message on itself
			else {
				if (message.payload) {
					if(message.to != message.resp_to) {
						var from = message.from;
						var msgid = message.id;
						this.rpcHandler.handleMessage(message.payload, from, msgid);
					}
					else {
						if (typeof message.payload.method !== "undefined") {
							// FIXME: can we call rpc.handleMessage here without checking messageCallbacks[] for message.id?
							var from = message.from;
							var msgid = message.id;
							this.rpcHandler.handleMessage(message.payload, from, msgid);
						}
						else {
							if (typeof message.payload.result !== "undefined" || typeof message.payload.error !== "undefined") {
								this.rpcHandler.handleMessage(message.payload);
							}
						}

						if (this.messageCallbacks[message.id]) {
							this.messageCallbacks[message.id].onSuccess(message.payload.result);
						}
					}
				}
				else {
					// what other message type are we expecting?
				}
				return;
			}
			return;
		}
	};

	// TODO add fucntion to release clients[] when session is closed -> this will also affect RPC callback funcs

	/**
	 * Export messaging handler definitions for node.js
	 */
	if (typeof exports !== 'undefined') {
		exports.MessageHandler = MessageHandler;
	} else {
		// export for web browser
		this.MessageHandler = MessageHandler;
	}

}());
