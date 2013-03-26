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

    exports.setRPCHandler = function(rpc) {
        rpc.registerPolicycheck(handleMessage);
    };



/**
 * Handles a new JSON RPC message (as string)
 */
function handleMessage() {
    if (arguments[0].jsonrpc && arguments[0].method) {

        var rpcRequest = arguments[0];
        var id = rpcRequest.id;
        if (typeof id === 'undefined') return;

        var apiFeatureID, apiFeature, apiFeaturesMap = {'ServiceDiscovery':'http://webinos.org/api/discovery'};
        var serviceId = null;

        var idx = rpcRequest.method.lastIndexOf('@');

        if (idx == -1) {
            idx = rpcRequest.method.lastIndexOf('.');
            apiFeatureID = rpcRequest.method.substring(0, idx);
            apiFeature = apiFeaturesMap[apiFeatureID];
        } else {
            apiFeature = rpcRequest.method.substring(0, idx);
            serviceId = rpcRequest.method.substring(idx+1);
            idx = serviceId.indexOf('.');
            serviceId = serviceId.substring(0, idx);
        }

        //If no feature is associated to the request, then allow
        if(apiFeature == null) {
            console.log('Policy manager: no feature found');
            return true;
        }

        var userAndRequestor = arguments[1].split("/");
        var sessionId = arguments[1].replace(/\//g, "_").replace(/@/g, "_");

        var request = {
            'subjectInfo' : { 'userId' : userAndRequestor[0] },
            'deviceInfo'  : { 'requestorId' : userAndRequestor[1] },
            'resourceInfo' : { 'apiFeature': apiFeature, 'serviceId': serviceId }
        };

        //Extract feature parameters (if needed)
        switch(apiFeature) {
            case 'http://webinos.org/api/discovery':
                request.resourceInfo['paramFeature'] = arguments[0]['params'][0]['api'];
                break;
            default:
        }
 
        if (pm.enforceRequest(request, sessionId) == 0) {
            //request is allowed by policy manager
            return true;
        } else {
            //request is NOT allowed by policy manager
            return false;
        }
    }
    //If no feature is specified then allow
    return true;
}

}());
