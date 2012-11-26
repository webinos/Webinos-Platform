(function () {
    "use strict";

    var path = require('path');
    var dependencies= require('find-dependencies')(__dirname);
    var webinosPath = dependencies.local.require(dependencies.local.pzp.location).getWebinosPath();
    var policyFile = path.join(webinosPath,"policies", "policy.xml");

    var pmlib = require('./policymanager.js');
    var pm = new pmlib.policyManager(policyFile);
    //TODO: polic editor for the review - remove it!
    if(__EnablePolicyEditor) {
      var pvlib = require('../viewer/policyviewerserver.js');
      var policyViewer = new pvlib.policyViewer(pm);
    }

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


        var userAndRequestor = arguments[1].split("_")[1].split("/");
	var sessionId = arguments[1].replace(/\//g, "_").replace(/@/g, "_");

        var request = {
            'subjectInfo' : { 'userId' : userAndRequestor[0] },
            'deviceInfo'  : { 'requestorId' : userAndRequestor[1] },
            'resourceInfo' : { 'apiFeature': apiFeature }
        };


        if (pm.enforceRequest(request, sessionId) == 0) {
            //request is allowed by policy manager
            this._handleMessage.apply(this, arguments)
        } else {
            //request is NOT allowed by policy manager
            var rpc = {
                jsonrpc: '2.0',
                id: rpcRequest.id || getNextID(),
//                result: "SECURITY_ERROR",
                error: {
                    data: { name: "SecurityError", code: 18, message: "Access to " + apiFeature + " has been denied."},
                    code: -31000,
                    message: 'Method Invocation returned with error'
                }
            }
            this.executeRPC(rpc, undefined, undefined, arguments[1], arguments[2]);
        }
    }
}
}());
