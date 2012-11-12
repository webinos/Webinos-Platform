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
* Copyright 2012 EPU-National Technical University of Athens
******************************************************************************/
(function() {

	var Context = function(obj, rpcHandler) {
		this.base = WebinosService;
		this.base(obj);
    	this.rpcHandler = rpcHandler;
	};
	
	Context.prototype = new WebinosService;
	
	Context.prototype.bindService = function (bindCB, serviceId) {
		// actually there should be an auth check here or whatever, but we just always bind
		this.find = find.bind(this);
		this.executeQuery = executeQuery.bind(this);
		
		if (typeof bindCB.onBind === 'function') {
			bindCB.onBind(this);
		};
	}
	
	function find(params, successCB,errorCB) {
		var rpc = this.rpcHandler.createRPC(this, "find",  params);
		this.rpcHandler.executeRPC(rpc,
				function (params){
					successCB(params);
				},
				function (error){
					errorCB(error);
				}
		);
	}
	
  function registerAppContextObject(APPName, ContextObjectName, ContextFields, callback) {
    var rpc = webinos.rpcHandler.createRPC(this, "registerAppContextObject",  query);
    webinos.rpcHandler.executeRPC(rpc,
        function (params){
      callback(params);
        },
        function (error){
          callback(error);
        }
    );
  }

	function executeQuery(query, successCB,errorCB) {
	    var rpc = this.rpcHandler.createRPC(this, "executeQuery",  query);
	    this.rpcHandler.executeRPC(rpc,
	        function (params){
	          successCB(params);
	        },
	        function (error){
	          errorCB(error);
	        }
	    );
	  }
	
	if (typeof module !== 'undefined') {
		exports.Context = Context;
	} else {
		webinos.Context = Context;
	}
})();
