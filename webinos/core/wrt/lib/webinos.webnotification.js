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
* Copyright 2011 Andre Paul, Fraunhofer FOKUS
******************************************************************************/
(function() {

	/**
	 * ...
	 * @constructor
	 * @param obj Object containing displayName, api, etc.
	 */
	WebNotificationModule = function(obj) {
		this.base = WebinosService;
		this.base(obj);

	};
	
	WebNotificationModule.prototype = new WebinosService;
	
	/**
	 * To bind the service.
	 * @param bindCB BindCallback object.
	 */
	WebNotificationModule.prototype.bindService = function (bindCB, serviceId) {
		// actually there should be an auth check here or whatever, but we just always bind
		var that = this;
		this.WebNotification = function (title, options){
			console.log(that.id);
			var rpc = webinos.rpcHandler.createRPC(that, "notify", [title, options]);
			webinos.rpcHandler.executeRPC(rpc,
					function (params){
						//on success
					 	if(params == 'onClick' && that.onClick){
					 		that.onClick(params);
					 	}
					 	else if(params == 'onShow' && that.onShow){
					 		that.onShow(params);
					 	}
					 	else if(params == 'onClose' && that.onClose){
					 		that.onClose(params);
					 	}
					},
					function (error){
						if(that.onError){
					 		that.onError(error);
					 	}
					}
			);
		}
		if (typeof bindCB.onBind === 'function') {
			bindCB.onBind(this);
		};
	}
	
	
}());