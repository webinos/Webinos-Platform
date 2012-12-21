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

var dependency  = require("find-dependencies")(__dirname);
var logger      = dependency.global.require(dependency.global.util.location, "lib/logging.js")(__filename) || console;
var wPath       = dependency.global.require(dependency.global.util.location, "lib/webinosPath.js");
var wId         = dependency.global.require(dependency.global.util.location, "lib/webinosId.js")
var certificate = dependency.global.require(dependency.global.manager.certificate_manager.location);

/**
 *
 * @constructor
 */
function Config() {
  certificate.call(this);
  this.metaData       = {};
  this.trustedList    = {pzh:{}, pzp:{}};
  this.crl            = "";
  this.policies       = {};//todo: integrate policy in the configuration
  this.userData       = {name: ""};
  this.userPref       = {};
  this.serviceCache   = [];
}

util.inherits(Config, certificate);

/**
 *
 * @param self
 * @param webinosType
 * @param inputConfig
 * @param callback
 * @return {*}
 */
function createNewConfiguration(self, webinosType, inputConfig, callback){
  var cn;
  try {
    self.fetchConfigDetails(webinosType, inputConfig, function(status) {
      if(status){
        cn = self.metaData.webinosType + ":"+self.metaData.webinosName ;
        self.generateSelfSignedCertificate(self.metaData.webinosType, cn, function(status, value ) {
          if(!status) {
            logger.error("failed generating self signed certificate -"+ value);
            if (callback) {return callback(status, value);}
          } else {
            if (self.metaData.webinosType !== "Pzp") {
              cn = self.metaData.webinosType + "CA:" + self.metaData.webinosName ;
              self.generateSelfSignedCertificate(self.metaData.webinosType+"CA", cn, function(status, value){ // Master Certificate
                if (status) {
                  logger.log("connection and master certificate generated");
                  self.storeAll();
                  if (callback) {return callback(true);}
                } else {
                  logger.error("failed generating master certificate -"+ value);
                  if (callback) {callback(false, value);}
                }
              });
            } else {
              self.storeAll();
              if (callback) {return callback(true);}
            }
          }
        });
      } else {
         logger.log("Error reading default configuration details");
      }
    });
  } catch (err) {
    if (callback) {return callback(false, err);}
  }
}
/**
* Checks if metaData exists, if not creates a range of certificates
* it calls generating certificate function defined in certificate manager.
*
* @param {function} callback It is callback function that is invoked after
* checking/creating certificates
*/
Config.prototype.setConfiguration = function (webinosType, inputConfig, callback) {
  var self = this, conn_key, cn;
  wId.fetchDeviceName(webinosType, inputConfig, function(deviceName){
    var webinosRoot  =  path.join(wPath.webinosPath(), deviceName);
    logger.addType(deviceName); // per instance this should be only set once..
    if (typeof callback !== "function") {
      logger.error("callback missing");
      return;
    }

    self.fetchMetaData(webinosRoot, deviceName, function(status, value){
      if (status && value && (value.code=== "ENOENT" || value.code=== "EACCES")) {//meta data does not exist
        createNewConfiguration(self, webinosType, inputConfig, callback);
      } else { //metaData not found
        self.metaData= value;
        self.fetchCertificate("external", function(status, value) { if (status) { self.cert.external = value;} });
        self.fetchCertificate("internal", function(status, value) { if (status) { self.cert.internal = value;
          self.fetchServiceCache(function(status, value) { if (status) { self.serviceCache = value;
            self.fetchCrl(function(status, value) { if (status) { self.crl = value;
              self.fetchUserData(function(status, value) { if (status) { self.userData = value;
                self.fetchUserPref(function(status, value) { if (status) { self.userPref = value;
                  self.fetchTrustedList(function(status, value) { if (status) { self.trustedList = value; return callback(true);
                  }else{createNewConfiguration(self, webinosType, inputConfig, callback);}});
                }else{createNewConfiguration(self, webinosType, inputConfig, callback);}});
              }else{createNewConfiguration(self, webinosType, inputConfig, callback);}});
            }else{createNewConfiguration(self, webinosType, inputConfig, callback);}});
          }else{createNewConfiguration(self, webinosType, inputConfig, callback);}});
        }else{createNewConfiguration(self, webinosType, inputConfig, callback);}});
      }
    });
  });
};
/**
 * Store user data based on OpenId Details
 * @param user -
 */
