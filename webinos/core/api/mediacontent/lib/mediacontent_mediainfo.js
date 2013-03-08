
// sortMode and filter not implemented
function MediaContentMediaInfo () {
    var MediaType = require("./media_types.js");
    var os = require("os");
    var path = require("path");
    var fs = require("fs");

    function fetchMediaInfo(directoryPath, id, callback) {
        var child_process = require("child_process").exec;
        var xml2js = require('xml2js');
        child_process("mediainfo --Output=XML " + directoryPath, function(
                error, stderr, stdout) {
            if (!error) {
                var xmlParser = new xml2js.Parser(xml2js.defaults["0.2"]);
                xmlParser.parseString(stderr, function(err, xmlData) {
                    if (!err) {
                        callback(id, xmlData);
                    }
                });
            }
        });
    }
    
    this.getLocalFolders = function(params, successCB, errorCB) {
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
        mediaFolders = [ music, video, pictures ];
        for (i = 0; i < mediaFolders.length; i = i + 1) {
            stats = fs.statSync(mediaFolders[i]);
            if (stats.isDirectory()) {
                mediaFolder = new MediaType.MediaFolder();
                mediaFolder.id = stats.ino;
                mediaFolder.folderURI = mediaFolders[i];
                mediaFolder.title = mediaFolders[i].slice(mediaFolders[i]
                        .lastIndexOf("/") + 1, mediaFolders[i].length);
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
    
    this.findItem = function(params, successCB, errorCB) {
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
    
    /**
     * This functionality is not implemented as not supported in media info
     */
    this.updateItem = function (params, successCB, errorCB, item) {
    };
    
    /**
     * This functionality is not implemented as not supported in media info
     */
    this.updateItemsBatch = function (params, successCB, errorCB, items) {
    };
};

var mediaContentMediaInfo = new MediaContentMediaInfo();

exports.getLocalFolders = mediaContentMediaInfo.getLocalFolders;
exports.findItem = mediaContentMediaInfo.findItem;
exports.updateItem = mediaContentMediaInfo.updateItem;
exports.updateItemsBatch = mediaContentMediaInfo.updateItemsBatch;
