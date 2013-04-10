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
 * Copyright 2012 - 2013 Samsung Electronics (UK) Ltd
 * Author: Habib Virji (habib.virji@samsung.com)
 *         Ziran Sun (ziran.sun@samsung.com)
 *******************************************************************************/
var path = require ("path");
var fs = require ("fs");
var os = require ("os");
var util = require ("util");

var dependency = require ("find-dependencies") (__dirname);
var logger = require("./logging.js") (__filename) || console;
var wPath = require("./webinosPath.js");
var certificate = dependency.global.require (dependency.global.manager.certificate_manager.location);

/**
 *
 * @constructor
 */
function Config () {
    "use strict";
    var self = this;
    certificate.call (self);
    self.metaData = {};
    self.trustedList = {pzh:{}, pzp:{}};
    self.untrustedCert = {};
    self.exCertList    = {};
    self.crl = {};
    self.policies = {};//todo: integrate policy in the configuration
    self.userData = {};
    self.userPref = {};
    self.serviceCache = [];
    var existsSync = fs.existsSync || path.existsSync;

    self.fileList = [{folderName: null, fileName: "metaData", object: self.metaData},

        {folderName: null, fileName: "crl", object: self.crl},
        {folderName: null, fileName:"trustedList", object: self.trustedList},
        {folderName: null, fileName:"untrustedList", object: self.untrustedCert},
        {folderName: null, fileName:"exCertList", object: self.exCertList},
        {folderName: path.join("certificates", "internal"),fileName: "certificates", object: self.cert.internal},
        {folderName: path.join("certificates", "external"),fileName: "certificates", object: self.cert.external},
        {folderName:"userData", fileName: "userDetails", object: self.userData},
        {folderName:"userData", fileName:"serviceCache", object: self.serviceCache},
        {folderName:"userData", fileName:"userPref", object: self.userPref}];

    function setFriendlyName(friendlyName) {
        if(friendlyName) {
            self.metaData.friendlyName = friendlyName;
        } else {
            if (os.platform() && os.platform().toLowerCase() === "android" ){
                self.metaData.friendlyName = "Mobile";
            } else if (process.platform === "win32") {
                self.metaData.friendlyName = "Windows PC";
            } else if (process.platform === "darwin") {
                self.metaData.friendlyName = "MacBook";
            } else if (process.platform === "linux" || process.platform === "freebsd") {
                self.metaData.friendlyName = "Linux Device";
            } else {
                self.metaData.friendlyName = "Webinos Device";// Add manually
            }
        }
    }

    function compareObjects(objA, objB){
        if (typeof objA !== "object" || typeof objB !== "object") {
            return false;
        }

        if ((Object.keys(objA)).length !== (Object.keys(objB)).length) {
            return false;
        }

        for (var i = 0; i < Object.keys(objA).length; i = i + 1) {
            if (objA[i] !== objB[i]){
                return false;
            }
        }

        return true;// both objects are equal
    }

    function updateWebinosConfig(folderName, type) {
        function writeFile(config) {
            var filePath = path.resolve (__dirname, "../../../../webinos_config.json");
            fs.writeFileSync(filePath, JSON.stringify(config, null, "  "));
            logger.log("updated webinos config ");
        }

        if (folderName === "userData") {
            var filePath = path.resolve (__dirname, "../../../../webinos_config.json");
            var config = require(filePath);
            if (type === "serviceCache") {
               if (self.metaData.webinosType === "Pzh" &&
                   config.pzhDefaultServices.length !== self.serviceCache.length) {
                   config.pzhDefaultServices = self.serviceCache;
               } else if (self.metaData.webinosType === "Pzp" &&
                          config.pzpDefaultServices.length !== self.serviceCache.length) {
                   config.pzpDefaultServices = self.serviceCache;
               }
               writeFile(config);
            } else if (type === "userPref" && !compareObjects(config.ports, self.userPref.ports)) {
                config.ports = self.userPref.ports;
                writeFile(config);
            }
        }
    }

    function checkDefaultValues(webinosType) {
        var filePath = path.resolve (__dirname, "../../../../webinos_config.json");
        var config = require(filePath), key;
        if (!compareObjects(config.webinos_version, self.metaData.webinos_version)) {
            self.metaData.webinos_version = config.webinos_version;
            self.storeDetails(null, "metaData", self.metaData);
        }
        if (!compareObjects(config.ports, self.userPref.ports)) {
            self.userPref.ports = config.ports;
            self.storeDetails("userData", "userPref", self.userPref);
        }
        if (webinosType === "Pzh" && config.pzhDefaultServices.length !== self.serviceCache.length) {
            self.serviceCache = config.pzhDefaultServices;
            self.storeDetails("userData", "serviceCache", self.serviceCache);
        } else if (webinosType === "Pzp" && config.pzpDefaultServices.length !== self.serviceCache.length) {
            self.serviceCache = config.pzpDefaultServices;
            self.storeDetails("userData", "serviceCache", self.serviceCache);
        }
        if (webinosType === "Pzp" && config.friendlyName !== "") {
            setFriendlyName(config.friendlyName);
        }
    }

    function createPolicyFile() {
        // policy file
        fs.readFile (path.join (self.metaData.webinosRoot, "policies", "policy.xml"), function (err) {
            if (err && err.code === "ENOENT") {
                var data;
                try {
                    data = fs.readFileSync (path.resolve (__dirname, "../../manager/policy_manager/defaultpolicy.xml"));
                }
                catch (e) {
                    logger.error ("Default policy not found");
                    data = "<policy combine=\"first-applicable\" description=\"denyall\">\n<rule effect=\"deny\"></rule>\n</policy>";
                }
                fs.writeFileSync (path.join (self.metaData.webinosRoot, "policies", "policy.xml"), data);
            }
        });
    }


    function storeAll() {
        self.fileList.forEach (function (name) {
            if (typeof name === "object") {
                if(name.folderName === "userData") {
                    if (name.fileName === "userDetails") {
                        name.object = self.userData;
                    }
                    if (name.fileName === "serviceCache") {
                        name.object = self.serviceCache;
                    }
                }
                self.storeDetails(name.folderName, name.fileName, name.object);
            }
        });
    }



    function checkConfigExists(webinosType, inputConfig, callback) {
        var name, i;
        require("./webinosId.js").fetchDeviceName(webinosType, inputConfig, function (webinosName) {
            var webinos_root =  (webinosType.search("Pzh") !== -1)? wPath.webinosPath()+"Pzh" :wPath.webinosPath();
            self.metaData.webinosRoot = (webinosType.search("Pzh") !== -1)? (webinos_root + "/" + webinosName): webinos_root;
            for (i = 0; i < self.fileList.length; i = i + 1) {
                name = self.fileList[i];
                var fileName = (name.fileName !== null) ? (name.fileName+".json"):(webinosName +".json");
                var filePath = path.join (self.metaData.webinosRoot, name.folderName, fileName);
                if( !existsSync(filePath)){
                    return callback(false);
                }
            }
            return callback(true);
        });

    }
    /**
     *
     * @param callback
     * @return {*}
     */
    function createDefaultDirectories(type, callback) {
        var dirPath, root_permission = "0744", internal_permission = "0744";
        var webinos_root =  (type.search("Pzh") !== -1)? wPath.webinosPath()+"Pzh" :wPath.webinosPath();
        try {
            //In case of node 0.6, define the fs existsSync
            if (!existsSync (webinos_root)) {//If the folder doesn't exist
                fs.mkdirSync (webinos_root, root_permission);//Create it
             }

            if (!existsSync (self.metaData.webinosRoot))//If the folder doesn't exist
                fs.mkdirSync (self.metaData.webinosRoot, internal_permission);
            // webinos root was created, we need the following 1st level dirs
            var list = [ path.join (self.metaData.webinosRoot, "logs"),
                path.join (self.metaData.webinosRoot, "certificates"),
                path.join (self.metaData.webinosRoot, "policies"),
                path.join (self.metaData.webinosRoot, "wrt"),
                path.join (self.metaData.webinosRoot, "wrt", "sessions"),
                path.join (self.metaData.webinosRoot, "userData"),
                path.join (self.metaData.webinosRoot, "keys"),
                path.join (self.metaData.webinosRoot, "certificates", "external"),
                path.join (self.metaData.webinosRoot, "certificates", "internal")];
            list.forEach (function (name) {
                if (!existsSync (name)) fs.mkdirSync (name, internal_permission);
            });
            // Notify that we are done
            callback (true);
        } catch (err) {
            //Notify that something went wrong
            return callback (false, err.code);
        }
    }
    function storeUserData(user, defaultCert){
        var key;
        self.userData = {};
        for(key in defaultCert) {
            self.userData[key] = defaultCert[key];
        }
        self.userData.name = user.displayName;
        self.userData.email = user.emails;
        self.userData.authenticator = user.from;
        self.userData.identifier = user.identifier;
    }
    /**
     *
     * @param webinosType
     * @param inputConfig
     * @param callback
     */
    function fetchDefaultWebinosConfiguration(webinosType, inputConfig, callback) {
        var filePath = path.resolve (__dirname, "../../../../webinos_config.json"), webinos_root;
        require("./webinosId.js").fetchDeviceName(webinosType, inputConfig, function (deviceName) {
            self.metaData.webinosType = webinosType;
            self.metaData.serverName = inputConfig.sessionIdentity;
            self.metaData.webinosName = deviceName;
            webinos_root =  (webinosType.search("Pzh") !== -1)? wPath.webinosPath()+"Pzh" :wPath.webinosPath();
            self.metaData.webinosRoot = (webinosType.search("Pzh") !== -1)? webinos_root+ "/" + self.metaData.webinosName: webinos_root;

            createDefaultDirectories(webinosType, function (status) {
                if (status) {
                    logger.log ("created default webinos directories at location : " + self.metaData.webinosRoot);
                    var key, defaultConfig = require(filePath);
                    self.metaData.webinos_version = defaultConfig.webinos_version;
                    self.userPref.ports = defaultConfig.ports;
                    self.userData = defaultConfig.certConfiguration;
                    if(inputConfig.user)  storeUserData(inputConfig.user, defaultConfig.certConfiguration);
                    setFriendlyName(inputConfig.friendlyName || defaultConfig.friendlyName);
                    if (webinosType === "Pzh" || webinosType === "PzhCA") {
                        self.serviceCache = defaultConfig.pzhDefaultServices.slice(0);
                        self.metaData.friendlyName = self.userData.name +" ("+ self.userData.authenticator + ")";
                    } else if (webinosType === "Pzp" || webinosType === "PzpCA") {
                        self.serviceCache = defaultConfig.pzpDefaultServices.slice(0);
                    }

                    createPolicyFile();
                    storeAll();
                    callback (true);
                } else {
                    callback (false, "failed creating webinos default directories");
                }
            });
        });
    }

    function createNewConfiguration (webinosType, inputConfig, callback) {
        try {
            fetchDefaultWebinosConfiguration(webinosType, inputConfig, function (status) {
                if (status) {
                    var cn = self.metaData.webinosType + "CA:" + self.metaData.webinosName;
                    self.generateSelfSignedCertificate (self.metaData.webinosType+"CA", cn, function (status, value) {
                        if (!status) {
                            logger.error ("failed generating self signed master certificate -" + value);
                            if (callback) {return callback (false, "certificate manager failed in generating certificates");}
                        } else {
                            logger.log ("*****master certificate generated*****");
                            cn = self.metaData.webinosType + ":" + self.metaData.webinosName;
                            self.generateSelfSignedCertificate (self.metaData.webinosType, cn, function (status, csr) { // Master Certificate
                                if (status) {
                                    logger.log ("*****connection certificate generated*****");
                                    self.generateSignedCertificate(csr, function (status, signedCert) {
                                        if (status) {
                                            logger.log ("*****connection certificate signed by master certificate*****");
                                            self.cert.internal.conn.cert = signedCert;
                                            self.storeDetails(path.join("certificates", "internal"), "certificates", self.cert.internal);
                                            self.storeDetails(null, "crl", self.crl);
                                            callback(true);
                                        } else {
                                            callback (false);
                                        }
                                    });
                                } else {
                                    logger.error ("failed generating master certificate -" + value);
                                    if (callback) {callback (false, value);}
                                }
                            });
                        }
                    });
                } else {
                    logger.log ("Error reading default configuration details");
                    if (callback) {return callback (false, "Error reading default configuration details");}
                }
            });
        } catch (err) {
            logger.error(err);
            if (callback) {callback (false, err);}
        }
    }
    /**
     * Checks if metaData exists, if not creates a range of certificates
     * it calls generating certificate function defined in certificate manager.
     *
     * @param {function} callback It is callback function that is invoked after
     * checking/creating certificates
     */
    this.setConfiguration = function (webinosType, inputConfig, callback) {
        checkConfigExists(webinosType, inputConfig, function(status) {
            if(status) {
                self.fileList.forEach(function(name){
                    self.fetchDetails(name.folderName, name.fileName, name.object);
                });
                checkDefaultValues(webinosType);
                callback(true);
            } else {
                createNewConfiguration (webinosType, inputConfig, callback);
            }
        });
    };

    this.storeKeys = function (keys, name) {
        var filePath = path.join(self.metaData.webinosRoot, "keys", name+".pem");
        fs.writeFile(path.resolve(filePath), keys, function(err) {
            if(err) {
                logger.error("failed saving " + name +".pem");
            } else {
                logger.log("saved " + name +".pem");
                //calling get hash
                // self.getKeyHash(filePath);
            }
        });
    };
    /**
     *
     * @param data
     */
    this.storeDetails = function (folderName, type, data) {
        var fileName = type+".json";
        var filePath = path.join (self.metaData.webinosRoot, folderName, fileName);
        fs.writeFile (path.resolve (filePath), JSON.stringify (data, null, " "), function (err) {
            if (err) {
                logger.error ("failed saving in "+ folderName);
            } else {
                logger.log ("saved "+ filePath);
                updateWebinosConfig(folderName, type);
            }
        });
    };
    /**
     *
     * @param callback
     */
    this.fetchDetails = function (folderName, type, assignValue) {
        var fileName = type+".json";
        var filePath = path.join (self.metaData.webinosRoot, folderName, fileName);
        try {
            var data = fs.readFileSync (path.resolve (filePath));
            var dataString = data.toString ();
            if (dataString !== "") {
                data = JSON.parse(dataString);
                for (var key in data) {
                    assignValue[key] = data[key];
                }
            }
        } catch(err) {
            logger.log(err);
            logger.error ("configuration file "+ filePath+" is corrupted, retrying again to create fresh configuration");
        }
    };
}

util.inherits (Config, certificate);

module.exports = Config;
