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
var path          = require("path");
var fs            = require("fs");
var os            = require("os");

var certificate = require("./session_certificate");
var common      = require("./session_common");
var log         = new common.debug("config");

fetchDeviceName = function(type) {
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
    }

    function onsuccess(prop_value, prop){
      return (prop_value + "_"+ type); //devicename_type
    }

    function onerror(){
      log.error("android get device name returns error");
      return ("android"+ "_"+ type);
    }

    var devStatusModule = bridge.load('org.webinos.impl.DevicestatusImpl', this);
    devStatusModule.getPropertyValue(onsuccess, onerror, prop);
  } else  if ((type === "Pzp" || type === "PzhFarm")){
    return (os.hostname() + "_"+ type); //devicename_type
  } else {
    return name;
  }
};

fetchPortDetails = function() {
  fs.readFile("webinos_config.json", function(err,data) {
    var port = {};
    if (!err) {
      var port_data = JSON.parse(data.toString());
      port.farmPort           = port_data.ports.farm;
      port.farm_webServerPort = port_data.ports.farm_webServer;
      port.pzp_webSocket      = port_data.ports.pzp_webSocket;
      port.pzp_web_webSocket  = port_data.ports.pzp_web_webSocket;
      port.pzp_tlsServer      = port_data.ports.pzp_tlsServer;
      port.pzp_zeroConf       = port_data.ports.pzp_zeroConf;
      return port;
    } else { // We failed in reading configuration file, assign defaults
      port.farmPort           = 80;
      port.farm_webServerPort = 443;
      port.pzp_webSocket      = 8081;
      port.pzp_web_webSocket  = 8080;
      port.pzp_tlsServer      = 8040;
      port.pzp_zeroConf       = 4321;
      return port;
    }
  });
};

/**
 * @description: returns root path of .webinos folder. In this folder all information is stored.
 */
webinosConfigPath = function() {
  "use strict";
  var webinosDemo;
  switch(os.type().toLowerCase()){
    case "windows_nt":
      webinosDemo = path.resolve(process.env.appdata + "/webinos/");
      break;
    case "linux":
      switch(os.platform().toLowerCase()){
        case "android":
          webinosDemo = path.resolve(process.env.EXTERNAL_STORAGE + "/.webinos/");
          break;
        case "linux":
          webinosDemo = path.resolve(process.env.HOME + "/.webinos/");
          break;
      }
      break;
    case "darwin":
      webinosDemo = path.resolve(process.env.HOME + "/.webinos/");
      break;
  }
  return webinosDemo;
};

var Config = function(friendlyName, webinosType, sessionIdentity) {
  this.friendlyName = friendlyName;
  this.webinosName  = fetchDeviceName(webinosType);
  this.webinosType  = webinosType;

  this.serverName   = sessionIdentity;
  this.ports        = fetchPortDetails();

  this.states       = ["NOT_CONNECTED", "CONNECTING", "CONNECTED", "DISCONNECTING"];
  this.modes        = ["VIRGIN", "HUB", "PEER"];

  this.certificate  = {"master":"", "connection":""};

  this.webinosRoot  = webinosConfigPath()+"/"+this.webinosName+"/";
}

/**
* @descripton Checks for master certificate, if certificate is not found
* it calls generating certificate function defined in certificate manager.
* This function is crypto sensitive.
* @param {function} callback It is callback function that is invoked after
* checking/creating certificates
*/
Config.prototype.setConfiguration = function (callback) {
  var self = this;
  if (typeof callback !== "function") {
    callback("error", "callback missing");
    return;
  }
  var filePath = path.join(self.webinosRoot, self.webinosName+".json");
  fs.readFile(filePath, function(err, data) {
      if(err && err.code ==="EACCES") {
        log.error("configuration file read failed, try running as sudo or admin ");
        process.exit();
      }
      if ( err && err.code=== "ENOENT" ) {// CREATE NEW CONFIGURATION
        try {
          certificate.generateSelfSignedCertificate(self.webinosType,
            function(status, selfSignErr, conn_key, conn_cert, conn_csr ) {
            if(status !== "success") {
              log.error("connection self signed certificate failed");
              callback("error", "connection self signed certificate failed");
              return;
            } else {
              log.info("generated connection certificates");
              if (self.webinosType !== "Pzp") {
                certificate.generateMasterCertificate(self.certificate, function(status, master_cert){ // Master Certificate
                  if (status === "success") {
                    certificate.generateSignedCertificate(conn_csr, master_cert, null, self.webinosType, // Connecton
                    function(status, config_signed) {
                      if(status === "success") {
                        callback("success", config_signed, conn_key);
                      } else {
                        callback("error", "signing connection certificate failed");
                      }
                    });
                  } else {
                    callback("error", "generating master certificate failed");
                  }
                });
              } else {
                try{
                  // Used for initial connection, will be replaced by cert received from PZH
                  self.certificate.connection = conn_cert.cert;
                  self.certificate.csr        = csr;
                  self.storePzpCertificate(self.certificate, function(status) {
                    if (status === "success") {
                      callback(status, config, conn_key, config.csr);
                    }
                  });
                } catch (err) {
                  log.error("storing configuration"+ err);
                  return;
                }
                }
              } else {
                log.error("generating self signed cert: ");
                callback("undefined");
              }
            });
          } catch (err) {
            log.error("generating certificates" + err);
            callback("undefined");
          }
        } else { // When configuration already exists, just load configuration file
            var configData = data.toString("utf8");
            config = JSON.parse(configData);
            if (config.serverName.split('/') === -1 && pzhName === "") {
              log.error("Please specify pzh-name to connect to pzh, else you will be running in virgin mode");
            } else if (pzhName !== "") {
              if (config.serverName.split('/') === -1){
                config.serverName = config.serverName + '/' + pzhName;
              }
            }
            if (config.master.cert === "" ){
              session_configuration.fetchKey(config.own.key_id, function(conn_key){
                callback(config, conn_key, config.csr);
              });
            } else {
              session_configuration.fetchKey(config.own.key_id, function(conn_key){
                callback(config, conn_key);
              });
            }
        }
      });
  });
};

session_configuration.storeConfig = function (config, callback) {
  var webinosDemo = common.webinosConfigPath();
  if (typeof config!== "undefined") {
    fs.writeFile((webinosDemo+ "/config/"+config.name+".json"), JSON.stringify(config, null, " "), function(err) {
      if(err) {
        callback(false);
        log.error("error saving configuration file - "+config.name);
      } else {
        callback(true);
        log.info("saved configuration file - " + config.name);
      }
    });
  }
}
