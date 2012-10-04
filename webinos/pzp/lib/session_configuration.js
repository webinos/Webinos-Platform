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
var path        = require("path");
var fs          = require("fs");
var os          = require("os");
var util        = require("util");

var webinos     = require("webinos")(__dirname);
var logger      = webinos.global.require(webinos.global.util.location, "lib/logging.js")(__filename) || console;
var wPath       = webinos.global.require(webinos.global.util.location, "lib/webinosPath.js");
var wId         = webinos.global.require(webinos.global.util.location, "lib/webinosId.js")

var certificate = webinos.global.require(webinos.global.manager.certificate_manager.location);


function Config() {
  certificate.call(this);
  this.metaData       = {};
  this.trustedList    = {pzh:[], pzp:[]};
  this.crl            = "";
  this.policies       = {};//todo: integrate policy in the configuration
  this.userData       = {name: ""};
  this.userPref       = {};
  this.serviceCache   = [];
}

util.inherits(Config, certificate);

function createNewConfiguration(self, webinosType, callback){
  var cn;
  try {
    cn = self.metaData.webinosType + ":"+self.metaData.webinosName ;
    self.generateSelfSignedCertificate(self.metaData.webinosType, cn, function(status, value ) {
      if(!status) {
        logger.error("failed generating self signed certificate");
        return callback(status, value);
      } else {
        if (self.metaData.webinosType !== "Pzp") {
          cn = self.metaData.webinosType + "CA:" + self.metaData.webinosName ;
          self.generateSelfSignedCertificate(self.metaData.webinosType+"CA", cn, function(status, value){ // Master Certificate
            if (status) {
              logger.log("connection and master certificate generated");
              self.storeAll();
              return callback(true);
            } else {
              logger.error("failed generating master certificate")
              callback(false, value);
            }
          });
        } else {
          self.storeAll();
          return callback(true);
        }
      }
    });
  } catch (err) {
    return callback(false, err);
  }
}
/**
* Checks if metaData exists, if not creates a range of certificates
* it calls generating certificate function defined in certificate manager.
* This function is crypto sensitive.
*
* @param {function} callback It is callback function that is invoked after
* checking/creating certificates
*/
Config.prototype.setConfiguration = function (friendlyName, webinosType, sessionIdentity, callback) {
  var self = this, conn_key, cn;
  var deviceName = wId.fetchDeviceName(webinosType, friendlyName);
  var webinosRoot  =  path.join(wPath.webinosPath(), deviceName);

  logger.addType(deviceName); // per instance this should be only set once..

  if (typeof callback !== "function") {
    logger.error("callback missing");
    return;
  }

  self.fetchMetaData(webinosRoot, deviceName, friendlyName, webinosType, sessionIdentity,function(status, value){
    if (status && value && value.code=== "ENOENT") {//meta data does not exist
      createNewConfiguration(self, webinosType, callback);
    } else { //metaData
      self.metaData = value;
      self.fetchCertificate("internal", function(status, value) {
        if (status) {  // certificate
          if (value === {}) { createNewConfiguration(self,webinosType, callback); } else { self.cert.internal = value; }
          self.fetchCertificate("external", function(status, value){
            if(status){
              if (value === {}) { createNewConfiguration(self,webinosType, callback);} else { self.cert.external = value;}
            }
          });
          self.fetchServiceCache(function(status, value){
            if(status){
              if (value === {}) { createNewConfiguration(self,webinosType, callback);} else { self.serviceCache = value;}
            }
          });
          self.fetchCrl(function(status, value) {
            if(status ){ // crl
              if (value === "") { createNewConfiguration(self,webinosType, callback); } else { self.crl = value; }
              self.fetchUserData(function(status, value) {
                if (status) { //user data
                  if (value === {}) { createNewConfiguration(self, webinosType, callback); } else { self.userData = value; }
                  self.fetchUserPref(function(status,value)   {
                    if (status) { // user pref
                      if (value === {}) { createNewConfiguration(self,webinosType, callback); } else { self.userPref = value; }
                      self.fetchTrustedList(function(status,value) {
                        if (status) { // trusted list
                          if (value === {}){ createNewConfiguration(self, webinosType, callback); } else { self.trustedList = value;
                            return callback(status, value);
                          }
                        } else {
                          callback(status, value);
                        }
                      });
                    } else { // else userData
                      return callback(status, value);
                    }
                  });
                } else { // else trusted list
                  return callback(status, value);
                }
              });
            } else { //else crl
              return callback(status, value);
            }
          });
        } else { // else certificate
          return callback(status, value);
        }
      });
    }
  });
};

