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
* Copyright 2011-2012 Paddy Byers
*
******************************************************************************/

(function(exports) {	
	var INITIALISED = -1;
	var CONNECTING  =  0;
	var OPEN        =  1;
	var CLOSING     =  2;
	var CLOSED      =  3;

	var sockets = [];

	var tryConnect = function(ws) {
		if(exports.__webinos) {
			try {
				console.log('WebinosSocket connecting .....');
				exports.__webinos.openSocket(ws.id);
				ws.readyState = CONNECTING;
				return true;
			} catch(e) {
				console.log('... failed; exception = ' + e);
			}
		}
		return false;
	};

	var WebinosSocket = function() {
		var id = this.id = sockets.length;
		sockets.push(this);
		this.readyState = INITIALISED;
		
		tryConnect(this)
		this.queuedMessages = [];
	};

	WebinosSocket.INITIALISED = INITIALISED;
	WebinosSocket.CONNECTING  = CONNECTING;
	WebinosSocket.OPEN        = OPEN;
	WebinosSocket.CLOSING     = CLOSING;
	WebinosSocket.CLOSED      = CLOSED;

	WebinosSocket.handleConnect = function(id) {
		var ws = sockets[id];
		if(ws) {
			if(ws.readyState == CONNECTING) {
				console.log('... connected');
				ws.readyState = OPEN;
				for(var i in ws.queuedMessages)
					exports.__webinos.send(ws.id, ws.queuedMessages[i]);
				delete ws.queuedMessages;
				if(ws.onopen)
					ws.onopen();
			}
		}
	};

	WebinosSocket.handleDisconnect = function(id) {
		var ws = sockets[id];
		if(ws) {
			if(ws.readyState != CLOSED) {
				ws.readyState = CLOSED;
				if(ws.onclose)
					ws.onclose();
			}
		}
	};

	WebinosSocket.handleMessage = function(id, data) {
		var ws = sockets[id];
		if(ws) {
			if(ws.readyState == OPEN && ws.onmessage)
				ws.onmessage({data:data});
		}
	};

	WebinosSocket.prototype.send = function(data) {
		switch(this.readyState) {
		case -1: /* INITIALISED */
			tryConnect(this);
		case 0: /* CONNECTING */
			this.queuedMessages.push(data);
			break;
		case 1: /* OPEN */
			exports.__webinos.send(this.id, data);
			break;
		case 2: /* CLOSING */
		case 3: /* CLOSED */
		default:
			throw new Error('IllegalStateError');
		}
	};
	
	WebinosSocket.prototype.close = function(data) {
		if(this.readyState == OPEN || this.readyState == CONNECTING)
			exports.__webinos.closeSocket(this.id);
		
		if(this.readyState != CLOSED)
			this.readyState = CLOSING;
	};
	
	exports.WebinosSocket = WebinosSocket;
})(window);