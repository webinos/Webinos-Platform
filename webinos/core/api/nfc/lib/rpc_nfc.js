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
 * Copyright 2013 Sony Mobile Communications
 * 
 ******************************************************************************/

(function() {

    var RPCWebinosService = require('webinos-jsonrpc2').RPCWebinosService;
    
    var NfcModule = function(rpcHandler, params) {
      this.rpcHandler = rpcHandler;
      this.params = params;
    };

    NfcModule.prototype.init = function(register, unregister) {

        if (process.platform == 'android') {
            var androidNfcModule = require('bridge').load(
                    'org.webinos.impl.nfc.NfcAnodeModule', this);
            if (androidNfcModule != null) {
                var service = new NfcService(this.rpcHandler, this.params,
                        androidNfcModule);
                register(service);
            }
        } else {
            var service = new NfcService(this.rpcHandler, this.params, null);
            register(service);
        }
    };
    
    var ListenerType = {
        TEXT : 0,
        URI : 1,
        MIME : 2
    };

    function ListenerWrapper(type, extra, listener) {
        this.type = type;
        this.extra = extra;
        this.listener = listener;
    }
    
    var listProps = function(obj) {
        var ret = [];
        for ( var prop in obj) {
            ret.push(prop);
        }
        return ret;
    };

    var NfcService = function(rpcHandler, params, androidNfcModule) {
        // inherit from RPCWebinosService
        this.base = RPCWebinosService;
        this.base({
            api : 'http://webinos.org/api/nfc',
            displayName : 'NFC',
            description : 'Webinos NFC API.'
        });

        this.rpcHandler = rpcHandler;
        
        this.listeners = {};
        this.listenerHandle = 1;
        
        this.currentTag = null;
        
        this.androidNfcModule = androidNfcModule;
        
        this.moduleListener = new NfcModuleListener(this);
        if (process.platform == 'android') {
            this.androidNfcModule.setListener(this.moduleListener);
        }
    };

    NfcService.prototype = new RPCWebinosService;

    function mimeTypeMatches(mimeType, matchAgainst) {
        var re = new RegExp(matchAgainst.replace("\\*", "\\.\\*"), "i");
        return mimeType.match(re) != null;
    }
    
    NfcModuleListener = function(service) {
        this.service = service;
        
        this.handleEvent = function(tag) {
            service.currentTag = tag;
            var urlparser = require('url');
            var ndefMsg = tag.tech.readCachedNdefMessage();
            var tagEvent = {};
            tagEvent.tech = tag.tech.getType();
            tagEvent.ndefMessage = ndefMsg;
            var listenersToTrigger = [];
            for (var i = 0; i < tagEvent.ndefMessage.length; i++) {
                var ndefRecord = tagEvent.ndefMessage[i];
                var payload = [];
                for ( var j = 0; j < ndefRecord.payload.length; j++) {
                    payload[j] = ndefRecord.payload[j];
                }
                ndefRecord.payload = payload;         
                var j = 0;
                for (var listenerHandle in this.service.listeners) {
                    var listenerWrapper = this.service.listeners[listenerHandle];
                    if (listenerWrapper.type == ListenerType.TEXT && ndefRecord.TNF == 1 && ndefRecord.type == "T") {
                        listenersToTrigger[j++] = listenerWrapper.listener;
                    }
                    if (listenerWrapper.type == ListenerType.URI && ndefRecord.TNF == 1 && ndefRecord.type == "U") {
                        var url = urlparser.parse(ndefRecord.info);
                        if (url.protocol.substring(0, url.protocol.length-1) == listenerWrapper.extra) {
                            listenersToTrigger[j++] = listenerWrapper.listener;
                        }
                    }
                    if (listenerWrapper.type == ListenerType.MIME && ndefRecord.TNF == 2) {
                        if (mimeTypeMatches(ndefRecord.type, listenerWrapper.extra)) {
                            listenersToTrigger[j++] = listenerWrapper.listener;
                        }
                    }
                }
            }
            for (var i = 0; i < listenersToTrigger.length; i++) {
                listenersToTrigger[i].handleEvent(tagEvent);
            }
        }
    }
    
    Listener = function(rpcHandler, objectRef) {
        this.rpcHandler = rpcHandler;
        this.objectRef = objectRef;

        this.handleEvent = function(event) {
            var rpc = this.rpcHandler.createRPC(this.objectRef, 'onEvent',
                    event);
            this.rpcHandler.executeRPC(rpc);
        }
    };

    NfcService.prototype.addTextTypeListener = function(params, successCB,
            errorCB, objectRef) {
        if (process.platform == 'android') {
            try {
                this.androidNfcModule.addTextTypeFilter();
            } catch (err) {
                errorCB(err);
                return;
            }
        }
        this.listeners[this.listenerHandle] = new ListenerWrapper(ListenerType.TEXT, null, new Listener(this.rpcHandler, objectRef));
        successCB(this.listenerHandle++);
    };
    
    NfcService.prototype.addUriTypeListener = function(params, successCB,
            errorCB, objectRef) {
        if (process.platform == 'android') {
            try {
                this.androidNfcModule.addUriTypeFilter(params[0]);
            } catch (err) {
                errorCB(err);
                return;
            }
        }
        this.listeners[this.listenerHandle] = new ListenerWrapper(ListenerType.URI, params[0], new Listener(this.rpcHandler, objectRef));
        successCB(this.listenerHandle++);
    };
    
    NfcService.prototype.addMimeTypeListener = function(params, successCB,
            errorCB, objectRef) {
        if (process.platform == 'android') {
            try {
                this.androidNfcModule.addMimeTypeFilter(params[0]);
            } catch (err) {
                errorCB(err); 
            }
        }
        this.listeners[this.listenerHandle] = new ListenerWrapper(ListenerType.MIME, params[0], new Listener(this.rpcHandler, objectRef));
        successCB(this.listenerHandle++);
    };
    
    NfcService.prototype.removeListener = function(params, successCB, errorCB) {
        var listenerWrapper = this.listeners[params[0]];
        if (listenerWrapper != null) {
            if (process.platform == 'android') {
                if (listenerWrapper.type == ListenerType.TEXT) {
                    this.androidNfcModule.removeTextTypeFilter();
                } else if (listenerWrapper.type == ListenerType.URI) {
                    this.androidNfcModule.removeUriTypeFilter(listenerWrapper.extra);
                } else if (listenerWrapper.type == ListenerType.MIME) {
                    this.androidNfcModule.removeMimeTypeFilter(listenerWrapper.extra);
                }
            }
            delete listenerWrapper;
        }
    };
    

    NfcService.prototype.read = function(params, successCB, errorCB) {
        this.currentTag.tech.readNdefMessage(function(ndefMsg) {
            for ( var i = 0; i < ndefMsg.length; i++) {
                var payload = [];
                for ( var j = 0; j < ndefMsg[i].payload.length; j++) {
                    payload[j] = ndefMsg[i].payload[j];
                }
                ndefMsg[i].payload = payload;
            }
            successCB(ndefMsg);
        }, function(err) {
            errorCB(err);
        });
    };
    

    NfcService.prototype.write = function(params, successCB, errorCB) {
        this.currentTag.tech.writeNdefMessage(params[0], function() {
            successCB();
        }, function(err) {
            errorCB(err);
        });
    };

    NfcService.prototype.close = function(params, successCB, errorCB) {
        try {
            this.currentTag.tech.close();
        } catch (err) {
            errorCB(err); 
        }
    };
    

    NfcService.prototype.shareTag = function(params, successCB, errorCB) {
        if (process.platform == 'android') {
            try {
                this.androidNfcModule.shareTag(params[0]);
            } catch (err) {
                errorCB(err); 
            }
        }
    };
    
    NfcService.prototype.unshareTag = function(params, successCB, errorCB) {
        if (process.platform == 'android') {
            try {
                this.androidNfcModule.unshareTag();
            } catch (err) {
                errorCB(err); 
            }
        }
    };
    
    NfcService.prototype.launchScanningUI = function(params, successCB,
            errorCB, objectRef) {
        if (process.platform == 'android') {
            try {
                this.androidNfcModule.launchScanningActivity(params[0]);
            } catch (err) {
                errorCB(err); 
            }
        }
        successCB();
    };
    
    SimulatedNdefTech = function(ndefMsg) {
        this.ndefMessage = ndefMsg;
        
        this.getType = function() {
            return "NDEF";
        }
        
        this.readCachedNdefMessage = function() {
           return this.ndefMessage;
        }
        
        this.readNdefMessage = function(readCB, errorCB) {
            readCB(this.ndefMessage);
        }
        
        this.writeNdefMessage = function(ndefMessage, successCB, errorCB) {
            this.ndefMessage = ndefMessage;
            successCB();
        }
        
        this.close = function(errorCB) {
            
        }
    }

    NfcService.prototype.dispatchEvent = function(params, successCB, errorCB) {
        var event = {};
        event.tech = new SimulatedNdefTech(params[0]);
        this.moduleListener.handleEvent(event);
    };

    // export our object
    exports.Module = NfcModule;

})();
