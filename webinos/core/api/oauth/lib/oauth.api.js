(function() {

var OAuth= require('oauth').OAuth;
var RPCWebinosService = require('webinos-jsonrpc2').RPCWebinosService;

/**
 * Webinos Service constructor.
 * @param rpcHandler A handler for functions that use RPC to deliver their result.  
 */
var oAuthModule = function(rpcHandler, params) {
	// inherit from RPCWebinosService
	this.base = RPCWebinosService;
	this.base({
		api:'http://webinos.org/mwc/oauth',
		displayName:'oAuth',
		description:'oAuth Module to make oAuth requests.'
	});
}

oAuthModule.prototype = new RPCWebinosService;

oAuthModule.prototype.init = function(params, successCB, errorCB){
	var requestTokenUrl = params[0]; 
	var consumer_key = params[1]; 
	var consumer_secret= params[2]; 
	var callbackUrl = params[3]; //TODO: investigate if this is wrong
	try{
		this.service = new OAuth(requestTokenUrl,
                 requestTokenUrl, 
                 consumer_key, consumer_secret, 
                 "1.0A", callbackUrl, "HMAC-SHA1");
	} catch(err){
		if (errorCB) errorCB();
		return;
	}
	if (successCB) successCB();
	// Twitter params should be the following
	//"https://twitter.com/oauth/request_token",
                 // "https://twitter.com/oauth/access_token", 
                 // consumer_key, consumer_secret, 
                 // "1.0A", "http://127.0.0.1:8888/", "HMAC-SHA1"
}

oAuthModule.prototype.get = function(params, successCB, errorCB){
	console.log("oAuth get was invoked");
	
	var requestUrl = params[0];
	var access_token = params[1];
	var access_token_secret = params[2];
	console.log(requestUrl);
	this.service.get(requestUrl, access_token, access_token_secret, function(error, data) {
		if (error){
			if (errorCB) errorCB(error.statusCode);
		}else{
			if (successCB) successCB(data);
		}
	});
}

oAuthModule.prototype.post = function(params, successCB, errorCB){
	console.log("oAuth post was invoked");
	
	var requestUrl = params[0];
	var access_token = params[1];
	var access_token_secret = params[2];
	var post_body= params[3];
	var post_content_type = params[4];
	console.log(requestUrl);
	this.service.post(requestUrl, access_token, access_token_secret, post_body, post_content_type, function(error, data) {
		if (error){
			if (errorCB) errorCB(error.statusCode);
		}else{
			if (successCB) successCB(data);
		}
	});
}

// export our object
exports.Service = oAuthModule;

})();