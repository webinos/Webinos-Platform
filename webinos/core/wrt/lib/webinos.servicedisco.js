//
// Webinos-Platform/webinos/core/wrt/lib/webinos.servicedisco.js
//
// Maintenance records:
// These inline comments should be incorporated in release notes and removed
// from here when releasing new versions.
//
// Modification implements
// -- Interface DiscoveryInterface method
//      PendingOperation findServices(ServiceType serviceType, FindCallBack findCallBack, Options options, Filter filter)
// -- Interface FindCallBack method
//      void onError(DOMError error)
// -- Interface PendingOperation method
//      void cancel()
//
(function () {
    function isOnNode() {
        return typeof module === "object" ? true : false;
    };
    
    /**
     * Interface DiscoveryInterface
     */
    var ServiceDiscovery = function (rpcHandler) {
        this.rpcHandler = rpcHandler;
        this.registeredServices = 0;
        this._webinosReady = false;
        this.callerCache = [];
        this.timer = null;

        if (isOnNode()) {
            return;
        }
        
        // further code only runs in the browser
        
        var that = this;
        webinos.session.addListener('registeredBrowser', function () {
            that._webinosReady = true;
            // finishCallers(that);
            for (var i = 0; i < that.callerCache.length; i++) {
                var caller = that.callerCache[i];
                that.rpcHandler.executeRPC(caller.rpc);
            }
            that.callerCache = [];
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
    
    /**
     * Method:
     * PendingOperation findServices(ServiceType serviceType, FindCallBack findCallBack, Options options, Filter filter)
     */
    ServiceDiscovery.prototype.findServices = function (serviceType, callback, options, filter) {
        
        
        var searchParams = {
                serviceType: serviceType,
                callback:    callback,
                options:     options,
                filter:      filter
        };
        
        var rpc = this.rpcHandler.createRPC('ServiceDiscovery', 'findServices',
                [serviceType, options, filter]);
        
        var findHandle = new PendingOperation(this, rpc, searchParams);
        if (callback && typeof callback.onError === 'function') {
            findHandle.errorCallback = callback.onError;
        }
        
        var that = this;
        
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
            var typeMap = {};
            if (typeof webinos.file !== 'undefined' && typeof webinos.file.Service !== 'undefined')
                typeMap['http://webinos.org/api/file'] = webinos.file.Service;
            if (typeof TestModule !== 'undefined') typeMap['http://webinos.org/api/test'] = TestModule;
            if (typeof ActuatorModule !== 'undefined') {
                typeMap['http://webinos.org/api/actuators'] = ActuatorModule;
                typeMap['http://webinos.org/api/actuators.linearmotor'] = ActuatorModule;
                typeMap['http://webinos.org/api/actuators.switch'] = ActuatorModule;
                typeMap['http://webinos.org/api/actuators.rotationalmotor'] = ActuatorModule;
                typeMap['http://webinos.org/api/actuators.vibratingmotor'] = ActuatorModule;
                typeMap['http://webinos.org/api/actuators.servomotor'] = ActuatorModule;
                typeMap['http://webinos.org/api/actuators.swivelmotor'] = ActuatorModule;
                typeMap['http://webinos.org/api/actuators.thermostat'] = ActuatorModule;
            }
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
                typeMap['http://webinos.org/api/sensors.noise'] = Sensor;
                typeMap['http://webinos.org/api/sensors.pressure'] = Sensor;
                typeMap['http://webinos.org/api/sensors.humidity'] = Sensor;
                typeMap['http://webinos.org/api/sensors.heartratemonitor'] = Sensor;
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
                findHandle.found = true;
                callback.onFound(service);
            } else {
                var serviceErrorMsg = 'Cannot instantiate webinos service.';
                console.log(serviceErrorMsg);
                if (typeof callback.onError === 'function') {
                    callback.onError(new DiscoveryError(102, serviceErrorMsg));
                }
            }
        } // End of function success
        
        // The core of findService.
        rpc.onservicefound = function (params) {
            // params is the parameters needed by the API method.
            if (typeof findHandle !== 'undefined') {
                success(params);
            }
        };
        
        // Refer to the call in
        // Webinos-Platform/webinos/core/api/servicedisco/lib/rpc_servicediso.js.
        rpc.onSecurityError = function (params) {
            if (typeof findHandle !== 'undefined' && typeof callback.onError === 'function') {
                callback.onError(DOMError('SecurityError', ''));
            }
        };
        
        // Add this pending operation.
        this.rpcHandler.registerCallbackObject(rpc);
        
        if (typeof this.rpcHandler.parent !== 'undefined') {
            rpc.serviceAddress = this.rpcHandler.parent.config.pzhId;
        } else {
            rpc.serviceAddress = webinos.session.getServiceLocation();
        }
        
        this.timer = setTimeout(function () {
                if (typeof findHandle !== 'undefined') {
                    that.rpcHandler.unregisterCallbackObject(rpc);
                    // If no results return TimeoutError.
                    if (!findHandle.found && typeof callback.onError === 'function') {
                        callback.onError(DOMError('TimeoutError', ''));
                    }
                    delete findHandle;
                }
            },
            options && typeof options.timeout !== 'undefined' ? options.timeout : 120000
            // Default: 120 secs
        );
        
        // TODO Need to check how to handle it. The serviceType BlobBuilder is
        // not in the API spec.
        // Pure local services.
        if (serviceType == "BlobBuilder") {
            this.found =true;
            var tmp = new BlobBuilder();
            this.registeredServices++;
            callback.onFound(tmp);
            return findHandle;
        }
        
        if (!isOnNode() && !this._webinosReady) {
            this.callerCache.push(findHandle);
        } else {
            // Only do it when _webinosReady is true.
            this.rpcHandler.executeRPC(rpc);
        }
        
        return findHandle;
    };  // End of findServices.
    
    /**
     * Interface PendingOperation
     */
    function PendingOperation(serviceDiscoveryInterface, rpc, searchParams) {
        this.rpc = rpc;
        this.searchParams = searchParams;
        this.found = false;
        this.errorCallback = null;
        
        var that = this;
        this.cancel = function () {
            // Check serviceDiscoveryInterface.callerCache and remove the call.
            var index = serviceDiscoveryInterface.callerCache.indexOf(that);
            if (index >= 0) {
                serviceDiscoveryInterface.callerCache.splice(index, 1);
            }
            serviceDiscoveryInterface.rpcHandler.unregisterCallbackObject(rpc);
            clearTimeout(serviceDiscoveryInterface.timer);
            if (typeof that.errorCallback === 'function') {
                that.errorCallback(DOMError('AbortError', ''));
            }
            delete that;
            return;
        };
    }
    
    function DOMError(type, message) {
        return {
            type: type,
            message: message
        };
    }
    
    
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
