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
* Copyright 2011 University of Oxford
*******************************************************************************/

/*
 * This isn't a proper test.
 */

var path = require('path');
var util = require('util');
var fs = require('fs');
var moduleRoot   = require(path.resolve(__dirname, '../../dependencies.json'));
var dependencies = require(path.resolve(__dirname, '../' + moduleRoot.root.location + '/dependencies.json'));
var webinosRoot  = path.resolve(__dirname, '../' + moduleRoot.root.location);
var attester = require(path.join(webinosRoot, dependencies.api.attestation.location, 'lib/webinos.tpm.attestation.js'));

var nonce = [0x00, 0x01, 0x02, 0x03, 0x04,
             0x00, 0x01, 0x02, 0x03, 0x04,
             0x00, 0x01, 0x02, 0x03, 0x04,
             0x00, 0x01, 0x02, 0x03, 0x04];

var pcrs = [1,2,3];

function printObject(o) {
  var out = '';
  for (var p in o) {
    out += p + ': ' + o[p] + '\n';
  }
  console.log(out);
}


attester.getAttestationKey("4", function(key) {
    var i=0;
	console.log("Got key: " + key["id"]);
	console.log(key);


	attester.getAttestation(key["id"], pcrs, nonce,
			function(schema, softwareList, pcrList, attData) {


		console.log("Got attestation: " + schema);
		//console.log("Software list: \n" + softwareList);

        //show every tenth entry
        console.log("Displaying every twentieth item in the log");

        for (i=0;i<softwareList.length;i=i+20) {
            console.log(i + " " + softwareList[i].toString());
        }

		console.log("PCRS: \n" + pcrList);

        console.log("Quote\n");
		printObject(attData.validationData);
		printObject(attData.validationData.versionInfo);
		printObject(attData.quoteInfo);
		printObject(attData.quoteInfo.versionInfo);

	});

});
