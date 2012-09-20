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
var webinos = require("webinos")(__dirname);
var logging = webinos.global.require(webinos.global.util.location, "lib/logging.js");
var log     = new logging("pzp_local");
var pzpClient= require("./pzp_peerTLSClient");


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

var PzpLocal = function(){

};


/*
 * Zerconf: Advertise itself as a PZP service _tcp_pzp once authenticated by PZH. service type: _pzp._tcp
 */
PzpLocal.prototype.startLocalAdvert = function() {
  if(typeof mdns!=="undefined") {
    switch(os.type().toLowerCase()){
      case "linux":
        switch(os.platform().toLowerCase()){
          case "android":
            break;
          case "linux":
            var ad = mdns.createAdvertisement(mdns.tcp('pzp'), this.config.userPref.ports.pzp_zeroConf);
            ad.start();
            ad.on('error', function(err) {
              log.error("zeroconf advertisement  (" + err+")");
            });
            log.info("started pzp");
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

PzpLocal.prototype.findConnect = function(pzhId) {
  //Zeroconf - start
  if (typeof mdns !== "undefined") {
    switch(os.type().toLowerCase()){
      case "linux":
        switch(os.platform().toLowerCase()){
          case "android":
            break;
          case "linux":
            var browser = mdns.createBrowser(mdns.tcp('pzp'));
            browser.on('error', function(err) {
              log.error("browser error: (" + err+")");
            });
            browser.start();

            var msg ={};
            browser.on('serviceUp', function(service) {
              log.info("service up");
              msg.name = getelement(service, 'name');
              msg.port = getelement(service, 'port');
              msg.address = getelement(service, 'addresses');

              log.info("check ZeroConf discovery list");
              if(msg.name !== os.hostname()) {
                // Use case - Had connected to this PZP at least once
                if((typeof self.connectedPzp[msg.name] !== "undefined") && self.connectedPzp[msg.name].state === self.states[0] ) {
                  var client = new pzpClient();
                  client.connectOtherPZP(self, msg);
                }
                else if (typeof self.connectedPzp[msg.name] === "undefined") {
                  log.info("new peer");
                  var client = new pzpClient();
                  client.connectOtherPZP(self, msg);
                }
              }
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
  //end - zeroconf
};

module.exports = PzpLocal;