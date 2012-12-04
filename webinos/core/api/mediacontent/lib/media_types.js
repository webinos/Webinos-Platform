var MediaFolderType = Object.freeze({ "INTERNAL": 0, "EXTERNAL": 1, "UNKNOWN": 2});
var MediaItemType = Object.freeze({ "IMAGE":0, "VIDEO": 1, "AUDIO": 2, "UNKNOWN": 3 });
var MediaLyricsType = Object.freeze({ "SYNCHRONIZED": 0, "UNSYNCHRONIZED": 1 });
var MediaImageOrientation = Object.freeze({ "NORMAL": 0, "FLIP_HORIZONTAL": 1, "ROTATE_180": 2, "FLIP_VERTICAL": 3,
                                            "TRANSPOSE": 4, "ROTATE_90": 5, "TRANSVERSE": 6, "ROTATE_270": 7 });
var FilterMatchFlag = Object.freeze({ "EXACTLY": 0, "FULLSTRING": 1, "CONTAINS": 2, "STARTSWITH": 3, "ENDSWITH": 4,
                                      "EXISTS": 5 });
var SortModeOrder = Object.freeze({ "ASC": 0, "DESC": 1 });
var CompositeFilterType = Object.freeze({ "UNION": 0, "INTERSECTION": 1 });
var MediaFolderId = String;

var MediaFolder = function () {
  "use strict";
  return {
    id: MediaFolderId,
    folderURI: "",
    title: "",
    storageType: MediaFolderType.INTERNAL,
    modifiedData: new Date()
  };
};

var MediaItem = function () {
  "use strict";
  return {
    editableAttributes: [],
    id: "",
    type: MediaFolderType.INTERNAL,
    mimeType: "",
    title: "",
    itemURI: "",
    thumbnailURIs: [],
    releaseDate: new Date(),
    modifiedDate: new Date(),
    size: 0,
    description: "",
    rating: 0
  };
};

var MediaVideo =  function () {
  "use strict";
  return {
    geolocation: "",
    album: "",
    artists: [],
    duration: 0,
    width: 0,
    height: 0,
    playedTime: 0,
    playCount: 0
  };
};

MediaVideo.prototype = new MediaItem();

var MediaLyrics = function () {
  "use strict";
  return {
    type: MediaLyricsType.SYNCHRONIZED,
    timestamp: [],
    texts: []
  };

};

var MediaAudio = function () {
  "use strict";
  return {
    album: "",
    genres: [],
    artists: [],
    composers: [],
    lyrics: MediaLyrics,
    copyright: "",
    bitrate: 0,
    trackNumber: 0,
    duration: 0,
    playedTime: 0,
    playCount: 0
  };
};
MediaAudio.prototype = new MediaItem();

var MediaImage = function () {
  "use strict";
  return {
    geolocation: "",
    width: "",
    height: "",
    orientation: MediaImageOrientation.NORMAL
  };
};

MediaImage.prototype = new MediaItem();

var Media = function () {
  "use strict";
  return {
    content: ""
  };
};

Media.prototype = new MediaItem();

this.MediaImage  = MediaImage;
this.MediaAudio  = MediaAudio;
this.MediaVideo  = MediaVideo;
this.MediaItem   = MediaItem;
this.MediaFolder = MediaFolder;
this.MediaFolderType = MediaFolderType;
this.Media      = Media;