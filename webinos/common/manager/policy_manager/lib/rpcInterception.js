(function () {
    "use strict";

    var pm = null;

    var getNextID = function(a) {
    // implementation taken from here: https://gist.github.com/982883
    return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,getNextID);
}

_RPCHandler.prototype._handleMessage = _RPCHandler.prototype.handleMessage;

/**
 * Handles a new JSON RPC message (as string)
 */
_RPCHandler.prototype.handleMessage = function(){
    if (arguments[0].jsonrpc) {
        if (!pm) {
            var pmlib = require('./policymanager.js');
            pm = new pmlib.policyManager();
        }

        var rpcRequest = arguments[0];
        var id = rpcRequest.id;
        if (typeof id === 'undefined') return;

        var apiFeatureID, apiFeature, apiFeaturesMap = {'ServiceDiscovery':'http://webinos.org/api/discovery'};

        var idx = rpcRequest.method.lastIndexOf('@');

        if (idx == -1) {
            idx = rpcRequest.method.lastIndexOf('.');
            apiFeatureID = rpcRequest.method.substring(0, idx);
            apiFeature = apiFeaturesMap[apiFeatureID];
        } else {
            apiFeature = rpcRequest.method.substring(0, idx);
        }

        var request = {};
        var requestInfo = {};
        var subjectInfo = {};
        subjectInfo.userId = "userId";
        request.subjectInfo = subjectInfo;

        requestInfo.apiFeature = apiFeature;
        request.resourceInfo = requestInfo;

        if (pm.enforceRequest(request) == 0) {
            //request is allowed by policy manager
            this._handleMessage.apply(this, arguments)
        } else {
            //request is NOT allowed by policy manager
            var rpc = {
                jsonrpc: '2.0',
                id: rpcRequest.id || getNextID(),
                result: "SECURITY_ERROR",
                error: {
                    data: "SECURITY_ERROR",
                    code: -31000,
                    message: 'Method Invocation returned with a security error'
                }
            }
            this.executeRPC(rpc, undefined, undefined, arguments[1], arguments[2]);
        }
    }
}
}());