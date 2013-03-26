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
* Copyright 2012 Krishna Bangalore, TU München
******************************************************************************/
(function() {
var RPCWebinosService = require("webinos-jsonrpc2").RPCWebinosService;
var exec = require('child_process').exec;

var dependencies = require("find-dependencies")(__dirname)	
var pzp = dependencies.global.require(dependencies.global.pzp.location,
    "lib/pzp.js")
	
/**
 * ...
 * 
 * ...
 * @constructor
 * @param rpcHandler A handler for functions that use RPC to deliver their result.
 * @param params Parameters to initialize the service.
 */
var corePZinformationModule = function(rpcHandler, params) {
	// inherit from RPCWebinosService
	this.base = RPCWebinosService;
	this.base({
		api:'http://webinos.org/api/corePZinformation',
		displayName:'corePZinformationModule',
		description:'corePZinformation API'
	});
	
}

corePZinformationModule.prototype = new RPCWebinosService;

/**
 * ...
 * @param params Array with parameters.
 * @param successCB Success callback.
 * @param errorCB Error callback.
 * @param objectRef RPC object reference.
 */
 
//corePZinformation has been Implemented on the Client Side API in core,wrt,lib,webinos.corePZinformation.js
/*PZP Name*/ 
corePZinformationModule.prototype.pzpname = function(params, successCB, errorCB){
	
        console.log("pzpname was invoked");
	
}
  
/*PZP State*/ 
corePZinformationModule.prototype.pzpstate = function(params, successCB, errorCB){
	
        console.log("pzpstate was invoked");
    
}

/*PZH Name*/ 
corePZinformationModule.prototype.pzhname = function(params, successCB, errorCB){
	
        console.log("pzhstate was invoked");
        
}


/*PZP id*/
corePZinformationModule.prototype.pzpid = function(params, successCB, errorCB){

	console.log("pzpid was invoked");
	
}

// export our object
exports.Service = corePZinformationModule;

})();
