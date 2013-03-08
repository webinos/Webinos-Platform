function MediaContentAndroid () {

    var androidModule = require('bridge').load(
            'org.webinos.impl.mediacontent.MediaSourceManagerImpl', this);
    var localSource = androidModule.getLocalMediaSource();
    
    this.getLocalFolders = function(params, successCB, errorCB) {
        try {
            localSource.getFolders(successCB, errorCB);      
        } catch (err) {
            errorCB(err);
        }
    };
    
    this.findItem = function(params, successCB, errorCB) {
        try {
            localSource.findItems(function(mediaItemCollection) {
                var mediaItems = [];
                for ( var j = 0; j < mediaItemCollection.size; j++) {
                    if (mediaItemCollection.audios[j] != null) {
                        mediaItems[j] = mediaItemCollection.audios[j];
                    } else if (mediaItemCollection.images[j] != null) {
                        mediaItems[j] = mediaItemCollection.images[j];
                    } else if (mediaItemCollection.videos[j] != null) {
                        mediaItems[j] = mediaItemCollection.videos[j];
                    }
                }
                successCB(mediaItems);
            }, errorCB, params.folderId, params.filter, params.sortMode, 0, 0);
        } catch (err) {
            errorCB(err);
        }
    };
    
    /**
     * This functionality is not implemented.
     */
    this.updateItem = function (params, successCB, errorCB, item) {
    };
    
    /**
     * This functionality is not implemented.
     */
    this.updateItemsBatch = function (params, successCB, errorCB, items) {
    };
};

var mediaContent = new MediaContentAndroid();

exports.getLocalFolders = mediaContent.getLocalFolders;
exports.findItem = mediaContent.findItem;
exports.updateItem = mediaContent.updateItem;
exports.updateItemsBatch = mediaContent.updateItemsBatch;