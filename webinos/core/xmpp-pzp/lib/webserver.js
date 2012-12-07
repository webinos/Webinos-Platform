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
 * Author: Eelco Cramer
 */

(function() {
	"use strict";
	
    var http = require('http');
    var server = http.createServer(handler);
    var wsServer = http.createServer(handler);
    var url = require("url");
    var path = require("path");
    var fs = require("fs");
    var logger = require('./Logger').getLogger('webserver', 'warn');

    var WebSocketServer = require('websocket').server;
    var rpcServer = require("./RpcServer.js");

    var documentRoot = path.resolve(__dirname, '../../../web_root');
    var webinos = require("find-dependencies")(__dirname);
    var content = webinos.global.require(webinos.global.util.location, "lib/content.js");
    
    var wss;

    /**
     * Handles incoming requests from connected WRTs
     * @function
     * @param request The HTTP request.
     * @param response The HTTP response.
     */
    function handler(request, response) {
    	logger.verbose("Entering request callback");
        var pathname = url.parse(request.url).pathname;

        logger.debug("Received request for " + pathname);

        // simulate a fully configured web server
        if (pathname == "/") pathname = "client.html";
    
        // determine file to serve
        var filename = path.join(documentRoot, pathname);
    
    	filename = path.normalize(filename);

        // now serve the file
        fs.readFile(filename, function (err, data) {
        	if (err) {
        		// Can't read file. This is not an error or warning
        		logger.debug("Can't read " + filename + " due to " + err);
    		
        		// create error response
        		response.writeHead(404, {"Content-Type": "text/plain"});
        		response.write("Error " + err + " when serving " + pathname);
        		logger.info("404 NOT FOUND for " + filename);
        	} else {
        		response.writeHead(200, {"Content-Type": mimeType(filename)});
        		response.write(data);
        		logger.info("200 OK for " + filename);
        	}
        	response.end();
        	logger.verbose("Leaving request callback");
        });
    }

    /**
     * Starts the webserver webinos clients can connect to.
     * @function
     * @param httpPort Port for HTTP connections.
     * @param wssPort Port for websocket connections.
     * @param rpcHandler The RPC handler.
     * @param jid The jid of PZP.
     */
    function start(httpPort, wssPort, rpcHandler, jid) {
    	logger.verbose("Entering start()");
    	logger.debug("Creating web server on port " + httpPort);
	
    	server.listen(httpPort);
    	wsServer.listen(wssPort);
	
    	logger.info("Webserver listening on port " + httpPort);

    	// configure the RPC server
    	wss = new WebSocketServer({
            httpServer: wsServer,
            autoAcceptConnections: true
        });
    	
    	//TODO fix this
    	rpcServer.configure(wss, rpcHandler, jid);
	
    	logger.verbose("Leaving start()");
    }

    exports.start = start;
    exports.wss = wss;

    /**
     * Gets the MIME type for a file.
     * @private
     * @function
     * @param {string} filename The filename.
     */
    function mimeType(filename) {
    	logger.verbose("Entering mimeType function");
        content.getContentType(filename);
    	logger.verbose("Leaving mimeType function");
    }
})();