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
 * RPC server. Binds socket.io to the Webinos RPC scripts.
 * 
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

    //RPC server initialization
    function configure(wss, rpcHandler, pzhConnection) {
    	wss.on("connect", function(wsConnection) {
            logger.info("connection accepted.");
      
            var pzh = pzhConnection.getJID().split("/")[0];
            var applicationId = uuid.v1();
      
            // send register result to browser
            // TODO react to register message as well
            var register = {
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
            }
            
            wsConnection.sendUTF(JSON.stringify(register));

            // listen to events for this application
            
            var callbackToApplication = function (event) {
                logger.trace('event catched. Forwarding to application');
                
                var message = {
    			    "type": "JSONRPC",
    			    "payload": {
    			        "jsonrpc": "2.0",
    			        "id": 0,
    			        "method": event.serviceId + "." + event.method,
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
            
            //RPC writer for this connection
        	var messageHandler = {
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

        	function wsMessage(utf8Data) {
                var msg = JSON.parse(utf8Data);

                logger.verbose('Receiving message: ' + JSON.stringify(msg));

                if(msg.type === "prop" ) {
                    // Legacy from initial implementation. Do we need to register the browser?
                    // ignoring these for now
                    logger.verbose('Ignoring legacy messages: ' + JSON.stringify(msg));
                    
                    //TODO add support for these
                } else if (msg.type === 'JSONRPC' && msg.payload) {
        	        rpcHandler.handleMessage(msg.payload, msg.from, Math.round(Math.random() * 10000));
        			logger.verbose('rpc called.');
                } else {
                    logger.debug('Don not know what to do with this message: ' + JSON.stringify(msg));
                }
            }

            function wsClose(reason) {
                logger.info(reason);
                logger.debug('user disconnected');
            }

        	rpcHandler.setMessageHandler(messageHandler);
        });
    }

    
    exports.configure = configure;
})();
