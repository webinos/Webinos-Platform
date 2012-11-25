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
* Copyright 2012 Ziran Sun, Samsung Electronics(UK) Ltd
******************************************************************************/

(function ()	{
 
  var os = require('os');
  var webinos_= require("find-dependencies")(__dirname);
  var logger  = webinos_.global.require(webinos_.global.util.location, "lib/logging.js")(__filename);
  var element  = webinos_.global.require(webinos_.global.util.location, "lib/peerElement.js");
  
  var mdns = null;
  var bridge = null;
  var connectPeers = null;
  
  var localconnectionManager = function () {

    // Load zeroconf mdns module 
		if(os.platform().toLowerCase() == "android")  {
      try{
        this.bridge = require('bridge');
        this.mdns = this.bridge.load('org.webinos.impl.discovery.DiscoveryMdnsImpl', this);
      } catch(e) {
        logger.error("Android Zeroconf mdns module could not be loaded!" + e);
      }
		}
    else {
      try {
        this.mdns = require('mdns');
      } catch(e) {
        logger.error("Zeroconf mdns module could not be loaded!" + e);
      }
    }
 };

	/**
	 * Set the connectPeers function that should be used to connect other peers around.
	 * Developers use this function to call different connectPeers APIs under
	 * different working scenrios. 
	 * @param connectPeersFunction A function that used for connecting other peers.
	 */
	localconnectionManager.prototype.setConnectPeersfunction = function (connectPeersFunction) {
	 	connectPeers = connectPeersFunction;
	};

	localconnectionManager.prototype.connectPeers = function (msg) {
	  connectPeers(msg);
	}; 
  
  /**
	 * Register and advertise Peer services in the underlayer discovery scheme specified. 
   * @param serviceType. Service type string. e.g. for PZP using "pzp". 
	 * @param discoveryMethod. Discovery scheme prefered. Call this function every
   * time if prefer multiple discovery schemes.
   * @param port. Port used for advertising the service. 
   * TODO: DiscoveryMethod as an array so to support multiple methods; replace 
   * serviceType with URI string, e.g. http://webinos.org/pzp (not sure if this makes sense though) 
   */
  localconnectionManager.prototype.advertPeers = function (serviceType, discoveryMethod, port) {
    switch(discoveryMethod)
    {
      case 'upnp':
        break;
      case 'bluetooth':
        break;
      //TODO: by default using zeroconf. This will be replaced by a self-scan 
      //process looking for all available discovery methods that are supported  
      case 'zeroconf':
      default:
        if(os.platform().toLowerCase() == "android") {
          var serviceString = "_" + serviceType + "._tcp.local.";
          logger.log("Android mdns-registering service" + serviceString);
          try {
            this.mdns.advertServices(serviceString);
            logger.log("Android mdns-registering service - END");
          }
          catch(e) {
            console.error("Android mdns-registering service- error: "+ e.message);
          } 
        }
        else
        {
          if(typeof this.mdns!=="undefined") {
            logger.log("mdns-registering service");
            var ad = this.mdns.createAdvertisement(this.mdns.tcp(serviceType), port);
            logger.log("mdns-starting advertising service");
            ad.start();
            ad.on('error', function(err) {
            logger.error("mdns-registering service- error:  (" + err+")");
            });
          }
        }
        break;
    }
	};  
  
   /**
	 * Find other PZP Peers and try to connect to the found peers. 
   * @param serviceType. service type string. e.g. for PZP using "pzp". 
	 * @param discoveryMethod. Discovery scheme prefered. 
   * @prarm port. TLS port used for establishing connections.  
   * @param option. Other options specified by particular connection scheme. Specify it as
   * pzh id if serviceType is as "pzp"
   */
  localconnectionManager.prototype.findPeers = function(serviceType, discoveryMethod, port, option){
    
    switch(discoveryMethod)
    {
      case 'upnp':
        break;
      case 'bluetooth':
        break;
      //TODO: by default using zeroconf. This should be replaced by a self-scan 
      //process looking for all available discovery methods that are supported  
      case 'zeroconf':
      default:
        if(os.platform().toLowerCase() == "android") {
          function onFound(service){
            for (var i=0;i<service.deviceAddresses.length;i++)
            { 
              if((typeof service.deviceNames[i] !== "undefined") && (typeof service.deviceAddresses[i] !== "undefined")) {
               logger.log("Found peer:" + service.deviceAddresses[i]);
                var msg ={};
                var nm = service.deviceNames[i];
                
                //Remove the IP address part of Android name
                if(nm.search("/") !== -1) {
                  //Fetch name of the android device
                  var index = nm.indexOf('/');
                  msg.name = nm.slice(0, index);
                }
                else
                  msg.name    = service.deviceNames[i];
                
                msg.address = service.deviceAddresses[i];
                logger.log("found peer address:" + msg.address);
                msg.port    = port;
                
                //Webinos - to compromise PZP name defined in core
                if(serviceType === "pzp")
                {
                  msg.name    = option + "/" + msg.name + '_Pzp'; //override peer name with PZP specific
                  logger.log("Connecting to peer: " + msg.name);
                }
                connectPeers(msg);
              } 
            }
          }
          
          var serviceString = "_" + serviceType + "._tcp.local.";
          try{
              var servicetype = {
              api: serviceString
            };
            
            try {
              this.mdns.findServices(servicetype, onFound);
              logger.log("Android-start finding other peers");
            }
            catch(e) {
              logger.error("Android findPzp - error: "+e.message);
            }
          }
          catch(e){
            logger.error("error: "+e.message);
          }
        }
        else
        {
          if(typeof this.mdns!=="undefined") {
            var browser = this.mdns.createBrowser(this.mdns.tcp(serviceType));
            var msg ={};
            
            browser.on('error', function(err) {
              logger.error("zeroconf mdns browser error: (" + err+")");
            });
 
            browser.start();
 
            browser.on('serviceUp', function(service) {
              logger.log("Peer Discovery zeroconf mdns service up");
              
              var nm = element.getPeerElement(service, 'name');
              //check nm content
              if(nm.search("/") !== -1) {
              	//split name and address
              	var index = nm.indexOf('/');
              	msg.name = nm.slice(0, index);
              	var mAddr = nm.slice(index+1, nm.length);
              	//replace "_" with "."
              	msg.address = mAddr.replace(/_/g, '.');
              }
              else
              {
              	msg.name    = nm;
              	logger.log("Found peer name:" + msg.name);
              	msg.address = element.getPeerElement(service, 'addresses');
              	logger.log("Found peer address:" + msg.address);
              }	
              logger.log("check mdns discovery list");
              var hostname = os.hostname();
              
              if(msg.name !== os.hostname()) {
                logger.log("found other host");
                if(serviceType === "pzp")
                  msg.name = option + "/" + msg.name + "_Pzp";
                connectPeers(msg);
              }
            });

            browser.on('serviceDown', function(service) {
              logger.log("service down: ", service);
            });

            browser.on('serviceChanged', function(service) {
              logger.log("service changed: ", service);
            });
          }
        }  
      break;
    }
  };
  
  exports.localconnectionManager = localconnectionManager;

}());
