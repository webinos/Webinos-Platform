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
* Copyright 2012 Ziran Sun, Samsung Electronics(UK) Ltd
******************************************************************************/
(function ()	{
"use strict";
  var logger = console;
  if (typeof module !== "undefined") {
    var webinos_= require("find-dependencies")(__dirname);
    logger  = webinos_.global.require(webinos_.global.util.location, "lib/logging.js")(__filename);
  }
	function logObj(obj, name)	{
		for (var myKey in obj)	{
			if (typeof obj[myKey] === 'object')
			{
				logger.log(name + "["+myKey +"] = "+JSON.stringify(obj[myKey]));
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
	 */

	/**
	 * MessageHandler constructor
	 *  @constructor
	 *  @param rpcHandler RPC handler manager.
	 */
	var MessageHandler = function (rpcHandler) {
		this.sendMsg = null;

		this.ownSessionId = null;
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

	/**
	 * Function to set own session identity.
	 * @param ownSessionId pz session id
	 */
	MessageHandler.prototype.setOwnSessionId = function (ownSessionId) {
		this.ownSessionId = ownSessionId;
	};

	/**
	 * Function to get own session identity.
	 */
	MessageHandler.prototype.getOwnSessionId = function () {
		return this.ownSessionId;
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
	 *  Create a register message.
	 *  Use the created message to send it to an entity, this will setup a session
	 *  on the receiver side. The receiver will then route messages to the
	 *  sender of this message.
	 *  @param from Message originator
	 *  @param to  Message destination
	 */
	MessageHandler.prototype.createRegisterMessage = function(from, to) {
		logger.log('creating register msg to send from ' + from + ' to ' + to);
		if (from === to) throw new Error('cannot create register msg to itself');

		var msg = {
			register: true,
			to: to,
			from: from,
			type: 'JSONRPC',
			payload: null
		};

		return msg;
	};

	/**
	 *  Remove stored session route. This function is called once session is closed.
	 *  @param sender Message sender or forwarder
	 *  @param receiver Message receiver
	 */
	MessageHandler.prototype.removeRoute = function (sender, receiver) {
		var session = [sender, receiver].join("->");
		if (this.clients[session]) {
			delete this.clients[session];
		}
	};

	/**
	 * Returns true if msg is a msg for app on wrt connected to this pzp.
	 */
	function isLocalAppMsg(msg) {
		if (/(?:\/[a-f0-9]+){2,}/.exec(msg.to) // must include /$id/$otherid to be wrt
				&& /\//.exec(this.ownSessionId) // must include "/" to be pzp
				&& msg.to.substr(0, this.ownSessionId.length) === this.ownSessionId) {
			return true;
		}
		return false;
	}

	/**
	 * Somehow finds out the PZH address and returns it?
	 */
	function getPzhAddr(message) {
		// check occurances of separator used in addressing
		var data = message.to.split(this.separator);
		var occurences = data.length - 1;
		var id = data[0];
		var forwardto = data[0];

		// strip from right side
		for (var i = 1; i < occurences; i++) {
			id = id + this.separator + data[i];
			var new_session1 = [id, this.ownSessionId].join("->");
			var new_session2 = [this.ownSessionId, id].join("->");

			if (this.clients[new_session1] || this.clients[new_session2]) {
				forwardto = id;
			}
		}

		if (forwardto === data[0]) {
			var s1 = [forwardto, this.ownSessionId].join("->");
			var s2 = [this.ownSessionId, forwardto].join("->");
			if (this.clients[s1] || this.clients[s2])
				forwardto = data[0];
			else
			{
				var own_addr = this.ownSessionId.split(this.separator);
				var own_pzh = own_addr[0]
				if (forwardto !== own_pzh) {
					forwardto = own_pzh;
				}
			}
		}
		return forwardto;
	}

	/**
	 * RPC writer - referto write function in  RPC
	 * @param rpc Message body
	 * @param to Destination for rpc result to be sent to
	 * @param msgid Message id
	 */
	MessageHandler.prototype.write = function (rpc, to, msgid) {
		if (!to) throw new Error('to is missing, cannot send message');

		var message = {
			to: to,
			resp_to: this.ownSessionId,
			from: this.ownSessionId
		};

		if (!msgid) {
			msgid = 1 + Math.floor(Math.random() * 1024);
		}
		message.id = msgid;

		if (typeof rpc.jsonrpc !== "undefined") {
			message.type = "JSONRPC";
		}

		message.payload = rpc;

		var session1 = [to, this.ownSessionId].join("->");
		var session2 = [this.ownSessionId, to].join("->");

		if ((!this.clients[session1]) && (!this.clients[session2])) { // not registered either way
			logger.log("session not set up");
			var forwardto = getPzhAddr.call(this, message);

			if (isLocalAppMsg.call(this, message)) {
				// msg from this pzp to wrt previously connected to this pzp
				console.log('drop message, wrt disconnected');
				return;
			}

			logger.log("message forward to:" + forwardto);
			this.sendMsg(message, forwardto);
		}
		else if (this.clients[session2]) {
			logger.log("clients[session2]:" + this.clients[session2]);
			this.sendMsg(message, this.clients[session2]);
		}
		else if (this.clients[session1]) {
			logger.log("clients[session1]:" + this.clients[session1]);
			this.sendMsg(message, this.clients[session1]);
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
				log.error("JSON.parse (message) - error: "+ e.message);
			}
		}

		if (message.hasOwnProperty("register") && message.register) {
			var from = message.from;
			var to = message.to;
			if (to !== undefined) {
				var regid = [from, to].join("->");

				//Register message to associate the address with session id
				if (message.from) {
					this.clients[regid] = message.from;
				}
				else if (sessionid) {
					this.clients[regid] = sessionid;
				}

				logger.log("register Message");
			}
			return;
		}
		// check message destination
		else if (message.hasOwnProperty("to") && (message.to)) {

			//check if a session with destination has been stored
			if(message.to !== this.ownSessionId) {
				logger.log("forward Message");

				//if no session is available for the destination, forward to the hop nearest,
				//i.e A->D, if session for D is not reachable, check C, then check B if C is not reachable
				var to = message.to;
				var session1 = [to, this.ownSessionId].join("->");
				var session2 = [this.ownSessionId, to].join("->");

				// not registered either way
				if ((!this.clients[session1]) && (!this.clients[session2])) {
					logObj(message, "Sender, receiver not registered either way");
					var forwardto = getPzhAddr.call(this, message);

					if (isLocalAppMsg.call(this, message)) {
						// msg from other pzp to wrt previously connected to this pzp
						console.log('drop message, wrt disconnected');
						return;
					}

					logger.log("message forward to:" + forwardto);
					this.sendMsg(message, forwardto);
				}
				else if (this.clients[session2]) {
					this.sendMsg(message, this.clients[session2]);
				}
				else if (this.clients[session1]) {
					this.sendMsg(message, this.clients[session1]);
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
		window.MessageHandler = MessageHandler;
	}

}());
