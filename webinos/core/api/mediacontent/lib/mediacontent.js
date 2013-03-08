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
* Copyright 2012 Habib Virji, Samsung Electronics (UK) Ltd
 ******************************************************************************/
(function () {
  "use strict";

  var RPCWebinosService = require('webinos-jsonrpc2').RPCWebinosService;
  var mediaContentMediaInfo;
  if (process.platform == 'android') {
      mediaContentMediaInfo = require('./mediacontent_android.js');
  } else {
      mediaContentMediaInfo = require('./mediacontent_mediainfo.js');
  }

  var WebinosMediaContentModule = function (rpcHandler, params) {
    this.rpcHandler = rpcHandler;
    // inherit from RPCWebinosService
    this.base = RPCWebinosService;
    this.base({
      api: 'http://webinos.org/api/mediacontent',
      displayName: 'MediaContent',
      description: 'MediaContent Module to view and get details about image/video/audio.'
    });
  };

  WebinosMediaContentModule.prototype = new RPCWebinosService;

  WebinosMediaContentModule.prototype.updateItem = function (params, successCB, errorCB, item) {
      mediaContentMediaInfo.updateItem(params, successCB, errorCB, item);
  };

  WebinosMediaContentModule.prototype.updateItemsBatch = function (params, successCB, errorCB, items) {
      mediaContentMediaInfo.updateItemsBatch(params, successCB, errorCB, items);
  };

  WebinosMediaContentModule.prototype.getLocalFolders = function (params, successCB, errorCB) {
      mediaContentMediaInfo.getLocalFolders(params, successCB, errorCB);
  };

  WebinosMediaContentModule.prototype.findItem = function (params, successCB, errorCB) {
      mediaContentMediaInfo.findItem(params, successCB, errorCB);
  };

  WebinosMediaContentModule.prototype.getContents = function (params, successCB, errorCB, objectRef) {
    var self = this;
    //params.type, params.fileName
    function success(mediaContents) {
      var MediaType = require("./media_types.js");
      var fs = require("fs");
      var media = new MediaType.Media(), readStream, rpc, buf = [];
      media = mediaContents;
      readStream = fs.createReadStream(media.itemURI);
      readStream.on("data", function (data) {
        buf.push(data);
      });
      readStream.on("end", function (data) {
        var complete_image = Buffer.concat(buf);
        media.contents = complete_image.toString("base64");
        rpc = self.rpcHandler.createRPC(objectRef, 'onEvent', media);
        self.rpcHandler.executeRPC(rpc);
        readStream.destroy();
      });
    }
    this.findItem(params, success, errorCB);
  };
  
  // export our object
  exports.Service = WebinosMediaContentModule;
}());
