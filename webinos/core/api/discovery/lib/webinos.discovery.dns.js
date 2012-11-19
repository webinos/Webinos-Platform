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
 	
if (typeof webinos === "undefined") { webinos = {}; }
if (!webinos.discovery) { webinos.discovery = {}; }

//android

var disc = require('bridge').load('org.webinos.impl.discovery.DiscoveryMdnsImpl', this);

/**
 * Find devices that support specific service type
 * @param serviceType Service type.
 * @param onFound Success callback.
 */

DNSfindservice = function(serviceType, onFound){
  try 
  {
    disc.findServices(serviceType, function(service){onFound(service);}, null, null);
    console.log("DNSfindservice - END");
  }
  catch(e) {
    console.log("DNSfindservice  - error: "+e.message);
  }
};

exports.DNSfindservice = DNSfindservice;
