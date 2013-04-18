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

    var ListenerType = {
        TEXT : 0,
        URI : 1,
        MIME : 2
    };

    function ListenerWrapper(type, extra, listener, rpc) {
        this.type = type;
        this.extra = extra;
        this.listener = listener;
        this.rpc = rpc;
    }

    NfcModule = function(obj) {
        this.base = WebinosService;
        this.base(obj);

        this.listeners = {};
        
        this.currentTag = null;
    };

    NfcModule.prototype = new WebinosService;

    NfcModule.prototype.bindService = function(bindCB, serviceId) {
        this.textRecord = textRecord;
        this.uriRecord = uriRecord;
        this.mimeRecord = mimeRecord;
        this.addTextTypeListener = addTextTypeListener;
        this.addUriTypeListener = addUriTypeListener;
        this.addMimeTypeListener = addMimeTypeListener;
        this.removeTextTypeListener = removeTextTypeListener;
        this.removeUriTypeListener = removeUriTypeListener;
        this.removeMimeTypeListener = removeMimeTypeListener;
        this.shareTag = shareTag;
        this.unshareTag = unshareTag;
        this.launchScanningUI = launchScanningUI;
        this.dispatchEvent = dispatchEvent;
        if (typeof bindCB.onBind === 'function') {
            bindCB.onBind(this);
        }
    };

    string2byteArray = function(str) {
        var ba = [];
        for ( var i = 0; i < str.length; i++) {
            ba[i] = str.charCodeAt(i);
        }
        return ba;
    };
    
    NdefRecord = function(id, TNF, type, payload, info) {
      this.id = id;
      this.TNF = TNF;
      this.type = type;
      this.payload = payload;
      this.info = info;
    };
    
    function textRecord(text, lang) {
        var textBytes  = string2byteArray(text);
        var langBytes  = string2byteArray(lang);
        var payload = [];
        
        payload.push(langBytes.length);

        payload = payload.concat(langBytes);
        payload = payload.concat(textBytes);
        
        return new NdefRecord("", 1, "T", payload, text);  
    }

    function uriRecord(uri) {
        var uriBytes  = string2byteArray(uri);
        var payload = [];
        
        payload.push(0);
        
        payload = payload.concat(uriBytes);
        
        return new NdefRecord("", 1, "U", payload, uri);  
    }

    function mimeRecord(mimeType, data) {
        return new NdefRecord("", 2, mimeType, data, data);
    }
    

    function findListener(nfcModule, type, extra, listener) {
        for ( var handle in nfcModule.listeners) {
            var listenerWrapper = nfcModule.listeners[handle];
            if (listenerWrapper.type == type
                    && (extra != null || extra == listenerWrapper.extra)
                    && listenerWrapper.listener == listener) {
                return handle;
            }
        }
        return null;
    }
    

    function addListener(nfcModule, type, extra, listener, success, fail) {
        if (findListener(nfcModule, type, extra, listener) != null) {
            if(typeof fail !== "undefined") {
                fail("listener is already registered");
            }
        } else {
            var rpc;
            if (type == ListenerType.TEXT) {
                rpc = webinos.rpcHandler.createRPC(nfcModule,
                        "addTextTypeListener");
            } else if (type == ListenerType.URI) {
                rpc = webinos.rpcHandler.createRPC(nfcModule,
                        "addUriTypeListener", [ extra ]);
            } else if (type == ListenerType.MIME) {
                rpc = webinos.rpcHandler.createRPC(nfcModule,
                        "addMimeTypeListener", [ extra ]);
            }

            rpc.onEvent = function(tag) {
                
                tag.read = function(success, fail) {
                    if (this != nfcModule.currentTag) {
                        if (typeof fail !== 'undefined') {
                            fail("invalid tag");
                            return;
                        }
                    }
                    var rpc = webinos.rpcHandler.createRPC(nfcModule,
                            "read");
                    webinos.rpcHandler.executeRPC(rpc, function(params) {                       
                        if (typeof success !== 'undefined') {
                            success(params);
                        }
                    }, function(error) {
                        if (typeof fail !== 'undefined') {
                            fail();
                        }
                    });
                }
                
                tag.write = function(ndefmessage, success, fail) {
                    if (this != nfcModule.currentTag) {
                        fail("invalid tag");
                    }
                    var rpc = webinos.rpcHandler.createRPC(nfcModule,
                            "write", [ ndefmessage ]);
                    webinos.rpcHandler.executeRPC(rpc, function(params) {                       
                        if (typeof success !== 'undefined') {
                            success();
                        }
                    }, function(error) {
                        if (typeof fail !== 'undefined') {
                            fail();
                        }
                    });
                }
                
                tag.close = function(fail) {
                    if (this != nfcModule.currentTag) {
                        fail("invalid tag");
                    }
                    var rpc = webinos.rpcHandler.createRPC(nfcModule, "close");
                    webinos.rpcHandler.executeRPC(rpc, null, function(error) {
                        if (typeof fail !== 'undefined') {
                            fail();
                        }
                    });
                }               
                
                nfcModule.currentTag = tag;
                listener(tag);
            };

            webinos.rpcHandler.registerCallbackObject(rpc);

            webinos.rpcHandler.executeRPC(rpc, function(params) {
                nfcModule.listeners[params] = new ListenerWrapper(type, extra,
                        listener, rpc);
                if (typeof success !== 'undefined') {
                    success();
                }
            }, function(error) {
                webinos.rpcHandler.unregisterCallbackObject(rpc);
                if (typeof fail !== 'undefined') {
                    fail();
                }
            });
        }
    }

    function addTextTypeListener(listener, success, fail) {
        addListener(this, ListenerType.TEXT, null, listener, success, fail);
    }

    function addUriTypeListener(scheme, listener, success, fail) {
        addListener(this, ListenerType.URI, scheme, listener, success, fail);
    }

    function addMimeTypeListener(mimeType, listener, success, fail) {
        addListener(this, ListenerType.MIME, mimeType, listener, success, fail);
    }

    function removeListener(nfcModule, type, extra, listener) {
        var handle = findListener(nfcModule, type, extra, listener);
        if (handle != null) {
            var rpc = webinos.rpcHandler.createRPC(nfcModule, "removeListener",
                    [ handle ]);
            webinos.rpcHandler.executeRPC(rpc);
            webinos.rpcHandler.unregisterCallbackObject(nfcModule.listeners[handle].rpc);
            delete nfcModule.listeners[handle];
        }
    }

    function removeTextTypeListener(listener) {
        removeListener(this, ListenerType.TEXT, null, listener);
    }

    function removeUriTypeListener(scheme, listener) {
        removeListener(this, ListenerType.URI, scheme, listener);
    }

    function removeMimeTypeListener(mimeType, listener) {
        removeListener(this, ListenerType.MIME, mimeType, listener);
    }
    

    function shareTag(message, success, fail) {
        var rpc = webinos.rpcHandler.createRPC(this, "shareTag",
                [ message ]);
        webinos.rpcHandler.executeRPC(rpc, function() {
            if (typeof success !== 'undefined') {
                success();
            }
        }, function(err) {
            if (typeof fail !== 'undefined') {
                fail();
            }
        });
    }
    
    function unshareTag(success, fail) {
        var rpc = webinos.rpcHandler.createRPC(this, "unshareTag");
        webinos.rpcHandler.executeRPC(rpc, function() {
            if (typeof success !== 'undefined') {
                success();
            }
        }, function(err) {
            if (typeof fail !== 'undefined') {
                fail();
            }
        });
    }
    
    function launchScanningUI(autoDismiss, success, fail) {
        var rpc = webinos.rpcHandler.createRPC(this, "launchScanningUI",
                [ autoDismiss ]);
        webinos.rpcHandler.executeRPC(rpc, function() {
            if (typeof success !== 'undefined') {
                success();
            }
        }, function(err) {
            if (typeof fail !== 'undefined') {
                fail();
            }
        });
    }

    function dispatchEvent(event) {
        var rpc = webinos.rpcHandler.createRPC(this, "dispatchEvent", [ event ]);
        webinos.rpcHandler.executeRPC(rpc);
    }

}());
