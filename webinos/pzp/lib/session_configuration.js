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
var logging     = webinos.global.require(webinos.global.util.location, "lib/logging.js");
var wPath       = webinos.global.require(webinos.global.util.location, "lib/webinosPath.js");
var wId         = webinos.global.require(webinos.global.util.location, "lib/webinosId.js");

var log         = Object.create(logging);
var certificate = webinos.global.require(webinos.global.manager.certificate_manager.location);


function Config() {
  certificate.call(this);
  this.metaData       = {};
  this.trustedList    = {};
  this.crl            = "";
  this.policies       = {};//todo: integrate policy in the configuration
  this.userData       = {};
  this.userPref       = {};
  this.serviceCache   = [];
}

util.inherits(Config, certificate);
/**
* @descripton Checks for master certificate, if certificate is not found
* it calls generating certificate function defined in certificate manager.
* This function is crypto sensitive.
* @param {function} callback It is callback function that is invoked after
* checking/creating certificates
*/
Config.prototype.setConfiguration = function (friendlyName, webinosType, sessionIdentity, callback) {
  var self = this;
  if (typeof callback !== "function") {
    log.error("callback missing");
    return;
  }
  self.fetchMetaData(wPath.webinosPath(), wId.fetchDeviceName(webinosType, friendlyName), friendlyName, webinosType, sessionIdentity, function(status, value){
    if (!status ) {//meta data
      try {
        if (value && value.code=== "ENOENT" ) {
          var cn = self.metaData.webinosType + ":"+ self.metaData.serverName + ":" + self.metaData.webinosName ;
          self.generateSelfSignedCertificate(type, cn,
            function(status, value ) {
            if(!status) {
              return callback(status, value);
            } else {
              if (self.metaData.webinosType !== "Pzp") {
                var cn = self.metaData.webinosType + "CA:"+ self.metaData.serverName + ":" + self.metaData.webinosName ;
                self.generateSelfSignedCertificate(self.metaData.webinosType+"CA", cn,
                function(status, value){ // Master Certificate
                  if (status) {
                    self.storeCertificate(self.metaData.webinosType, self.config.cert.internal, "internal", function(status, value){
                      if (status) {
                        self.storeCrl(self.crl, function(status, value){
                          return callback(status, value);
                        });
                      } else {
                        return callback(status, value);
                      }
                    });
                  } else {
                    return callback(status, value);
                  }
                });
              } else {
                self.storeMetadata(self.metaData, function(status, value){
                  if (status) {
                    self.storeCertificate(self.metaData.webinosType, self.config.cert.internal, "internal", function(status, value){
                      return callback(status, value);
                    });
                  }
                });
              }
            }
          });
        } else {
          callback(false, "failed reading or storing configuration data");
        }
      } catch (err) {
        return callback(false, err);
      }
    } else { //metaData
      self.metaData = JSON.parse(value.toString("utf8"));
      self.fetchCertificate(self.metaData.webinosType, "internal", function(status, value) {
        if (status) {  // certificate
          self.cert.internal = JSON.parse(value.toString());
          self.fetchCrl(function(status, value) {
            if(status ){ // crl
              self.crl = value;
              self.trustedList(function(status,value) {
                if (status) { // trusted list
                  self.trustedList = JSON.parse(value.toString());
                  self.fetchUserData(function(status, value) {
                    if (status) { //user data
                      self.userData = JSON.parse(value.toString());
                      self.fetchUserPref(function(status,value)   {
                        if (status) {
                          self.userPref = JSON.parse(value.toString());
                          return callback(status);
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

Config.prototype.storeCertificate = function (type, certificate, ext_int, callback) {
  var self = this;
  var filePath = path.join(self.metaData.webinosRoot, "certificates", ext_int, type, self.metaData.webinosName, ".json");
  fs.writeFile(path.resolve(filePath), JSON.stringify(certificate, null, " "), function(err) {
    if(err) {
      return callback(false, err);
    }
    else {
      return callback(true);
    }
  });
};

Config.prototype.fetchCertificate = function(type, ext_int, callback) {
  var self = this;
  var filePath = path.join(self.metaData.webinosRoot, "certificates", ext_int, type, self.metaData.webinosName, ".json");
  fs.readFile(path.resolve(filePath), function(err, data) {
    if (!err) {
      var certData = JSON.parse(data.toString());
      callback(true, certData);
    } else {
      callback(false, err);
    }
  });
};

Config.prototype.storeMetaData = function(data, callback) {
  var self = this;
  var filePath = path.join(self.metaData.webinosRoot, self.metaData.webinosName+".json");
  fs.writeFile(path.resolve(filePath), JSON.stringify(data, null, " "), function(err) {
    if(err) {
      callback(false, err);
    } else {
      callback(true);
    }
  });
};
Config.prototype.fetchMetaData = function(webinosPath, webinosName, friendlyName, webinosType, sessionIdentity, callback) {
  var self = this;
  var filePath = path.join(webinosPath, webinosName+".json");
  fs.readFile(path.resolve(filePath), function(err, data) {
      if(err) {
        self.fetchConfigDetails(friendlyName, webinosType, sessionIdentity, function(status, value) {
          if (status) {
            callback(err);
          } else {
            callback(false, "webinos configuration failed to load, delete webinos directory and try again")
          }
        });
      } else {
        var metadata = JSON.parse(data.toString());
        callback(true, metadata);
      }
    });
};
Config.prototype.storeCrl = function (data, callback) {
  var self = this;
  var filePath = path.join(self.metaData.webinosRoot,"crl.pem");
  fs.writeFile(path.resolve(filePath), JSON.stringify(data, null, " "), function(err) {
    if(err) {
      return callback(false, err);
    }
    else {
      return callback(true);
    }
  });
};
Config.prototype.fetchCrl = function (callback) {
  var self = this;
  var filePath = path.join(self.metaData.webinosRoot, "crl.pem");
  fs.readFile(path.resolve(filePath), function(err, data) {
    if(err) {
      return callback(false, err);
    }
    else {
      return callback(true, data.toString());
    }
  });
};
Config.prototype.storeTrustedList = function (data, callback) {
  var self = this;
  var filePath = path.join(self.metaData.webinosRoot,"trustedList.json");
  fs.writeFile(path.resolve(filePath), JSON.stringify(data, null, " "), function(err) {
    if(err) {
      return callback(false, err);
    }
    else {
      return callback(true);
    }
  });
};
Config.prototype.fetchTrustedList = function (callback) {
  var self = this;
  var filePath = path.join(self.metaData.webinosRoot, "trustedList.json");
  fs.readFile(path.resolve(filePath), function(err, data) {
    if(err) {
      return callback(false, err);
    }
    else {
      var JSONData = JSON.parse(data.toString());
      return callback(true, JSONData);
    }
  });
};
Config.prototype.storeUserData = function (data, callback) {
  var self = this;
  var filePath = path.join(self.metaData.webinosRoot,"userData",self.metaData.webinosName+".json");
  fs.writeFile(path.resolve(filePath), JSON.stringify(data, null, " "), function(err) {
    if(err) {
      return callback(false, err);
    }
    else {
      return callback(true);
    }
  });
};
Config.prototype.fetchUserData = function (callback) {
  var self = this;
  var filePath = path.join(self.metaData.webinosRoot,"userData",self.metaData.webinosName+".json");
  fs.readFile(path.resolve(filePath), function(err, data) {
    if(err) {
      return callback(false, err);
    }
    else {
      var JSONData = JSON.parse(data.toString());
      return callback(true, JSONData);
    }
  });
};
Config.prototype.storeUserPref = function (data, callback) {
  var self = this;
  var filePath = path.join(self.metaData.webinosRoot,"userData",self.metaData.webinosName+"_pref.json");
  fs.writeFile(path.resolve(filePath), JSON.stringify(data, null, " "), function(err) {
    if(err) {
      return callback(false, err);
    }
    else {
      return callback(true);
    }
  });
};
Config.prototype.fetchUserPref = function (callback) {
  var self = this;
  var filePath = path.join(self.metaData.webinosRoot,"userData",self.metaData.webinosName+"_pref.json");
  fs.readFile(path.resolve(filePath), function(err, data) {
    if(err) {
      return callback(false, err);
    }
    else {
      var JSONData = JSON.parse(data.toString());
      return callback(true, JSONData);
    }
  });
};
Config.prototype.createDirectories = function(callback) {
  var self = this, dirPath;
  try {
    // Main webinos directory
    fs.readdir(self.metaData.webinosRoot, function(err) {
      if ( err && err.code === "ENOENT" ) {
        fs.mkdirSync(self.metaData.webinosRoot,"0700");
      }
      fs.readdir ( path.resolve(path.join(self.metaData.webinosRoot, self.metaData.webinosName)), function(err) {
        if ( err && err.code=== "ENOENT" ) {
          fs.mkdirSync( self.metaData.webinosRoot+"/"+self.metaData.webinosName,"0700");
        }
      dirPath = path.resolve(path.join(self.metaData.webinosRoot, self.metaData.webinosName));
      fs.readdir ( path.resolve(path.join(dirPath, "policies")), function(err) {
        if ( err && err.code=== "ENOENT" ) {
          fs.mkdirSync( self.metaData.webinosRoot+"/policies","0700");
        }
        fs.readdir ( path.resolve(path.join(dirPath, "certificates")), function(err) {
          if ( err && err.code=== "ENOENT" ) {
            fs.mkdirSync( self.metaData.webinosRoot+"/certificates","0700");
          }
          fs.readdir ( path.resolve(path.join(dirPath, "certificates", "external")), function(err) {
            if ( err && err.code=== "ENOENT" ) {
              fs.mkdirSync( self.metaData.webinosRoot+"/certificates/external","0700");
            }
            fs.readdir ( path.resolve(path.join(dirPath,"certificates","internal")), function(err) {
              if ( err && err.code=== "ENOENT" ) {
                fs.mkdirSync( self.metaData.webinosRoot+"/certificates/internal","0700");
              }
              fs.readdir ( path.resolve(path.join(dirPath,"userData")), function(err) {
                if ( err && err.code=== "ENOENT" ) {
                  fs.mkdirSync( self.metaData.webinosRoot+"/userData","0700");
                }
                // logs
                fs.readdir ( path.resolve(path.join(dirPath,"logs")), function(err) {
                  if ( err && err.code=== "ENOENT" ) {
                    fs.mkdirSync( dirPath +"/logs","0700");
                  }
                  // keys
                  fs.readdir ( path.resolve(path.join(dirPath, "keys")), function(err) {
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

      self.userData.country         = userPref.certConfiguration.country;
      self.userData.state           = userPref.certConfiguration.state;
      self.userData.city            = userPref.certConfiguration.city;
      self.userData.orgName         = userPref.certConfiguration.orgname;
      self.userData.orgUnit         = userPref.certConfiguration.orgunit;
      self.userData.cn              = userPref.certConfiguration.cn;
      self.userData.email           = userPref.certConfiguration.email;

      for (key in userPref.pzhDefaultServices) {
        self.serviceCache.push({"name": userPref.pzhDefaultServices[key], "params":{}});
      };
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
    self.metaData.webinosRoot  = wPath.webinosPath();
    self.createDirectories(function(status){
      if (status){
        self.storeMetaData(self.metaData, function(status, value){
          if(status) { //metadata
            self.storeUserData(self.userData, function(status, value){
              if (status) { //userdata
                self.storeUserPref(self.userPref, function(status, value){ //userpref
                  return callback(status, value);
                });
              } else {// else userdata
                return callback(status, value);
              }
            });
          } else{//else metadata
           return callback(status, value);
          }
        });
      }
    });
  });
};

module.exports = Config;
