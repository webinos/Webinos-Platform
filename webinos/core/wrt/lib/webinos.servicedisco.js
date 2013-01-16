// Webinos-Platform/webinos/core/wrt/lib/webinos.servicedisco.js
// Maintenance records:
// These inline comments should be incorporated in release notes and removed
// from here when releasing new versions.
//
// Modified by Wei Guo 16-01-2013
// Modification implements
// -- Interface FindCallBack
//      void onError(DOMError error)
// -- Interface PendingOperation
//      void cancel()
//
(function() {
    var isOnNode = function () {
        return typeof module === "object" ? true : false;
    };

    // ServiceDiscovery constructor, constructed within ./webinos.js
    var ServiceDiscovery = function (rpcHandler) {
        this.rpcHandler = rpcHandler;
        this.registeredServices = 0;
        this._found = false;
        this._pending = false;
        this._errorCallback = null;
        this._webinosReady = false;

        /**
         * Interface PendingOperation
         * Cancel the pending discovery. Returns AbortError.
         */
        this.cancel = function () {
            if (this._pending) {
                this._pending = false;
                if (typeof this._errorCallback === 'function') {
                    this._errorCallback('AbortError');
                }
            }
        };

        if (isOnNode()) {
            return;
        }
        
        // further code only runs in the browser
       
        var that = this;
        webinos.session.addListener('registeredBrowser', function () {
            that._webinosReady = true;
            finishCallers();
        });        
    };

    /**
     * Export definitions for node.js
     */
    if (isOnNode()) {
        exports.ServiceDiscovery = ServiceDiscovery;
    } else {
        // this adds ServiceDiscovery to the window object in the browser
        this.ServiceDiscovery = ServiceDiscovery;
    }

    var callerCache = [];

    var finishCallers = function () {
        for (var i = 0; i < callerCache.length; i++) {
            var caller = callerCache[i];
            webinos.discovery.findServices(
            	caller.serviceType,
            	caller.callback,
            	caller.options,
            	caller.filter
            );
        }
        callerCache = [];
    };

    ServiceDiscovery.prototype.findServices = function (serviceType, callback, options, filter) {
        var that = this;
        
        this._pending = true;   // Discovery starts.
        
        if (callback && typeof callback.onError === 'function') {
            this._errorCallback = callback.onError;
        }

        if (!isOnNode() && !this._webinosReady) {
            callerCache.push({
            	serviceType: serviceType,
            	callback:    callback,
            	options:     options,
            	filter:      filter
            });
            return;
        }

        // Pure local services.
        if (serviceType == "BlobBuilder") {
            var tmp = new BlobBuilder();
            this.registeredServices++;
            this._found = true;
            callback.onFound(tmp);
            return;
        }

        function success(params) {
            var baseServiceObj = params;

            console.log("servicedisco: service found.");

            // TODO The typeMap is hard-coded here so only these APIs are
            // supported. In the future this should be improved to support
            // dynamic APIs.
            //
            // APIs should be classified as intrinsic ones and webinos
            // services. Intrinsic APIs, like Discovery, App2App, should be
            // provided directly in WRT. webinos service APIs, like Actuator,
            // Vehicle, which are supposed to be provided with a PZP, should be
            // found with Discovery implemented in this file.
            //
            // That means, intrinsic APIs are released along with WRT and not
            // acquired with Discovery. Users can invoke them directly just
            // like using a library. While webinos service APIs will still be
            // acquired with Discovery.
            //
            // Wei Guo 11-01-2013
            //
            var typeMap = {};
            if (typeof webinos.file !== 'undefined' && typeof webinos.file.Service !== 'undefined')
                typeMap['http://webinos.org/api/file'] = webinos.file.Service;
            if (typeof TestModule !== 'undefined') {
            	typeMap['http://webinos.org/api/test'] = TestModule;
            }
            if (typeof ActuatorModule !== 'undefined') typeMap['http://webinos.org/api/actuator'] = ActuatorModule;
            if (typeof WebNotificationModule !== 'undefined') typeMap['http://webinos.org/api/webnotification'] = WebNotificationModule;
            if (typeof oAuthModule!== 'undefined') typeMap['http://webinos.org/mwc/oauth'] = oAuthModule;
            if (typeof WebinosGeolocation !== 'undefined') typeMap['http://www.w3.org/ns/api-perms/geolocation'] = WebinosGeolocation;
            if (typeof WebinosDeviceOrientation !== 'undefined') typeMap['http://webinos.org/api/deviceorientation'] = WebinosDeviceOrientation;
            if (typeof Vehicle !== 'undefined') typeMap['http://webinos.org/api/vehicle'] = Vehicle;
            if (typeof EventsModule !== 'undefined') typeMap['http://webinos.org/api/events'] = EventsModule;
            if (typeof App2AppModule !== 'undefined') typeMap['http://webinos.org/api/app2app'] = App2AppModule;
            if (typeof AppLauncherModule !== 'undefined') typeMap['http://webinos.org/api/applauncher'] = AppLauncherModule;
            if (typeof Sensor !== 'undefined') {
                typeMap['http://webinos.org/api/sensors'] = Sensor;
                typeMap['http://webinos.org/api/sensors.temperature'] = Sensor;
                typeMap['http://webinos.org/api/sensors.light'] = Sensor;
                typeMap['http://webinos.org/api/sensors.proximity'] = Sensor;
            }
            if (typeof PaymentModule !== 'undefined') typeMap['http://webinos.org/api/payment'] = PaymentModule;
            if (typeof UserProfileIntModule !== 'undefined') typeMap['UserProfileInt'] = UserProfileIntModule;
            if (typeof TVManager !== 'undefined') typeMap['http://webinos.org/api/tv'] = TVManager;
            if (typeof DeviceStatusManager !== 'undefined') typeMap['http://wacapps.net/api/devicestatus'] = DeviceStatusManager;
            if (typeof Contacts !== 'undefined') typeMap['http://www.w3.org/ns/api-perms/contacts'] = Contacts;
            if (typeof webinos.Context !== 'undefined') typeMap['http://webinos.org/api/context'] = webinos.Context;
            //if (typeof DiscoveryModule !== 'undefined') typeMap['http://webinos.org/manager/discovery/bluetooth'] = DiscoveryModule;
            if (typeof DiscoveryModule !== 'undefined') typeMap['http://webinos.org/api/discovery'] = DiscoveryModule;
            if (typeof AuthenticationModule !== 'undefined') typeMap['http://webinos.org/api/authentication'] = AuthenticationModule;
            if (typeof MediaContentModule !== 'undefined') typeMap['http://webinos.org/api/mediacontent'] = MediaContentModule;

            if (isOnNode()) {
                var path = require('path');
                var moduleRoot = path.resolve(__dirname, '../') + '/';
                var moduleDependencies = require(moduleRoot + '/dependencies.json');
                var webinosRoot = path.resolve(moduleRoot + moduleDependencies.root.location) + '/';
                var dependencies = require(path.resolve(webinosRoot + '/dependencies.json'));

                var Context = require(path.join(webinosRoot, dependencies.wrt.location, 'lib/webinos.context.js')).Context;
                typeMap['http://webinos.org/api/context'] = Context;
            }

            var ServiceConstructor = typeMap[baseServiceObj.api];
            if (typeof ServiceConstructor !== 'undefined') {
                // elevate baseServiceObj to usable local WebinosService object
                var service = new ServiceConstructor(baseServiceObj, that.rpcHandler);
                this.registeredServices++;
                this._found = true;
                callback.onFound(service);
            } else {
                var serviceErrorMsg = 'Cannot instantiate webinos service.';
                console.log(serviceErrorMsg);
                if (typeof callback.onError === 'function') {
                    callback.onError(new DiscoveryError(102, serviceErrorMsg));
                }
            }
        } // End of function success

        var rpc = this.rpcHandler.createRPC('ServiceDiscovery', 'findServices',
        		[serviceType, options, filter]);
        // The RPC invokes the Method findServices on PZP.
        
        // The core of findService.
        rpc.onservicefound = function (params) {
            // params is the parameters needed by the API method.
            if (that._pending) {
                success(params);
            }
        };
        
        // Refer to the call in
        // Webinos-Platform/webinos/core/api/servicedisco/lib/rpc_servicediso.js.
        // Wei Guo 11-01-2013
        rpc.onSecurityError = function (params) {
            if (that._pending && typeof callback.onError === 'function') {
                callback.onError('SecurityError');
            }
        };
        
        this.rpcHandler.registerCallbackObject(rpc);

        var serviceAddress;
        if (typeof this.rpcHandler.parent !== 'undefined') {
            serviceAddress = this.rpcHandler.parent.config.pzhId;
        } else {
            serviceAddress = webinos.session.getServiceLocation();
        }
        rpc.serviceAddress = serviceAddress;
        
        // No awaitingResponse. Refer to
        // webinso-jsonrpc2/lib/rpc.js
        // Error responses are generated specifically with a new RPC from the
        // remote.
        this.rpcHandler.executeRPC(rpc);
        
        // Set timeout in WRT.
		setTimeout(
			function () {
                if (that._pending) {
                    that._pending = false;  // Discovery finishes.
    				
    				// If no results return TimeoutError.
    				if (!that._found && typeof callback.onError === 'function') {
    					callback.onError('TimeoutError');
    			    }
			    }
			},
			options && typeof options.timeout !== 'undefined' ? options.timeout : 120000
			// Default: 120 secs
		);
        
        return;
    }; // ServiceDiscovery.prototype.findServices function ends.
    // It should return an array of found services.
    // It provides the FindCallBack of onFound, onError, and onLost.
    // onError is implemented.
    // onLost is not implemented.

    // TODO Decide how to deal with it.
    var DiscoveryError = function (code, message) {
        this.code = code;
        this.message = message;
    };
    DiscoveryError.prototype.FIND_SERVICE_CANCELED = 101;
    DiscoveryError.prototype.FIND_SERVICE_TIMEOUT = 102;
    DiscoveryError.prototype.PERMISSION_DENIED_ERROR = 103;

    ///////////////////// WEBINOS SERVICE INTERFACE ///////////////////////////

    // TODO decide what to do with this class.
    WebinosService = function (obj) {
        this.base = RPCWebinosService;
        this.base(obj);

//        this.id = Math.floor(Math.random()*101);
    };
    WebinosService.prototype = new RPCWebinosService;

    WebinosService.prototype.state = "";

//    WebinosService.prototype.api = "";

//    WebinosService.prototype.id = "";

//    WebinosService.prototype.displayName = "";

//    WebinosService.prototype.description = "";

    WebinosService.prototype.icon = "";

    // stub implementation in case a service module doesn't provide its own bindService
    WebinosService.prototype.bindService = function(bindCB) {
        if (typeof bindCB === 'undefined') return;

        if (typeof bindCB.onBind === 'function') {
            bindCB.onBind(this);
        }
    };

    WebinosService.prototype.unbind = function() {
        webinos.discovery.registeredServices--;
        if (channel != null && webinos.discovery.registeredServices > 0) {
            channel.close();
            channel = null;
        }
    };
}());
