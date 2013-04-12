(function () {
	"use strict";
        var devicetype;
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
                devicetype = params;
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
                         if (params && params[0] && params[0].aspect == "Device" && params[0].property == "type") { //If It's device type then Get it from the parameters in the webinos_config.json file
                         successCallback(devicetype.devicetype);
                         console.log(devicetype.devicetype);
                         } else
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
