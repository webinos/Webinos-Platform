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
    var logger = require('./Logger').getLogger('RpcServer', 'verbose');
    var rpcHandler;

    //RPC server initialization
    function configure(wss, rpcHandler) {
    	wss.on("connect", function(connection) {
            logger.info("connection accepted.");
      
            connection.sendUTF('{ "type": "prop", "from": "eelco@servicelab.org/mobile", "payload": { "status": "registeredBrowser", "message": {"connectedPzp": [], "connectedPzh": ["eelco@servicelab.org"] }}}');
      
            connection.on("message", function(message) { wsMessage(message.utf8Data); });
            connection.on("close", function(reason, description) { wsClose(description) });
            
            //RPC writer for this connection
        	var messageHandler = {
        		write: function(result, respto, msgid)	{
        			logger.verbose('Sending result.', result);
        			connection.sendUTF(JSON.stringify(result));
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
        	        rpcHandler.handleMessage(msg.payload, this, Math.round(Math.random() * 10000));
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