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

  var MediaType = require("./media_types.js"),
    os = require("os"),
    path = require("path"),
    child_process = require("child_process").exec,
    fs = require("fs"),
    WebinosMediaContentModule;

  function fetchMediaInfo(directoryPath, id, callback) {
    var xml2js = require('xml2json'), result;
    child_process("mediainfo --Output=XML " + directoryPath, function (error, stderr, stdout) {
      if (!error) {
        result = xml2js.toJson(stderr);
        callback(id, result);
      }
    });
  }

  WebinosMediaContentModule = function (rpcHandler, params) {
    // inherit from RPCWebinosService
    this.base = RPCWebinosService;
    this.base({
      api: 'http://webinos.org/api/mediacontent',
      displayName: 'MediaContent',
      description: 'MediaContent Module to view and get details about image/video/audio.'
    });
  };

  WebinosMediaContentModule.prototype = new RPCWebinosService;

  /**
   * This functionality is not implemented as not supported in media info
   * @param item
   */
  WebinosMediaContentModule.prototype.updateItem = function (params, successCB, errorCB, item) {

  };
  /**
   * This functionality is not implemented as not supported in media info
   * @param items
   * @successCB
   * @errorCB
   */
  WebinosMediaContentModule.prototype.updateItemsBatch = function (params, successCB, errorCB, items) {
  };

  WebinosMediaContentModule.prototype.getLocalFolders = function (params, successCB, errorCB) {
    var mediaFolder, i, list = [], stats, mediaFolders, music, video, pictures;
    if (os.type().toLowerCase() === "linux") {
      music = path.resolve(process.env.HOME, "Music");
      video = path.resolve(process.env.HOME, "Videos");
      pictures = path.resolve(process.env.HOME, "Pictures");
    } else if (os.type().toLowerCase() === "windows_nt") {
      music = path.resolve(process.env.userprofile, "My Music");
      video = path.resolve(process.env.userprofile, "My Videos");
      pictures = path.resolve(process.env.userprofile, "My Pictures");
    }
    mediaFolders = [music, video, pictures];
    for (i = 0; i < mediaFolders.length; i = i + 1) {
      stats = fs.statSync(mediaFolders[i]);
      if (stats.isDirectory()) {
        mediaFolder = new MediaType.MediaFolder();
        mediaFolder.id = stats.ino;
        mediaFolder.folderURI = mediaFolders[i];
        mediaFolder.title = mediaFolders[i].slice(mediaFolders[i].lastIndexOf("/") + 1, mediaFolders[i].length);
        mediaFolder.storageType = MediaType.MediaFolderType.INTERNAL;
        mediaFolder.modifiedDate = stats.ctime;
        list.push(mediaFolder);
      }
    }
    if (list.length === 0) {
      errorCB("UnknownError");
    } else {
      successCB(list);
    }
  };

  WebinosMediaContentModule.prototype.findItem = function (params, successCB, errorCB, folderId, filter, sortMode, count,
                                                           offset) {
    function success(list) {
      var i, count = 0, listSend = [];
      for (i = 0; i < list.length; i = i + 1) {
        fetchMediaInfo(list[i].folderURI, list[i].id, function (id, info) {
          var i, mediaItem,  title, result, current, data;
          result = JSON.parse(info);
          for (i = 0; i < result.Mediainfo.File.length; i = i + 1) {
            current =  result.Mediainfo.File[i];
            mediaItem = new MediaType.MediaItem();
            mediaItem.id = id;
            mediaItem.type = current.track[1].type;
            mediaItem.mimeType = current.track[0].Format || "";
            title = current.track[0].Complete_name.slice(current.track[0].Complete_name.lastIndexOf("/") + 1,
              current.track[0].Complete_name.length) || "";
            mediaItem.title = title.replace(/&#(\d+);/g, function (m, n) { return String.fromCharCode(n); });
            mediaItem.itemURI = (current.track[0].Complete_name.replace(/&#(\d+);/g, function (m, n) { return String.fromCharCode(n); }) || "");
            mediaItem.thumbnailURIs = "";
            mediaItem.releaseDate = current.track[0].Tagged_date || 0;
            mediaItem.modifiedDate = current.track[0].Encoded_date || 0;
            mediaItem.size = current.track[0].File_size || 0;
            mediaItem.description = current.track[0].Comment || "";
            mediaItem.rating = "";
            if (current.track[1].type === "Audio") {
              mediaItem.album = current.track[0].Album;
              mediaItem.genres = "";
              mediaItem.artists = current.track[0].Performer;
              mediaItem.composers = current.track[0].Performer;
              mediaItem.lyrics = "";
              mediaItem.copyright = "";
              mediaItem.bitrate = current.track[1].Bit_rate;
              mediaItem.trackNumber = current.track[0].Track_name_Position;
              mediaItem.duration = current.track[1].Duration;
              mediaItem.playedTime = 0;
              mediaItem.playCount = 0;
              mediaItem.editableAttributes = [mediaItem.playedTime, mediaItem.playCount];
            } else if (current.track[1].type === "Video") {
              mediaItem.geolocation = "";
              mediaItem.album = current.track[0].Album || '';
              mediaItem.artists = current.track[0].Performer || '';
              mediaItem.duration = current.track[1].Duration || '';
              mediaItem.width = current.track[1].Width || 0;
              mediaItem.height = current.track[1].Height || 0;
              mediaItem.playedTime = 0;
              mediaItem.playCount = 0;
              mediaItem.editableAttributes = [mediaItem.playedTime, mediaItem.playCount];
            } else if (current.track[1].type === "Image") {
              /*try {
                data = fs.readFileSync(current.track[0].Complete_name);
                mediaItem = data;
              } catch (err) {

              }*/
              mediaItem.geolocation = "";
              mediaItem.width = current.track[1].Width;
              mediaItem.height = current.track[1].Height;
              mediaItem.editableAttributes = [];
            }
            listSend.push(mediaItem);
          }
          count = count + 1;
          if (count === list.length) {
            successCB(listSend);
          }
        });
      }
    }
    this.getLocalFolders([], success, errorCB);
  };
  // export our object
  exports.Service = WebinosMediaContentModule;
}());
