(function() {

    var RPCWebinosService = require('webinos-jsonrpc2').RPCWebinosService;
    
    var NfcModule = function(rpcHandler, params) {
      this.rpcHandler = rpcHandler;
      this.params = params;
    };

    NfcModule.prototype.init = function (register, unregister) {
      var service = new NfcService(this.rpcHandler, this.params);
      register(service);
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

    var NfcService = function(rpcHandler, params) {
        // inherit from RPCWebinosService
        this.base = RPCWebinosService;
        this.base({
            api : 'http://webinos.org/api/nfc',
            displayName : 'NFC',
            description : 'Webinos NFC API.'
        });

        this.rpcHandler = rpcHandler;
        this.listeners = {};
        this.handle = 1;

        this.androidNfcModule = null;
        if (process.platform == 'android') {
            this.androidNfcModule = require('bridge').load(
                    'org.webinos.impl.nfc.NfcAnodeModule', this);
        }
        
        this.urlparser = require('url');
    };

    NfcService.prototype = new RPCWebinosService;

    Listener = function(rpcHandler, objectRef) {
        this.rpcHandler = rpcHandler;
        this.objectRef = objectRef;

        this.handleEvent = function(event) {
            //var ndefMsg = event.tech.readCachedNdefMessage();
            var ndefMsg = event.ndefMessage;
            var tagEvent = {};
            tagEvent.ndefMessage = [];
            for ( var i = 0; i < ndefMsg.length; i++) {
                var ndefRecord = {};
                ndefRecord.id = ndefMsg[i].id;
                ndefRecord.TNF = ndefMsg[i].TNF;
                ndefRecord.type = ndefMsg[i].type;
                ndefRecord.info = ndefMsg[i].info;
                ndefRecord.payload = [];
                for ( var j = 0; j < ndefMsg[i].payload.length; j++) {
                    ndefRecord.payload[j] = ndefMsg[i].payload[j];
                }
                tagEvent.ndefMessage[i] = ndefRecord;
            }
            var rpc = this.rpcHandler.createRPC(this.objectRef, 'onEvent',
                    tagEvent);
            this.rpcHandler.executeRPC(rpc);
        }

        this.handleSimulatedEvent = function(event) {
            var tagEvent = {};
            tagEvent.ndefMessage = [];
            tagEvent.ndefMessage[0] = event;
            var rpc = this.rpcHandler.createRPC(this.objectRef, 'onEvent',
                    tagEvent);
            this.rpcHandler.executeRPC(rpc);
        }
    };

    NfcService.prototype.addTextTypeListener = function(params, successCB,
            errorCB, objectRef) {
        if (process.platform == 'android') {
            this.androidNfcModule.addTextTypeListener(new Listener(
                    this.rpcHandler, objectRef), function(err) {errorCB(err)});
        }
        this.listeners[this.handle] = new ListenerWrapper(ListenerType.TEXT, null, new Listener(this.rpcHandler, objectRef));
        successCB(this.handle++);
    };
    
    NfcService.prototype.addUriTypeListener = function(params, successCB,
            errorCB, objectRef) {
        if (process.platform == 'android') {
            this.androidNfcModule.addUriTypeListener(params[0], new Listener(
                    this.rpcHandler, objectRef), function(err) {errorCB(err)});
        }
        this.listeners[this.handle] = new ListenerWrapper(ListenerType.URI, params[0], new Listener(this.rpcHandler, objectRef));
        successCB(this.handle++);
    };
    
    NfcService.prototype.addMimeTypeListener = function(params, successCB,
            errorCB, objectRef) {
        if (process.platform == 'android') {
            this.androidNfcModule.addMimeTypeListener(params[0], new Listener(
                    this.rpcHandler, objectRef), function(err) {errorCB(err)});
        }
        this.listeners[this.handle] = new ListenerWrapper(ListenerType.MIME, params[0], new Listener(this.rpcHandler, objectRef));
        successCB(this.handle++);
    };
    
    NfcService.prototype.removeListener = function(params, successCB, errorCB){
        if (process.platform == 'android') {
            this.androidNfcModule.removeListener(this.listeners[params[0]].listener);
        }
        delete this.listeners[params[0]];
    };

    function mimeTypeMatches(mimeType, matchAgainst) {
        var re = new RegExp(matchAgainst.replace("\\*", "\\.\\*"), "i");
        return mimeType.match(re) != null;
    }

    NfcService.prototype.dispatchEvent = function(params, successCB, errorCB) {
        var event = params[0];
        for (var handle in this.listeners) {
            var element = this.listeners[handle];
            if (element.type == ListenerType.TEXT && event.TNF == 1 && event.type == "T") {
                element.listener.handleSimulatedEvent(event);
            }
            if (element.type == ListenerType.URI && event.TNF == 1 && event.type == "U") {
                var url = this.urlparser.parse(event.info);
                if (url.protocol.substring(0, url.protocol.length-1) == element.extra) {
                    element.listener.handleSimulatedEvent(event);
                }
            }
            if (element.type == ListenerType.MIME && event.TNF == 2) {
                if (mimeTypeMatches(event.type, element.extra)) {
                    element.listener.handleSimulatedEvent(event);
                }
            }
        }
    };

    // export our object
    exports.Module = NfcModule;

})();
