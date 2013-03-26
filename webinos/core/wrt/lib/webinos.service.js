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

(function(exports) {

    var WebinosService = function (obj) {
        this.base = RPCWebinosService;
        this.base(obj);
    };
    WebinosService.prototype = new RPCWebinosService;

    WebinosService.prototype.state = {};
    WebinosService.prototype.icon = '';

    // stub implementation in case a service module doesn't provide its own bindService
    WebinosService.prototype.bindService = function(bindCB) {
        if (typeof bindCB === 'undefined') return;

        if (typeof bindCB.onBind === 'function') {
            bindCB.onBind(this);
        }
    };
    WebinosService.prototype.bind = WebinosService.prototype.bindService;

    WebinosService.prototype.unbind = function(){};

    exports.WebinosService = WebinosService;

})(window);
