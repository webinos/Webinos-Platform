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
* Copyright 2011 Alexander Futasz, Fraunhofer FOKUS
* Copyright 2011 Habib Virji, Samsung Electronics (UK) Ltd
 *******************************************************************************/
var validation    = require("./session_schema");
var webinos       = require("find-dependencies")(__dirname);
var logger        = webinos.global.require(webinos.global.util.location, "lib/logging.js")(__filename) || console;

var ProcessWebinosMsg = exports;

var instanceMap = {};

/**
 * Converts a JSON string to Buffer.
 *
 * Given JSON string is converted into a byte length prefixed Buffer. The first
 * four bytes contain the byte length of the JSON string. Use this function
 * to send JSON over a TCP socket.
 * @param jsonString JSON string to be converted.
 * @returns byte lenght prefixed buffer.
 */
ProcessWebinosMsg.jsonStr2Buffer = function(jsonString) {
  var strByteLen = Buffer.byteLength(jsonString, 'utf8');
  var buf = new Buffer(4 + strByteLen, 'utf8');
  buf.writeUInt32LE(strByteLen, 0);
  buf.write(jsonString, 4);
  return buf;
};

/**
* Read in JSON objects from buffer and call objectHandler for each parsed
* object.
* @param instance PZH/PZP instance.
* @param buffer Buffer instance containing JSON serialized objects.
* @param objectHandler Callback for parsed object.s
*/
ProcessWebinosMsg.readJson = function(instance, buffer, objectHandler) {
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
      };
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
ProcessWebinosMsg.processedMsg = function(self, msgObj, callback) {
  // BEGIN OF POLITO MODIFICATIONS
  var valError = validation.checkSchema(msgObj);
  if(valError === false) { // validation error is false, so validation is ok
    //logger.info('received recognized packet ' + JSON.stringify(msgObj));
  } else if (valError === true) {
    // for debug purposes, we only print a message about unrecognized packet
    // in the final version we should throw an error
    // Currently there is no a formal list of allowed packages and throw errors
    // would prevent the PZH from working
    logger.log("received unrecognized packet " + JSON.stringify(msgObj));
  } else if (valError === 'failed') {
    logger.error('failed');
  } else {
    logger.error('invalid response ' + valError);
  }
  callback.call(self, msgObj);
};

