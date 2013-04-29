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
 * Copyright 2012 - 2013 Samsung Electronics (UK) Ltd
 * Author: Habib Virji (habib.virji@samsung.com)
 *         Ziran Sun (ziran.sun@samsung.com)
 *******************************************************************************/

var Pzp_OtherManager = function (_parent) {
    // TODO: these variables are directly set by service discovery does not look right
    var dependency = require ("find-dependencies") (__dirname);
    var util = dependency.global.require (dependency.global.util.location);
    var logger = util.webinosLogging (__filename) || console;
    var Discovery = dependency.global.require (dependency.global.api.service_discovery.location, "lib/rpc_servicedisco").Service;
    var MessageHandler = dependency.global.require (dependency.global.manager.messaging.location, "lib/messagehandler").MessageHandler;
    var Sync = dependency.global.require (dependency.global.manager.synchronisation_manager.location, "index");
    var modLoader = dependency.global.require (dependency.global.util.location, "lib/loadservice.js");
    var rpc = require ("webinos-jsonrpc2");
    var RPCHandler = rpc.RPCHandler;
    var Registry = rpc.Registry;
    var PzpDiscovery = require ("./pzp_peerDiscovery");
    var PzpSib   = require("./pzp_SIB_auth");
    var path = require ("path");
    var os = require ('os');

    this.serviceListener;  // For a single callback to be registered via addRemoteServiceListener.
    this.registry;
    this.rpcHandler;
    this.discovery;
    this.messageHandler;
    this.peerDiscovery;
    this.Sib = new PzpSib(_parent);;
    var self = this;
    var sync = new Sync ();
    logger.addId (_parent.config.metaData.webinosName);
    /**
     * Any entity connecting to PZP has to register its address with other end point
     */
    function registerMessaging (pzhId) {
        if (_parent.pzp_state.connectedPzh[pzhId] && _parent.pzp_state.enrolled) {
            var msg = self.messageHandler.createRegisterMessage(_parent.pzp_state.sessionId, pzhId);
            _parent.sendMessage (msg, pzhId);
        }
    }

    function syncHash (receivedMsg) {
        var policyPath = path.join (_parent.config.metaData.webinosRoot, "policies", "policy.xml");
        sync.parseXMLFile (policyPath, function (value) {
            var list = {trustedList:_parent.config.trustedList,
                crl                :_parent.config.crl,
                cert               :_parent.config.cert.external,
                exCertList         : _parent.config.exCertList,
                policy             :value};
            var result = sync.compareFileHash (list, receivedMsg);
            if (Object.keys (result).length >= 1) {
                _parent.prepMsg("sync_compare", result);
            }
            else {
                logger.log ("All Files are already synchronized");
            }
        });
    }

    function updateHash (receivedMsg) {
        var msg;
        for (msg in receivedMsg) {
            if (msg === "trustedList") {
                _parent.config.metaData.trustedList = receivedMsg[msg];
                _parent.config.storeDetails(null, "trustedList", _parent.config.trustedList);
            }
            else if (msg === "crl") {
                _parent.config.crl = receivedMsg[msg];
                _parent.config.storeDetails(null, "crl", _parent.config.crl);
            }
            else if (msg === "cert") {
                _parent.config.cert.external = receivedMsg[msg];
                _parent.config.storeDetails(require("path").join("certificates", "external"), "certificates", _parent.config.cert.external);
            }
        }
        logger.log ("Files Synchronised with the PZH");
    }

    function updateServiceCache (validMsgObj, remove) {
        var name, url, list;
        url = require ("url").parse (validMsgObj.payload.message.svAPI);
        if (url.slashes) {
            if (url.host === "webinos.org") {
                name = url.pathname.split ("/")[2];
            } else if (url.host === "www.w3.org") {
                name = url.pathname.split ("/")[3];
            } else {
                name = validMsgObj.payload.message.svAPI;
            }
        }
        for (var i = 0; i < _parent.config.serviceCache.length; i = i + 1) {
            if (_parent.config.serviceCache[i].name === name) {
                if (remove) {
                    _parent.config.serviceCache.splice (i, 1);
                }
                _parent.config.storeDetails("userData", "serviceCache",_parent.config.serviceCache);
                return;
            }
        }

        if (!remove) {
            _parent.config.serviceCache.splice (i, 0, {"name":name, "params":{}});
            _parent.config.storeDetails("userData", "serviceCache",_parent.config.serviceCache);
        }
    }

    function unRegisterService (validMsgObj) {
        self.registry.unregisterObject ({
            "id" :validMsgObj.payload.message.svId,
            "api":validMsgObj.payload.message.svAPI
        });
        updateServiceCache (validMsgObj, true);
    }

    function registerService (validMsgObj) {
        modLoader.loadServiceModule ({
            "name"  :validMsgObj.payload.message.name,
            "params":validMsgObj.payload.message.params
        }, self.registry, self.rpcHandler);
        updateServiceCache (validMsgObj, false);
    }

    function listUnRegServices (validMsgObj) {
        var data = require ("fs").readFileSync ("./webinos_config.json");
        var c = JSON.parse (data.toString ());
        _parent.prepMsg ("unregServicesReply", {
                "services":c.pzpDefaultServices,
                "id"      :validMsgObj.payload.message.listenerId
            });
    }

    function updateDeviceInfo(validMsgObj) {
        var i;
        if (_parent.pzp_state.connectedPzh[validMsgObj.from]) {
            _parent.pzp_state.connectedPzh[validMsgObj.from].friendlyName = validMsgObj.payload.message.friendlyName;
            if (_parent.config.metaData.friendlyName.indexOf(validMsgObj.payload.message.friendlyName) === -1) {
                _parent.config.metaData.friendlyName = validMsgObj.payload.message.friendlyName + "'s " + _parent.config.metaData.friendlyName;
                _parent.config.storeDetails(null, "metaData", _parent.config.metaData);
            }
        } else if (_parent.pzp_state.connectedPzp[validMsgObj.from]) {
            _parent.pzp_state.connectedPzp[validMsgObj.from].friendlyName = validMsgObj.payload.message.friendlyName;
        }
        // These are friendlyName... Just for display purpose
        for (i = 0; i < validMsgObj.payload.message.connectedPzp.length; i = i + 1) {
            if(!_parent.pzp_state.connectedPzp.hasOwnProperty(validMsgObj.payload.message.connectedPzp[i].key) &&
                validMsgObj.payload.message.connectedPzp[i].key !== _parent.pzp_state.sessionId)
            {
                _parent.pzp_state.connectedDevicesToPzh.pzp[validMsgObj.payload.message.connectedPzp[i].key] =
                    validMsgObj.payload.message.connectedPzp[i] && validMsgObj.payload.message.connectedPzp[i].friendlyName;
            }
        }

        for (i = 0; i < validMsgObj.payload.message.connectedPzh.length; i = i + 1) {
            if(!_parent.pzp_state.connectedPzh.hasOwnProperty(validMsgObj.payload.message.connectedPzh[i].key)) {
                _parent.pzp_state.connectedDevicesToPzh.pzh[validMsgObj.payload.message.connectedPzh[i].key]=
                    validMsgObj.payload.message.connectedPzh[i] && validMsgObj.payload.message.connectedPzh[i].friendlyName;
            }
        }
        _parent.pzpWebSocket.connectedApp();
    }

    /**
     * Initializes Webinos Other Components that interact with the session manager
     * @param modules : webinos modules that should be loaded in the PZP
     */
    this.initializeRPC_Message = function () {
        self.registry = new Registry (this);
        self.rpcHandler = new RPCHandler (_parent, self.registry); // Handler for remote method calls.
        self.discovery = new Discovery (self.rpcHandler, [self.registry]);
        self.registry.registerObject (self.discovery);
        modLoader.loadServiceModules (_parent.config.serviceCache, self.registry, self.rpcHandler); // load specified modules
        self.messageHandler = new MessageHandler (self.rpcHandler); // handler for all things message
        // Init the rpc interception of policy manager
        //dependency.global.require (dependency.global.manager.policy_manager.location, "lib/rpcInterception.js").setRPCHandler (self.rpcHandler);
        //dependency.global.require (dependency.global.manager.context_manager.location);//initializes context manager
    };

    /**
     * Setups message rpc handler, this is tied to sessionId, should be called when sessionId changes
     */
    this.setupMessage_RPCHandler = function () {
        var send = function (message, address, object) {
            "use strict";
            _parent.sendMessage (message, address);
        };
        self.rpcHandler.setSessionId (_parent.pzp_state.sessionId);
        self.messageHandler.setOwnSessionId (_parent.pzp_state.sessionId);
        self.messageHandler.setSendMessage (send);
        self.messageHandler.setSeparator ("/");
    };

    /**
     * Used by RPC to register and update services to the PZH
     */
    this.registerServicesWithPzh = function () {
        setTimeout(function(){   // timeout as register services takes time to load
            var pzhId = _parent.config.metaData.pzhId;
            if (_parent.pzp_state.connectedPzh[pzhId] && _parent.pzp_state.enrolled) {
                var localServices = self.discovery.getRegisteredServices ();
                var msg = {"type":"prop",
                    "from"       :_parent.pzp_state.sessionId,
                    "to"         :pzhId,
                    "payload"    :{"status":"registerServices",
                        "message":{services:localServices,
                           "from":_parent.pzp_state.sessionId}}};
                _parent.sendMessage (msg, pzhId);
                logger.log ("sent msg to register local services with pzh");
            }
        }, 6000);
    };

    /**
     * Called when PZP is connected to Hub or in case if error occurs in PZP connecting
     */
    this.startOtherManagers = function () {
        self.setupMessage_RPCHandler ();
        registerMessaging (_parent.config.metaData.pzhId);    //message handler
        self.registerServicesWithPzh (); //rpc
        if (!self.peerDiscovery) {// local discovery&& mode !== modes[0]
            if (os.type ().toLowerCase () == "windows_nt") {
                //Do nothing until WinSockWatcher works
            }
            else {
                self.peerDiscovery = new PzpDiscovery (_parent);
                self.peerDiscovery.advertPzp ('zeroconf', _parent.config.userPref.ports.pzp_zeroConf);
            }
        }
    };

    /**
     * Add callback to be used when PZH sends message about other remote
     * services being available. This is used by the RPCHandler to receive
     * other found services. A privilege function used by RPC
     * @param callback the listener that gets called.
     */
    this.addRemoteServiceListener = function (callback) {
        self.serviceListener = callback;
    };

    /**
     * Processes message received from the PZP
     * @param msgObj - the buffer array received from other webinos end point
     */
    this.processMsg = function (msgObj) {
        util.webinosMsgProcessing.processedMsg (_parent, msgObj, function (validMsgObj) {
            logger.log ("msg received " + JSON.stringify (validMsgObj));
            if (validMsgObj.type === 'prop') {
                switch (validMsgObj.payload.status) {
                    case'foundServices':
                        self.serviceListener && self.serviceListener (validMsgObj.payload);
                        break;
                    case "findServices":
                        setFoundService (validMsgObj);
                        break;
                    case 'listUnregServices':
                        listUnRegServices (validMsgObj);
                        break;
                    case 'registerService':
                        registerService (validMsgObj);
                        break;
                    case'unregisterService':
                        unRegisterService (validMsgObj);
                        break;
                    case "sync_hash":
                        syncHash (validMsgObj.payload.message);
                        break;
                    case "update_hash":
                        updateHash (validMsgObj.payload.message);
                        break;
                    case "update":
                        updateDeviceInfo(validMsgObj);
                        break;
                    case "changeFriendlyName":
                        _parent.changeFriendlyName(validMsgObj.payload.message);
                        break;
                }
            } else {
                self.messageHandler.onMessageReceived (validMsgObj, validMsgObj.to);
            }
        });
    }
};

module.exports = Pzp_OtherManager;
