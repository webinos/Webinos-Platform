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
var path        = require("path");
var fs          = require("fs");
var os          = require("os");
var util        = require("util");

var webinos     = require("webinos")(__dirname);
var logging     = webinos.global.require(webinos.global.util.location, "lib/logging.js");
var wPath       = webinos.global.require(webinos.global.util.location, "lib/webinosPath.js");

var log         = Object.create(logging);
var certificate = webinos.global.require(webinos.global.manager.certificate_manager.location);

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
  } else  if ((type === "Pzp" || type === "PzhProvider")){
    return (os.hostname() + "_"+ type); //devicename_type
  } else {
    return name;
  }
};

function Config(friendlyName, webinosType, sessionIdentity) {
  certificate.call(this);
  this.friendlyName = friendlyName;
  this.webinosName  = fetchDeviceName(webinosType);
  this.webinosType  = webinosType;
  this.serverName   = sessionIdentity;
  this.webinosRoot  = wPath.webinosConfigPath()+"/"+this.webinosName;
  this.port         = {};
  this.defaultService = [];
  this.certData     = {};
  this.cert         = {};
   if (webinosType === "PzhProvider") {
    this.cert.master = {};
    this.cert.master.key_id = this.webinosName + "_master_" + this.webinosType;
    this.cert.conn   = {};
    this.cert.conn.key_id   = this.webinosName + "_conn_"   + this.webinosType;
    this.cert.web    = {}
    this.cert.web.key_id    = this.webinosName + "_web_"    + this.webinosType;
  } else if (type === "Pzh"){
    this.cert.master = {};
    this.cert.master.key_id = this.webinosName + "_master_" +this.webinosType;
    this.cert.conn   = {};
    this.cert.conn.key_id   = this.webinosName   + "_conn_"   +this.webinosType;
  } else if (type === "Pzp") {
    this.conn   = {};
    this.conn.key_id       = this.webinosName   + "_conn_"   +this.webinosType;
  }
}

util.inherits(Config, certificate);
/**
* @descripton Checks for master certificate, if certificate is not found
* it calls generating certificate function defined in certificate manager.
* This function is crypto sensitive.
* @param {function} callback It is callback function that is invoked after
* checking/creating certificates
*/
Config.prototype.setConfiguration = function (type, callback) {
  var self = this;
  if (typeof callback !== "function") {
    log.error("error", "callback missing");
    return;
  }
  self.fetchConfigDetails(function(){
    self.createDirectories(function() {
      var filePath = path.join(self.webinosRoot, self.webinosName+".json");
      fs.readFile(filePath, function(err, data) {
        if(err && err.code ==="EACCES") {
          callback("error", "permission", err);
          return;
        }
        if ( err && err.code=== "ENOENT" ) {// CREATE NEW CONFIGURATION
          try {
            var cn = type + ":"+ self.serverName + ":" + self.webinosName ;
            self.generateSelfSignedCertificate(type, cn,
              function(status, selfSignErr ) {
              if(status !== "success") {
                callback("error", "self sign", selfSignErr);
                return;
              } else {
                if (self.webinosType !== "Pzp") {
                  var cn = type + "CA:"+ self.serverName + ":" + self.webinosName ;
                  self.generateSelfSignedCertificate(type+"CA", cn,
                  function(status, errorDetails, key){ // Master Certificate
                    if(status === "success") {
                      callback("success", "", key);
                    } else {
                      callback("error", errorDetails);
                    }
                  });
                }
              }
            });
          } catch (err) {
            callback("error", "exception", err );
          }
        } else { // When configuration already exists, just load configuration file
          var configData = data.toString("utf8");
          config = JSON.parse(configData);
          self.fetchCertificate(self.webinosType, "internal", function(status, errorDetails, data) {
            if (status === "success") {
              callback(status, "", data);
            } else {
              callback(status, errorDetails, data );
            }
          });
        }
      });
    });
  });
};

Config.prototype.storeCertificate = function (type, certificate, ext_int, callback) {
  var self = this;
  if (typeof callback !== "function") {
    callback("error", "callback missing");
  } else if (typeof certificate === "undefined") {
    callback("error", "missing parameters");
  } else {
    var filePath = path.join(self.webinosRoot, "certificates", ext_int, type, self.webinosName, ".json");
    fs.writeFile(filePath, JSON.stringify(certificate, null, " "), function(err) {
      if(err) {
        callback("error", "store cert", err);
      } else {
        callback("success");
      }
    });
  }
};

Config.prototype.fetchCertificate = function(type, ext_int, callback) {
  var self = this;
  if (typeof callback !== "function") {
    callback("error", "callback not defined as function");
  } else if (typeof certificate === "undefined") {
    callback("error", "certificate data is missing");
  } else {
    var filePath = path.join(self.webinosRoot, "certificates", ext_int, type, self.webinosName, ".json");
    fs.readFile(filePath, function(data, err) {
      if (!err) {
        var certData = JSON.parse(data.toString());
        callback("success", certData);
      } else {
        callback("error", "read cert", err);
      }
    });
  }
};

