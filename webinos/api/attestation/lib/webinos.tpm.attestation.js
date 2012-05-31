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

//
// This file is the interface to the attestation API.
// On different platforms, this will hopefully (in the future)
// talk to different underlying code and software stacks.
//
// Requires the tssbridge nodejs module and the x509Reader
//
// Before using this module, you need to generate an AIK and
// parse it with openssl.
// this involves...
//  (1) use the "identity" executable from privacyca.com to
//      create a "key.blob" file and a cert.pem file
//
//
//  (2) create a root directory to store all of your AIKs in.  Set this
//      as the "aikdirectory" in the config var below.
//      Within this directory, each AIK lives in a sub directory,
//      containing the two key files - "key.blob" and "cert.pem"
//      so, for instance, I have /home/johl/aiks/ as the "aikdirectory" as
//      well as the /home/johl/aiks/1/ subdirectory containing those three files


var path = require('path');
var fs = require('fs');
var x509 = require('./x509Reader.js');
var tssBridge = require('../build/Release/tssbridge');
var nPathV = parseFloat(process.versions.node);
if (nPathV >= 0.7) { nPathV = fs;} else { nPathV = path;}

var UNKNOWN_ERROR = 0;
var INVALID_ARGUMENT_ERROR = 1;
var IO_ERROR = 4;
var NOT_SUPPORTED_ERROR = 5;
var PERMISSION_DENIED_ERROR = 20;
var KEY_NOT_FOUND_ERROR = 21;

var attester = exports;


// Add a "trim()" method to String.
String.prototype.trim = function () {
    "use strict";
    return this.replace(/^\s+|\s+$/g, '');
};
//
// Configure this module. This should be changed to read
// a text file, or similar.
//
var config = {
    getSchema: function () {
		"use strict";
        return this.schema;
    },
    getAikDir: function () {
        "use strict";
        return this.aikdirectory;
    },
    getKeyBlobPrefix: function () {
        "use strict";
        return this.keyblobprefix;
    },
    getCertPemPrefix: function () {
        "use strict";
        return this.certpemprefix;
    },
    getImaLog: function () {
        "use strict";
        return this.imalog;
    },
    getBootLog: function () {
        "use strict";
        return this.bootlog;
    },
    getSrkPassword: function () {
        "use strict";
        return this.srkpwd;
    },
    schema: "TPM 1.2 + IMA",
    aikdirectory: "../../../lib/aiks",
    keyblobprefix: "key.blob",
    certpemprefix: "cert.pem",
    srkpwd: "srkpwd",
    // Should be, on a real system -
    // "/sys/kernel/security/ima/ascii_runtime_measurements",
    imalog: "../../../lib/samplelogs/imalog.txt",
    // Should be, on a real system -
    // "/sys/kernel/security/tpm0/ascii_bios_measurements"
    bootlog: "../../../lib/samplelogs/bootlog.txt"
};


//convenience function for getting the path to a particular
//key directory
function getKeyPath(keyid) {
 "use strict";
 return path.join(config.getAikDir(), keyid);
}

function getAllKeyIds() {
    "use strict";
    return fs.readdirSync(config.getAikDir());
}

//Does a key with the given ID exist?
function keyExists(keyid) {
	"use strict";
    return nPathV.existsSync(config.getAikDir()) && nPathV.existsSync(getKeyPath(keyid)) && nPathV.existsSync(path.join(getKeyPath(keyid), config.getKeyBlobPrefix())) && nPathv.existsSync(path.join(getKeyPath(keyid), config.getCertPemPrefix()));
}

//
// Loads a certificate from the key with this ID, and then executes the
// "doneFn(cert)" function with argument being the resulting certificate.
//
function loadCertFile(keyid, doneFn) {
    "use strict";
    x509.readFile(path.join(getKeyPath(keyid), config.getCertPemPrefix()), function (cert) {
        cert.id = keyid;
        doneFn(cert);
    });
}

