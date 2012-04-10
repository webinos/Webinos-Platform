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
 * Main script for the XMPP PZP demo.
 *
 * Authors: Eelco Cramer and Victor Klos (TNO)
 */

var xmpp = require('./xmpp');
var ws = require('./webserver');
var disco = require('./ServiceDiscovery');
var status = require('./StatusServer');

var path = require('path');
var moduleRoot = require(path.resolve(__dirname, '../dependencies.json'));
var dependencies = require(path.resolve(__dirname, '../' + moduleRoot.root.location + '/dependencies.json'));
var webinosRoot = path.resolve(__dirname, '../' + moduleRoot.root.location);

var rpc = require(path.join(webinosRoot, dependencies.rpc.location));

var argv = process.argv;
var WebinosFeatures = require('./WebinosFeatures.js');
var logger = require('nlogger').logger('pzp.js');

var index;
var port;
var jid;

// Parse command line
var arguments_ok = false;
console.error();
if (argv.length == 5 || argv.length == 6) {
	var index = parseInt(argv[2], 10);
	if (isNaN(index) || (index > 100)) {
		console.error("*** " + argv[2] + " is not a valid index number.\r\n");
	} else {
		jid = argv[3];
		// simple check for user@domain/resource format
		if (jid.match(/^.+@.+\/./i)) {
			arguments_ok = true;
		} else {
			console.error("*** " + argv[3] + " is not a valid full jid\r\n");
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

logger.trace("Done parsing command line.");
port = 8000+10*index;
logger.info("Using index=" + index + ", jid=" + jid + " and port=" + port);

var rpcHandler = new _RPCHandler();
var connection = new xmpp.Connection(rpcHandler);

logger.trace("Starting servers...");
ws.start(port, rpcHandler);
disco.start(ws.io, connection, jid, rpcHandler);
status.start(ws.io, connection, jid);

logger.trace("Done starting servers.");

logger.trace("Initialising connection to xmpp server.");
connection.connect({ jid: argv[3], password: argv[4], bosh: argv[5] }, function() {
	logger.info("Connected to the XMPP server.");
});

connection.on('end', function () {
	logger.info("Connection has been terminated. Stopping...");
	process.exit(1);
});

// installing a listerner for all features, just informational and for debugging purposes.
connection.on('newFeature', function(feature) {
	logger.trace("The feature " + feature.ns + " on " + feature.device + " became available.");
	
	// do something with the feature.
	feature.once('remove', function(feature) {
		// do something when the feature is removed.
		logger.trace("The feature " + feature.ns + " on " + feature.device + " became unavailable.");
	});
});
