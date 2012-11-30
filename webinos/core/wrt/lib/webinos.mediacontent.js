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
 * Copyright 2011 Habib Virji, Samsung Electronics (UK) Ltd
 ******************************************************************************/
(function () {
  /**
   * Webinos MediaContent service constructor (client side).
   * @constructor
   * @param obj Object containing displayName, api, etc.
   */
  MediaContentModule = function (obj) {
    this.base = WebinosService;
    this.base(obj);
  };

  MediaContentModule.prototype = new WebinosService;

  /**
   * To bind the service.
   * @param bindCB BindCallback object.
   */
  MediaContentModule.prototype.bindService = function (bindCB, serviceId) {
    this.getLocalFolders = function (successCB, errorCB) {
      var rpc = webinos.rpcHandler.createRPC(this, "getLocalFolders", []);
      webinos.rpcHandler.executeRPC(rpc,
        function (params) {
          successCB(params);
        },
        function (error) {
          errorCB(error);
        }
        );
    };
    this.findItem = function (successCB, errorCB) {
      "use strict";
      var rpc = webinos.rpcHandler.createRPC(this, "findItem", []);
      webinos.rpcHandler.executeRPC(rpc,
        function (params) {
          successCB(params);
        },
        function (error) {
          errorCB(error);
        }
        );
    };
    this.updateItem = function (successCB, errorCB) {
      "use strict";
      var rpc = webinos.rpcHandler.createRPC(this, "updateItem", []);
      webinos.rpcHandler.executeRPC(rpc,
        function (params) {
          successCB(params);
        },
        function (error) {
          errorCB(error);
        }
        );
    };

    this.updateItemsBatch = function (successCB, errorCB) {
      "use strict";
      var rpc = webinos.rpcHandler.createRPC(this, "updateItemBatches", []);
      webinos.rpcHandler.executeRPC(rpc,
        function (params) {
          successCB(params);
        },
        function (error) {
          errorCB(error);
        }
        );
    };


    if (typeof bindCB.onBind === 'function') {
      bindCB.onBind(this);
    }
  };
}());
