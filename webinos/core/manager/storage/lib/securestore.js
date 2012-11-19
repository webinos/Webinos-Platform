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

// This module provides "secure" storage.  Better stated: it will zip & encrypt 
// a directory for you after use ("close") and recover one again ("open") next
// time.  Passwords and (relative) paths must be provided.

// This was only experimental code - I don't expect anyone to actually use it.
// It also hasn't gone through any security review.  It's awful.

var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var zipHelper = require("./zipHelper");
var nPathV = parseFloat(process.versions.node);
if (nPathV >= 0.7) { nPathV = fs;} else { nPathV = path;}

// we're creating an inner directory for arbitary json storage.
var jsonDirSuffix = "json";

var secstore = exports;

//decrypt the storage file and unzip it into a directory.
function openInner(storeFile, password, done) {
    "use strict";
    secstore.decryptFile(storeFile, password, function () {
        secstore.unzipFile(storeFile, function () {
            done();
        });
    });
}

//create a store directory 
function init(storePath, done) {
    "use strict";
    fs.mkdir(storePath, 448, function () {
        fs.mkdir(path.join(storePath, jsonDirSuffix), 448, function (err) {
            done(err);
        });
    });
}

//DANGER! Will delete a directory recursively
//... may fail on larger directory structures, apparently.
function rimrafSync(p) {
    "use strict";
    var s = fs.lstatSync(p);
    if (!s.isDirectory()) {
        return fs.unlinkSync(p);
    }
    fs.readdirSync(p).forEach(function (f) {
        rimrafSync(path.join(p, f));
    });
    fs.rmdirSync(p);
}

// store a key value pair in the encrypted directory.  This is a convenience 
// function, I actually recommend you don't use this.
secstore.storeKeyValue = function (dir, k, json, err) {
    "use strict";
    fs.writeFile(path.join(path.join(dir, jsonDirSuffix), k), JSON.stringify(json), err);
};

// get a key value pair from the directory.  This is a convenience function, 
// I actually recommend you don't use this.
secstore.getKeyValue = function (dir, k, fn) {
    "use strict";
    fs.readFile(path.join(path.join(dir, jsonDirSuffix), k), function (error, data) {
        if (error === null || error === undefined) {
            if (data.length > 0) {
                fn(error, JSON.parse(data));
            } else {
                fn(error, {});
            }
        } else {
            fn(error);
        }
    });
};

// Open the "secure" storage directory
// Arguments:
//	password:       user password for decrypting the store file
//	storeFile:	    the encrypted storage file
//	storeDirectory: where we decrypt the storage file
//	done:           a callback function
secstore.open = function (password, storeFile, storeDirectory, done) {
    "use strict";
    try {
        if (!fs.lstatSync(storeFile).isFile()) {
            throw new Error("Error: not a file");
            // we're not handling this problem: the zip file has to be a 
            // file, clearly.
        } else {
            // all is good - lets decrypt and open
            openInner(storeFile, password, done);
        }
    } catch (e) {
        // error when opening the storage file.  Two scenarios: there's no 
        // file, or something else happened
        if (e.code === 'ENOENT') {
            //no file.  Create the directory structure and return.
            init(storeDirectory, done);
        } else {
            // something bad happened.  
            console.log(e);
            done(e);
        }
    }
};

// close the storage, turn it into a file and encrypt the hell out of it.
// Arguments:
//	password:       user password for decrypting the store file
//	storeFile:      the "to be encrypted" storage file
//	storeDirectory: the directory we are encrypting
//	done:           a callback function on completion / error
secstore.close = function (password, storeFile, storeDirectory, done) {
    "use strict";
    // zip up the directory structure
    secstore.zipDir(storeFile, storeDirectory, function () {
        // encrypt
        if (nPathV.existsSync(storeFile)) {
            secstore.encryptFile(storeFile, password, function () {
                // secure delete storage, recursive.
                rimrafSync(storeDirectory);
                done();
            });
        } else {
            console.log("Zip didn't create a file " + storeFile + "so we're assuming nothing to store or encrypt");
        }
    });
};


// zip a file using the zip command
// will overwrite the file if necessary.
secstore.zipDir = function zipDir(zipFile, inPath, fn) {
    "use strict";
    if (nPathV.existsSync(zipFile)) {
        fs.unlinkSync(zipFile);
    }
    zipHelper.makeZipFile(inPath, zipFile, fn);
};

//Unzip a file using the unzip command
//DANGER! Will overwrite by default!
secstore.unzipFile = function unzipFile(zipFile, fn) {
    "use strict";
    zipHelper.unzipFile(zipFile, fn);
};






// decryption based on passwords and a callback for when it is complete.
secstore.decryptFile = function decryptFile(file, passwd, done) {
    "use strict";
    var decipher = crypto.createDecipher('aes-128-cbc', passwd);
    var decrypted;

    fs.readFile(file, 'binary', function (err, data) {
        if (err) {
            throw err;
        }
        decrypted = decipher.update(data);
        decrypted += decipher.final();
        fs.writeFile(file, decrypted, 'binary', function (err) {
            done(err);
        });
    });
};

// encrypt a file, with a function callback called "done"
secstore.encryptFile = function encryptFile(file, passwd, done) {
    "use strict";
    var cipher = crypto.createCipher('aes-128-cbc', passwd);
    var crypted;
    fs.readFile(file, 'binary', function (err, data) {
        if (err) {
            throw err;
        }
        crypted = cipher.update(data);
        crypted += cipher.final();
        fs.writeFile(file, crypted, 'binary', function () {
            done();
        });
    });
};
