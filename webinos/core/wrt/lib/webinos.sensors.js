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
* Copyright 2011 Alexander Futasz, Fraunhofer FOKUS
******************************************************************************/
(function() {

    /**
     * Webinos Sensor service constructor (client side).
     * @constructor
     * @param obj Object containing displayName, api, etc.
     */
    Sensor = function(obj) {
       this.base = WebinosService;
       this.base(obj);
    };
    Sensor.prototype = new WebinosService;
    
    /**
     * To bind the service.
     * @param bindCB BindCallback object.
     */
    Sensor.prototype.bind = function(bindCB) {
             
        var self = this;
        
        var rpc = webinos.rpcHandler.createRPC(this, "getStaticData", []);
        
        webinos.rpcHandler.executeRPC(rpc,
            function (result){
            
                self.maximumRange = result.maximumRange;
                self.minDelay = result.minDelay;
                self.power = result.power;
                self.resolution = result.resolution;
                self.vendor = result.vendor;  
                self.version = result.version; 
            
                if (typeof bindCB.onBind === 'function') {
                    bindCB.onBind(this);
                };
            },
            function (error){
                
            }
        );

    };
    
    Sensor.prototype.configureSensor = function(options) {
        var rpc = webinos.rpcHandler.createRPC(this, 'configureSensor', options);
        
        webinos.rpcHandler.registerCallbackObject(rpc);
        webinos.rpcHandler.executeRPC(rpc);
    };

    Sensor.prototype.addEventListener = function(eventType, eventHandler, capture) {
        var rpc = webinos.rpcHandler.createRPC(this, 'addEventListener', eventType);
        rpc.onEvent = function (sensorEvent) {
            eventHandler(sensorEvent);
        };
        webinos.rpcHandler.registerCallbackObject(rpc);
        webinos.rpcHandler.executeRPC(rpc);
    };


    Sensor.prototype.removeEventListener = function(eventType, eventHandler, capture) {
        var rpc = webinos.rpcHandler.createRPC(this, 'removeEventListener', eventType);
        webinos.rpcHandler.executeRPC(rpc);
    };

}());