// This method returns an attestation x509 key certificate
// if the key ID is specified, it will try to get that one.
// if the key is empty, it will return the first key it finds.
// if the key is specified but not available, it will return KEY_NOT_FOUND_ERROR
attester.getAttestationKey = function (keyid, doneFn) {
    "use strict";
    var keys;

    if (keyid === undefined || keyid === null) {
        keys = getAllKeyIds();
        if (keys.length > 0) {
            this.getAttestationKey(keys[0], doneFn);
        } else {
            console.log("No keys available at " + config.getAikDir());
            doneFn(KEY_NOT_FOUND_ERROR);
        }

    } else if (keyExists(keyid)) {
        loadCertFile(keyid, function (keyCert) {
            doneFn(keyCert);
        });

    } else {
        console.log("Could not find key " + keyid);
        doneFn(KEY_NOT_FOUND_ERROR);
    }
};

var toStr = function() {
    "use strict";
    return "Log [" + this.pcr + "]: " + this.text;
};

// Return an interpretation of the boot log software list
function getBootSoftwareList() {
    "use strict";
    var data = fs.readFileSync(config.bootlog, "utf8");
    var lines = data.split("\n");
    var entry = [];
    var j = 0;
    var line;
    var i = 0;
    for (i = 0; i < lines.length; i=i+1) {
        // split for the first three columns.
        line = lines[i].split(" ");
        if (line.length >= 4) {
            entry[j] = {
                pcr: line[1].trim(),
                hash: line[2].trim(),
                mask: line[3].trim(),
                flag: "boot",
                text: lines[i].substr(lines[i].indexOf("[") + 1, lines[i].length - (lines[i].indexOf("[") + 2)).trim()
            };
            entry[j].toString = toStr;
        }
        j = j+1;
    }
    return entry;
}

// Return a list of software running, as reporting in the
// IMA software log
function getIMASoftwareList() {
    "use strict";
    var data = fs.readFileSync(config.imalog, "utf8");
    var lines = data.split("\n");
    var entry = [];
    var j = 0;
    var i;
    var k;
    var line;

    for (i = 0; i < lines.length; i=i+1) {
        // split for the first three columns.
        line = lines[i].split(" ");

        if (line.length >= 5) {
            entry[j] = {
                pcr: line[0].trim(),
                hash1: line[1].trim(),
                flag: line[2].trim(),
                hash2: line[3].trim(),
                text: ""
            };
            for (k = 4; k < line.length; k=k+1) {
                entry[j].text = entry[j].text + line[k];
            }
            entry[j].toString = toStr;
        }
        j=j+1;
    }
    return entry;

}


//Return a list of all the software running on the system
//this just reads a couple of log files.
function getSoftwareList() {
    "use strict";
    return getBootSoftwareList().concat(getIMASoftwareList());
}


//return the quote and platform log in an asychronous
//callback "doneFn" which takes four arguments:
//
//(1) the schema string - here "TPM 1.2 + IMA"
//(2) a list of software running on the platform, here
//a slightly odd data structure reflecting two log files
//(3) a list of register contents (BYTES)
//(4) attestation data from the quote function.
//
//There are four arguments: the key identifier, an array of pcr indexes, a
//20-byte nonce, and the callback function.
attester.getAttestation = function (keyid, pcrs, nonce, doneFn) {
 "use strict";
 var softwareList;
 var pcrList = [];
 var i;
 var attData;

 softwareList = getSoftwareList();
 attData = tssBridge.getQuote(
 config.getSrkPassword(), path.join(getKeyPath(keyid), config.getKeyBlobPrefix()), pcrs, nonce);
 //TODO: error handling.
 for (i = 0; i < pcrs.length; i=i+1) {
     var pcrRes = tssBridge.getPCR(pcrs[i]);
     pcrList[pcrs[i]] = pcrRes;
 }

 doneFn(config.getSchema(), softwareList, pcrList, attData);
};
