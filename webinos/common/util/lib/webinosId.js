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
 * Copyright 2011 Ziran Sun, Samsung Electronics (UK) Ltd
 *******************************************************************************/
var os = require('os');
exports.fetchDeviceName = function(type, name, callback) {
  //Get Android devices identity
  if(type === "Pzp" && (os.type().toLowerCase() === "linux") && (os.platform().toLowerCase() === "android")){
    var bridge = require("bridge");
    /* If WiFi Mac address is prefered
     * var prop = {
     *	aspect: "WiFiNetwork",
     *	property: "macAddress"
     * }
     */
    var prop = {
      aspect: "Device",
      property: "identity"
    };

    function onsuccess(prop_value, prop){
      callback (prop_value + "_"+ type); //devicename_type
    }

    function onerror(){
      log.error("android get device name returns error");
      callback ("android"+ "_"+ type);
    }

    var devStatusModule = bridge.load('org.webinos.impl.DevicestatusImpl', this);
    devStatusModule.getPropertyValue(onsuccess, onerror, prop);
  } else  if ((type === "Pzp" || type === "PzhP")){
    callback (os.hostname() + "_"+ type); //devicename_type
  } else {
    callback( name);
  }
};