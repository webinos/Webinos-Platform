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

var mdns;
try {
  mdns = require('mdns');
} catch(e) {}

var os      = require('os');
var webinos = require("find-dependencies")(__dirname);
var logger  = webinos.global.require(webinos.global.util.location, "lib/logging.js")(__filename) || console;

function getelement(service, element){
  var srv = JSON.stringify(service);
  var ret = null;
  if(element === 'name')
  {
    var nm = srv.split(element)[2];
    var index = nm.indexOf(",");
    //remove ""
    ret = nm.slice(3, index-1);
  }
  else if(element ==='addresses')
  {
    var el = srv.split(element)[1];
    var index = el.indexOf(",");
    ret = el.slice(4, index-2);
  }
  else
  {
    var el = srv.split(element)[1];
    var index = el.indexOf(",");
    ret = el.slice(2, index);
  }
  return ret;
}

var PzpLocal = function(_parent){
  /*
   * Zerconf: Advertise itself as a PZP service _tcp_pzp once authenticated by PZH. service type: _pzp._tcp
   */
  this.startLocalAdvert = function() {
    if(typeof mdns!=="undefined") {
      switch(os.type().toLowerCase()){
        case "linux":
          switch(os.platform().toLowerCase()){
            case "android":
              break;
            case "linux":
              var ad = mdns.createAdvertisement(mdns.tcp('pzp'), _parent.config.userPref.ports.pzp_zeroConf);
              ad.start();
              ad.on('error', function(err) {
                logger.error("zero conf advertisement  (" + err+")");
              });
              break;
          }
          break;
        case "darwin":
          break;
        case "windows_nt":
          break;
      }
    }
  };

  this.findLocalPzp = function() {
    //Zeroconf - start
    switch(os.type().toLowerCase()){
      case "linux":
        var filename;
        switch(os.platform().toLowerCase()){
          case "android":
          {
            function onFound(service){
              logger.log("Android-Mdns onFound callback: found service.");
              if((service.deviceNames[0] != "undefined") && (service.deviceAddresses[0] != "undefined")) {
                var msg ={};
                msg.name    = service.deviceNames[0];
                msg.address = service.deviceAddresses[0];
                msg.name    = pzhId + "/" + msg.name + "_Pzp";
                msg.port    = tlsServerPort;
                logger.log("found peer address:" + msg.address);
                _parent.pzpClient.connectPeer(msg);
              }
            }

            try{
              var servicetype = {
                api: "_pzp._tcp.local."
              };
              var bridge = require("bridge");
              mdnsModule = bridge.load('org.webinos.impl.discovery.DiscoveryMdnsImpl', this);
              logger.log("\n test msdndiscovery...");

              try {
                mdnsModule.findServices(servicetype, onFound);
                logger.log("startDiscovery - END");
              }
              catch(e) {
                logger.error("startDiscovery - error: "+e.message);
              }
            }
            catch(e){
              logger.error("error: "+e.message);
            }
          }
            break;
          case "linux":
            if (typeof mdns !== "undefined") {
              var browser = mdns.createBrowser(mdns.tcp('pzp')), msg ={};
              browser.on('error', function(err) {
                logger.error("browser error: (" + err+")");
              });
              browser.start();
              browser.on('serviceUp', function(service) {
                logger.log("service up");
                msg.name    = getelement(service, 'name');
                msg.port    = getelement(service, 'port');
                msg.address = getelement(service, 'addresses');

                logger.log("check ZeroConf discovery list");
                var hostname = os.hostname();
                if(msg.name !== os.hostname()) {
                  //Update connection - msg.name is machine name
                  msg.name = _parent.config.metaData.pzhId + "/" + msg.name + "_Pzp";
                  msg.port = _parent.config.userPref.ports.pzp_tlsServer;
                  _parent.pzpClient.connectPeer(msg);
                }
              });
            }
            break;
        }
        break;
      case "darwin":
        break;
      case "windows_nt":
        break;
    }
  //end - zeroconf
  };
};

module.exports = PzpLocal;