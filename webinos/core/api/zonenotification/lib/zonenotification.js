/*******************************************************************************
 * Code contributed to the Webinos project.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *	 http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright 2013 John Lyle, University of Oxford
 ******************************************************************************/
 (function () {
    var RPCWebinosService = require("webinos-jsonrpc2").RPCWebinosService;
    var NotificationInputs = require("./notificationPzh.js");
    var util = require('util');

    var WebinosNotificationModule = function (rpcHandler, params) {
        this.rpcHandler = rpcHandler;
        this.params = params;
    };

    WebinosNotificationModule.prototype.init = function (register, unregister) {
        var service = new NotificationService(this.rpcHandler, this.params);
        register(service);
    };

    /**
     * 
     * @constructor
     * @alias TestService
     * @param rpcHandler A handler for functions that use RPC to deliver their result.
     * @param params Parameters to initialize the service.
     */
    var NotificationService = function (rpcHandler, params) {
        // inherit from RPCWebinosService
        this.rpcHandler = rpcHandler;
        this.params = params;
        this.base = RPCWebinosService;
        this.base({
            api: 'http://webinos.org/api/internal/zonenotification',
            displayName: 'Personal Zone Internal Notifications',
            description: 'This service provides notifications to webinos devices'
        });

        this.listenAttr = {};


        /**
         * Invoke the registered listener twice with a constant number value. 
         * @param params Optional parameters.
         * @param successCB Success callback.
         * @param errorCB Error callback.
         * @param objectRef RPC object reference.
         */
        this.listenAttr.subscribe = function (params, successCB, errorCB, objectRef) {
            console.log("Zone Notification Service: subscribe attrbute was invoked");
            NotificationInputs.addSubscriber(
            objectRef,

            function (id, msg) {
                var rpc = rpcHandler.createRPC(objectRef, 'onNotification', {
                    "id": id,
                    "notification": msg
                });
                rpcHandler.executeRPC(rpc);
            },

            function (id) {
                var rpc = rpcHandler.createRPC(objectRef, 'onCancel', id);
                rpcHandler.executeRPC(rpc);
            });
            successCB();
        };
    }

    NotificationService.prototype = new RPCWebinosService;

    /**
     * Get the value of an internal property and whatever was sent as params.
     * @param params Array with parameters.
     * @param successCB Success callback.
     * @param errorCB Error callback.
     */
    NotificationService.prototype.respond = function (params, successCB, errorCB) {
        console.log("Zone Notification Service: respond was invoked with params: " + util.inspect(params));
        NotificationInputs.addResponseFromUI(
        this.rpcHandler.sessionId,
        params["id"],
        params["response"],

        function () {
            successCB();
        },

        function (err) {
            errorCB(err);
        });
    }

    // export our object
    exports.Module = WebinosNotificationModule;

})();
