/*******************************************************************************
 * Code contributed to the webinos project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright 2011 Alexander Futasz, Fraunhofer FOKUS
 ******************************************************************************/

(function () {
    function isOnNode() {
        return typeof module === "object" ? true : false;
    }

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
    if (typeof ActuatorModule !== 'undefined') typeMap['http://webinos.org/api/actuators'] = ActuatorModule;
    if (typeof App2AppModule !== 'undefined') typeMap['http://webinos.org/api/app2app'] = App2AppModule;
    if (typeof AppLauncherModule !== 'undefined') typeMap['http://webinos.org/api/applauncher'] = AppLauncherModule;
    if (typeof AuthenticationModule !== 'undefined') typeMap['http://webinos.org/api/authentication'] = AuthenticationModule;
    if (typeof webinos.Context !== 'undefined') typeMap['http://webinos.org/api/context'] = webinos.Context;
    if (typeof corePZinformationModule !== 'undefined') typeMap['http://webinos.org/api/corePZinformation'] = corePZinformationModule;
    if (typeof DeviceStatusManager !== 'undefined') typeMap['http://webinos.org/api/devicestatus'] = DeviceStatusManager;
    if (typeof DiscoveryModule !== 'undefined') typeMap['http://webinos.org/api/discovery'] = DiscoveryModule;
    if (typeof EventsModule !== 'undefined') typeMap['http://webinos.org/api/events'] = EventsModule;
    if (webinos.file && webinos.file.Service) typeMap['http://webinos.org/api/file'] = webinos.file.Service;
    if (typeof MediaContentModule !== 'undefined') typeMap['http://webinos.org/api/mediacontent'] = MediaContentModule;
    if (typeof NfcModule !== 'undefined') typeMap['http://webinos.org/api/nfc'] = NfcModule;
    if (typeof WebNotificationModule !== 'undefined') typeMap['http://webinos.org/api/notifications'] = WebNotificationModule;
    if (typeof WebinosDeviceOrientation !== 'undefined') typeMap['http://webinos.org/api/deviceorientation'] = WebinosDeviceOrientation;
    if (typeof PaymentModule !== 'undefined') typeMap['http://webinos.org/api/payment'] = PaymentModule;
    if (typeof Payment2Module !== 'undefined') typeMap['http://webinos.org/api/payment2'] = Payment2Module;
    if (typeof Sensor !== 'undefined') typeMap['http://webinos.org/api/sensors'] = Sensor;
    if (typeof TestModule !== 'undefined') typeMap['http://webinos.org/api/test'] = TestModule;
    if (typeof TVManager !== 'undefined') typeMap['http://webinos.org/api/tv'] = TVManager;
    if (typeof Vehicle !== 'undefined') typeMap['http://webinos.org/api/vehicle'] = Vehicle;
    if (typeof WebinosGeolocation !== 'undefined') typeMap['http://webinos.org/api/w3c/geolocation'] = WebinosGeolocation;
    if (typeof WebinosGeolocation !== 'undefined') typeMap['http://www.w3.org/ns/api-perms/geolocation'] = WebinosGeolocation; // old feature URI for compatibility
    if (typeof Contacts !== 'undefined') typeMap['http://www.w3.org/ns/api-perms/contacts'] = Contacts;
    if (typeof ZoneNotificationModule !== 'undefined') typeMap['http://webinos.org/api/internal/zonenotification'] = ZoneNotificationModule;
//    if (typeof DiscoveryModule !== 'undefined') typeMap['http://webinos.org/manager/discovery/bluetooth'] = DiscoveryModule;
    if (typeof oAuthModule !== 'undefined') typeMap['http://webinos.org/mwc/oauth'] = oAuthModule;

    if (isOnNode()) {
        var path = require('path');
        var moduleRoot = path.resolve(__dirname, '../') + '/';
        var moduleDependencies = require(moduleRoot + '/dependencies.json');
        var webinosRoot = path.resolve(moduleRoot + moduleDependencies.root.location) + '/';
        var dependencies = require(path.resolve(webinosRoot + '/dependencies.json'));

        var Context = require(path.join(webinosRoot, dependencies.wrt.location, 'lib/webinos.context.js')).Context;
        typeMap['http://webinos.org/api/context'] = Context;
    }

    /**
     * Interface DiscoveryInterface
     */
    var ServiceDiscovery = function (rpcHandler) {
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
                console.log("servicedisco: service found.");
                var baseServiceObj = params;

                // reduce feature uri to base form, e.g. http://webinos.org/api/sensors
                // instead of http://webinos.org/api/sensors.light etc.
                var stype = /(?:.*(?:\/[\w]+)+)/.exec(baseServiceObj.api);
                stype = stype ? stype[0] : undefined;

                var ServiceConstructor = typeMap[stype];
                if (ServiceConstructor) {
                    // elevate baseServiceObj to usable local WebinosService object
                    var service = new ServiceConstructor(baseServiceObj, rpcHandler);
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

    webinos.discovery = new ServiceDiscovery (webinos.rpcHandler);
    webinos.ServiceDiscovery = webinos.discovery; // for backward compat
}());
