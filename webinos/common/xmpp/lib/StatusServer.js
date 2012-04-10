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
 * StatusServer.js
 * handles the connection status service
 * author: Eelco Cramer (TNO)
 */

var sys = require('util');
var logger = require('nlogger').logger('StatusServer.js');

var connection;

var io;

//TODO retrieve jid from pzhConnection
function start(socketIO, pzhConnection, jid) {
	logger.trace("Entering start()");

	io = socketIO;
	connection = pzhConnection;
	
	io.of('/bootstrap').on('connection', function(socket) {
		logger.trace("New connection.");
		//TODO add boolean for connected status to XMPP server
		socket.emit('status', { 'device': jid, 'owner': jid.split("/")[0]});
	});
	
	//TODO add connection listener to update status if pzh connection is disconnected
	
	logger.trace("Leaving start()");
}

exports.start = start;
