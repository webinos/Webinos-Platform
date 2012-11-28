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

function getConnectedPzp(_instance){
  var i, pzps = [], list = Object.keys(_instance.config.trustedList.pzp);
  for (i=0; i < list.length; i = i + 1){
    if (_instance.pzh_state.connectedPzp.hasOwnProperty(list[i])){
      pzps.push({id: list[i].split("/")[1], url: list[i], isConnected: true});
    } else {
      pzps.push({id: list[i].split("/")[1], url: list[i], isConnected: false});
    }
  }
  return pzps;
}

function getConnectedPzh(_instance){
  var pzhs = [], myKey, list = Object.keys(_instance.config.trustedList.pzh);
  for (myKey=0; myKey < _instance.config.trustedList.pzh.length; myKey = myKey + 1){
    var id =  _instance.config.trustedList.pzh[myKey]
    var first = id.indexOf("_") +1;
    var last  = id.length
    id = id.slice(parseInt(first), parseInt(last));
    if (_instance.pzh_state.connectedPzh.hasOwnProperty( _instance.config.trustedList.pzh[myKey])){
      pzhs.push({id: id, url: _instance.config.trustedList.pzh[myKey], isConnected: true});
    } else {
      pzhs.push({id: id, url: _instance.config.trustedList.pzh[myKey], isConnected: false});
    }
  }
  pzhs.push({id: _instance.config.userData.email + " (Your Pzh)", url: _instance.config.metaData.serverName, isConnected: true});
  return pzhs;
}

function getRevokedCert(_instance){
  var revokedCert = [], myKey;
  for (myKey in _instance.config.cert.internal.revokedCert){
    if (_instance.config.cert.internal.revokedCert.hasOwnProperty(myKey)){
      revokedCert.push({id: myKey, url: myKey, isConnected: false});
    }
  }
  return revokedCert;
}

var Pzh_Apis = exports;
/**
 *
 * @param _instance
 * @param type
 * @param _callback
 */
Pzh_Apis.fetchLogs = function(_instance, _type, _callback){
  "use strict";
  logger.fetchLog(_type, "Pzh", _instance.config.metaData.friendlyName, function(data) {
    var payload;
    if (_type === "error") {
      payload = {to: _instance.pzh_state.sessionId, cmd:"crashLog", payload:data};
    } else {
      payload = {to: _instance.pzh_state.sessionId, cmd:"infoLog", payload:data};
    }
    _callback(payload);
  });
};

/**
 * Sets PZH URL id for storing information about QRCode
 * @param {function} cb: Callback to return result
 */
Pzh_Apis.getMyUrl = function(_instance, _callback) {
  "use strict";
  if(_callback) { _callback(_instance.pzh_state.sessionId);}
};
/**
 *
 * @param _instance
 * @param _callback
 */
Pzh_Apis.listZoneDevices = function(_instance, _callback) {
  "use strict";
  var result = {pzps: [], pzhs: []}, pzhId = _instance.pzh_state.sessionId;
  result.pzps = getConnectedPzp(_instance);
  result.pzhs = getConnectedPzh(_instance);
  if(_callback) { _callback({to: pzhId, cmd:"listDevices", payload:result});}
};
/**
 *
 * @param _instance
 * @param _callback
 */
Pzh_Apis.listPzp = function(_instance, _callback) {
  "use strict";
  var result = {signedCert: [], revokedCert: []}, myKey;
  result.signedCert  = getConnectedPzp(_instance);
  result.revokedCert = getRevokedCert(_instance);
  _callback({to: _instance.pzh_state.sessionId, cmd:"listPzp", payload:result});
};

/**
 *
 * @param _instance
 * @param _callback
 */
Pzh_Apis.fetchUserData = function(_instance, _callback) {
  "use strict";
  if(_callback) {
    var userDetails = _instance.config.userData;
    _callback( {to: _instance.pzh_state.sessionId, cmd: "userDetails", payload: {email: userDetails.email, country: userDetails.country, image: userDetails.image, name: userDetails.name, servername: _instance.pzh_state.sessionId}});
  }
};

/**
 *
 * @param _instance
 * @param _callback
 */
Pzh_Apis.listAllServices = function(_instance, _callback) {
  "use strict";
  var result = { pzEntityList: [] }, connectedPzp = getConnectedPzp(_instance), key;
  result.pzEntityList.push({pzId:_instance.pzh_state.sessionId});
  for (key = 0; key < connectedPzp.length; key = key + 1) {
    result.pzEntityList.push({pzId:connectedPzp[key].url});
  }
  result.services = _instance.pzh_otherManager.discovery.getAllServices();
  var payload = {to: _instance.pzh_state.sessionId, cmd:"listAllServices", payload:result};
  if (_callback) {_callback(payload);}
};
/**
 *
 * @param _instance
 * @param at
 * @param _callback
 */
Pzh_Apis.listUnregServices = function(_instance, _at, _callback) {
  "use strict";
  function runCallback(pzEntityId, modules) {
    var result = {
      "pzEntityId": pzEntityId,
      "modules"   : modules
    };
    if(_callback) {_callback({to: _instance.pzh_state.sessionId, cmd:"listUnregServices", payload:result});}
  }

  if (_instance.pzh_state.sessionId !== _at) {
    var id = _instance.pzh_otherManager.addMsgListener(function(modules) {
      runCallback(_at, modules.services);
    });
    var msg =  {"type"  : "prop", "from" : _instance.pzh_state.sessionId, "to"   : _at,
      "payload" : {"status" : "listUnregServices", "message" : {listenerId:id}}};
    _instance.sendMessage(msg, _at);
  } else {
    runCallback(_instance.pzh_state.sessionId, _instance.pzh_otherManager.getInitModules());
  }
};
/**
 *
 * @param _instance
 * @param at
 * @param name
 * @param _callback
 */
Pzh_Apis.registerService = function(_instance, _at, _name, _callback) {
  "use strict";
  if (_instance.pzh_state.sessionId !== _at) {
    var msg =  {"type"  : "prop", "from" : _instance.pzh_state.sessionId, "to"   : _at,
      "payload" : {"status" : "registerService", "message" :  {name:_name, params:{}}}};
    _instance.sendMessage(msg, _at);
  } else {
    _instance.pzh_otherManager.registry.loadModule({"name":_name, "params":{}}, _instance.rpcHandler);
  }
};
/**
 *
 * @param _instance
 * @param at
 * @param svId
 * @param svAPI
 * @param _callback
 */
Pzh_Apis.unregisterService = function(_instance, _at, _svId, _svAPI, _callback) {
  "use strict";
  if (_instance.pzh_state.sessionId !== _at) {
    var msg =  {"type"  : "prop", "from" : _instance.pzh_state.sessionId, "to"   : _at,
      "payload" : {"status" : "unregisterService", "message" : {svId: _svId, svAPI: _svAPI}}};
    _instance.sendMessage(msg, _at);
  } else {
    _instance.pzh_otherManager.registry.unregisterObject({"id": _svId, "api": _svAPI});
  }
};
