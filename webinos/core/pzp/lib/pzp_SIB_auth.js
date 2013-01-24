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
 * Copyright 2011 Ziran Sun, Samsung Electronics (UK) Ltd
 *******************************************************************************/
var os = require("os");
var https = require('https');
var path        = require("path");
var webinos = require("find-dependencies")(__dirname);
var logger  = webinos.global.require(webinos.global.util.location, "lib/logging.js")(__filename) || console;

var PzpSIBAuth = function(_parent){

  /**
   * Create QR image using public key Hash
   * @param infile. Path for the public key certificate
   * @param outfile. Path for the generate QR image file (Android only)
   * @param width. Width of QR image to be generated (Android only)
   * @param height. Height of QR image to be generated (Android only)
   * @param cb. Callback when QR image generated
   */
  this.createQRHash = function(infile, outfile, width, height, cb) {
    _parent.config.getKeyHash(infile, function(status, value){  
      if(status)
      {
        logger.log("get hash: " + value);
        if(os.platform().toLowerCase() == "android") {
          try {
            var bridge = require('bridge');
            QRencode = bridge.load('org.webinos.impl.QRImpl', this);
            QRencode.enCode(value, width, height, outfile, function(outfile){
              cb(outfile);
            });
          }
          catch(e) {
            logger.error("Android QRencode - error: "+e.message);
          }
        }
        else
        {
          try {
            var QRCode = require("qrcode");
            QRCode.toDataURL(value, function(err, value) {
              logger.log("created url: " + value);
              cb(err, value);
            });
          } catch (err) {
            logger.log("create QR failed: " + err); 
          } 
        } 
      }  
      else
        logger.log("get hash err: " + value); 
    });  
  };  
  
   /**
   * Compare hash from the scanned QR code with Hash stored locally
   * @param filepath. path for other party's public key certificate
   * @param hash.  Locally stored hash code
   * @param cb. Callback when comprison is done   
   */
  this.checkQRHash = function(filename, hash, cb) {
    _parent.config.getKeyHash(filename, function(status, value){  
      if(status)
      {
        logger.log("hash passed over is: " + hash);
        
        logger.log("get hash of the other party: " + value)
        if(hash == value){
          logger.log("correct hash key");
          cb(true);
        }  
        else
        {
          logger.log("Wrong Hash Key");
          cb(false);
        }  
      }  
      else
      {
        logger.log("get hash err: " + value); 
      }  
    });  
  };
}

  module.exports = PzpSIBAuth;
