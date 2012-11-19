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
var rpc            = dependency.global.require(dependency.global.rpc.location);
var Registry       = dependency.global.require(dependency.global.rpc.location, "lib/registry").Registry;
var Discovery      = dependency.global.require(dependency.global.api.service_discovery.location, "lib/rpc_servicedisco").Service;
var RPCHandler     = rpc.RPCHandler;
var Sync           = dependency.global.require(dependency.global.manager.synchronisation_manager.location, "index");

var Pzh_RPC = function(_parent) {
  this.messageHandler;
  this.listenerMap= {}; // holds listeners/callbacks, mostly for pzh internal api
  this.discovery;
  this.registry;
  this.rpcHandler;
  this.modules;         // holds startup modules
  var self = this;

  /**
   * Initialize RPC to enable discovery and rpcHandler
   */
  this.initializeRPC = function(){
    self.registry     = new Registry();
    self.rpcHandler   = new RPCHandler(undefined, self.registry); // Handler for remote method calls.
    self.discovery    = new Discovery(self.rpcHandler, [self.registry]);
    self.registry.registerObject(self.discovery);
    self.registry.loadModules(_parent.config.serviceCache, self.rpcHandler); // load specified modules
    self.rpcHandler.setSessionId(_parent.pzh_state.sessionId);
  };

  /**
   * Send services to other connected pzh
   * @param validMsgObj
   */
  this.sendFoundServices = function(validMsgObj){
    logger.log("trying to send webinos services from this RPC handler to " + validMsgObj.from + "...");
    var services = self.discovery.getAllServices(validMsgObj.from);
    var msg = _parent.prepMsg(_parent.pzh_state.sessionId, validMsgObj.from, "foundServices", services);
    msg.payload.id = validMsgObj.payload.message.id;
    _parent.sendMessage(msg, validMsgObj.from);
    logger.log("sent " + (services && services.length) || 0 + " Webinos Services from this rpc handler.");
  };

  /**
   * Unregister services
   * @param validMsgObj
   */
  this.unregisterServices = function(validMsgObj) {
    logger.log("receiving initial modules from pzp...");
    if (!validMsgObj.payload.id) {
      logger.error("cannot find callback");
      return;
    }
    self.listenerMap[validMsgObj.payload.id](validMsgObj.payload.message);
    delete self.listenerMap[validMsgObj.payload.id];
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

    logger.log("sent " + (localServices && localServices.length) || 0 + " webinos services to " + pzhId);
  };

  this.getInitModules = function() {
    return serviceCache;
  };

  this.addMsgListener = function (callback) {
    var id = (parseInt((1 + Math.random()) * 0x10000)).toString(16).substr(1);
    this.listenerMap[id] = callback;
    return id;
  };

  this.syncStart = function(_pzpId) {
    Sync.getFileHash(_parent.config.metaData.webinosRoot, _parent.config.metaData.webinosName, function(result) {
      var msg = _parent.prepMsg(_parent.pzh_state.sessionId, _pzpId, "sync_hash", result);
      _parent.sendMessage(msg, _pzpId)
    });
  };

  this.syncUpdateHash = function(_pzpId, rcvdMsg) {
    Sync.syncFileMissing(_parent.config.metaData.webinosRoot, _parent.config.metaData.webinosName, rcvdMsg, function(result) {
      var msg = _parent.prepMsg(_parent.pzh_state.sessionId, _pzpId, "update_hash", result);
      _parent.sendMessage(msg, _pzpId)
    });
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
            self.unregisterServices(validMsgObj);
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