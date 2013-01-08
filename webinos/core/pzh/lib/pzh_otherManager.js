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

var dependency     = require("find-dependencies")(__dirname);
var logger         = dependency.global.require(dependency.global.util.location, "lib/logging.js")(__filename) || console;
var session        = dependency.global.require(dependency.global.pzp.location, "lib/session.js");
var MessageHandler = dependency.global.require(dependency.global.manager.messaging.location, "lib/messagehandler").MessageHandler;
var Discovery      = dependency.global.require(dependency.global.api.service_discovery.location, "lib/rpc_servicedisco").Service;
var Sync           = dependency.global.require(dependency.global.manager.synchronisation_manager.location, "index");
var loadModules    = dependency.global.require(dependency.global.util.location, "lib/loadservice.js").loadServiceModules;
var rpc            = require("webinos-jsonrpc2");
var RPCHandler     = rpc.RPCHandler;
var Registry       = rpc.Registry;
var path = require("path");

var Pzh_RPC = function(_parent) {
  this.messageHandler;
  this.listenerMap= {}; // holds listeners/callbacks, mostly for pzh internal api
  this.discovery;
  this.registry;
  this.rpcHandler;
  this.modules;         // holds startup modules
  var self = this;
  var sync = new Sync();
  /**
  * Initialize RPC to enable discovery and rpcHandler
  */
  this.initializeRPC = function(){
    self.registry     = new Registry();
    self.rpcHandler   = new RPCHandler(undefined, self.registry); // Handler for remote method calls.
    self.rpcHandler.setSessionId(_parent.pzh_state.sessionId);
    self.discovery    = new Discovery(self.rpcHandler, [self.registry]);
    self.registry.registerObject(self.discovery);
    loadModules(_parent.config.serviceCache, self.registry, self.rpcHandler); // load specified modules
  };

  /**
   * Send services to other connected pzh
   * @param validMsgObj
   */
  this.sendFoundServices = function(validMsgObj){
    _parent.pzh_state.logger.log("trying to send webinos services from this RPC handler to " + validMsgObj.from + "...");
    var services = self.discovery.getAllServices(validMsgObj.from);
    var msg = _parent.prepMsg(_parent.pzh_state.sessionId, validMsgObj.from, "foundServices", services);
    msg.payload.id = validMsgObj.payload.message.id;
    _parent.sendMessage(msg, validMsgObj.from);
    _parent.pzh_state.logger.log("sent " + (services && services.length) || 0 + " Webinos Services from this rpc handler.");
  };

  /**
   * Unregister services
   * @param validMsgObj
   */
  this.unregisteredServices = function(validMsgObj) {
    _parent.pzh_state.logger.log("receiving initial modules from pzp...");
    if (!validMsgObj.payload.message.id) {
      _parent.pzh_state.logger.error("cannot find callback");
      return;
    }
    self.listenerMap[validMsgObj.payload.message.id](validMsgObj.payload.message);
    delete self.listenerMap[validMsgObj.payload.message.id];
  };

  /**
   *
   */
  this.setMessageHandler_RPC = function() {
    self.initializeRPC();
    self.messageHandler = new MessageHandler(self.rpcHandler);// handler of all things message
    var messageHandlerSend = function (message, address, object) {
      "use strict";
      _parent.sendMessage(message, address);
    };
    // Setting message handler to work with pzh instance
    self.messageHandler.setGetOwnId(_parent.pzh_state.sessionId);
    self.messageHandler.setObjectRef(_parent);
    self.messageHandler.setSendMessage(messageHandlerSend);
    self.messageHandler.setSeparator("/");
  };

  this.registerServices = function(pzhId){
    var localServices = self.discovery.getAllServices();
    var msg = {"type"  : "prop", "from" : _parent.pzh_state.sessionId, "to" : pzhId, "payload" : {"status" : "registerServices", "message" :  {services:localServices, from:_parent.pzh_state.sessionId}}};
    parent.sendMessage(msg, pzhId);

    _parent.pzh_state.logger.log("sent " + (localServices && localServices.length) || 0 + " webinos services to " + pzhId);
  };

  this.getInitModules = function() {
    return _parent.config.serviceCache;
  };

  this.addMsgListener = function (callback) {
    var id = (parseInt((1 + Math.random()) * 0x10000)).toString(16).substr(1);
    this.listenerMap[id] = callback;
    return id;
  };

  this.syncStart = function(_pzpId) {
    var policy, policyPath, list, result, myKey, msg;
    policyPath= path.join(_parent.config.metaData.webinosRoot, "policies","policy.xml");
    policy = sync.parseXMLFile(policyPath);
    list = {trustedList: _parent.config.trustedList, _crl: _parent.config.crl, cert: _parent.config.cert.external, policy: policy};
    result = sync.getFileHash(list);

    for (myKey in _parent.pzh_state.connectedPzp) {
      if (_parent.pzh_state.connectedPzp.hasOwnProperty(myKey)) { // Sync with everyone.
        msg = _parent.prepMsg(_parent.pzh_state.sessionId, myKey, "sync_hash", result);
        _parent.sendMessage(msg, myKey);
      }
    }
  };

  this.syncUpdateHash = function(_pzpId, rcvdMsg) {
    var result = sync.syncFileMissing(rcvdMsg);
    if (Object.keys(result).length >= 1) {
      if (result["trustedList"])  {
        _parent.config.metaData.trustedList = result["trustedList"];
        _parent.config.storeTrustedList(_parent.config.metaData.trustedList);
      }
      if (result["crl"]) {
        _parent.config.crl = receivedMsg[msg];
        _parent.config.storeCrl(_parent.config.crl);
      }
      if (result["cert"]) {
        _parent.config.cert.external = receivedMsg[msg];
        _parent.config.storeCertificate(_parent.config.cert.external, "external");
      }
      var msg = _parent.prepMsg(_parent.pzh_state.sessionId, _pzpId, "update_hash", result);
      _parent.sendMessage(msg, _pzpId);
    }
    else {
      logger.log("Nothing to synchronize with the PZP " + _pzpId)
    }


  };

  /**
   * Process incoming messages, message of type prop are only received while session is established. Rest of the time it
   * is usually RPC messages
   * @param {Object} conn - It is used in special scenarios, when PZP is not connected and we need to send response back
   * @param {Object} msgObj - A message object received from other PZH or PZP.
   */
  this.processMsg = function(msgObj) {
    session.common.processedMsg(this, msgObj, function(validMsgObj) {
      _parent.pzh_state.logger.log("received message" + JSON.stringify(validMsgObj));
      if(validMsgObj.type === "prop") {
        switch(validMsgObj.payload.status) {
          case "registerServices":
            self.discovery.addRemoteServiceObjects(validMsgObj.payload.message);
            break;
          case "findServices":
            self.sendFoundServices(validMsgObj);
            break;
          case "unregServicesReply":
            self.unregisteredServices(validMsgObj);
            break;
          case "sync_compare":
            self.syncUpdateHash(validMsgObj.from, validMsgObj.payload.message);
            break;
        }
      } else {
        try {
          self.messageHandler.onMessageReceived(validMsgObj, validMsgObj.to);
        } catch (err2) {
          _parent.pzh_state.logger.error("error message sending to messaging " + err2.message);
        }
      }
    });
  }
};

module.exports = Pzh_RPC;
