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

var crypto      = require("crypto");
var path        = require("path");
var fs          = require("fs");

var MOD         = 2147483647;
var BLOCKSIZE   = 2048;

var dependencies= require("find-dependencies")(__dirname);
var logger      = dependencies.global.require(dependencies.global.util.location, "lib/logging.js")(__filename) || console;

var Sync = exports;

function createRsyncHash(file, callback) {
  fs.readFile(file, function(err, data) {
     if(!err){
       var dataStr = data.toString(), a = 1, b = 0, i;
       for (i = 0; i < dataStr.length; i = i + 1) {
          a = (a + dataStr[i].charCodeAt(0)) % MOD;
          b = (b + a) % MOD;
       }
       callback({weak: (b << 32 | a), strong: crypto.createHash("md5").update(dataStr).digest("hex")});

     } else {
       callback ({weak:"" , strong: ""})
     }
  });
}

Sync.getFileHash = function(webinosPath, id, callback) {
  var result = {trustedList: "", crl: "", external_cert: "", userData: "", policies:""};
  var trustedList = path.join(webinosPath, "trustedList.json");// Trusted List
  var crl = path.join(webinosPath, "crl.pem");// CRL
  var certificates = path.join(webinosPath, "certificates", "external", id+".json");     //Certificates/External
  var policies = path.join(webinosPath, "policies","policy.xml");

  createRsyncHash(trustedList, function(hashData) {
    result.trustedList = hashData;
    createRsyncHash(crl, function(hashData){
      result.crl = hashData;
      createRsyncHash(certificates, function(hashData){
        result.external_cert = hashData;
        createRsyncHash(policies, function(hashData){
          result.policies = hashData;
          callback(result);
        });
      });
    });
  });
};

// We have two options of sending patched data, follow rsync but it is for a bigger chunk of data + more for binary data.
Sync.compareFileHash = function(webinosPath, id, list, callback) {
  Sync.getFileHash(webinosPath, id, function(result){
    var requestData = {trustedList: 0, crl: 0, external_cert: 0, policies: 0};
    if (list.trustedList.weak !== result.trustedList.weak || list.trustedList.strong !== result.trustedList.strong){
      requestData.trustedList = 1;
    }

    if (list.crl.weak !== result.crl.weak || list.crl.strong !== result.crl.strong){
      requestData.crl = 1;
    }

    if (list.external_cert.weak !== result.external_cert.weak || list.external_cert.strong !== result.external_cert.strong){
      requestData.external_cert = 1;
    }

    if (list.policies.weak !== result.policies.weak || list.policies.strong !== result.policies.strong){
      requestData.policies = 1;
    }

    callback(requestData);
  });
};

Sync.syncFileMissing = function(webinosPath, id, message, callback) {
  var sendPatches = {};

  var cert = path.join(webinosPath, "certificates", "external", id+".json");// Trusted List
  var trustedList = path.join(webinosPath, "trustedList.json");// Trusted List
  var crl = path.join(webinosPath, "crl.pem");// Trusted List
  var policy = path.join(webinosPath, "policies","policy.xml");// Trusted List

  if (message.trustedList == 1 || message.crl === 1 || message.external_cert === 1 || message.policies  === 1) {
    if (message.trustedList === 1){
      sendPatches.trustedList = fs.readFileSync(trustedList, "utf8");
    }
    if (message.crl === 1){
      sendPatches.crl =  fs.readFileSync(crl, "utf8");
    }
    if (message.external_cert === 1){
      sendPatches.cert =  fs.readFileSync(cert, "utf8");
    }
    if (message.policies === 1){
      sendPatches.policies =  fs.readFileSync(policy, "utf8");
    }
  }
  callback(sendPatches);
};

Sync.updateFileMissing = function(webinosPath, id, list, callback){
  if(list.trustedList) {
    fs.writeFileSync(path.join(webinosPath, "trustedList.json"), list.trustedList.toString());
  }
  if(list.crl) {
    fs.writeFileSync(path.join(webinosPath, "crl.pem"), list.crl.toString());
  }
  if(list.cert) {
    fs.writeFileSync(path.join(webinosPath, "certificates", "external", id+".json"), list.cert.toString());
  }
  if(list.policies) {
    fs.writeFileSync(path.join(webinosPath, "policies", "policy.xml"), list.policies.toString());
  }
  callback(true);
};
