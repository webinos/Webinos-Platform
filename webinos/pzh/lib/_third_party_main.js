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
* Copyright 2011 Habib Virji, Samsung Electronics (UK) Ltd
*******************************************************************************/
var fs = require('fs'),
PzhFarm = require('webinos_pzh').farm;

var host = null, name = null;

function help() {
    console.log('Usage: node startPzh.js [options]');
    console.log('Options:');
    console.log('--host=[host]            host of the pzh (default localhost)');
    console.log('--name=[identifier]      common name in the certificate (default PzhFarm)');
    process.exit();
}

process.argv.forEach(function (arg) {
	  var parts;
	  if (arg.indexOf('--') > -1) {
	    parts = arg.split('=');
	    if (parts.length > 1) {
	      switch (parts[0]) {
	      case '--host':
	        host = parts[1];
	        break;
	      case '--name':
	        name = parts[1];
	        break;
	      }
	    }
	    else if (parts[0] === '--help') {
	    	help();
	    }
	  }
});

if ( host === null) {
	host = 'localhost';
}

if ( name === null) {
	name = '';
}

var farm = new PzhFarm();

farm.startFarm(host, name, function(result) {
	console.log('******* PZH FARM STARTED *******');
});


