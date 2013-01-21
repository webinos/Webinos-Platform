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
    WebinosMediaContentModule,
    RPCWebinosService = require('webinos-jsonrpc2').RPCWebinosService;

  function fetchMediaInfo(directoryPath, id, callback) {
    var xml2js = require('xml2js');
    child_process("mediainfo --Output=XML " + directoryPath, function (error, stderr, stdout) {
      if (!error) {
        var xmlParser = new xml2js.Parser(xml2js.defaults["0.2"]);
        xmlParser.parseString(stderr, function(err, xmlData) {
          if(!err){
            callback(id, xmlData);
          }
        });
      }
    });
  }

  WebinosMediaContentModule = function (rpcHandler, params) {
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

  // sortMode and filter not implemented
  WebinosMediaContentModule.prototype.findItem = function (params, successCB, errorCB) {
    //folderId, filter, sortMode,count, offset
    function success(list) {
      var i, countTotal = 0, listSend = [], dirName;
      for (i = 0; i < list.length; i = i + 1) {
        if (params.folderId) {
          if (list[i].id === parseInt(params.folderId, 10)) {
            dirName = list[i].folderURI;
          } else {
            continue;
          }
        } else {
          dirName = list[i].folderURI;
        }
        fetchMediaInfo(dirName, list[i].id, function (id, result) {
          var i = 0, mediaItem,  title, result, current, data, track;
          if (params.offset) {
            i = parseInt(params.offset, 10);
          }
          while (i < result.Mediainfo.File.length) {
            current =  result.Mediainfo.File[i];
            track = current.track[0] || current.track;
            i = i + 1;
            mediaItem = new MediaType.MediaItem();
            mediaItem.id = id;
            mediaItem.type = (current.track && current.track[1] && current.track[1].$["type"]) ||
                (track.Format && track.Format[0]) ||
                (current.track && current.track[1]&& current.track[1].Format && current.track[1].Format[0]) ||
                "";
            mediaItem.mimeType = (track.Format && track.Format[0]) || "";
            title = track.Complete_name && track.Complete_name[0].slice(track.Complete_name[0].lastIndexOf("/") + 1, track.Complete_name[0].length) || "";
            mediaItem.title = title || "";
            mediaItem.itemURI = (track.Complete_name && track.Complete_name[0]) || "";
              //.replace(/&#(\d+);/g,function (m, n) { return String.fromCharCode(n); })
            mediaItem.thumbnailURIs = "";
            mediaItem.releaseDate = (track.Recorded_date && track.Recorded_date[0]) || 0;
            mediaItem.modifiedDate = (track.Encoded_date && track.Encoded_date[0])|| 0;
            mediaItem.size = (track.File_size && track.File_size[0]) || 0;
            mediaItem.description = (track.Comment && track.Comment[0])|| "";
            mediaItem.rating = "";
            if (current.track && current.track[1] && current.track[1].$["type"] === "Audio") {
              mediaItem.album = (track.Album && track.Album[0]) || "";
              mediaItem.genres = "";
              mediaItem.artists = (track.Performer && track.Performer[0]) || "";
              mediaItem.composers = (track.Performer && track.Performer[0]) || "";
              mediaItem.lyrics = "";
              mediaItem.copyright = "";
              mediaItem.bitrate = (track.Overall_bit_rate && track.Overall_bit_rate[0]) || "";
              mediaItem.trackNumber = (track.Track_name_Position && track.Track_name_Position[0]) || "";
              mediaItem.duration = (track.Duration && track.Duration[0]) || "";
              mediaItem.playedTime = 0;
              mediaItem.playCount = 0;
              mediaItem.editableAttributes = [mediaItem.playedTime, mediaItem.playCount];
            } else if (current.track && current.track[1] && current.track[1].$["type"] === "Video") {
              mediaItem.geolocation = "";
              mediaItem.album = (track.Album && track.Album[0]) || '';
              mediaItem.artists = (track.Performer && track.Performer[0]) || '';
              mediaItem.duration = (current.track && current.track[1] && current.track[1].Duration)|| '';
              mediaItem.width = (current.track && current.track[1] && current.track[1].Width) || 0;
              mediaItem.height = (current.track && current.track[1] && current.track[1].Height) || 0;
              mediaItem.playedTime = 0;
              mediaItem.playCount = 0;
              mediaItem.editableAttributes = [mediaItem.playedTime, mediaItem.playCount];
            } else if (current.track && current.track[1] && current.track[1].$["type"] === "Image") {
              mediaItem.geolocation = "";
              mediaItem.width = (current.track && current.track[1] && current.track[1].Width[0]) || 0;
              mediaItem.height = (current.track && current.track[1] && current.track[1].Height[0]) || 0;
              mediaItem.editableAttributes = [];
            }
            listSend.push(mediaItem);
            if (params.fileName && params.fileName === title) {
              return successCB(mediaItem);
            }
            if (params.count && i === parseInt(params.count, 10)) {
              return successCB(listSend);
            }
          }
          countTotal = countTotal + 1;
          if (countTotal === list.length) {
            return successCB(listSend);
          } else if (params.count || params.offset || params.folderId) {
            return successCB(listSend);
          }
        });
      }
    }
    this.getLocalFolders([], success, errorCB);
  };

  WebinosMediaContentModule.prototype.getContents = function (params, successCB, errorCB, objectRef) {
    var self = this;
    //params.type, params.fileName
    function success(mediaContents) {
      var photo, media = new MediaType.Media(), readStream, fileSize, rpc, buf = [];
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
