package org.webinos.api.mediacontent;

import java.util.Map;

import org.meshpoint.anode.idl.Dictionary;

import android.provider.MediaStore;

public class MediaAudio extends MediaItem implements Dictionary {

  @SingleDbFieldMapping(name = MediaStore.Images.ImageColumns.ORIENTATION, 
      translatorClass = "OrientationTranslator")
  public String album;
  
  public String[] genres;
  
  @SingleDbFieldMapping(name = MediaStore.Audio.AudioColumns.ARTIST, 
      translatorClass = "ToStringArrayTranslator")
  public String[] artists;
  
  @SingleDbFieldMapping(name = MediaStore.Audio.AudioColumns.COMPOSER, 
      translatorClass = "ToStringArrayTranslator")
  public String[] composers;
  
  public MediaLyrics lyrics;
  public String copyright;
  public long bitrate;
  
  @SingleDbFieldMapping(name = MediaStore.Audio.AudioColumns.TRACK)
  public int trackNumber;
  
  @SingleDbFieldMapping(name = MediaStore.Audio.AudioColumns.DURATION)
  public long duration;
  
  public long playedTime;
  public long playCount;
  
  public MediaAudio() {
    super();
  }
  
  public MediaAudio(Map<String, Object> valueSet) {
    super(valueSet);

    if (valueSet.containsKey("album")) {
      this.album = (String) valueSet.get("album");
    }
    if (valueSet.containsKey("genres")) {
      this.genres = (String[]) valueSet.get("genres");
    }
    if (valueSet.containsKey("artists")) {
      this.artists = (String[]) valueSet.get("artists");
    }
    if (valueSet.containsKey("composers")) {
      this.composers = (String[]) valueSet.get("composers");
    }

    // this.lyrics = (String)valueSet.get("lyrics");

    if (valueSet.containsKey("copyright")) {
      this.copyright = (String) valueSet.get("copyright");
    }
    if (valueSet.containsKey("bitrate")) {
      this.bitrate = (Long) valueSet.get("bitrate");
    }
    if (valueSet.containsKey("trackNumber")) {
      this.trackNumber = ((Long) valueSet.get("trackNumber")).intValue();
    }
    if (valueSet.containsKey("duration")) {
      this.duration = (Long) valueSet.get("duration");
    }
    if (valueSet.containsKey("playedTime")) {
      this.playedTime = (Long) valueSet.get("playedTime");
    }
    if (valueSet.containsKey("playCount")) {
      this.playCount = (Long) valueSet.get("playCount");
    }
  }

}
