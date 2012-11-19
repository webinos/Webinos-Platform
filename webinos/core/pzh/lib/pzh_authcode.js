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
* Copyright 2011 University of Oxford
* Copyright 2011 Habib Virji, Samsung Electronics (UK) Ltd
*******************************************************************************/

/** @description: This module can be used for authentication a new PZP to the personal zone hub
 * The PZH creates an "authCounter" which creates and validates authentication
 * codes that are given to new devices.
 *
 * One implementation scenario is the QR Code: a user visits the PZH web
 * interface, logs in, and is shown a QR Code, which contains an authCode,
 * which is then presented to the PZH as proof that the PZP should be trusted.
 */
var webinos = require("find-dependencies")(__dirname);
var logger  = webinos.global.require(webinos.global.util.location, "lib/logging.js")(__filename) || console;
var tokenAuth = exports;

/** @description: This creates an auth code object which can be used to set a new
 * code for a new PZP and then query about whether it is still valid.
 */
tokenAuth.createAuthCounter = function(callback) {
  "use strict";
  var authCounter = {
    status  : false,
    code    : "",
    timeout : "",
    guesses :0
  };

   /** @description:set the code that we are expecting to see at the PZH from a new PZP
    * it will automatically set an expiry time for this code.
    */
  authCounter.setExpectedCode = function(code, cb) {
    var self = this;
    logger.log("new PZP expected, code: " + code);
    self.status = true;
    self.code = code;
    var d = new Date();
    d.setMinutes(d.getMinutes() + 10); //Timeout of ten minutes?  Should this be a config option?
    self.timeout = d;
    self.guesses = 8; //Allow 8 guesses
    cb();
  };

  /** @description: unset the code - we've seen it before, or we've timed out and have no use
   * for it anymore.
     */
  authCounter.unsetExpected = function(cb) {
    var self = this;
    logger.log("no longer expecting PZP with code " + self.code);
    self.status = false;
    self.code = null;
    self.timeout = null;
    self.guesses = 8;
    cb();
  };

    /** @description query interface: are we expecting a new PZP any time soon? */
  authCounter.isExpected = function(cb) {
    var self = this;

    if (!self.status) {
      logger.log("not expecting a new PZP");
      cb(false);
      return;
    }
    if (self.timeout < new Date()) {
      logger.log("was expecting a new PZP, timed out.");
      self.unsetExpected( function() {
        cb(false);
      });
      return;
    }

    cb ( self.status &&
      (self.timeout > new Date()) );
  };

  /** @description: query interface: are we expecting a new PZP any time soon?  and if so,
     * does it have this code?  if not, increment the number of guesses.
     */
  authCounter.isExpectedCode = function(newcode, cb) {
    var self = this;
    newcode = newcode.toUpperCase();

    logger.log("trying to add a PZP, code: " + newcode);

    if (!self.status) {
      logger.log("not expecting a new PZP");
      cb(false);
      return;
    }
    if (self.code !== newcode) {
      logger.log("was expecting a new PZP, but code wrong");
      self.guesses = self.guesses - 1;
      if (self.guesses <= 0) {
        //no more guesses
        logger.log("too many guesses, deleting code");
        self.unsetExpected( function() {
          cb(false);
        });
      }
      cb(false);
      return;
    }

    if (self.timeout < new Date()) {
      logger.log("was expecting a new PZP, code is right, but timed out.");
      self.unsetExpected( function() {
        cb(false);
      });
      return;
    }

    cb( self.status && self.code === newcode &&
      (self.timeout > new Date()) );
  };
  callback(authCounter);
};
