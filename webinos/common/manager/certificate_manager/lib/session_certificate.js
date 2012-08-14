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

var log1  =  require("./session_common");
var log   =  new log1.debug("cert");

/** @description Create private key, certificate request, self signed certificate and empty crl. This is crypto sensitive function
 * @param {Object} self is currect object of Pzh/Pzp
 * @param {String} name used in common field to differentiate Pzh and Pzp
 * @param {Object} obj holds key, certificate and crl certificate values and names
 * @returns {Function} callback returns failed or certGenerated. Added to get synchronous behaviour
 */
exports.selfSigned = function(config, type, callback) {
  "use strict";
  var certman, cn, certType, key , csr ;
  var obj = {cert: "", crl:""};

  try {
    certman = require("certificate_manager");
  } catch (err) {
    log.error("failed loading certificate manager");
    callback("failed", err);
    return;
  }

  try {
    if (type === "PzhFarmCA" ||  type === "PzhCA"){
      key = certman.genRsaKey(2048);
    } else {
      key = certman.genRsaKey(1024);
    }
  } catch(err1) {
    log.error("failed generating certificate");
    callback("failed", err1);
    return;
  }

  cn = encodeURIComponent(type+":"+ config.name);

  if (cn.length > 40) {
    cn = cn.substring(0, 40);
  }
  if (type === "PzhFarmCA" ||  type === "PzhCA") {
    certType = 0;
  } else if (type === "Pzh" || type === "PzhFarm" ||
    type === "PzhWebServer" || type === "PzhWebSocketServer") {
    certType = 1;
  } else {
    certType = 2;
  }

  try {
      // state, city, orgname, orgunit are left empty as we do not posses this information
    if (type === "Pzh") {
      csr = certman.createCertificateRequest(key,
          config.country,
          "", // state
          "", //city
          "", //orgname
          "", //orgunit
          cn,
          config.email);
    } else {
      csr = certman.createCertificateRequest(key,
          "", // country
          "", // state
          "", //city
          "", //orgname
          "", //orgunit
          cn,
         ""); //email
    }
  } catch (e) {
    log.error("failed Generating CSR");
    callback("failed", e);
    return;
  }

  try {
      var server = "DNS:"+config.serverName;
      obj.cert = certman.selfSignRequest(csr, 3600, key, certType, server);
  } catch (e1) {
    log.error("failed generating self signed certifcate");
    callback("failed", e1);
    return;
  }
  try {
    obj.crl = certman.createEmptyCRL(key, obj.cert, 3600, 0);
  } catch (e2) {
    callback("failed", e2);
    return;
  }
  callback("certGenerated", null, key, obj, csr);
};

/**
 * @description Crypto sensitive
*/
exports.signRequest = function(csr, master_key, master_cert, certType, uri, callback) {
  "use strict";
  var certman;

  try {
    certman = require("certificate_manager");
  } catch (err) {
    callback( "failed");
    return;
  }

  try {
    var server = "DNS:"+uri;
    var clientCert = certman.signRequest(csr, 3600, master_key, master_cert, certType, server);
    callback("certSigned", clientCert);
  } catch(err1) {
    log.error("failed to sign certificate: " + err1.msg);
    callback("failed");
    return;
  }
};

exports.revokeClientCert = function(master_key, master_crl, pzpCert, callback) {
  "use strict";
  var certman;

  try {
    certman = require("certificate_manager");
  } catch (err) {
    log.error("failed loading certificate manager");
    callback("failed", err);
    return;
  }
  try {
    log("INFO", "Calling certman.addToCRL\n");
    var crl = certman.addToCRL("" + master_key, "" + master_crl, "" + pzpCert);
    // master.key.value, master.cert.value
    callback("certRevoked",  crl);
  } catch(err1) {
    log.error(err1);
    callback("failed", err1);
    return;
  }
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
