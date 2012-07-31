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
* Copyright 2011 Habib Virji, Samsung Electronics (UK) Ltd
*******************************************************************************/

// A wrapper for the QRCODE module which generates a QR code for a short,
// 8-byte string, plus (in theory) the URL of the PZH.

var crypto  = require("crypto");
var path    = require("path");

var pzh_qrcode = exports;

function create(url, code, cb) {
  "use strict";
  try { 
    var QRCode = require("qrcode");
    var urlCode = "" + url + " " + code;
    QRCode.toDataURL(urlCode, function(err,url) {
      cb(err, url);
    });
  } catch (err) {
    cb(err, "<img src=\"http://www.yooter.com/images/pagenotfound.jpg\" />");
  }
}

function generateRandomCode() {
  "use strict";
  return crypto.randomBytes(8).toString("base64");
}

// Generate me a random code.  I do hope this is secure...
pzh_qrcode.createQR = function(url, code, cb) {
  "use strict";
  create(url,code,cb);
};
// Add a new PZP by generating a QR code.  This function:
// (1) returns a QR code 
// (2) generates a new secret code, to be held by the PZH
// (3) tells the PZH to be ready for a new PZP to be added
pzh_qrcode.addPzpQR = function(pzh, connection) {
  "use strict";
  var code = generateRandomCode();

  pzh.expecting.setExpectedCode(code, function() {
    pzh.getMyUrl(function(url) { 
      create(url, code, function(err, qrimg) {
        if (err === null) {
          var message = {
            name: pzh.sessionId, 
            img: qrimg,
            result: "success"
            };
          var payload = {status : "addPzpQR", message : message};
          var msg = {type: "prop", payload: payload};
          connection.sendUTF(JSON.stringify(msg));
        } else {
          pzh.expecting.unsetExpected( function() {
            var message = {
              name: pzh.sessionId, 
              img: qrimg,
              result: "failure: not suppported"
              };
            var payload = {status : "addPzpQR", message : message};
            var msg = {type: "prop", payload: payload};
            connection.sendUTF(JSON.stringify(msg));
          });
        }
      });
    });
  });
};

// The same function as the above, but without the messaging nonsense.
// Due a refactor.
pzh_qrcode.addPzpQRAgain = function(pzh, next) {
  "use strict";
  
  var code = generateRandomCode();

  pzh.expecting.setExpectedCode(code,function() {
    pzh.getMyUrl(function(url) {
      create(url, code, function(err, qrimg) {
        next({to: pzh.config.serverName, cmd: "addPzpQR", payload:{err: err, img: qrimg, code: code}});
      });
    });
  }); 
};



