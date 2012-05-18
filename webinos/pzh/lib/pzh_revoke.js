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
* Copyright 2011 University of Oxford
*******************************************************************************/

// This module provides the PZH with revocation commands for removing a PZP
// which should no longer be part of the personal zone. It does not handle
// revocation of a PZH.
//
// The main user of this module is the PZH"s web interface.
//


var revoker = exports;

var fs      = require("fs");
var path    = require("path");
var crypto  = require("crypto");
var util    = require("util");

var webinos = require("webinos")(__dirname);
var log     = webinos.global.require(webinos.global.pzp.location, "lib/session").common.debug;
var session = webinos.global.require(webinos.global.pzp.location, "lib/session");

// Main interface: remove a PZP here.
function revoke(instance, pzpCert, callback) {
  "use strict";
  session.configuration.fetchKey(instance.config.master.key_id, function(master_key) {
    session.certificate.revokeClientCert(master_key, instance.config.master.crl, pzpCert, function(result, crl) {
      if (result === "certRevoked") {
        /* This should work, if this works then we do not have to restart PZH
        try {
          instance.conn.pair.credentials.context.addCRL(crl);
        } catch (err) {
          console.log(err);
        }
        */
        instance.config.master.crl = crl;
        session.configuration.storeConfig(instance.config, function() {
          //TODO : trigger the PZH to reconnect all clients
          //TODO : trigger a synchronisation with PZPs.
          callback(true);
        });

      } else {
        log(instance.sessionId, "ERROR", "[PZH - "+instance.sessionId+"] Failed to revoke client certificate [" + pzpCert + "]");
        callback(false);
      }
    });
  });
}

// internal wrapper for revocation.  Collects key and revokes the certificate.
function removeRevokedCert(instance, pzpid, config, callback) {
  "use strict";
  try {
    config.revokedCert[pzpid] = config.signedCert[pzpid];
    delete config.signedCert[pzpid] ;
    session.configuration.storeConfig(config, function() {
      callback(true);
    });
  } catch (err) {
    log(instance.sessionId, "INFO", "[PZH - "+ instance.sessionId+"] Unable to rename certificate " + err);
    callback(false);
  }
}
  
revoker.revokePzp = function (pzpid, pzh, callback ) {
  "use strict";
  var pzpcert = pzh.config.signedCert[pzpid];
  if (typeof pzpcert !== "undefined" ) {
    revoke(pzh, pzpcert, function(result) {
      if (result) {
        log(pzh.sessionId, "INFO", "[PZH - "+ pzh.sessionId+"] Revocation success! " + pzpid + " should not be able to connect anymore ");

        removeRevokedCert(pzh, pzpid, pzh.config, function(status2) {
          if (!status2) {
            log(pzh.sessionId, "INFO", "[PZH - "+ pzh.sessionId+"] Could not rename certificate");
          }
          callback({cmd:"revokePzp", pzpid: pzpid});
          return;
        });
      } else {
        log(pzh.sessionId, "INFO", "[PZH - "+ pzh.sessionId+"] Revocation failed! ");
        callback("failed to update CRL");
      }
    });
  }
};
