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
var KeyStore = function () {
    "use strict";
    var os = require('os');
    var fs = require('fs');
    var path = require('path');
    var self = this;

    function checkPlatform() {
        if (self.metaData.webinosType ==="Pzp" && (os.type().toLowerCase() ==="linux" &&
            os.platform().toLowerCase() !== "android") || os.type().toLowerCase() === "darwin") {
            try {
                var  keystore = require("keystore");
                return keystore;
            } catch (err) {
                return null;
            }
        } else {
            return null;
        }
    }

    function writeFile(id, value, callback) {
        fs.writeFile(path.resolve(path.join(self.metaData.webinosRoot, "keys", id)), value, function(err) {
            if(err) {
                return callback(false, "failed storing private keys " + err);
            } else {
                return callback(true, value);
            }
        });
    }

    function storeKey(id, value, callback) {
        var keystore = checkPlatform();
        try{
            if(keystore) {
                keystore.put(id, value);
                return callback(true, value);
            } else {
                writeFile(id, value, callback);
            }
        } catch (err) { // An exception has occurred in key-store store in file instead
            writeFile(id, value, callback);
        }
    }

    function getKeys(id, callback) {
        var keyPath = path.resolve(path.join(self.metaData.webinosRoot, "keys", id));
        fs.readFile(keyPath, function(err, data) {
            if(err) {
                return callback(false, "failed fetching keys " + err);
            } else {
                return callback(true, data.toString());
            }
        });
    }

    this.generateKey = function(type, id, callback) {
        try {
            var certman = require("certificate_manager");
        } catch (err) {
            return callback(false, "certificate manager is missing, please run npm install to generate it");
        }
        try {
            var key;
            if (type === "PzhPCA" ||  type === "PzhCA" || type === "PzpCA"){
                key = certman.genRsaKey(2048);
            } else {
                key = certman.genRsaKey(1024);
            }
            storeKey(id, key, callback);
        } catch(err) {
            return callback(false, err);
        }
    };

    this.fetchKey = function (id, callback) {
        var key, keystore = checkPlatform();
        if(keystore) {
            key = keystore.get(id);
            if (key) {
                return callback(true, key);
            } else {
                getKeys(id, callback);
            }
        } else {
            getKeys(id, callback);
        }
    };
};

module.exports = KeyStore;
