/*******************************************************************************
 *  Code contributed to the webinos project*
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
var dependency = require ("find-dependencies") (__dirname);
var keystore = dependency.global.require (dependency.global.manager.keystore.location);

var Certificate = function () {
    "use strict";
    this.cert = {internal:{master:{}, conn:{}, web:{}}, external:{}};
    keystore.call(this);
    var logger = dependency.global.require (dependency.global.util.location, "lib/logging.js") (__filename);
    var self = this, certificateType = Object.freeze({ "SERVER": 0, "CLIENT": 1}), certificateManager;
    try {
        certificateManager = require ("certificate_manager");
    } catch (err) {
        logger.error("certificate manager is missing, please run npm install or node-gyp rebuild");
        process.exit();
    }

    function getCertType(type) {
        var cert_type;
        if (type === "PzhPCA" || type === "PzhCA" || type === "PzpCA") {
            cert_type = certificateType.SERVER;
        } else if (type === "PzhP" || type === "Pzh" || type === "Pzp" || type === "PzhWS" || type === "PzhSSL" ) {
            cert_type = certificateType.CLIENT;
        }
        return cert_type;
    }

    function getKeyId(type) {
        var key_id;
        if (type === "PzhPCA" || type === "PzhCA" || type === "PzpCA") {
            key_id = self.cert.internal.master.key_id = self.metaData.webinosName + "_master";
        } else if (type === "PzhP" || type === "Pzh" || type === "Pzp") {
            key_id = self.cert.internal.conn.key_id = self.metaData.webinosName + "_conn";
        } else if (type === "PzhWS") {
            if(!self.cert.internal.webclient) {self.cert.internal.webclient = {}}
            key_id = self.cert.internal.webclient.key_id = self.metaData.webinosName + "_webclient";
        } else if (type === "PzhSSL") {
            if(!self.cert.internal.webssl) {self.cert.internal.webssl = {}}
            key_id = self.cert.internal.webssl.key_id = self.metaData.webinosName + "_webssl";
        }
        return key_id;
    }

    this.generateSelfSignedCertificate = function (type, cn, callback) {
        var obj = {}, key_id = getKeyId(type), cert_type = getCertType(type);

        if (type === "PzhCA") {
            self.cert.internal.signedCert = {};
            self.cert.internal.revokedCert = {};
        } else if (type === "PzpCA") {
            self.cert.internal.pzh = {}
        }
        cn = encodeURIComponent (cn);
        if (cn.length > 40) {
            cn = cn.substring (0, 40);
        }

        self.generateKey (type, key_id, function (status, privateKey) {
            if (!status) {
                logger.error ("failed generating key " + privateKey);
                return callback (false, privateKey);
            } else {
                logger.log (type + " created private key (certificate generation I step)");
                try {
                    obj.csr = certificateManager.createCertificateRequest (privateKey,
                        encodeURIComponent (self.userData.country),
                        encodeURIComponent (self.userData.state), // state
                        encodeURIComponent (self.userData.city), //city
                        encodeURIComponent (self.userData.orgname), //orgname
                        encodeURIComponent (self.userData.orgunit), //orgunit
                        cn,
                        encodeURIComponent (self.userData.email));
                } catch (err) {
                    logger.error ("failed generating csr " + err);
                    return callback (false, err);
                }

                try {
                    logger.log (type + " generated CSR (certificate generation II step)");
                    var server = self.metaData.serverName;
                    if (require ("net").isIP (server)) {
                        server = "IP:" + self.metaData.serverName;
                    } else {
                        server = "DNS:" + self.metaData.serverName;
                    }
                    obj.cert = certificateManager.selfSignRequest (obj.csr, 3600, privateKey, cert_type, server);
                } catch (e1) {
                    logger.error ("failed generating signed certificate " + e1);
                    return callback (false, e1);
                }
                try {
                    logger.log (type + " generated self signed certificate (certificate generation III step)");
                    obj.crl = certificateManager.createEmptyCRL (privateKey, obj.cert, 3600, 0);
                } catch (e2) {
                    logger.error ("failed generating crl " + e2);
                    return callback (false, e2);
                }

                logger.log (type + " generated crl (certificate generation IV step)");
                if (type === "PzhPCA" || type === "PzhCA" || type === "PzpCA") {
                    self.cert.internal.master.cert = obj.cert;
                    self.crl.value = obj.crl;
                    if (type === "PzpCA") { self.cert.internal.master.csr = obj.csr;} // We need to get it signed by PZH later
                    return callback(true);
                } else if (type === "PzhP" || type === "Pzh" || type === "Pzp") {
                    self.cert.internal.conn.cert = obj.cert;
                    if (type === "Pzp") { self.cert.internal.conn.csr = obj.csr; }
                    return callback (true, obj.csr);
                }  else if (type === "PzhWS" || type === "PzhSSL") {
                    return callback (true, obj.csr);
                }
            }
        });
    };

    this.getKeyHash = function(path, callback){
        try {
            var hash = certificateManager.getHash(path);
            logger.log("Key Hash is" + hash);
            return callback(true, hash);
        } catch (err) {
            logger.log("get certificate manager error" + err);
            return callback(false, err);
        }
    };

    this.generateSignedCertificate = function (csr, callback) {
        try {
            self.fetchKey (self.cert.internal.master.key_id, function (status, privateKey) {
                if (status) {
                    var server,  clientCert;
                    if (require ("net").isIP (self.metaData.serverName)) {
                        server = "IP:" + self.metaData.serverName;
                    } else {
                        server = "DNS:" + self.metaData.serverName;
                    }
                    clientCert = certificateManager.signRequest (csr, 3600, privateKey, self.cert.internal.master.cert, certificateType.CLIENT, server);
                    logger.log ("signed certificate by the PZP/PZH");
                    return callback (true, clientCert);
                } else {
                    return callback (false, privateKey); // It is not privateKey but just variable name
                }
            });
        } catch (err1) {
            return callback (false, err1);
        }
    };

    this.revokeClientCert = function (pzpCert, callback) {
        try {
            self.fetchKey (self.cert.internal.master.key_id, function (status, value) {
                if (status) {
                    var crl = certificateManager.addToCRL ("" + value, "" + self.crl, "" + pzpCert);
                    // master.key.value, master.cert.value
                    logger.log("revoked certificate");
                    return callback (true, crl);
                } else {
                    return callback (status, value)
                }
            });
        } catch (err1) {
            return callback (false, err1);

        }
    };
};

require ("util").inherits (Certificate, keystore);
module.exports = Certificate;
