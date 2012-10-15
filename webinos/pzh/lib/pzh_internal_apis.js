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

var webinos = require('find-dependencies')(__dirname);
var logger  = webinos.global.require(webinos.global.util.location, "lib/logging.js")(__filename);

var Pzh_Apis = exports;
/**
 *
 * @param instance
 * @param type
 * @param callback
 */
Pzh_Apis.fetchLogs = function(instance, type, callback){
  "use strict";
  logger.fetchLog(type, "Pzh", instance.getFriendlyName(), function(data) {
    var payload;
    if (type === "error") {
      payload = {to: instance.getSessionId(), cmd:"crashLog", payload:data};
    } else {
      payload = {to: instance.getSessionId(), cmd:"infoLog", payload:data};
    }
    callback(payload);
  });
};

/**
 * Sets PZH URL id for storing information about QRCode
 * @param {function} cb: Callback to return result
 */
Pzh_Apis.getMyUrl = function(instance, callback) {
  "use strict";
  if(callback) { callback(instance.getSessionId());}
};
/**
 *
 * @param instance
 * @param callback
 */
Pzh_Apis.listZoneDevices = function(instance, callback) {
  "use strict";
  var result = {pzps: [], pzhs: []}, pzhId = instance.getSessionId();
  result.pzps = instance.getConnectedPzp();
  result.pzhs = instance.getConnectedPzh();
  if(callback) { callback({to: pzhId, cmd:"listDevices", payload:result});}
};
/**
 *
 * @param instance
 * @param callback
 */
Pzh_Apis.listPzp = function(instance, callback) {
  "use strict";
  var result = {signedCert: [], revokedCert: []}, myKey;
  result.signedCert  = instance.getConnectedPzp();
  result.revokedCert = instance.getRevokedCert();
  callback({to: instance.getSessionId(), cmd:"listPzp", payload:result});
};

/**
 *
 * @param instance
 * @param callback
 */
Pzh_Apis.fetchUserData = function(instance, callback) {
  "use strict";
  if(callback) {
    var userDetails = instance.getUserDetails();
    callback( {to: instance.getSessionId(), cmd: "userDetails", payload: {email: userDetails.email, country: userDetails.country, image: userDetails.image, name: userDetails.name, servername: instance.getSessionId()}});
  }
};

/**
 *
 * @param instance
 * @param callback
 */
Pzh_Apis.listAllServices = function(instance, callback) {
  "use strict";
  var result = { pzEntityList: [] }, connectedPzp = instance.getConnectedPzp(), key;
  result.pzEntityList.push({pzId:instance.getSessionId()});
  for (key = 0; key <  connectedPzp.length; key = key + 1) {
    result.pzEntityList.push({pzId:connectedPzp[key]});
  }
  result.services = instance.discovery.getAllServices();
  var payload = {to: instance.getSessionId(), cmd:"listAllServices", payload:result};
  if (callback) {callback(payload);}
};
/**
 *
 * @param instance
 * @param at
 * @param callback
 */
Pzh_Apis.listUnregServices = function(instance, at, callback) {
  "use strict";
  function runCallback(pzEntityId, modules) {
    var result = {
      "pzEntityId": pzEntityId,
      "modules"   : modules
    };
    if(callback) {callback({to: instance.getSessionId(), cmd:"listUnregServices", payload:result});}
  }

  if (instance.getSessionId() !== at) {
    var id = instance.addMsgListener(function(modules) {
      runCallback(at, modules);
    });
    var msg =  {"type"  : "prop", "from" : instance.getSessionId(), "to"   : at,
      "payload" : {"status" : "listUnregServices", "message" : {listenerId:id}}};
    instance.sendMessage(msg, at);
  } else {
    runCallback(instance.getSessionId(), instance.getInitModules());
  }
};
/**
 *
 * @param instance
 * @param at
 * @param name
 * @param callback
 */
Pzh_Apis.registerService = function(instance, at, name, callback) {
  "use strict";
  if (instance.getSessionId() !== at) {
    var msg =  {"type"  : "prop", "from" : instance.getSessionId(), "to"   : at,
      "payload" : {"status" : "registerService", "message" :  {name:name, params:{}}}};
    instance.sendMessage(msg, at);
  } else {
    instance.registry.loadModule({"name":name, "params":{}}, instance.rpcHandler);
  }
};
/**
 *
 * @param instance
 * @param at
 * @param svId
 * @param svAPI
 * @param callback
 */
Pzh_Apis.unregisterService = function(instance, at, svId, svAPI, callback) {
  "use strict";
  if (instance.sessionId !== at) {
    var msg =  {"type"  : "prop", "from" : instance.getSessionId(), "to"   : at,
      "payload" : {"status" : "unregisterService", "message" : {svId:svId, svAPI:svAPI}}};
    instance.sendMessage(msg, at);
  } else {
    instance.registry.unregisterObject({"id":svId, "api":svAPI});
  }
};
