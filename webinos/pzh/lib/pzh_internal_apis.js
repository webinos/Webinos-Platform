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
********************************************************************************/

// This file is a wrapper / facade for all the functionality that the PZH
// web interface is likely to need.

// Ideally, this would be accessed through the same messaging interface
// as everything else, as these need some access control too.
// In other words: due a refactor.

var pzhapis     = exports;

var path        = require("path");
var fs          = require("fs");
var util        = require("util");
var crypto      = require("crypto");

var webinos = require("webinos")(__dirname);
var session = webinos.global.require(webinos.global.pzp.location, "lib/session");
var qrcode  = require("./pzh_qrcode.js");
var revoke  = require("./pzh_revoke.js");

var farm    = require("./pzh_farm.js");

var pzh_internal_apis = exports;

// Synchronous method for getting information about a PZP with a certain ID.
function getPzpInfoSync(instance, pzpId) {
  "use strict";
  //find out whether we have this PZP in a session somewhere.
  var pzpConnected = false;
  var pzpName = pzpId;
  for (var i in instance.connectedPzp) {
    if (instance.connectedPzp.hasOwnProperty(i)) {
        //session IDs append the PZH to the front of the PZP ID.
      var splitId = i.split("/");
      if (splitId.length > 1 && splitId[1] !== null) {
        if (splitId[1] === pzpId) {
          pzpConnected = true;
          pzpName = i;
        }
      }
    }
  }

  return {
    id          : pzpId,
    cname       : pzpName,
    isConnected : pzpConnected
  };
}

// Synchronous method for getting information about a PZH with a certain ID.
function getPzhInfoSync(instance, pzhId) {
  "use strict";
  if (pzhId && pzhId.split("_")[0] === instance.config.name) {
    //we know that this PZH is alive
    return {
      id : pzhId + " (Your PZH)",
      url: pzhId,
      isConnected: true
    };
  } else {
    for (var i in instance.connectedPzh) {
      if (instance.connectedPzh.hasOwnProperty(i)) {
        //session IDs append the PZH to the front of the PZP ID.
        if (i === pzhId.split('/')[1]) {
          return {
            id          : i,
            url         : pzhId,
            isConnected : true
          };
        }
      }
    }    
    // We did not find pzh connected
     return {
      id          : pzhId.split("/")[1],
      url         : pzhId,
      isConnected : false
    };
  }
}

// Wrapper for adding a new PZP to a personal zone through a short code
pzh_internal_apis.addPzpQR = function (instance, callback) {
  "use strict";
  qrcode.addPzpQRAgain(instance, callback);
};


pzh_internal_apis.listPzp = function(instance, callback) {
  "use strict";
  var result = {signedCert: [], revokedCert: []};
  for (var i in instance.config.signedCert){
    if (typeof instance.config.signedCert[i] !== "undefined") {
      result.signedCert.push(getPzpInfoSync(instance, i));
    }
  }

  for (var i in instance.config.revokedCert) {
    if (typeof instance.config.revokedCert[i] !== "undefined") {
      result.revokedCert.push(getPzpInfoSync(instance, i));
    }
  }
  var payload = {to: instance.config.serverName, cmd:"listPzp", payload:result};
  callback(payload);
};


// Get a list of all Personal zone devices.
pzh_internal_apis.listZoneDevices = function(instance, callback) {
  "use strict";
  var result = {pzps: [], pzhs: []};
  if (instance && instance.config) {
    for (var i in instance.config.signedCert){
      if (typeof instance.config.signedCert[i] !== "undefined") {
        result.pzps.push(getPzpInfoSync(instance, i));
      }
    }
  
   for (var i in instance.config.otherCert) {
      if (typeof instance.config.otherCert[i] !== "undefined" && instance.config.otherCert[i].cert !== "") {
        result.pzhs.push(getPzhInfoSync(instance, i));
      }
    }
    result.pzhs.push(getPzhInfoSync(instance, instance.sessionId));
    var payload = {to: instance.config.serverName, cmd:"listDevices", payload:result};
    callback(payload);
  }
};

// Return the crashlog of this PZH.
pzh_internal_apis.crashLog = function(instance, callback){
  "use strict";
  var filename = path.join(session.common.webinosConfigPath()+"/logs/", instance.sessionId+".json");
  fs.readFile(filename, function(err, data){
    var payload = {to: instance.config.serverName, cmd:"crashLog", payload:""};
    if (data !== null && typeof data !== "undefined"){
      payload.payload = data.toString("utf8");
      callback(payload);
    } else {
      callback(payload);
    }
  });
};

pzh_internal_apis.revoke = function(instance, pzpid, callback) {
  "use strict";
  revoke.revokePzp(pzpid, instance, callback);
};

// This is sending side action on PZH end
pzh_internal_apis.addPzhCertificate = function(instance, to, callback) {
  // temp solution till we decide how to trigger
  
  if (to && to.split('/')) {
    if (instance.config.otherCert[to]) {
      callback({cmd:'pzhPzh', to: instance.config.serverName, payload: "already connected"});
    } else {
      var pzh_connecting = require('./pzh_connecting.js');
      var pzhConnect = new pzh_connecting(instance);
      pzhConnect.sendCertificate(to, callback); 
    }
  } else {
    callback({cmd:'pzhPzh', to: instance.config.serverName, payload: "connecting address is wrong"});
  }
};

pzh_internal_apis.restartPzh = function(instance, callback) {
  "use strict";
  try {
    // Reload contents
    var id = instance.config.serverName;
    farm.server._contexts.some(function(elem) {
      if (id.match(elem[0]) !== null) {
        elem[1] = crypto.createCredentials(farm.pzhs[id].options).context;
      }
    });
  } catch(err) {
    callback.call(instance, err);
  }
};
