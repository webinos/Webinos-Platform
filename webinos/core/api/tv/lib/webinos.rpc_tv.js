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
* Copyright 2012 Martin Lasak, Fraunhofer FOKUS
******************************************************************************/

//Service side RPC endpoint for the tv module API

(function() {
	"use strict";
	
	var _TV_MODULE_IMPLEMENTATION_ = 'mock'; // mock, vlcdvb, coolstream, ce4100

	// reference to a certain tv module implementation
	var tvmodule;
	
	/**
	 * Webinos TV service constructor (server side).
	 * @constructor
	 * @alias RemoteTVManager
	 * @param rpcHandler A handler for functions that use RPC to deliver their result.
	 */
	var RemoteTVManager = function(rpcHandler, params) {
		// inherit from RPCWebinosService
		this.base = RPCWebinosService;
		this.base({
			api:'http://webinos.org/api/tv',
			displayName:'TV ('+(params.impl?params.impl:_TV_MODULE_IMPLEMENTATION_)+' service)',
			description:'TV control and managment.'
		});
		
		if (typeof params.impl !== 'undefined') {
			tvmodule = require('./webinos.service_tv.' + params.impl + '.js');
			if(tvmodule.tv_setConf)tvmodule.tv_setConf(params);
			tvmodule=tvmodule.tv;
		} else {
			tvmodule = require('./webinos.service_tv.' + _TV_MODULE_IMPLEMENTATION_ + '.js').tv;
		}
		
		/**
		 * Add event listener.
		 * @param params Array, first item being event type.
		 * @param successCallback Success callback.
		 * @param errorCallback Error callback.
		 * @param RPC object reference.
		 */
		this.display.addEventListener = function ( params,  successCallback,  errorCallback, objectRef) {
			if(params[0]==='channelchange'){
				var useCapture = params[2];
			
			tvmodule.tv.display.addEventListener('channelchange',function(channel){
				var json = rpcHandler.createRPC(objectRef, "onchannelchangeeventhandler", channel);
				rpcHandler.executeRPC(json);
			},useCapture);
			
			}
		};
	};
	
	RemoteTVManager.prototype = new RPCWebinosService;
	
	//API: tv module implementation 
	RemoteTVManager.prototype.tuner = {};
	RemoteTVManager.prototype.display = {};
	
	/**
	 * Set a channel.
	 * @param params Array, first item being the channel.
	 * @param successCallback Success callback.
	 * @param errorCallback Error callback.
	 */
	RemoteTVManager.prototype.display.setChannel = function ( params,  successCallback,  errorCallback) {
		tvmodule.tv.display.setChannel(params[0],function(channel){
			successCallback(channel);
		},function(){
			
		});
	};
	
	/**
	 * Get EPG info. (Spec tbd.)
	 * @param channel Channel.
	 * @param successCallback Success callback.
	 * @param errorCallback Error callback.
	 */
	RemoteTVManager.prototype.display.getEPGPIC = function( params,  successCallback,  errorCallback){
		//TODO: only internal temporarily use!
		//This is only to bridge the missing Media Capture API and EPG functionality 
        
        tvmodule.tv.display.getEPGPIC(params[0],function(EPGPIC){
			successCallback(EPGPIC);
		},function(){
			
		});
        
	};
	
	/**
	 * Get the available TV sources (e.g. tuners)
	 * @param params not used.
	 * @param successCallback Success callback.
	 * @param errorCallback Error callback.
	 */
	RemoteTVManager.prototype.tuner.getTVSources = function ( params,  successCallback,  errorCallback) {
		tvmodule.tv.tuner.getTVSources(function(sources){
			successCallback(sources);
		},function(){
			
		});
	};

	// export our object
	exports.Service = RemoteTVManager;

}());
