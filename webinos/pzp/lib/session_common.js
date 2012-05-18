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
* Copyright 2011 Alexander Futasz, Fraunhofer FOKUS
*******************************************************************************/

/**
* @description Session common has functions that are used by both Pzh and Pzp
* @author <a href="mailto:habib.virji@samsung.com">Habib Virji</a>
*/
var dns = require("dns");
var net = require("net");
var path = require("path");
var fs = require("fs");
var os = require("os");

var writeError = [];
var message = "";

var session_common = exports;

var validation   = require("./session_schema");


session_common.debug = function(num, msg) {
  "use strict";
  var info = true; // Change this if you want no prints from session manager
  var debug = true;

  if(num === "ERROR" || num === 1) {
    console.log("ERROR: " + msg);
  } else if((num === "INFO" || num === 2) & info) {
    console.log("INFO: " + msg);
  } else if((num === "DEBUG" || num === 3) && debug) {
    console.log("DEBUG: " + msg);
  }
};

session_common.debugPzh = function(id, type, msg) {
  var info = true; // Change this if you want no prints from session manager

  if (id !== null && typeof id !== "undefined" && typeof writeError[id] === "undefined"){
    var filepath = session_common.webinosConfigPath();
    var filename = path.join(filepath+"/logs/", id+".json");
    try{
      fs.exists(filename, function(status){
        // If file does not exist, we create it , create write stream does not create file directly :) ..
        if (!status) {
          fs.writeFile(filename, function(){
            writeError[id] = fs.createWriteStream(filename, { flags: "a", encoding:"utf8"});
          });
        } else {
          writeError[id] = fs.createWriteStream(filename, { flags: "a", encoding:"utf8"});
        }
      });
    } catch (err){
      console.log("Error Initializing logs" + err);
    }
  }

  if (typeof writeError[id] !== "undefined" && type === "ERROR") {
    writeError[id].write(msg);
  }

  if(type === "ERROR" || type === 1) {
    console.log("ERROR: " + msg);
  } else if((type === "INFO" || type === 2) & info) {
    console.log("INFO: " + msg);
  } else if((type === "DEBUG" || type === 3)) {
    console.log("DEBUG: " + msg);
  }
};
/**
 * @description: returns root path of .webinos folder. In this folder all information is stored.
 */
session_common.webinosConfigPath = function() {
  "use strict";
  var webinosDemo;
  switch(os.type().toLowerCase()){
    case "windows_nt":
      webinosDemo = path.resolve(process.env.appdata + "/webinos/");
      break;
    case "linux":
      switch(os.platform().toLowerCase()){
        case "android":
          webinosDemo = path.resolve(process.env.EXTERNAL_STORAGE + "/.webinos/");
          break;
        case "linux":
          webinosDemo = path.resolve(process.env.HOME + "/.webinos/");
          break;
      }
      break;
    case "darwin":
      webinosDemo = path.resolve(process.env.HOME + "/.webinos/");
      break;
  }

  return webinosDemo;
};

/** @desription It removes the connected PZP/Pzh details.
 */
session_common.removeClient = function(self, conn) {
  "use strict";
  var i, delId, delPzhId;

  for (var id in self.connectedPzp){
    if (self.connectedPzp[id].socket === conn) {
      delete self.connectedPzp[i];
      return id;
    }
  }
    // TODO: Remove PZH details...
};

/**
* Read in JSON objects from buffer and call objectHandler for each parsed
* object.
* @param buffer Buffer instance containing JSON serialized objects.
* @param objectHandler Callback for parsed object.s
*/
var instanceMap = {};
session_common.readJson = function(instance, buffer, objectHandler) {
  var jsonStr;
  var len;
  var offset = 0;
  
  for (;;) {
    if (instanceMap[instance]) {
      // we already read from a previous buffer, read the rest
      len = instanceMap[instance].restLen;
      jsonStr = instanceMap[instance].part;
      jsonStr += buffer.toString('utf8', offset, offset + len);
      offset += len;
      instanceMap[instance] = undefined;
      
    } else {
      len = buffer.readUInt32LE(offset);
      jsonStr = buffer.toString('utf8', offset + 4, offset + len + 4);
      offset += len + 4;
    }
    
    if (jsonStr.length < len) {
      instanceMap[instance] = {
          restLen: len - jsonStr.length,
          part: jsonStr
      }
      return;
    }
    
    // call handler with parsed message object
    objectHandler(JSON.parse(jsonStr));
    
    if (offset >= buffer.length) {
      // finished reading buffer
      return;
    }
  }
};

/**
 * Read in JSON objects from buffer and call objectHandler for each parsed
 * object.
 * @param buffer Buffer instance containing JSON serialized objects.
 * @param objectHandler Callback for parsed object.s
 */
session_common.processedMsg = function(self, msgObj, callback) {
  "use strict";
  
  // BEGIN OF POLITO MODIFICATIONS
  var valError = validation.checkSchema(msgObj);
  if(valError === false) { // validation error is false, so validation is ok
    //session_common.debug('DEBUG','[VALIDATION] Received recognized packet ' + JSON.stringify(msgObj));
  } else if (valError === true) {
    // for debug purposes, we only print a message about unrecognized packet
    // in the final version we should throw an error
    // Currently there is no a formal list of allowed packages and throw errors
    // would prevent the PZH from working
    session_common.debug('INFO','[VALIDATION] Received unrecognized packet ' + JSON.stringify(msgObj));
  } else if (valError === 'failed') {
    session_common.debug('ERROR','[VALIDATION] failed');
  } else {
    session_common.debug('ERROR','[VALIDATION] Invalid response ' + valError);
  }
  callback.call(self, msgObj);
};

/**
 * @description: It uses both resolve and lookup to fetch IP address. 
 * Used by PZP before connecting to PZH
 */
session_common.resolveIP = function(serverName, callback) {
  if(net.isIP(serverName) !== 0) {
    callback(serverName);
  } else {
    dns.resolve(serverName, function(err, addresses) {
      if (typeof err !== "undefined") {
        // try again with lookup
        dns.lookup(serverName, function(err, address, family) {
          if (err) {
            callback("undefined");
            return;
          }
          callback(address);
        });
      } else {
        // resolve succeeded
        callback(addresses[0]);
      }
    });
  }
};
