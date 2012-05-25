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
var path          = require("path");
var fs            = require("fs");
var os            = require("os");

var certificate = require("./session_certificate");
var common      = require("./session_common");
var log         = new common.debug("config");

var session_configuration = exports;

// If modifying, please change both ports
session_configuration.pzhPort    = 8000; // used by PZP
session_configuration.farmPort   = 8000; // used by farm when starting

// PZH webserver uses these ports
session_configuration.httpServerPort = 8900;
session_configuration.webServerPort  = 9000;

//PZP webserver uses these ports
session_configuration.pzpHttpServerPort = 8081;
session_configuration.pzpWebServerPort  = 8080;

// PZP TLS Server to allow PZP"s to connect
session_configuration.pzpServerPort = 8040;

// Default webinos services available when no configuration exists yet
session_configuration.pzhDefaultServices = [
  {name: "context", params: {}},
  {name: "events", params: {}},
  {name: "get42", params: {}}
];

session_configuration.states = ["NOT_CONNECTED", "CONNECTING", "CONNECTED", "DISCONNECTING"];
session_configuration.modes  = ["VIRGIN", "HUB", "PEER", "HUB_PEER"];
session_configuration.PZH_MSG = "0";
session_configuration.PZP_MSG = "1";
/**
* @descripton Checks for master certificate, if certificate is not found 
* it calls generating certificate function defined in certificate manager. 
* This function is crypto sensitive.
* @param {function} callback It is callback function that is invoked after 
* checking/creating certificates
*/
session_configuration.setConfiguration = function (name, type, url, callback) {
  var webinosDemo = common.webinosConfigPath();

  if (typeof callback !== "function") {
    log.error("callback function is not defined");
    callback("undefined");
    return;
  }

  if (type !== "PzhFarm" && type !== "Pzh" && type !== "Pzp") {
    log.error("wrong type is used");
    callback("undefined");
    return;
  }

  if (name === "" && (type === "Pzp" || type === "PzhFarm")){
    name = os.hostname() + "_"+ type; //devicename_type
  }

  fs.readFile(( webinosDemo+"/config/"+ name +".json"), function(err, data) {
    if ( err && err.code=== "ENOENT" ) {
      // CREATE NEW CONFIGURATION
      var config = createConfigStructure(name, type);
      config.name = name;
      config.serverName = url;
      // This self signed certificate is for getting connection certificate CSR.
      try {  // From this certificate generated only csr is used
        certificate.selfSigned(config, type, function(status, selfSignErr, conn_key, conn_cert, csr ) {
          if(status === "certGenerated") {
            session_configuration.storeKey(config.own.key_id, conn_key);
            log.info("generated CONN Certificates");
            if (type !== "Pzp") {
              // This self signed certificate is  master certificate / CA
              selfSignedMasterCert(config, function(config_master){
                // Sign connection certifcate
                session_configuration.signedCert(csr, config_master, null, 1, function(config_signed) { // PZH CONN CERT 1
                  callback(config_signed, conn_key);
                });
              });
            } else {
              // PZP will only generate only 1 certificate
              try{
                  // Used for initial connection, will be replaced by cert received from PZH
                config.own.cert = conn_cert.cert;
                config.csr      = csr;
                session_configuration.storeConfig(config, function() {
                  callback(config, conn_key, config.csr);
                });
              } catch (err) {
                log.error("storing key in key store "+ err);
                return;
              }
            }
          } else {
            log.error("generating Self Signed Cert: ");
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
};

session_configuration.createDirectoryStructure = function (callback) {
  var webinosDemo = common.webinosConfigPath();
  try {
    // Main webinos directory
    fs.readdir( webinosDemo, function(err) {
      if ( err && err.code === "ENOENT" ) {
        fs.mkdirSync( webinosDemo,"0700");
      }
      setTimeout(function(){
        // Configuration directory, which holds information about certificate, ports, openid details
        fs.readdir ( webinosDemo+"/config", function(err) {
          if ( err && err.code=== "ENOENT" ) {
            fs.mkdirSync( webinosDemo +"/config","0700");
          }
        });
        // logs
        fs.readdir ( webinosDemo+"/logs", function(err) {
          if ( err && err.code=== "ENOENT" ) {
            fs.mkdirSync( webinosDemo +"/logs","0700");
          }
        });
        // keys
        fs.readdir ( webinosDemo+"/keys", function(err) {
          if ( err && err.code=== "ENOENT" ) {
            fs.mkdirSync( webinosDemo +"/keys","0700");
          }
        });
        callback(true);
      }, 100);
    });
  } catch (err){
    log.error("error setting default Webinos Directories" + err.code);
  }
}

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
// TODO: Put this keys in secure storage ..
session_configuration.storeKey= function (key_id, value) {
  var webinosDemo = common.webinosConfigPath();
  fs.writeFile((webinosDemo+ "/keys/"+key_id), value, function(err) {
    if(err) {
      log.error("error saving key " + err);
    } else {
      log.info("saved key file @@ " +key_id);
    }
  });
}

session_configuration.fetchKey= function (key_id, callback) {
  var webinosDemo = common.webinosConfigPath();
  fs.readFile((webinosDemo+ "/keys/"+key_id), function(err, data) {
    if(err) {
      log.error("error saving key " + err);
      callback(null);
    } else {
      log.info("fetched key file @@ "+ key_id);
      callback(data.toString());
    }
  });
}

session_configuration.signedCert = function (csr, config, name, type, callback) {
  try {
    session_configuration.fetchKey(config.master.key_id, function(master_key){
      // connection certificate signed by master certificate
      certificate.signRequest(csr, master_key, config.master.cert, type, config.serverName, function(result, signed_cert) {
        if(result === "certSigned") {
          log.info("generated Signed Certificate by CA");
          try {
            if(type === 1 || type === 0) { // PZH
              config.own.cert = signed_cert; // Signed connection certificate
            } else {
              config.signedCert[name] = signed_cert;
            }

            // Update with the signed certificate
            session_configuration.storeConfig(config, function() {
              callback(config);
            });
          } catch (err1) {
            log.error("error setting paramerters" + err1) ;
            callback("undefined");
            return;
          }
        }
      });
    });
  } catch (err){
    log.error("error in generating signed certificate by CA" + err);
    callback("undefined");
  }
};

function createConfigStructure (name, type) {
  var config = {};
  if (type === "Pzh") {
    config.own         = { key_id: name+"_conn_key",   cert:""};
    config.master      = { key_id: name+"_master_key", cert:"", crl:"" };
    config.signedCert  = {};
    config.revokedCert = {};
    config.otherCert   = {};
    config.email       = "";
    config.country     = "";
    config.image       = "";
  } else if (type === "PzhFarm") {
    config.own         = { key_id: name+"_conn_key",   cert:""};
    config.master      = { key_id: name+"_master_key", cert:""} ;
    config.webServer   = { key_id: name+"_ws_key",     cert:""} ;
    config.pzhs        = {}; //contents: "", modules:""
  } else if (type === "Pzp" ) {
    config.own         = { key_id: name+"_conn_key", cert:""};
    config.csr         = "";
    config.master      = { cert:"", crl:"" };
    config.pzhId       = '';
  };
  config.type        = type;
  config.name        = '';
  config.serverName  = '';
  return config;
}

function selfSignedMasterCert(config, callback){
  try {
    certificate.selfSigned(config, config.type+"CA", function(result, selfSignErr, master_key, master_cert) {
      if(result === "certGenerated") {
        log.info("generated CA Certificate");
        // Store all master certificate information
        config.master.cert = master_cert.cert;
        config.master.crl  = master_cert.crl;
        session_configuration.storeKey(config.master.key_id, master_key);
        session_configuration.storeConfig(config, function() {
          callback(config);
        });
      } else {
        log.error("error in generting certificate");
      }
    });
  } catch (err) {
    log.error("error in generating master self signed certificate " + err);
    callback("undefined");
  }
}

