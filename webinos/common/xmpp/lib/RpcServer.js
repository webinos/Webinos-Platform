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

var http = require("http");
var url = require("url");
var path = require("path");
var fs = require("fs");
var logger = require('nlogger').logger('RpcServer.js');
var io;

//RPC server initialization
function configure(server, rpcHandler) {
	io = server;
	
	io.of('/jsonrpc').on('connection', function(socket) {
	    logger.trace((new Date()) + " Connection accepted.");

	    socket.on('message', function(message) {
			msg = JSON.parse(message);
			logger.trace('calling rpc with message(' +  msg + ')');
			logger.trace('message.method=' + msg.method);
	        rpcHandler.handleMessage(msg, this, Math.round(Math.random() * 10000));
			logger.trace('rpc called.');
	    });
		
		socket.on('disconnect', function () {
	    	logger.debug('user disconnected');
	  	});

		//RPC writer for this connection
		function writer(result, respto, msgid)	{
			logger.trace('result(' + result + ')');
			socket.send(JSON.stringify(result));
			logger.trace('end result();')
		}
		
		rpcHandler.setWriter(writer);
	});
}

exports.configure = configure;