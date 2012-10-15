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
var os = require('os');
var fs = require('fs');
var path = require('path');

var KeyStore = function () {
  "use strict";
};

KeyStore.prototype.generateKey = function(type, id, callback) {
 try {
    certman = require("certificate_manager");
  } catch (err) {
    return callback(false, err);
  }
  try {
    var key;
    if (type === "PzhPCA" ||  type === "PzhCA"){
      key = certman.genRsaKey(2048);
    } else {
      key = certman.genRsaKey(1024);
    }

    this.storeKey(id,  key, function(status, errorDetails) {
      if (status) {
        return callback(true, key);
      } else {
        return callback(false, errorDetails);
      }
    });
  } catch(err) {
    return callback(false, err);
  }
};

KeyStore.prototype.storeKey = function (id, value, callback) {
  var self = this;

  if(self.metaData.webinosType === "Pzp" &&
    (os.type().toLowerCase() ==="linux" &&  os.platform().toLowerCase() !== "android") ||
    os.type().toLowerCase() === "darwin") {
    try {
      var keystore = require("keystore");
      keystore.put(id, value);
      return callback(true);
    } catch (err) {
      return callback(false, err);
    }
  } else {
    fs.writeFile(path.resolve(path.join(self.metaData.webinosRoot, "keys",id)), value, function(err) {
      if(err) {
        return callback(false, err);
      } else {
        return callback(true);
      }
    });
  }
};

KeyStore.prototype.fetchKey = function (id, callback) {
  var self = this, key;
  if(self.metaData.webinosType ==="Pzp" &&
    (os.type().toLowerCase() ==="linux" &&  os.platform().toLowerCase() !== "android") ||
    os.type().toLowerCase() === "darwin") {
    try {
      var keystore = require("keystore");
    } catch (err) {
      return callback(false, err);
    }
    key = keystore.get(id);
    if (typeof key !== "undefined") {
      return callback(true, key );
    } else {
      return callback(false, "keystore fetch key failed" );
    }
  } else {
    try {
      var keyPath = path.resolve(path.join(self.metaData.webinosRoot, "keys", id));
      fs.readFile(keyPath, function(err, data) {
        if(err) {
          return callback(false, err);
        } else {
          return callback(true, data.toString());
        }
      });
    } catch(err){
      return callback(false, err);
    }
  }
};

module.exports = KeyStore;
