(function () {
	"use strict";

	var RPCWebinosService = require('webinos-jsonrpc2').RPCWebinosService;
	var devicestatusmodule = require('./webinos.devicestatus.js').devicestatus,
	RemoteDeviceStatusManager = function(rpcHandler) {
		// inherit from RPCWebinosService
		this.base = RPCWebinosService;
		this.base({
			api: 'http://wacapps.net/api/devicestatus',
			displayName: 'DeviceStatus',
			description: 'Get information about the device status.'
		});
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
