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
    this.findItem = function (successCB, errorCB, params) {
      "use strict";
      var rpc = webinos.rpcHandler.createRPC(this, "findItem", params);
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

    this.getContents = function (listener, errorCB, params) {
      "use strict";
      var rpc = webinos.rpcHandler.createRPC(this, "getContents", params);//, totalBuffer = 0, data = "";
      rpc.onEvent = function (params) {
        // we were called back, now invoke the given listener
     /*   totalBuffer += params.currentBuffer;
        data += btoa(params.contents);
        if (totalBuffer === params.totalLength) {
          //photo = new Buffer(data, 'binary').toString('base64');
          window.open("data:image/png;base64"+atob(data));*/
        listener(params);
          //totalBuffer = 0;
          //data = '';
          //webinos.rpcHandler.unregisterCallbackObject(rpc);
        //}
      };

      webinos.rpcHandler.registerCallbackObject(rpc);
      webinos.rpcHandler.executeRPC(rpc);
      /*webinos.rpcHandler.executeRPC(rpc,
        function (params) {
          totalBuffer += params.currentBuffer;
          if (totalBuffer === params.totalLength) {
            successCB(params);
            totalBuffer = 0;
          }
        },
        function (error) {
          errorCB(error);
        }
        );*/
    };
  };
}());