Config.prototype.storeUserDetails = function(user) {
    if (this.userData && user !== null && this.userData.name !== user.displayName) {
    this.userData.name     = user.displayName;
    this.userData.email    = user.emails;
    this.userData.country  = user.country;
    this.userData.image    = user.image;
    this.userData.authenticator = user.from;
    this.userData.identifier = user.identifier;
    this.storeUserData(this.userData);
  }
};
/**
 *
 */
Config.prototype.storeAll = function() {
  var self = this;
  self.storeCertificate(self.cert.internal, "internal");
  self.storeCrl(self.crl);
  self.storeTrustedList(self.trustedList);
};
/**
 *
 * @param data
 * @param callback
 */
function processData(data,  callback){
  var JSONData, dataString = data.toString();
  if (dataString !== "") {
    JSONData = JSON.parse(dataString);
    callback(true, JSONData);
  } else {
    logger.error("configuration files are corrupted, retrying again to create fresh configuration");
    callback(false);
  }
}
/**
 *
 * @param certificate
 * @param ext_int
 */
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
/**
 *
 * @param ext_int
 * @param callback
 */
Config.prototype.fetchCertificate = function(ext_int, callback) {
  var self = this;
  var filePath = path.join(self.metaData.webinosRoot, "certificates", ext_int, self.metaData.webinosName+".json");
  fs.readFile(path.resolve(filePath), function(err, data) {
    if (err) {
      if (ext_int !== "external"){
        logger.error("configuration files for certificates are corrupted, retrying again to create fresh configuration");
      }
      callback(false);
    } else {
      processData(data,callback);
    }
  });

};
/**
 *
 * @param data
 */
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
/**
 *
 * @param webinosRoot
 * @param webinosName
 * @param callback
 */
Config.prototype.fetchMetaData = function(webinosRoot, webinosName, callback) {
  var self = this;
  var filePath = path.join(webinosRoot, webinosName+".json");
  fs.readFile(path.resolve(filePath), function(err, data) {
    if(err) {
      callback(true, err);// this is bit deceiving, we return  err as we want to trigger the certificate creation
    } else {
      processData(data, callback);
    }
  });
};
/**
 *
 * @param data
 */
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
/**
 *
 * @param callback
 */
Config.prototype.fetchCrl = function (callback) {
  var self = this;
  var filePath = path.join(self.metaData.webinosRoot, "crl.pem");
  fs.readFile(path.resolve(filePath), function(err, data) {
    if(err) {
      logger.error("configuration files for CRL are corrupted, retrying again to create fresh configuration");
      callback(false);
    } else {
      value = data.toString();
      callback(true, value);
    }
  });
};
/**
 *
 * @param data
 */
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
/**
 *
 * @param callback
 */
Config.prototype.fetchTrustedList = function (callback) {
  var self = this;
  var filePath = path.join(self.metaData.webinosRoot, "trustedList.json");
  fs.readFile(path.resolve(filePath), function(err, data) {
    if(err) {
      logger.error("configuration files for trusted list are corrupted, retrying again to create fresh configuration");
      callback(false);
    } else {
      processData(data,callback);
    }
  });
};
/**
 *
 * @param data
 */
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
/**
 *
 * @param callback
 */
Config.prototype.fetchUserData = function (callback) {
  var self = this;
  var filePath = path.join(self.metaData.webinosRoot,"userData",self.metaData.webinosName+".json");
  fs.readFile(path.resolve(filePath), function(err, data) {
    if(err) {
      logger.error("configuration files for user data are corrupted, retrying again to create fresh configuration");
      callback(false);
    } else {
      processData(data,callback);
    }
  });
};
/**
 *
 * @param data
 */
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
/**
 *
 * @param callback
 */
Config.prototype.fetchServiceCache = function (callback) {
  var self = this;
  var filePath = path.join(self.metaData.webinosRoot,"userData",self.metaData.webinosName+"_serviceCache.json");
  fs.readFile(path.resolve(filePath), function(err, data) {
    if(err) {
      logger.error("configuration files for service cache are corrupted, retrying again to create fresh configuration");
      callback(false);
    } else {
      processData(data, callback);
    }
  });
};
/**
 *
 * @param data
 */
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
/**
 *
 * @param callback
 */
