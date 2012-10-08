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

var session_configuration = exports;

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
session_configuration.setConfiguration = function (name, type, host, pzhName, callback) {
  var webinosDemo = common.webinosConfigPath();

  if (typeof callback !== "function") {
    log.error("callback function is not defined");
    callback("undefined");
    return;
  }

  if (type !== "PzhFarm" && type !== "Pzh" && type !== "Pzp") {
    log.error("wrong type is mentioned");
    callback("undefined");
    return;
  }

  fetchDeviceName(name, type, function(name){
    parsePortConfiguration(function() {
      fs.readFile(( webinosDemo+"/config/"+ name +".json"), function(err, data) {
          if(err && err.code ==="EACCES") {
            log.error("configuration file read failed... try with sudo ");
            process.exit();
          }
          // check if the config json file is empty
          if ( err && err.code=== "ENOENT" ){	  
          // CREATE NEW CONFIGURATION
          var config = createConfigStructure(name, type);
          config.name = name;

          if (type === "Pzp" && typeof pzhName !== "undefined" && (pzhName !== '' || pzhName !== null )) {
            config.serverName = host+'/'+pzhName+'/';
          } else {
            config.serverName = host;
          }

          // This self signed certificate is for getting connection certificate CSR.
          try {  // From this certificate generated only csr is used
            certificate.selfSigned(config, type, function(status, selfSignErr, conn_key, conn_cert, csr ) {
              if(status === "certGenerated") {
                session_configuration.storeKey(config.own.key_id, conn_key);
                log.info("generated connection certificates");
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
            //check if PZP config Json file is empty            
            if(configData === ""){	  
              // CREATE NEW CONFIGURATION
              var config = createConfigStructure(name, type);
              config.name = name;

              if (type === "Pzp" && typeof pzhName !== "undefined" && (pzhName !== '' || pzhName !== null )) {
                config.serverName = host+'/'+pzhName+'/';
              } else {
                config.serverName = host;
              }

              // This self signed certificate is for getting connection certificate CSR.
              try {  // From this certificate generated only csr is used
                certificate.selfSigned(config, type, function(status, selfSignErr, conn_key, conn_cert, csr ) {
                  if(status === "certGenerated") {
                    session_configuration.storeKey(config.own.key_id, conn_key);
                    log.info("generated connection certificates");
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
            }
            //end of checking 
            else
            {
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
          }  
      });
    });
  });
};

function parsePortConfiguration(callback) {

  var filename;
  if((os.type().toLowerCase() == "linux") && (os.platform().toLowerCase() == "android"))
  {
    //TODO: the full file path has to be given - check if any alternative way
    filename = "/data/data/org.webinos.app/node_modules/webinos/wp4/webinos_config.json";
  }
  else
  {
    filename = "webinos_config.json";
  }

  fs.readFile(filename, function(err,data) {
    if (!err) {
      var port_data = JSON.parse(data.toString());
      session_configuration.port = {};
      session_configuration.port.farmPort           = port_data.ports.farm;
      session_configuration.port.farm_webServerPort = port_data.ports.farm_webServer;
      session_configuration.port.pzp_webSocket = port_data.ports.pzp_webSocket;
      session_configuration.port.pzp_web_webSocket  = port_data.ports.pzp_web_webSocket;
      session_configuration.port.pzp_tlsServer      = port_data.ports.pzp_tlsServer;
      session_configuration.port.pzp_zeroConf       = port_data.ports.pzp_zeroConf;
      callback();
    }
    else
    {
	//file read fails - add default port numbers
      session_configuration.port = {};
      session_configuration.port.farmPort           = 80;
      session_configuration.port.farm_webServerPort = 443;
      session_configuration.port.pzp_webSocket = 8081;
      session_configuration.port.pzp_web_webSocket  = 8080;
      session_configuration.port.pzp_tlsServer      = 8040;
      session_configuration.port.pzp_zeroConf       = 4321;
      callback();
    }	
  });
}

function fetchDeviceName(name, type, callback) {
   //Get Android devices identity
  if((os.type().toLowerCase() === "linux") && (os.platform().toLowerCase() === "android"))
  {
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

    function onsuccess(prop_value, prop)
    {
      name = prop_value + "_"+ type; //devicename_type
      callback(name);
    }

    function onerror()
    {
      log.error("Android get device name returns error");
    }

    var devStatusModule = bridge.load('org.webinos.impl.DevicestatusImpl', this);
    devStatusModule.getPropertyValue(onsuccess, onerror, prop);
  } else  if (name === "" && (type === "Pzp" || type === "PzhFarm")){
    name = os.hostname() + "_"+ type; //devicename_type
    callback(name);
  } else {
    callback(name);
  }
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
        // widget manager
        fs.readdir ( webinosDemo+"/wrt", function(err) {
          if ( err && err.code=== "ENOENT" ) {
            fs.mkdirSync( webinosDemo +"/wrt","0700");
          }
        });
        // policy file
        fs.readFile ( webinosDemo+"/policy.xml", function(err) {
          if ( err && err.code=== "ENOENT" ) {
	    var data;
	    try {
	      data = fs.readFileSync("./webinos/common/manager/policy_manager/defaultpolicy.xml");
	    }
	    catch(e) {
	      console.log("Default policy non found");
	      data = "<policy combine=\"first-applicable\" description=\"denyall\">\n<rule effect=\"deny\"></rule>\n</policy>";
	    }
	    fs.writeFileSync(webinosDemo+"/policy.xml", data);
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
  config.rejectUnauthorized = false; //TODO: Add configuration property for this
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
