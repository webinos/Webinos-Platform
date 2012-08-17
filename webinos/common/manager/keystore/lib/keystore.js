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

var KeyStore = function () {
  "use strict";
};

KeyStore.prototype.generateKey = function(type, id, callback) {
 try {
    certman = require("certificate_manager");
  } catch (err) {
    callback("error", "exception", err);
    return;
  }
  try {
    var key;
    if (type === "PzhProviderCA" ||  type === "PzhCA"){
      key = certman.genRsaKey(2048);
    } else {
      key = certman.genRsaKey(1024);
    }

    this.storeKey(id, key, function(status, errorDetails) {
      if (status === "success") {
        callback("success", "", key);
      } else {
        callback("error", "key write", errorDetails);
      }
    });
  } catch(err) {
    callback("error", "exception", err);
    return;
  }
}

KeyStore.prototype.storeKey = function (id, value, callback) {
  var self = this;
  if((os.type().toLowerCase() ==="linux" &&  os.platform().toLowerCase() !== "android") ||
    os.type().toLowerCase() === "darwin") {
    try {
      var keystore = require("keystore");
      keystore.put(id, value);
      callback("success");
    } catch (err) {
      console.log(err);
      callback("error", "exception", err);
      return;
    }
  } else {
    fs.writeFile((self.webinosRoot+ "keys/"+id), value, function(err) {
      if(err) {
        console.log(err);
        callback("error", "exception", err);
      } else {
        callback("success");
      }
    });
  }
}


KeyStore.prototype.fetchKey = function (id, callback) {
  if((os.type().toLowerCase() ==="linux" &&  os.platform().toLowerCase() !== "android") ||
    os.type().toLowerCase() === "darwin") {
    try {
      var keystore = require("keystore");
    } catch (err) {
      callback("error", "exception", err);
      return;
    }
    var value = keystore.get(id);
    if (typeof value !== "undefined") {
      callback("success", "", value );
    } else {
      callback("error", "read file" );
    }
  } else {
    fs.readFile((this.path+ "/keys/"+id), function(err, data) {
      if(err) {
        callback("error", "read file", err);
      } else {
        callback("success", "", data.toString());
      }
    });
  }
};

module.exports = KeyStore;
