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

var dependency   = require("find-dependencies")(__dirname);
var logger       = dependency.global.require(dependency.global.util.location, "lib/logging.js")(__filename) || console;
var rpc          = dependency.global.require(dependency.global.rpc.location);
var Registry     = dependency.global.require(dependency.global.rpc.location, "lib/registry").Registry;
var Discovery    = dependency.global.require(dependency.global.api.service_discovery.location, "lib/rpc_servicedisco").Service;
var MessageHandler= dependency.global.require(dependency.global.manager.messaging.location, "lib/messagehandler").MessageHandler;
var RPCHandler   = rpc.RPCHandler;
var Sync         = dependency.global.require(dependency.global.manager.synchronisation_manager.location, "index");
var PzpDiscovery = require("./pzp_local");
var Session      = require("./session");
var path = require("path");
var Pzp_OtherManager = function (_parent) {
  // TODO: these variables are directly set by service discovery does not look right
  this.serviceListener;  // For a single callback to be registered via addRemoteServiceListener.
  this.registry;
  this.rpcHandler;
  this.discovery;
  this.messageHandler;
  this.localDiscovery;
  var self = this;
  var sync = new Sync();
  logger.addId(_parent.config.metaData.webinosName);
  /**
   * Any entity connecting to PZP has to register its address with other end point
   */
  function registerMessaging(pzhId) {
    if (_parent.pzp_state.connectedPzh[pzhId] && _parent.pzp_state.mode === _parent.modes[1]) {
      var msg = self.messageHandler.registerSender(_parent.pzp_state.sessionId, pzhId);
      _parent.sendMessage(msg, pzhId);
    }
  }

  function setFoundService(validMsgObj){
    var msg = { from : _parent.pzp_state.sessionId, to: validMsgObj.from, payload: {"status":"foundServices", message:self.discovery.getAllServices(validMsgObj.from)}};
    msg.payload.id = validMsgObj.payload.message.id;
    _parent.sendMessage(msg, validMsgObj.from);
  }

  function getInitModules() {
    return this.loadedModules;
  };

  function syncHash(receivedMsg) {
    var policyPath = path.join(_parent.config.metaData.webinosRoot, "policies","policy.xml");
    var policy = sync.parseXMLFile(policyPath);
    var list = {trustedList: _parent.config.trustedList, _crl: _parent.config.crl, cert: _parent.config.cert.external, policy: policy};
    var result = sync.compareFileHash(list, receivedMsg);
    if (Object.keys(result).length >= 1) {
      _parent.prepMsg(_parent.pzp_state.sessionId, _parent.config.metaData.pzhId, "sync_compare", result);
    }
    else {
      logger.log("All Files are already synchronized");
    }
  }

  function updateHash(receivedMsg){
    var msg;
    for (msg in receivedMsg) {
      if (msg === "trustedList") {
        _parent.config.metaData.trustedList = receivedMsg[msg];
        _parent.config.storeTrustedList(_parent.config.metaData.trustedList);
      }
      else if (msg === "crl") {
        _parent.config.crl = receivedMsg[msg];
        _parent.config.storeCrl(_parent.config.crl);
      }
      else if (msg === "cert") {
        _parent.config.cert.external = receivedMsg[msg];
        _parent.config.storeCertificate(_parent.config.cert.external, "external");
      }
    }
    logger.log("Files Synchronised with the PZH");
  }
  /**
   * Initializes Webinos Other Components that interact with the session manager
   * @param loadModules : webinos modules that should be loaded in the PZP
   */
  this.initializeRPC_Message = function(_loadModules) {
    self.loadedModules  = _loadModules;
    self.registry       = new Registry(this);
    self.rpcHandler     = new RPCHandler(_parent, self.registry); // Handler for remote method calls.
    self.discovery      = new Discovery(self.rpcHandler, [self.registry]);
    self.registry.registerObject(self.discovery);
    self.registry.loadModules(_loadModules, self.rpcHandler); // load specified modules
    self.messageHandler = new MessageHandler(self.rpcHandler); // handler for all things message
    dependency.global.require(dependency.global.manager.policy_manager.location); //initializes the policy manager
    dependency.global.require(dependency.global.manager.context_manager.location);//initializes context manager
  };

  /**
   * Setups message rpc handler, this is tied to sessionId, should be called when sessionId changes
   */
  this.setupMessage_RPCHandler = function() {
    var send = function (message, address, object) {
      "use strict";
      _parent.sendMessage(message, address);
    };
    self.rpcHandler.setSessionId(_parent.pzp_state.sessionId);
    self.messageHandler.setGetOwnId(_parent.pzp_state.sessionId);
    self.messageHandler.setObjectRef(_parent);
    self.messageHandler.setSendMessage(send);
    self.messageHandler.setSeparator("/");
  };

  /**
   * Used by RPC to register and update services to the PZH
   */
  this.registerServicesWithPzh = function() {
    var pzhId = _parent.config.metaData.pzhId;
    if (_parent.pzp_state.connectedPzh[pzhId] && _parent.pzp_state.mode === _parent.modes[1]) {
      var localServices = self.discovery.getRegisteredServices();
      var msg = {"type" : "prop", "from" : _parent.pzp_state.sessionId, "to": pzhId, "payload":{"status":"registerServices",
        "message":{services:localServices, from: _parent.pzp_state.sessionId}}};
      _parent.sendMessage(msg, pzhId);
      logger.log("sent msg to register local services with pzh");
    }
  };

  /**
   * Called when PZP is connected to Hub or in case if error occurs in PZP connecting
   */
  this.startOtherManagers = function(){
    self.setupMessage_RPCHandler();
    registerMessaging(_parent.config.metaData.pzhId);    //message handler
    self.registerServicesWithPzh(); //rpc
    if(!self.localDiscovery ) {// local discovery&& mode !== modes[0]
      self.localDiscovery = new PzpDiscovery(_parent);
      self.localDiscovery.startLocalAdvert();
    }
  };

  /**
   * Add callback to be used when PZH sends message about other remote
   * services being available. This is used by the RPCHandler to receive
   * other found services. A privilege function used by RPC
   * @param callback the listener that gets called.
   */
  this.addRemoteServiceListener = function(callback) {
    self.serviceListener = callback;
  };

  /**
   * Processes message received from the PZP
   * @param msgObj - the buffer array received from other webinos end point
   */
  this.processMsg = function(msgObj) {
    Session.common.processedMsg(_parent, msgObj, function(validMsgObj) {
      logger.log("msg received " + JSON.stringify(validMsgObj));
      if (validMsgObj.type === 'prop') {
        switch(validMsgObj.payload.status) {
          case'foundServices':
            self.serviceListener && self.serviceListener(validMsgObj.payload);
            break;
          case "findServices":
            setFoundService(validMsgObj);
            break;
          case 'listUnregServices':
            _parent.prepMsg(_parent.pzp_state.sessionId, _parent.config.metaData.pzhId, "unregServicesReply", {services: getInitModules.call(self), id:validMsgObj.payload.message.listenerId });
            break;
          case 'registerService':
            self.registry.loadModule({"name": validMsgObj.payload.message.name,"params": validMsgObj.payload.message.params}, self.rpcHandler);
            break;
          case'unregisterService':
            self.registry.unregisterObject({ "id": validMsgObj.payload.message.svId, "api": validMsgObj.payload.message.svAPI});
            break;
          case "sync_hash":
            syncHash(validMsgObj.payload.message);
            break;
          case "update_hash":
            updateHash(validMsgObj.payload.message);
            break;
        }
      } else {
        self.messageHandler.onMessageReceived(validMsgObj, validMsgObj.to);
      }
    });
  }
};

module.exports = Pzp_OtherManager;
