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
 * Main script for the XMPP PZH.
 * Authors: Eelco Cramer
 */

(function() {
   	"use strict";

    var path = require('path');
    var moduleRoot = require(path.resolve(__dirname, '../dependencies.json'));
    var dependencies = require(path.resolve(__dirname, '../' + moduleRoot.root.location + '/dependencies.json'));
    var webinosRoot = path.resolve(__dirname, '../' + moduleRoot.root.location);

    var webinos = require("find-dependencies")(__dirname);

    var logger =  webinos.global.require(webinos.global.xmpppzp.location, "lib/Logger").getLogger('pzp', 'info');
    
    var XMPPConnector = require('./XMPPConnector');
    var connector = new XMPPConnector.XMPPConnector();

    // Parse command line
    var argv = require('optimist')
        .usage('Usage: pzh.js --host=<xmpp server> --jid=<component name> --password=<xmpp component password> [--port=5275]')
        .demand(['host', 'jid', 'password'])
        .argv;

    if (!argv.port) argv.port = 5275;

    connector.on('online', function() {
      logger.info('Online!');
    });
    
    connector.connect({
        jid: argv.jid,
        password: argv.password,
        host: argv.host,
        port: argv.port,
        bosh: undefined
    });
    
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    logger.info('Press CRTL-C to stop.')

    var stop = function() {
        process.exit();
    };

    process.on('SIGINT', stop);
})();
