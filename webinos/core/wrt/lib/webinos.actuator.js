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
* Copyright 2012 Andre Paul, Fraunhofer FOKUS
******************************************************************************/
(function() {

	
	
	/**
	 * Webinos Actuator service constructor (client side).
	 * @constructor
	 * @param obj Object containing displayName, api, etc.
	 */
	ActuatorModule = function(obj) {
		this.base = WebinosService;
		this.base(obj);
	};
	
	ActuatorModule.prototype = new WebinosService();

	/**
	 * To bind the service.
	 * @param bindCB BindCallback object.
	 */
	ActuatorModule.prototype.bind = function(bindCB) {
			var self = this;
			var rpc = webinos.rpcHandler.createRPC(this, "getStaticData", []);
			webinos.rpcHandler.executeRPC(rpc,
				function (result){
			
					self.range = result.range;
					self.unit = result.unit;
					self.vendor = result.vendor;
					self.version = result.version;
					if (typeof bindCB.onBind === 'function') {
						bindCB.onBind(self);
					}
				},
				function (error){
					
				}
			);
    };
	
	/**
	 * Launches an application.
	 * @param successCallback Success callback.
	 * @param errorCallback Error callback.
	 * @param applicationID Application ID to be launched.
	 * @param params Parameters for starting the application.
	 */
	ActuatorModule.prototype.setValue = function (value, successCB, errorCallback){
		//returns pendingOp
		
		var rpc = webinos.rpcHandler.createRPC(this, "setValue", value);
		webinos.rpcHandler.executeRPC(rpc,
				function (event){
					successCB(event);
				},
				function (domerror){
					errorCallback(domerror);
				}
		);

	};
    	
}());