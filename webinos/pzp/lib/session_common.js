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

var ansi = require('ansi');
var cursor = ansi(process.stderr);

var writeError = [];
var message = "";

var session_common = exports;

var validation   = require("./session_schema");

session_common.debug = function(id) {
    this.store_id = id;
    this.sessionId;
};

session_common.debug.prototype.addId = function(id) {
  this.sessionId = id;
}
session_common.debug.prototype.error = function(msg) {
  cursor.bg.black();
  cursor.fg.red().write('error ');
  cursor.fg.cyan().write(this.store_id);
  if (typeof this.sessionId !== "undefined")
    cursor.fg.green().write(' ' + this.sessionId);
  cursor.fg.red().write(' ' + msg + '\n');
  cursor.reset();

  if (typeof this.sessionId !== "undefined" && typeof writeError[this.sessionId] === "undefined"){
    var filepath = session_common.webinosConfigPath();
    var filename = path.join(filepath+"/logs/", this.sessionId+".json");
    try{
      fs.exists(filename, function(status){
        // If file does not exist, we create it , create write stream does not create file directly :) ..
        if (!status) {
          fs.writeFile(filename, function(){
            writeError[this.sessionId] = fs.createWriteStream(filename, { flags: "a", encoding:"utf8"});
          });
        } else {
          writeError[this.sessionId] = fs.createWriteStream(filename, { flags: "a", encoding:"utf8"});
        }
      });
    } catch (err){
      console.log("Error Initializing logs" + err);
    }
  } else if(this.sessionId && writeError[this.sessionId]) {
    writeError[this.sessionId].write(msg + '\n');
  }
};

session_common.debug.prototype.info = function(msg) {
  cursor.bg.black();
  cursor.fg.white().write('info ');
  cursor.fg.cyan().write(this.store_id);
  if (typeof this.sessionId !== "undefined")
    cursor.fg.green().write(' ' + this.sessionId);
  cursor.fg.white().write(' ' + msg + '\n')
  cursor.reset();
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

  for (var id in self.connectedPzp){
    if (self.connectedPzp[id].socket === conn) {
      console.log("removed pzp instance details -" + id)
      delete self.connectedPzp[id];
      return id;
    }
  }

   for (var id in self.connectedPzh){
    if (self.connectedPzh[id].socket === conn) {
      console.log("removed pzh instance details -" + id)
      delete self.connectedPzh[id];
      return id;
    }
  }
    // TODO: Remove PZH details...
};

/**
 * Converts a JSON string to Buffer.
 *
 * Given JSON string is converted into a byte length prefixed Buffer. The first
 * four bytes contain the byte length of the JSON string. Use this function
 * to send JSON over a TCP socket.
 * @param jsonString JSON string to be converted.
 * @returns byte lenght prefixed buffer.
 */
session_common.jsonStr2Buffer = function(jsonString) {
	var strByteLen = Buffer.byteLength(jsonString, 'utf8');
	var buf = new Buffer(4 + strByteLen, 'utf8');
	buf.writeUInt32LE(strByteLen, 0);
	buf.write(jsonString, 4);
	return buf;
}

/**
* Read in JSON objects from buffer and call objectHandler for each parsed
* object.
* @param instance PZH/PZP instance.
* @param buffer Buffer instance containing JSON serialized objects.
* @param objectHandler Callback for parsed object.s
*/
var instanceMap = {};
session_common.readJson = function(instance, buffer, objectHandler) {
  var jsonStr;
  var len;
  var offset = 0;

  for (;;) {
    var readByteLen;
    if (instanceMap[instance]) {
      // we already read from a previous buffer, read the rest
      len = instanceMap[instance].restLen;
      var jsonStrTmp = buffer.toString('utf8', offset, offset + len);
      readByteLen = Buffer.byteLength(jsonStrTmp, 'utf8');
      jsonStr = instanceMap[instance].part + jsonStrTmp;
      offset += len;
      instanceMap[instance] = undefined;

    } else {
      len = buffer.readUInt32LE(offset);
      offset += 4;
      jsonStr = buffer.toString('utf8', offset, offset + len);
      readByteLen = Buffer.byteLength(jsonStr, 'utf8');
      offset += len;
    }

    if (readByteLen < len) {
      instanceMap[instance] = {
          restLen: len - readByteLen,
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

session_common.fetchIP = function(callback) {
  var socket = net.createConnection(80, "www.google.com");
  socket.on('connect', function() {
    if (typeof callback === "function") { callback(socket.address().address);}
    socket.end();
  });
  socket.on('error', function() { // Assuming this will happen as internet is not reachable
    if (typeof callback === "function") { callback("0.0.0.0");}

  });
}