Config.prototype.storeAll = function() {
  var self = this;
  self.storeCertificate(self.cert.internal, "internal");
  self.storeCrl(self.crl);
  self.storeTrustedList(self.trustedList);
};

function processData(data, callback){
  var dataString = data.toString();
  if (dataString !== "") {
    var JSONData = JSON.parse(dataString);
    return callback(true, JSONData);
  } else {
    return callback(true,{});
  }
}
Config.prototype.storeCertificate = function (certificate, ext_int) {
  var self = this;
  var filePath = path.join(self.metaData.webinosRoot, "certificates", ext_int, self.metaData.webinosName+".json");
  fs.writeFile(path.resolve(filePath), JSON.stringify(certificate, null, " "), function(err) {
    if(err) {
      logger.error("failed saving " + ext_int +" certificate");
    } else {
      logger.log("saved " + ext_int +" certificate");
    }
  });
};

Config.prototype.fetchCertificate = function(ext_int, callback) {
  var self = this;
  var filePath = path.join(self.metaData.webinosRoot, "certificates", ext_int, self.metaData.webinosName+".json");
  fs.readFile(path.resolve(filePath), function(err, data) {
    if (!err) {
     processData(data,callback);
    } else {
      callback(false, err);
    }
  });
};

Config.prototype.storeMetaData = function(data) {
  var self = this;
  var filePath = path.join(self.metaData.webinosRoot, self.metaData.webinosName+".json");
  fs.writeFile(path.resolve(filePath), JSON.stringify(data, null, " "), function(err) {
    if(err) {
      logger.error("failed saving pzp/pzh metadata");
    } else {
      logger.log("stored pzp/pzh metadata");
    }
  });
};
Config.prototype.fetchMetaData = function(webinosRoot, webinosName, friendlyName, webinosType, sessionIdentity, callback) {
  var self = this;
  var filePath = path.join(webinosRoot, webinosName+".json");
  fs.readFile(path.resolve(filePath), function(err, data) {
      if(err) {
        self.fetchConfigDetails(friendlyName, webinosType, sessionIdentity, function(status, value) {
          if (status) {
            callback(true, err);// this is bit deceiving, we return  err as we want to trigger the certificate creation
          } else {
            callback(false, "webinos configuration failed to load, delete webinos directory and try again")
          }
        });
      } else {
       processData(data,callback);
      }
    });
};
Config.prototype.storeCrl = function (data) {
  var self = this;
  var filePath = path.join(self.metaData.webinosRoot,"crl.pem");
  fs.writeFile(path.resolve(filePath), data, function(err) {
    if(err) {
      logger.error("failed saving crl");
    } else {
      logger.log("saved crl");
    }
  });
};
Config.prototype.fetchCrl = function (callback) {
  var self = this;
  var filePath = path.join(self.metaData.webinosRoot, "crl.pem");
  fs.readFile(path.resolve(filePath), function(err, data) {
    if(err) {
      return callback(false, err);
    } else {
      return callback(true, data.toString());
    }
  });
};
Config.prototype.storeTrustedList = function (data) {
  var self = this;
  var filePath = path.join(self.metaData.webinosRoot,"trustedList.json");
  fs.writeFile(path.resolve(filePath), JSON.stringify(data, null, " "), function(err) {
    if(err) {
      logger.error("failed saving pzh/pzp in the trusted list");
    } else {
      logger.log("saved pzp/pzh in the trusted list");
    }
  });
};
Config.prototype.fetchTrustedList = function (callback) {
  var self = this;
  var filePath = path.join(self.metaData.webinosRoot, "trustedList.json");
  fs.readFile(path.resolve(filePath), function(err, data) {
    if(err) {
      return callback(false, err);
    } else {
      var dataString = data.toString();
      if (dataString !== "") {
        var JSONData = JSON.parse(dataString);
        return callback(true, JSONData);
      } else {
        return callback(true, {pzh:[], pzp:[]});
      }
    }
  });
};
Config.prototype.storeUserData = function (data) {
  var self = this;
  var filePath = path.join(self.metaData.webinosRoot,"userData",self.metaData.webinosName+".json");
  fs.writeFile(path.resolve(filePath), JSON.stringify(data, null, " "), function(err) {
    if(err) {
      logger.error("failed saving user details");
    } else {
      logger.log("saved user details");
    }
  });
};
Config.prototype.fetchUserData = function (callback) {
  var self = this;
  var filePath = path.join(self.metaData.webinosRoot,"userData",self.metaData.webinosName+".json");
  fs.readFile(path.resolve(filePath), function(err, data) {
    if(err) {
      return callback(false, err);
    } else {
     processData(data,callback);
    }
  });
};
Config.prototype.storeServiceCache = function (data) {
  var self = this;
  var filePath = path.join(self.metaData.webinosRoot,"userData",self.metaData.webinosName+"_serviceCache.json");
  fs.writeFile(path.resolve(filePath), JSON.stringify(data, null, " "), function(err) {
    if(err) {
      logger.error("failed saving service cache");
    } else {
      logger.log("saved service cache");
    }
  });
};
Config.prototype.fetchServiceCache = function (callback) {
  var self = this;
  var filePath = path.join(self.metaData.webinosRoot,"userData",self.metaData.webinosName+"_serviceCache.json");
  fs.readFile(path.resolve(filePath), function(err, data) {
    if(err) {
      return callback(false, err);
    } else {
      processData(data, callback);
    }
  });
};
Config.prototype.storeUserPref = function (data) {
  var self = this;
  var filePath = path.join(self.metaData.webinosRoot,"userData",self.metaData.webinosName+"_pref.json");
  fs.writeFile(path.resolve(filePath), JSON.stringify(data, null, " "), function(err) {
    if(err) {
      logger.error("failed saving user preferences");
    } else {
      logger.log("saved user preferences");
    }
  });
};
Config.prototype.fetchUserPref = function (callback) {
  var self = this;
  var filePath = path.join(self.metaData.webinosRoot,"userData",self.metaData.webinosName+"_pref.json");
  fs.readFile(path.resolve(filePath), function(err, data) {
    if(err) {
      return callback(false, err);
    } else {
     processData(data, callback);
    }
  });
};
Config.prototype.createDirectories = function(callback) {
  var self = this, dirPath;
  try {
    // Main webinos directory
    fs.readdir(wPath.webinosPath(), function(err) {
      if (err && err.code === "ENOENT"){
        fs.mkdirSync(wPath.webinosPath(),"0700");
      }
      setTimeout(function(){
        fs.readdir ( path.resolve(path.join(wPath.webinosPath(),"logs")), function(err) { //logs
          if ( err && err.code=== "ENOENT" ) {
            fs.mkdirSync( wPath.webinosPath() +"/logs","0700");
          }
          fs.readdir(self.metaData.webinosRoot, function(err) {
            if ( err && err.code === "ENOENT" ) {
              fs.mkdirSync(self.metaData.webinosRoot,"0700");
            }
            fs.readdir (path.resolve(path.join(self.metaData.webinosRoot, "wrt")), function(err) {
              if ( err && err.code=== "ENOENT" ) {
                fs.mkdirSync( self.metaData.webinosRoot +"/wrt","0700");
              }
              fs.readdir (path.resolve(path.join(self.metaData.webinosRoot, "policies")), function(err) {
                if ( err && err.code=== "ENOENT" ) {
                  fs.mkdirSync( self.metaData.webinosRoot+"/policies","0700");
                }
                fs.readdir ( path.resolve(path.join(self.metaData.webinosRoot, "certificates")), function(err) {
                  if ( err && err.code=== "ENOENT" ) {
                    fs.mkdirSync( self.metaData.webinosRoot+"/certificates","0700");
                  }
                  fs.readdir ( path.resolve(path.join(self.metaData.webinosRoot, "certificates", "external")), function(err) {
                    if ( err && err.code=== "ENOENT" ) {
                      fs.mkdirSync( self.metaData.webinosRoot+"/certificates/external","0700");
                    }
                    fs.readdir ( path.resolve(path.join(self.metaData.webinosRoot,"certificates","internal")), function(err) {
                      if ( err && err.code=== "ENOENT" ) {
                        fs.mkdirSync( self.metaData.webinosRoot+"/certificates/internal","0700");
                      }
                      fs.readdir ( path.resolve(path.join(self.metaData.webinosRoot,"userData")), function(err) {
                        if ( err && err.code=== "ENOENT" ) {
                          fs.mkdirSync( self.metaData.webinosRoot+"/userData","0700");
                        }
                        fs.readdir ( path.resolve(path.join(self.metaData.webinosRoot, "keys")), function(err) {
                          if ( err && err.code=== "ENOENT" ) {
                            fs.mkdirSync( self.metaData.webinosRoot +"/keys","0700");
                          }
                          return callback(true);
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      }, 200);
    });
  } catch (err){
    return callback(false, err.code);
  }
};

Config.prototype.fetchConfigDetails = function(friendlyName, webinosType, sessionIdentity, callback) {
  var self = this;
  fs.readFile("./webinos_config.json", function(err,data) {
    if (!err) {
      var key, userPref = JSON.parse(data.toString());
      self.userPref.ports={};
      self.userPref.ports.provider           = userPref.ports.provider;
      self.userPref.ports.provider_webServer = userPref.ports.provider_webServer;
      self.userPref.ports.pzp_webSocket      = userPref.ports.pzp_webSocket;
      self.userPref.ports.pzp_web_webSocket  = userPref.ports.pzp_web_webSocket;
      self.userPref.ports.pzp_tlsServer      = userPref.ports.pzp_tlsServer;
      self.userPref.ports.pzp_zeroConf       = userPref.ports.pzp_zeroConf;

      if (self.userData.name === "") {
        self.userData.country         = userPref.certConfiguration.country;
        self.userData.email           = userPref.certConfiguration.email;
      }
      self.userData.state           = userPref.certConfiguration.state;
      self.userData.city            = userPref.certConfiguration.city;
      self.userData.orgName         = userPref.certConfiguration.orgname;
      self.userData.orgUnit         = userPref.certConfiguration.orgunit;
      self.userData.cn              = userPref.certConfiguration.cn;

      for (key in userPref.pzhDefaultServices) {
        self.serviceCache.push({"name": userPref.pzhDefaultServices[key], "params":{}});
      }
    } else { // We failed in reading configuration file, assign defaults
      self.userPref.ports ={};
      self.userPref.ports.provider               = 80;
      self.userPref.ports.provider_webServer     = 443;
      self.userPref.ports.pzp_webSocket          = 8081;
      self.userPref.ports.pzp_web_webSocket      = 8080;
      self.userPref.ports.pzp_tlsServer          = 8040;
      self.userPref.ports.pzp_zeroConf           = 4321;
    }
    self.metaData.friendlyName = friendlyName;
    self.metaData.webinosType  = webinosType;
    self.metaData.serverName   = sessionIdentity;
    self.metaData.webinosName  = wId.fetchDeviceName(webinosType, friendlyName);
    self.metaData.webinosRoot  = wPath.webinosPath() + "/"+ self.metaData.webinosName;
    self.createDirectories(function(status){
      if (status){
        self.storeMetaData(self.metaData);
        self.storeUserData(self.userData);
        self.storeUserPref(self.userPref);
        self.storeServiceCache(self.serviceCache);
       callback(true);
      } else {
        callback(false, "failed creating directories");
      }
    });
  });
};

module.exports = Config;
