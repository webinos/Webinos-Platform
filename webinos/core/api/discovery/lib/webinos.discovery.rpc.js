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
* Copyright 2012 Ziran Sun Samsung Electronics(UK) Ltd
* 
******************************************************************************/

(function() {

  "use strict";

  var os   = require("os");
  var discoverymodule = '';
	
  switch(os.type().toLowerCase()){
    case "linux":
      switch(os.platform().toLowerCase()){
        case "android":
          discoverymodule = require('./webinos.discovery.general.js');
          var hrmmodule = require('./webinos.discovery.hrm.js');
          var dnsmodule = require('./webinos.discovery.dns.js');
        break; 
        case "linux":
          discoverymodule = require('./webinos.discovery.linux.js');
        break;
      }
      break;
    case "darwin":
    break;
    case "windows_nt":
    break;
  }
	
  /**
   * Webinos Discovery service constructor (server side).
   * @constructor
   * @param rpcHandler A handler for functions that use RPC to deliver their result.  
   */
  var DiscoveryModule = function (rpcHandler) {
    this.base = RPCWebinosService;
    this.base({
      api:'http://webinos.org/api/discovery',
      displayName:'Discovery manager',
      description:'Discovery manager that supports Bluetooth and WiFi discovery'
    });
  }
    
  DiscoveryModule.prototype = new RPCWebinosService;

  /**
   * To find devices that support the specific service via Bluetooth. This applies to both Android and Linux.
   * @param data Service type.
   * @param successCallback Success callback.
   */
	
  if((os.type().toLowerCase() == "linux"))
  {
    DiscoveryModule.prototype.BTfindservice = function(data, successCallback){
      discoverymodule.BTfindservice(data, successCallback);   
    }
  }
	
  /**
   * To find devices that support the specific service. Android WiFi MDNS.
   * @param data Service type.
   * @param successCallback Success callback.
   */
  if((os.type().toLowerCase() == "linux") && (os.platform().toLowerCase() == "android"))
  {
    DiscoveryModule.prototype.DNSfindservice = function(data, successCallback){
      dnsmodule.DNSfindservice(data, successCallback);   
    }
  }
	
  /**
   * To find Bluetooth Heart Rate Monitor device. For Android OS only.
   * @param data Service type.
   * @param successCallback Success callback.
   */
  if((os.type().toLowerCase() == "linux") && (os.platform().toLowerCase() == "android"))
  {
    DiscoveryModule.prototype.findHRM = function(data, successCallback){
      hrmmodule.HRMfindservice(data, successCallback); 
    }
  }

  /**
   * To bind with found device that has the service requested. For Linux OS only. 
   * @param data Device address.
   * @param successCallback Success callback.
   */
  if((os.type().toLowerCase() == "linux") && (os.platform().toLowerCase() == "linux"))
  { 
    DiscoveryModule.prototype.bindservice = function(data, successCallback){
      discoverymodule.BTbindservice(data, successCallback);   
    }
  }
	
  /**
   * To get file list of selected folder in the bonded device. For Linux OS only.
   * @param data File folder.
   * @param successCallback Success callback.
   */
  if((os.type().toLowerCase() == "linux") && (os.platform().toLowerCase() == "linux"))
  {
    DiscoveryModule.prototype.listfile = function(data, successCallback){
      discoverymodule.BTlistfile(data, successCallback);
    }
  }
	
  /**
   * To transfer selected file from the bonded device. For Linux OS only.
   * @param data Selected file.
   * @param successCallback Success callback.
   */
  if((os.type().toLowerCase() == "linux") && (os.platform().toLowerCase() == "linux"))
  {
    DiscoveryModule.prototype.transferfile = function(data, successCallback){
      discoverymodule.BTtransferfile(data, successCallback);
    } 
  }
	
  exports.Service = DiscoveryModule;
	
})();
