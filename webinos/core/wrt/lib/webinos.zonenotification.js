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
 * Copyright 2013 John Lyle, University of Oxford
 ******************************************************************************/
 (function () {
    /**
     * Webinos Personal Zone Notifications service constructor (client side).
     * @constructor
     * @param obj Object containing displayName, api, etc.
     */
    ZoneNotificationModule = function (obj) {
        this.base = WebinosService;
        this.base(obj);
    };

    ZoneNotificationModule.prototype = new WebinosService;

    /**
     * To bind the service.
     * @param bindCB BindCallback object.
     */
    ZoneNotificationModule.prototype.bindService = function (bindCB, serviceId) {
        // actually there should be an auth check here or whatever, but we just always bind
        this.respond = respond;
        this.listenAttr = {};
        this.subscribe = subscribe.bind(this);
        if (typeof bindCB.onBind === 'function') {
            bindCB.onBind(this);
        };
    }

    /**
     * @param attr Some attribute.
     * @param successCB Success callback.
     * @param errorCB Error callback. 
     */
    function respond(id, response, successCB, errorCB) {
        console.log(this.id);
        var rpc = webinos.rpcHandler.createRPC(this, "respond", {
            "id": id,
            "response": response
        });
        webinos.rpcHandler.executeRPC(rpc,

        function (params) {
            successCB(params);
        },

        function (error) {
            errorCB(error);
        });
    }

    /**
     * @param listener Listener function that gets called.
     * @param options Optional options.
     */
    function subscribe(listener, options) {
        var rpc = webinos.rpcHandler.createRPC(this, "listenAttr.subscribe", [options]);

        console.log("Subscribe listener: " + JSON.stringify(listener) + " with option: " + JSON.stringify(options));

        rpc.onNotification = function (obj) {
            // we were called back, now invoke the given listener
            listener.onEvent(obj);
            //webinos.rpcHandler.unregisterCallbackObject(rpc);
        };

        rpc.onCancel = function (obj) {
            // we were called back, now invoke the given listener
            listener.onCancel(obj);
            //webinos.rpcHandler.unregisterCallbackObject(rpc);
        };

        webinos.rpcHandler.registerCallbackObject(rpc);
        webinos.rpcHandler.executeRPC(rpc);
    }

}());
