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


// This file WILL be the software-only attestation API

// IT IS CURRENTLY A WORK IN PROGRESS (read: completely broken)



// for ubuntu, likely to combine
//      ps -A -o command | awk '{ if ( $1 !~ /\[/ ) print $1 }' | awk '{ if ( $1 ~ /\// ) print $1; else  print "/usr/bin/"$1 }' | awk '{ print $1; system("sha1sum " $1)  }'
//       uname -a | awk '{ system("sudo sha1sum /boot/vmlinuz-"$3); system("sudo sha1sum /boot/vmcoreinfo-"$3); system("sudo sha1sum /boot/System.map-"$3); system("sudo sha1sum /boot/initrd.img-"$3); system("sudo sha1sum /boot/config-"$3); system("sudo sha1sum /boot/abi-"$3); }'
//      dmesg | grep -e "/usr" -e "/bin" -e "/lib" -e "/etc" -e "/boot" -e "/root" -e "/sys" -e "/var" -e "/vmlinuz" -e "/home"
//      ifconfig -a
//      dpkg --list | awk '{ system("dpkg-query -L "$2) }'
//      test with the "file" command.
//      libs:    find /bin -type f -perm /a+x -exec ldd {} \; | grep so | sed -e '/^[^\t]/ d' | sed -e 's/\t//' | sed -e 's/.*=..//' | sed -e 's/ (0.*)//' | sort | uniq -c | sort -n  (change /bin for different DIRs)
//      http://stackoverflow.com/questions/50159/show-all-libraries-used-by-executables-on-linux


var path = require('path');
var fs = require('fs');
var x509 = require('./x509Reader.js');
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
    getKeyFilePrefix: function () {
        "use strict";
        return this.keyfile;
    },
    getCertTextPrefix: function () {
        "use strict";
        return this.certtextprefix;
    },
    schema: "Software Only",
    aikdirectory: "../../../lib/aiks",
    keyfile: "key",
    certtextprefix: "cert.txt"
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
    return nPathV.existsSync(config.getAikDir()) && nPathV.existsSync(getKeyPath(keyid));
}

//
// Loads a certificate from the key with this ID, and then executes the
// "doneFn(cert)" function with argument being the resulting certificate.
//
function loadCertFile(keyid, doneFn) {
    "use strict";
    fs.readFile(path.join(getKeyPath(keyid), config.getCertTextPrefix()), "utf8", function (error, data) {
        if (error !== null && error !== undefined) {
            console.log("Could not read cert file " + path.join(getKeyPath(keyid), config.getCertTextPrefix()));
            console.log(error);
        }
        x509.readString(data, function (cert) {
            cert.id = keyid;
            doneFn(cert);
        });
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



//Return a list of all the software running on the system
function getSoftwareList() {
    "use strict";
}

// Return a signature over the softwareList.
function hmac(softwareList, keyid) {
    "use strict";

}


attester.getAttestation = function (keyid, nonce, doneFn) {
 "use strict";
 var softwareList;
 var pcrList = [];
 var i;
 var attData;

 softwareList = getSoftwareList();

 attData = hmac(softwareList, keyid);

 doneFn(config.getSchema(), softwareList, attData);
};
