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
 * Copyright 2011 Ziran Sun, Samsung Electronics (UK) Ltd
 *******************************************************************************/
var path        = require("path");
var webinos = require("find-dependencies")(__dirname);
var logger  = webinos.global.require(webinos.global.util.location, "lib/logging.js")(__filename) || console;
var localconnectionManager = webinos.global.require(webinos.global.manager.localconnection_manager.location, "/lib/localconnectionmanager").localconnectionManager;

var PzpPeerDiscovery = function(_parent){
  this.localconnectionManager = new localconnectionManager();
  
  /**
   * Advertise PZP with service type "pzp". 
   * @discoveryMethod. DiscoveryMethod used. 
   * @param port. Port for advertisement. Use 4321 if not configured
   */
  this.advertPzp = function(discoveryMethod, port) {
    
    if(typeof port == "undefined")
      port = 4321;
    this.localconnectionManager.advertPeers('pzp', discoveryMethod, port);
  };  

  /**
   * Find and connect other PZP Peers.   
   * @param parent. PZP instance
   * @param discoveryMethod. DiscoveryMethod used
   * @param tlsServerPort. TLS port for TLS peer connection
   * @param pzhId. PZH identity
   */
  this.findPzp = function(parent, discoveryMethod, tlsServerPort, pzhId){
  
    var connectPeerFunction = function (msg) {
      "use strict";
      // Don't connect yet - this requires certificate check  
      //_parent.pzpClient.connectPeer(msg);
      var filePath = path.join(_parent.config.metaData.webinosRoot, "keys", "conn.pem");  
      _parent.config.getKeyHash(filePath, function(status, value){  
        if(status)
          logger.log("get hash: " + value);
        else
          logger.log("get hash err: " + value); 
      }); 
    };
      
    this.localconnectionManager.setConnectPeersfunction(connectPeerFunction);
    this.localconnectionManager.findPeers('pzp', discoveryMethod, tlsServerPort, pzhId);
  };
}  

  module.exports = PzpPeerDiscovery;