Config.prototype.fetchUserPref = function (callback) {
  var self = this;
  var filePath = path.join(self.metaData.webinosRoot,"userData",self.metaData.webinosName+"_pref.json");
  fs.readFile(path.resolve(filePath), function(err, data) {
    if(err) {
      logger.error("configuration files for user pref are corrupted, retrying again to create fresh configuration");
      callback(false);
    } else {
      processData(data,callback);
    }
  });
};
/**
 *
 * @param callback
 * @return {*}
 */
Config.prototype.createDirectories = function (callback) {
    var self = this, dirPath, permission = 0777;
    try {
        //In case of node 0.6, define the fs existsSync
        if (typeof fs.existsSync === "undefined") fs.existsSync = path.existsSync;
        if (!fs.existsSync(wPath.webinosPath()))//If the folder doesn't exist
            fs.mkdirSync(wPath.webinosPath(), permission);//Create it
        //Set permissions for android
        if (os.platform().toLowerCase() !== "android") {
            if (process.getuid) {
                fs.chown(wPath.webinosPath(), process.getuid(), process.getgid());
                fs.chmod(wPath.webinosPath(), permission);
            }
        }
        if (!fs.existsSync(self.metaData.webinosRoot))//If the folder doesn't exist
            fs.mkdirSync(self.metaData.webinosRoot, permission);
        // webinos root was created, we need the following 1st level dirs
        var list = [ path.join(wPath.webinosPath(), "logs"), path.join(self.metaData.webinosRoot, "wrt"), path.join(wPath.webinosPath(), "wrt"), path.join(self.metaData.webinosRoot, "policies"),
            path.join(self.metaData.webinosRoot, "certificates"), path.join(self.metaData.webinosRoot, "userData"), path.join(self.metaData.webinosRoot, "keys"), path.join(self.metaData.webinosRoot, "certificates", "external"),
            path.join(self.metaData.webinosRoot, "certificates", "internal")];
        list.forEach(function (name) {
            if (!fs.existsSync(name))
                fs.mkdirSync(name, permission);
        });
        // Notify that we are done
        callback(true);
    } catch (err) {
        //Notify that something went wrong
        return callback(false, err.code);
    }
};
/**
 *
 * @param self
 */
Config.prototype.createPolicyFile = function(self) {
  // policy file
  fs.readFile( path.join(self.metaData.webinosRoot, "policies", "policy.xml"), function(err) {
    if ( err && err.code=== "ENOENT" ) {
      var data;
      try {
        data = fs.readFileSync(path.resolve(__dirname, "../../manager/policy_manager/defaultpolicy.xml"));
      }
      catch(e) {
        logger.error("Default policy not found");
        data = "<policy combine=\"first-applicable\" description=\"denyall\">\n<rule effect=\"deny\"></rule>\n</policy>";
      }
      fs.writeFileSync(path.join(self.metaData.webinosRoot, "policies", "policy.xml"), data);
    }
  });
};

/**
 *
 * @param webinosType
 * @param inputConfig
 * @param callback
 */
Config.prototype.fetchConfigDetails = function(webinosType, inputConfig, callback) {
  var self = this;
  var filePath = path.resolve(__dirname, "../../../../webinos_config.json");
    try {
  fs.readFile(filePath, function(err,data) {
    if (!err) {
      var key, userPref = JSON.parse(data.toString());
      self.userPref.ports={};
      self.userPref.ports.provider           = userPref.ports.provider;
      self.userPref.ports.provider_webServer = userPref.ports.provider_webServer;
      self.userPref.ports.pzp_webSocket      = userPref.ports.pzp_webSocket;
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
      self.userPref.ports.pzp_webSocket          = 8080;
      self.userPref.ports.pzp_tlsServer          = 8040;
      self.userPref.ports.pzp_zeroConf           = 4321;
      self.userData.country                      = "UK";
      self.userData.email                        = "hello@webinos.org";
      self.userData.state                        = "";
      self.userData.city                         = "";
      self.userData.orgName                      = "";
      self.userData.orgUnit                      = "";
      self.userData.cn                           = "";
    }
    self.metaData.friendlyName = inputConfig.friendlyName;
    self.metaData.webinosType  = webinosType;
    self.metaData.serverName   = inputConfig.sessionIdentity;
    wId.fetchDeviceName(webinosType, inputConfig, function(deviceName) {
      self.metaData.webinosName  = deviceName;
      self.metaData.webinosRoot  = wPath.webinosPath() + "/"+ self.metaData.webinosName;
      self.createDirectories(function(status){
        if (status){
          self.createPolicyFile(self);
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
  });
    }catch(err) {
        console.log(err);
    }
};

module.exports = Config;
