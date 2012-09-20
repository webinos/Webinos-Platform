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
  this.cert         = {};
  this.cert.internal= {};
  this.cert.external= {};
  this.cert.internal= {master: {}, conn: {}, web: {}};
};

util.inherits(Certificate, keystore);

Certificate.prototype.generateSelfSignedCertificate = function(type, cn, callback) {
  var certman, obj = {}, key_id, cert_type;
  var self = this;
  try {
    certman = require("certificate_manager");
  } catch (err) {
    return callback(false, err);
  }
  if (type === "PzhPCA" || type === "PzhCA") {
    key_id = self.cert.internal.master.key_id = self.metaData.webinosName + "_master";
    cert_type = 0;
  } else if (type === "PzhP" || type === "Pzh" || type === "Pzp") {
    key_id = self.cert.internal.conn.key_id = self.metaData.webinosName + "_conn";;
    cert_type = 1;
  } else  if (type === "PzhWS") {
    key_id = self.cert.internal.web.key_id  = self.metaData.webinosName + "_web";;
    cert_type = 2;
  }
  if (type === "Pzp") {
    cert_type = 2;
  }
  if (type === "PzhCA") {
    self.cert.internal.signedCert  = {};
    self.cert.internal.revokedCert = {};
  }
  cn = encodeURIComponent(cn);
  if (cn.length > 40) {
    cn = cn.substring(0, 40);
  }

  self.generateKey(type, key_id, function(status, value) {
     if (!status) {
       return callback(false, value);
    } else {
      try {
        obj.csr = certman.createCertificateRequest(value,
          self.userData.country,
          self.userData.state, // state
          self.userData.city, //city
          self.userData.orgname, //orgname
          self.userData.orgunit, //orgunit
          cn,
          self.userData.email);
      } catch (err) {
        return callback(false, err);
      }

      try {
        var server = "DNS:"+self.metaData.serverName;
        obj.cert = certman.selfSignRequest(obj.csr, 3600, value, cert_type, server);
      } catch (e1) {
        return callback(false, e1);
      }
      try {
        obj.crl = certman.createEmptyCRL(value, obj.cert, 3600, 0);
      } catch (e2) {
        return callback(false, e2);
      }

      if (type === "PzhPCA" || type === "PzhCA") {
        self.cert.internal.master.cert = obj.cert;
        self.crl              = obj.crl;
        self.generateSignedCertificate(self.cert.internal.conn.csr, 1, function(status, value) {
          if (status) {
            self.cert.internal.conn.cert = value;
          } else {
            return callback(status, value);
          }
        });
      } else if (type === "PzhP" || type === "Pzh" || type === "Pzp") {
        self.cert.internal.conn.cert = obj.cert;
        self.cert.internal.conn.csr  = obj.csr;
        if (type === "Pzp") {
          self.crl                     = obj.crl;
        }
      } else if (type === "PzhWS") {
        return callback(true, obj.csr, value);
      }
      return callback(true, value);
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
    return callback(false, err);
  }

  try {
    self.fetchKey(self.cert.internal.master.key_id, function(status, value) {
      if(status) {
        var server = "DNS:"+self.metaData.serverName;
        var clientCert = certman.signRequest(csr, 3600, value, self.cert.internal.master.cert,  cert_type, server);
        return callback(true, clientCert);
      } else {
        return callback(false, value);
      }
    });
  } catch(err1) {
    return callback(false, err1);
  }
};

Certificate.prototype.revokeClientCert = function(pzpCert, callback) {
  "use strict";
  var certman, self = this;
  try {
    certman = require("certificate_manager");
  } catch (err) {
    return callback(false, err);
  }
  try {
    self.keystore.fetchKey(self.cert.internal.master.key_id, function(status, value) {
      if (status) {
        var crl = certman.addToCRL("" + value, "" + self.cert.internal.master.crl, "" + pzpCert);
        // master.key.value, master.cert.value
        return callback(true, crl);
      } else {
        return callback(status, value)
      }
    });
  } catch(err1) {
    return callback(false, err1);

  }
};

module.exports = Certificate;
