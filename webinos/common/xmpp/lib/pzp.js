#!/usr/bin/env node

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
 * Main script for the XMPP PZP.
 * Authors: Eelco Cramer
 */

(function() {
   	"use strict";

    var xmpp = require('./xmpp');
    var ws = require('./webserver');
    var featureManager = require('./FeatureManager.js');

    var path = require('path');
    var moduleRoot = require(path.resolve(__dirname, '../dependencies.json'));
    var dependencies = require(path.resolve(__dirname, '../' + moduleRoot.root.location + '/dependencies.json'));
    var webinosRoot = path.resolve(__dirname, '../' + moduleRoot.root.location);

    var webinos       = require("find-dependencies")(__dirname);
    var rpc           = webinos.global.require(webinos.global.rpc.location);
    var registry      = webinos.global.require(webinos.global.rpc.location, "lib/registry");

    var argv = process.argv;
    var WebinosFeatures = require('./WebinosFeatures.js');
    var logger = require('./Logger').getLogger('pzp', 'info');

    var index;
    var port;
    var jid;
    var bosh;

    // Parse command line
    var arguments_ok = false;
    console.error();
    if (argv.length == 5 || argv.length == 6) {
    	var index = parseInt(argv[2], 10);
    	if (isNaN(index) || (index > 100)) {
    		logger.error("*** " + argv[2] + " is not a valid index number.\r\n");
    	} else {
    		jid = argv[3];
    		// simple check for user@domain/resource format
    		if (jid.match(/^.+@.+\/./i)) {
    			arguments_ok = true;
    		} else {
    			logger.error("*** " + argv[3] + " is not a valid full jid\r\n");
    		}

    		bosh = argv[5];
    	}
    }
    if (!arguments_ok) {
        console.error('Usage: pzp.js <index> <jid> <password> [bosh]\r\n');
        console.error("Where:");
        console.error("    index is the index number of this PZP instance (see below)");
        console.error("    jid is the xmpp account name plus resource, e.g. w012@servicelab.com/mobile");
        console.error("    password to use");
        console.error("    bosh is the URL of the BOSH server, e.g. http://xmpp.servicelab.com/jabber/");
        console.error("");
        console.error("From the index, a port number is calculated like so: port = 8000 + 10*index. So,");
        console.error("the first PZP client (with index 0) can connect at http://localhost:8000/, the");
        console.error("second one (with index 1) should use http://localhost:8010/ and so on.\r\n");
        console.error("When using a xmpp resource for the second time, it is expected behaviour that the");
        console.error("xmpp server disconnects the first client with that same resource name.\r\n");
        process.exit(1);
    }

    logger.verbose("Done parsing command line.");
    port = 8000+10*index;
    logger.info("Using index=" + index + ", jid=" + jid + " and port=" + port);

    var rpcRegistry = new registry.Registry();
    var rpcHandler = new rpc.RPCHandler(this, rpcRegistry);
    var connection = new xmpp.Connection(rpcHandler);

    logger.verbose("Initialising connection to xmpp server.");
    connection.connect({ jid: argv[3], password: argv[4], bosh: argv[5] }, function() {
    	logger.info("Connected to the XMPP server.");
    });

    connection.on('end', function () {
    	logger.info("Connection has been terminated. Stopping...");
    	process.exit(1);
    });

    logger.verbose("Starting servers...");
    ws.start(port, port+1, rpcHandler, connection);

    featureManager.initialize(connection, rpcHandler);

    logger.verbose("Done starting servers.");
})();
