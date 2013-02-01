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
        this.registeredServices = 0;
        
        var _webinosReady = false;
        var callerCache = [];

        /**
         * Search for registered services.
         * @param {ServiceType} serviceType ServiceType object to search for.
         * @param {FindCallBack} callback Callback to call with results.
         * @param {Options} options Timeout, optional.
         * @param {Filter} filter Filters based on location, name, description, optional.
         */
        this.findServices = function (serviceType, callback, options, filter) {
            var that = this;
            var findOp;
            
            var rpc = rpcHandler.createRPC('ServiceDiscovery', 'findServices',
                    [serviceType, options, filter]);
            
            var timer = setTimeout(function () {
                rpcHandler.unregisterCallbackObject(rpc);
                // If no results return TimeoutError.
                if (!findOp.found && typeof callback.onError === 'function') {
                    callback.onError(new DOMError('TimeoutError', ''));
                }
            }, options && typeof options.timeout !== 'undefined' ?
                        options.timeout : 120000 // default timeout 120 secs
            );
            
            findOp = new PendingOperation(function() {
                // remove waiting requests from callerCache
                var index = callerCache.indexOf(rpc);
                if (index >= 0) {
                    callerCache.splice(index, 1);
                }
                rpcHandler.unregisterCallbackObject(rpc);
                if (typeof callback.onError === 'function') {
                    callback.onError(new DOMError('AbortError', ''));
                }
            }, timer);
            
            var success = function (params) {
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
                if (typeof corePZinformationModule !== 'undefined') typeMap['http://webinos.org/api/corePZinformation'] = corePZinformationModule;
                if (typeof NfcModule !== 'undefined') typeMap['http://webinos.org/api/nfc'] = NfcModule;

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
                    var service = new ServiceConstructor(baseServiceObj, rpcHandler);
                    this.registeredServices++;
                    findOp.found = true;
                    callback.onFound(service);
                } else {
                    var serviceErrorMsg = 'Cannot instantiate webinos service.';
                    console.log(serviceErrorMsg);
                    if (typeof callback.onError === 'function') {
                        callback.onError(new DiscoveryError(102, serviceErrorMsg));
                    }
                }
            }; // End of function success
            
            // The core of findService.
            rpc.onservicefound = function (params) {
                // params is the parameters needed by the API method.
                success(params);
            };
            
            // Refer to the call in
            // Webinos-Platform/webinos/core/api/servicedisco/lib/rpc_servicediso.js.
            rpc.onSecurityError = function (params) {
                if (typeof findOp !== 'undefined' && typeof callback.onError === 'function') {
                    callback.onError(new DOMError('SecurityError', ''));
                }
            };
            
            // Add this pending operation.
            rpcHandler.registerCallbackObject(rpc);
            
            if (typeof rpcHandler.parent !== 'undefined') {
                rpc.serviceAddress = rpcHandler.parent.config.pzhId;
            } else {
                rpc.serviceAddress = webinos.session.getServiceLocation();
            }
            
            // TODO Need to check how to handle it. The serviceType BlobBuilder is
            // not in the API spec.
            // Pure local services.
            if (serviceType == "BlobBuilder") {
                this.found =true;
                var tmp = new BlobBuilder();
                this.registeredServices++;
                callback.onFound(tmp);
                return findOp;
            }
            
            if (!isOnNode() && !_webinosReady) {
                callerCache.push(rpc);
            } else {
                // Only do it when _webinosReady is true.
                rpcHandler.executeRPC(rpc);
            }
            
            return findOp;
        };  // End of findServices.
        
        if (isOnNode()) {
            return;
        }
        
        // further code only runs in the browser
        
        webinos.session.addListener('registeredBrowser', function () {
            _webinosReady = true;
            for (var i = 0; i < callerCache.length; i++) {
                var req = callerCache[i];
                rpcHandler.executeRPC(req);
            }
            callerCache = [];
        });
    };
    
    /**
     * Export definitions for node.js
     */
    if (isOnNode()) {
        exports.ServiceDiscovery = ServiceDiscovery;
    } else {
        // this adds ServiceDiscovery to the window object in the browser
        window.ServiceDiscovery = ServiceDiscovery;
    }
    
    /**
     * Interface PendingOperation
     */
    function PendingOperation(cancelFunc, timer) {
        this.found = false;
        
        this.cancel = function () {
            clearTimeout(timer);
            cancelFunc();
        };
    }
    
    function DOMError(name, message) {
        return {
            name: name,
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
