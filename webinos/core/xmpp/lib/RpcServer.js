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
*******************************************************************************/

/**
 * Author: Eelco Cramer, TNO
 */

(function() {
 	"use strict";
    var http = require("http");
    var url = require("url");
    var path = require("path");
    var fs = require("fs");
    var uuid = require('node-uuid');
    var logger = require('./Logger').getLogger('RpcServer', 'verbose');
    var rpcHandler;

    /**
     * Configures the RPC server
     * @function
     * @param wss The web socket server that is used to connect to the RPC server.
     * @param rpcHandler The rpc handler instance.
     * @param pzhConnection The connection to the PZH
     */
    function configure(wss, rpcHandler, pzhConnection) {
    	wss.on("connect", function(wsConnection) {
            logger.info("connection accepted.");
      
            var pzh = pzhConnection.getJID().split("/")[0];
            var applicationId = uuid.v1();

            /**
             * Returns register message
             * @function
             * @private
             * @returns the message
             */
            var register = function () {
                return {
                    "type": "prop",
                    "from": pzhConnection.getJID(),
                    "to": applicationId, //random value for application id
                    "payload": {
                        "status": "registeredBrowser",
                        "message": {
                            "connectedPzp": [],
                            "connectedPzh": [ pzh ]
                        }
                    }
                };
            }
            
            wsConnection.sendUTF(JSON.stringify(register()));

            /**
             * Performs a callback to the connected application.
             * @private
             * @function
             * @param event The event to send to the browser
             */
            var callbackToApplication = function (event) {
                logger.trace('event catched. Forwarding to application');
                
                var message = {
    			    "type": "JSONRPC",
    			    "payload": {
    			        "jsonrpc": "2.0",
    			        "id": 0,
    			        "method": event.serviceId + "." + event.methodName,
    			        "params": event.params
    			    },
    			    "id": 0,
    			    "from": pzhConnection.getJID(),
    			    "to": applicationId
                }
                
                wsConnection.sendUTF(JSON.stringify(message));
            };
      
            logger.trace('listening for events for application: ' + applicationId);
            pzhConnection.on(applicationId, callbackToApplication);
            
            wsConnection.on("message", function(message) { wsMessage(message.utf8Data); });
            wsConnection.on("close", function(reason, description) { 
                pzhConnection.removeListener(applicationId, callbackToApplication)
                wsClose(description) 
            });
            
            // The RPC writer for this connection
        	var messageHandler = {
        	    /**
        	     * Writes RPC data to the web socket connection.
        	     * @private
        	     * @function
        	     * @param result The result object.
        	     * @param {string} respto Address the response should go to.
        	     * @param {string} [msgid="not used"] The message id.
        	     */
        		write: function(result, respto, msgid)	{
        			logger.verbose('Sending result <' + JSON.stringify(result) + '> to <' + respto + '> for message id <' + msgid + '>');
        			
        			// check if the message should be send locally or remotely
        			if (respto != applicationId && respto != pzhConnection.getJID()) {
        			    pzhConnection.eventMessage(respto, result);
        			} else {
            			// first wrap result in message manager format for legacy compatibility
            			//TODO this should be removed and optimized in the future
            			var message = {
            			    "type": "JSONRPC",
            			    "payload": result,
            			    "id": 0,
            			    "from": pzhConnection.getJID(),
            			    "to": applicationId
            			};

            			wsConnection.sendUTF(JSON.stringify(message));
        			}
        		}
        	}

            /**
             * Message hanler for incomming message from web socket.
             * @function
             * @private
             * @params {string} utf8Data UTF-8 encoded string containing the message
             */
        	function wsMessage(utf8Data) {
                var msg = JSON.parse(utf8Data);

                logger.verbose('Receiving message: ' + JSON.stringify(msg));

                if(msg.type === "prop" ) {
                    // Legacy from initial implementation. Do we need to register the browser?
                    // ignoring these for now
                    if (msg.payload && msg.payload.status == 'registerBrowser') {
                        wsConnection.sendUTF(JSON.stringify(register()));
                    } else {
                        logger.verbose('Ignoring legacy messages: ' + JSON.stringify(msg));
                    }
                    
                    //TODO add support for these
                } else if (msg.type === 'JSONRPC' && msg.payload) {
        	        rpcHandler.handleMessage(msg.payload, msg.from, Math.round(Math.random() * 10000));
        			logger.verbose('rpc called.');
                } else {
                    logger.debug('Don not know what to do with this message: ' + JSON.stringify(msg));
                }
            }

            /**
             * Called when the web socket connection is closed.
             * @function
             * @private
             * @params {string} reason String containing the reason the connection was closed.
             */
            function wsClose(reason) {
                logger.info(reason);
                logger.debug('user disconnected');
            }

        	rpcHandler.setMessageHandler(messageHandler);
        });
    }

    
    exports.configure = configure;
})();
