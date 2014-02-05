package org.webinos.api.mediacontent;

import java.util.Map;

import android.provider.MediaStore;

public class MediaVideo extends MediaItem {
  
  @CompositeDbFieldMapping(compositeHandlerClass = "GeoCompositor", 
      fields = { @SingleDbFieldMapping(name = MediaStore.Images.ImageColumns.LATITUDE), 
                 @SingleDbFieldMapping(name = MediaStore.Images.ImageColumns.LONGITUDE) })
  public SimpleCoordinates geolocation;
  
  @SingleDbFieldMapping(name = MediaStore.Audio.AudioColumns.ALBUM)
  public String album;
  
  @SingleDbFieldMapping(name = MediaStore.Audio.AudioColumns.ARTIST, 
      translatorClass = "ToStringArrayTranslator")
  public String[] artists;
  
  @SingleDbFieldMapping(name = MediaStore.Video.VideoColumns.DURATION)
  public long duration;
  
  //@SingleDbFieldMapping(name = MediaStore.Files.FileColumns.WIDTH)
  public long width;
  
  //@SingleDbFieldMapping(name = MediaStore.Files.FileColumns.HEIGHT)
  public long height;
  
  public long playedTime;
  public long playCount;
  
  public MediaVideo() {
    super();
  }

  public MediaVideo(Map<String, Object> valueSet) {
    super(valueSet);

    if (valueSet.containsKey("geolocation")) {
      this.geolocation = (SimpleCoordinates) valueSet.get("geolocation");
    }
    if (valueSet.containsKey("album")) {
      this.album = (String) valueSet.get("album");
    }
    if (valueSet.containsKey("artists")) {
      this.artists = (String[]) valueSet.get("artists");
    }
    if (valueSet.containsKey("duration")) {
      this.duration = (Long) valueSet.get("duration");
    }
    if (valueSet.containsKey("width")) {
      this.width = (Long) valueSet.get("width");
    }
    if (valueSet.containsKey("height")) {
      this.height = (Long) valueSet.get("height");
    }
    if (valueSet.containsKey("playedTime")) {
      this.playedTime = (Long) valueSet.get("playedTime");
    }
    if (valueSet.containsKey("playCount")) {
      this.playCount = (Long) valueSet.get("playCount");
    }
  }
  
}
