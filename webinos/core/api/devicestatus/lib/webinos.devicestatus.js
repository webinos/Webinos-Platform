(function () {
	"use strict";
	var webinos = require("find-dependencies")(__dirname);
	var nativeDeviceStatus;
	try{
	if(process.platform=='android'){
	nativeDeviceStatus = require("bridge").load("org.webinos.impl.DevicestatusImpl", this);
	}else{
	nativeDeviceStatus = require('nativedevicestatus');
	}
    }catch(err){
	}
	var DeviceapisDeviceStatusManager, DeviceStatusManager, PropertyRef, WatchOptions, DeviceAPIError, PropertyValueSuccessCallback, ErrorCallback, PendingOperation;

	/*
	 *	DeviceapisDeviceStatusManager Interface
	 */

	DeviceapisDeviceStatusManager = function () {
		this.devicestatus = new DeviceStatusManager();
	};

	DeviceapisDeviceStatusManager.prototype.devicestatus = null;

	/*
	 *	DeviceStatusManager Interface
	 */

	DeviceStatusManager = function () {};

	DeviceStatusManager.prototype.getComponents = function (aspect, successCallback) {
		if(nativeDeviceStatus) successCallback(nativeDeviceStatus.getComponents(aspect));
	};

	DeviceStatusManager.prototype.isSupported = function (aspect, property, successCallback) {
		if(nativeDeviceStatus) successCallback({'aspect':aspect, 'property':property, 'isSupported':nativeDeviceStatus.isSupported(aspect, property)});
	};

	DeviceStatusManager.prototype.getPropertyValue = function (successCallback, errorCallback, prop) {
        	if(nativeDeviceStatus) successCallback(nativeDeviceStatus.getPropertyValue(prop.aspect, prop.property, prop.component));
	};

	DeviceStatusManager.prototype.watchPropertyChange = function (successCallback, errorCallback, prop, options) {
		if(nativeDeviceStatus) nativeDeviceStatus.watchPropertyChange(prop, options);
	};

	DeviceStatusManager.prototype.clearPropertyChange = function (watchHandler) {
		// Not Native?
	};

	/*
	 *	PropertyRef Interface
	 */

	PropertyRef = function (component, aspect, property) {
		if (typeof component === 'string') {
			this.component = component;
		}

		if (typeof aspect === 'string') {
			this.aspect = aspect;
		}

		if (typeof property === 'string') {
			this.property = property;
		}
	};

	PropertyRef.prototype.component = String;
	PropertyRef.prototype.aspect = String;
	PropertyRef.prototype.property = String;

	/*
	 *	WatchOptions Interface
	 */

	WatchOptions = function (minNotificationInterval, maxNotificationInterval, minChangePercent) {
		if (typeof minNotificationInterval === 'number') {
			this.minNotificationInterval = minNotificationInterval;
		}

		if (typeof maxNotificationInterval === 'number') {
			this.maxNotificationInterval = maxNotificationInterval;
		}

		if (typeof minChangePercent === 'number') {
			this.minChangePercent = minChangePercent;
		}
	};

	WatchOptions.prototype.minNotificationInterval = Number;
	WatchOptions.prototype.maxNotificationInterval = Number;
	WatchOptions.prototype.minChangePercent = Number;

	/*
	 *	DeviceAPIError Interface
	 */

	DeviceAPIError = function () {
		this.code = Number;
		this.message = String;
	};

	DeviceAPIError.prototype.UNKNOWN_ERR                    = 0;

	DeviceAPIError.prototype.INDEX_SIZE_ERR                 = 1;
	DeviceAPIError.prototype.DOMSTRING_SIZE_ERR             = 2;
	DeviceAPIError.prototype.HIERARCHY_REQUEST_ERR          = 3;
	DeviceAPIError.prototype.WRONG_DOCUMENT_ERR             = 4;
	DeviceAPIError.prototype.INVALID_CHARACTER_ERR          = 5;
	DeviceAPIError.prototype.NO_DATA_ALLOWED_ERR            = 6;
	DeviceAPIError.prototype.NO_MODIFICATION_ALLOWED_ERR    = 7;
	DeviceAPIError.prototype.NOT_FOUND_ERR                  = 8;

	DeviceAPIError.prototype.NOT_SUPPORTED_ERR              = 9;
	DeviceAPIError.prototype.INUSE_ATTRIBUTE_ERR            = 10;
	DeviceAPIError.prototype.INVALID_STATE_ERR              = 11;
	DeviceAPIError.prototype.SYNTAX_ERR                     = 12;
	DeviceAPIError.prototype.INVALID_MODIFICATION_ERR       = 13;
	DeviceAPIError.prototype.NAMESPACE_ERR                  = 14;
	DeviceAPIError.prototype.INVALID_ACCESS_ERR             = 15;
	DeviceAPIError.prototype.VALIDATION_ERR                 = 16;

	DeviceAPIError.prototype.TYPE_MISMATCH_ERR              = 17;

	DeviceAPIError.prototype.SECURITY_ERR                   = 18;

	DeviceAPIError.prototype.NETWORK_ERR                    = 19;

	DeviceAPIError.prototype.ABORT_ERR                      = 20;

	DeviceAPIError.prototype.TIMEOUT_ERR                    = 21;

	DeviceAPIError.prototype.INVALID_VALUES_ERR             = 22;
	DeviceAPIError.prototype.NOT_AVAILABLE_ERR              = 101;

	DeviceAPIError.prototype.code = Number;
	DeviceAPIError.prototype.message = Number;

	/*
	 *	PropertyValueSuccessCallback Interface
	 */

	PropertyValueSuccessCallback = function () {};

	PropertyValueSuccessCallback.prototype.onpropertyvalue = function (value, property) {
		return;
	};

	/*
	 *	ErrorCallback Interface
	 */

	ErrorCallback = function () {};

	ErrorCallback.prototype.onError = function (error) {
		return;
	};

	/*
	 *	PendingOperation Interface
	 */

	PendingOperation = function () {};

	PendingOperation.prototype.cancel = function () {
		return;
	};


	exports.devicestatus = new DeviceapisDeviceStatusManager();
}());
