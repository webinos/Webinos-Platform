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
var util = require('util');
var webinos = require("webinos")(__dirname);
var keystore = webinos.global.require(webinos.global.manager.keystore.location);

/** @description Create private key, certificate request, self signed certificate and empty crl. This is crypto sensitive function
 * @param {Object} self is currect object of Pzh/Pzp
 * @param {String} name used in common field to differentiate Pzh and Pzp
 * @param {Object} obj holds key, certificate and crl certificate values and names
 * @returns {Function} callback returns failed or certGenerated. Added to get synchronous behaviour
 */
function Certificate() {
  keystore.call(this);
};

util.inherits(Certificate, keystore);

Certificate.prototype.generateSelfSignedCertificate = function(type, cn, callback) {
  var certman, obj = {}, key_id, cert_type;
  var self = this;
  try {
    certman = require("certificate_manager");
  } catch (err) {
    callback("error", "exception", err);
    return;
  }
  if (type === "PzhProviderCA" || type === "PzhCA") {
    key_id = self.cert.master.key_id;
    cert_type = 0;
  } else if (type === "PzhProvider" || type === "Pzh" || type === "Pzp") {
    key_id = self.cert.conn.key_id;
    cert_type = 1;
  } else  if (type === "PzhWS") {
    key_id = self.cert.web.key_id;
    cert_type = 2;
  }
  if (type === "Pzp") {
    cert_type = 2;
  }
  cn = encodeURIComponent(cn);
  if (cn.length > 40) {
    cn = cn.substring(0, 40);
  }

  self.generateKey(type, key_id, function(status, errorDetails, key) {
    if (status === "error") {
      callback(status, "write file", errorDetails);
    } else {
      try {
        obj.csr = certman.createCertificateRequest(key,
          self.certData.country,
          self.certData.state, // state
          self.certData.city, //city
          self.certData.orgname, //orgname
          self.certData.orgunit, //orgunit
          cn,
          self.certData.email);
        } catch (err) {
        callback("error", "exception", err);
        return;
      }

      try {
        var server = "DNS:"+self.serverName;
        obj.cert = certman.selfSignRequest(obj.csr, 3600, key, cert_type, server);
      } catch (e1) {
        console.log(e1);
        callback("error", "exception", e1);
        return;
      }
      try {
        obj.crl = certman.createEmptyCRL(key, obj.cert, 3600, 0);
      } catch (e2) {
        callback("error", "exception", e2);
        return;
      }

      if (type === "PzhProviderCA" || type === "PzhCA") {
        self.cert.master.cert = obj.cert;
        self.cert.master.crl  = obj.crl;
        self.generateSignedCertificate(self.cert.conn.csr, 1, function(status, errorDetails, cert) {
          self.cert.conn.cert = cert;
        });
      } else if (type === "PzhProvider" || type === "Pzh" || type === "Pzp") {
        self.cert.conn.cert   = obj.cert;
        self.cert.conn.csr    = obj.csr;

      } else if (type === "PzhWS") {
        self.cert.web.cert = obj.cert;
      }
      callback("success", "", key);
    }
  });
};

/**
 * @description Crypto sensitive
*/
Certificate.prototype.generateSignedCertificate = function(csr, cert_type,  callback) {
  var certman, self = this;
  try {
    certman = require("certificate_manager");
  } catch (err) {
    callback("error", "exception", err);
    return;
  }

  try {
    this.fetchKey(this.cert.master.key_id, function(status, errorDetails, master_key) {
      var server = "DNS:"+self.serverName;
      var clientCert = certman.signRequest(csr, 3600, master_key, self.cert.master.cert,  cert_type, server);
      callback("success", "", clientCert);
    });
  } catch(err1) {
    callback("error", "exception", err1);
    return;
  }
};

Certificate.prototype.revokeClientCert = function(pzpCert, callback) {
  "use strict";
  var certman;
  try {
    certman = require("certificate_manager");
  } catch (err) {
    callback("error", "exception", err);
    return;
  }
  try {
    this.keystore.fetchKey(this.master.key_id, function(status, errorDetails, key) {
      var crl = certman.addToCRL("" + key, "" + this.master.crl, "" + pzpCert);
      // master.key.value, master.cert.value
      callback("success", "", crl);
    });
  } catch(err1) {
    callback("error", "exception", err1);
    return;
  }
}

module.exports = Certificate;
