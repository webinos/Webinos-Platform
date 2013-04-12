(function () {
	"use strict";

	var RPCWebinosService = require('webinos-jsonrpc2').RPCWebinosService;
	var devicestatusmodule = require('./webinos.devicestatus.js').devicestatus,
	RemoteDeviceStatusManager = function(rpcHandler, params) {
		// inherit from RPCWebinosService
		this.base = RPCWebinosService;
		this.base({
			api: 'http://webinos.org/api/devicestatus',
			displayName: 'DeviceStatus',
			description: 'Get information about the device status.'
		});
		this.params = params;
	};
	
	RemoteDeviceStatusManager.prototype = new RPCWebinosService;
	
	RemoteDeviceStatusManager.prototype.getComponents = 
		function (params, successCallback) {
			devicestatusmodule.devicestatus.getComponents(
				params[0],
				function (components) {
					successCallback(components);
				}
			);
		};
	
	RemoteDeviceStatusManager.prototype.isSupported = 
		function (params, successCallback) {
			if (params && params.length == 2 && params[0] == "Device" && params[1] == "type") //If it's the device type
				successCallback({ aspect:params[0], property:params[1],isSupported:true}); // we support it via config
			else // check the native implementation
				devicestatusmodule.devicestatus.isSupported(
					params[0],
					params[1],
					function (res) {
						successCallback(res);
					}
				);
		};

	RemoteDeviceStatusManager.prototype.getPropertyValue = 
		function (params, successCallback, errorCallback) {
			if (params && params[0] && params[0].aspect == "Device" && params[0].property == "type"){ //If it's the device type
				// Get it from the parameters in the config file.
				successCallback(this.params.devicetype);
			}else //Call the native implementation
				devicestatusmodule.devicestatus.getPropertyValue(
					function (prop) {
						successCallback(prop);
					},
					function (err) {
						errorCallback(err);
					},
					params[0]
				);
		};
/*
	RemoteDeviceStatusManageri.prototype.watchPropertyChange = 
		function (params, successCallback, errorCallback) {
			devicestatusmodule.devicestatus.getPropertyValue(
				function (prop) {
					successCallback(prop);
				},
				function (err) {
					errorCallback(err);
				},
				params[2]
			);
		};
*/	
	exports.Service = RemoteDeviceStatusManager;

}());
