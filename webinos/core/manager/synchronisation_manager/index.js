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

var fs = require("fs");
var crypto = require("crypto");
var sync_ = require("./lib/json-sync-master/sync.js");

var Sync = function() {
  "use strict";
  var jsonObject = {};
  this.getFileHash = function(_jsonObject) {
    var myKey, diff = {};
    jsonObject = _jsonObject;
    for( myKey in jsonObject) {
      if (jsonObject.hasOwnProperty(myKey)) {
        diff[myKey]= crypto.createHash("md5").update(JSON.stringify(jsonObject[myKey])).digest("hex");
      }
    }
    return diff;
  };

  this.compareFileHash = function(jsonObject, remoteJsonObject) {
    var diff = {}, myKey, own;
    var ownJsonObject = this.getFileHash(jsonObject);
    for( myKey in ownJsonObject) {
      if (ownJsonObject.hasOwnProperty(myKey)) {
        if (ownJsonObject[myKey] !== remoteJsonObject[myKey]) {
          diff[myKey] = jsonObject[myKey];
        }
      }
    }
    return diff;
  };

  this.syncFileMissing = function(remoteJsonObject) {
    var myKey, diff = {}, update, update1, syncdata, updatedData = {};
    console.log(remoteJsonObject);
    for( myKey in jsonObject) {
      if (jsonObject.hasOwnProperty(myKey) && remoteJsonObject.hasOwnProperty(myKey)) {
        update = sync_.detectUpdates(jsonObject[myKey], jsonObject[myKey]);
        update1 = sync_.detectUpdates(jsonObject[myKey], remoteJsonObject[myKey]);
        syncdata = sync_.reconcile([update1, update]);
        console.log(jsonObject[myKey]);
        sync_.applyCommands(jsonObject[myKey], syncdata.propagations[0]);
        console.log(syncdata.propagations[0])
        updatedData[myKey] = jsonObject[myKey];
        console.log(jsonObject[myKey]);
      }
    }
    return updatedData;
  };

  this.parseXMLFile= function(fileName) {
    var xml2js = require('xml2json');
    var data = fs.readFileSync(fileName);
    var result = xml2js.toJson(data.toString());
    return result;
  }
};
module.exports = Sync;