Config.prototype.storeConfig = function(data) {
  var self = this;
  fs.writeFile(path.join(self.webinosRoot, self.webinosName, ".json"), JSON.stringify(data, null, " "),
    function(err) {
    if(err) {
      callback("error", "write file", err);
    } else {
      callback("success");
    }
  });
};


Config.prototype.createDirectories = function(callback) {
  var self = this;
  try {
    // Main webinos directory
    fs.readdir(wPath.webinosConfigPath(), function(err) {
      if ( err && err.code === "ENOENT" ) {
        fs.mkdirSync(wPath.webinosConfigPath(),"0700");
      }
      setTimeout(function(){
        // Configuration directory, which holds information about certificate, ports, openid details
        fs.readdir ( self.webinosRoot, function(err) {
          if ( err && err.code=== "ENOENT" ) {
            fs.mkdirSync( self.webinosRoot,"0700");
          }
          fs.readdir ( self.webinosRoot+"/policies", function(err) {
            if ( err && err.code=== "ENOENT" ) {
              fs.mkdirSync( self.webinosRoot+"/policies","0700");
            }
          });
          fs.readdir ( self.webinosRoot+"/certificates", function(err) {
            if ( err && err.code=== "ENOENT" ) {
              fs.mkdirSync( self.webinosRoot+"/certificates","0700");
            }
            fs.readdir ( self.webinosRoot+"/certificates/external", function(err) {
              if ( err && err.code=== "ENOENT" ) {
                fs.mkdirSync( self.webinosRoot+"/certificates/external","0700");
              }
            });
            fs.readdir ( self.webinosRoot+"/certificates/internal", function(err) {
              if ( err && err.code=== "ENOENT" ) {
                fs.mkdirSync( self.webinosRoot+"/certificates/internal","0700");
              }
              fs.readdir ( self.webinosRoot+"/certificates/internal/pzp", function(err) {
                if ( err && err.code=== "ENOENT" ) {
                  fs.mkdirSync( self.webinosRoot+"/certificates/internal/pzp","0700");
                }
              });
              fs.readdir ( self.webinosRoot+"/certificates/internal/pzh", function(err) {
                if ( err && err.code=== "ENOENT" ) {
                  fs.mkdirSync( self.webinosRoot+"/certificates/internal/pzh","0700");
                }
              });
            });
          });
          fs.readdir ( self.webinosRoot+"/userdata", function(err) {
            if ( err && err.code=== "ENOENT" ) {
              fs.mkdirSync( self.webinosRoot+"/userdata","0700");
            }
          });
          // logs
          fs.readdir ( self.webinosRoot+"/logs", function(err) {
            if ( err && err.code=== "ENOENT" ) {
              fs.mkdirSync( self.webinosRoot +"/logs","0700");
            }
          });
          // keys
          fs.readdir ( self.webinosRoot+"/keys", function(err) {
            if ( err && err.code=== "ENOENT" ) {
              fs.mkdirSync( self.webinosRoot +"/keys","0700");
            }
          });
        });
        callback("success");
      }, 100);
    });
  } catch (err){
    log.error(err.code);
    callback("error", "exception", err.code);
  }
};

Config.prototype.fetchConfigDetails = function(callback) {
  var self = this;
  fs.readFile("webinos_config.json", function(err,data) {
    if (!err) {
      var key, cert_data = JSON.parse(data.toString());
      self.port.providerPort           = cert_data.ports.provider;
      self.port.provider_webServerPort = cert_data.ports.provider_webServer;
      self.port.pzp_webSocket          = cert_data.ports.pzp_webSocket;
      self.port.pzp_web_webSocket      = cert_data.ports.pzp_web_webSocket;
      self.port.pzp_tlsServer          = cert_data.ports.pzp_tlsServer;
      self.port.pzp_zeroConf           = cert_data.ports.pzp_zeroConf;

      self.certData.country            = cert_data.certConfiguration.country;
      self.certData.state              = cert_data.certConfiguration.state;
      self.certData.city               = cert_data.certConfiguration.city;
      self.certData.orgName            = cert_data.certConfiguration.orgname;
      self.certData.orgUnit            = cert_data.certConfiguration.orgunit;
      self.certData.cn                 = cert_data.certConfiguration.cn;
      self.certData.email              = cert_data.certConfiguration.email;

      for (key in cert_data.pzhDefaultServices) {
        self.defaultService.push({"name": cert_data.pzhDefaultServices[key], "params":{}});
      };
    } else { // We failed in reading configuration file, assign defaults
      self.port.providerPort           = 80;
      self.port.provider_webServerPort = 443;
      self.port.pzp_webSocket          = 8081;
      self.port.pzp_web_webSocket      = 8080;
      self.port.pzp_tlsServer          = 8040;
      self.port.pzp_zeroConf           = 4321;
    }
    callback("success");
  });
};

module.exports = Config;
