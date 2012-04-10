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
* Copyright 2011 Alexander Futasz, Fraunhofer FOKUS
******************************************************************************/
(function() {
    if (typeof webinos === "undefined") webinos = {};
    var channel = null;

    /**
     * Creates the socket communication channel
     * for a locally hosted websocket server at port 8080
     * for now this channel is used for sending RPC, later the webinos
     * messaging/eventing system will be used
     */
    function createCommChannel(successCB) {
        try {
            channel = new WebinosSocket();
        } catch(e1) {
	        try {
	            var port = parseInt(location.port) + 1;
	            if (isNaN(port)) {
	                port = 81;
	            }
	            var host = window.location.hostname;
	            if(!host) {
	            	host = 'localhost';
	            	port = 8081;
	            }
	            channel = new WebSocket("ws://" + host + ":" + port);
	        } catch(e2) {
	            channel  = new MozWebSocket('ws://'+window.location.hostname+':'+port);
	        }
        }
        webinos.session.setChannel(channel);

        channel.onmessage = function(ev) {
            console.log('WebSocket Client: Message Received : ' + JSON.stringify(ev.data));
            var data = JSON.parse(ev.data);
            if(data.type === "prop") {
                webinos.session.handleMsg(data);
            } else {
                webinos.messageHandler.setGetOwnId(webinos.session.getSessionId());
                webinos.messageHandler.setObjectRef(this);
                webinos.messageHandler.setSendMessage(webinos.session.message_send_messaging);
                webinos.messageHandler.onMessageReceived(data, data.to);
            }
        };
    }
    createCommChannel ();

    if (typeof webinos === 'undefined') webinos = {};

    webinos.rpcHandler = new RPCHandler();
    webinos.messageHandler = new MessageHandler(webinos.rpcHandler);
    webinos.discovery = new ServiceDiscovery(webinos.rpcHandler);
    webinos.ServiceDiscovery = webinos.discovery; // for backward compat

}());
