package org.webinos.api.mediacontent;

import java.util.Date;
import java.util.Map;

import org.meshpoint.anode.idl.Dictionary;

import android.provider.MediaStore;

public class MediaItem implements Dictionary {

  public static String MEDIATYPE_IMAGE = "IMAGE";
  public static String MEDIATYPE_VIDEO = "VIDEO";
  public static String MEDIATYPE_AUDIO = "AUDIO";
  public static String MEDIATYPE_UNKNOWN = "UNKNOWN";

  public String[] editableAttributes;

  @SingleDbFieldMapping(name = MediaStore.Files.FileColumns._ID, 
      translatorClass = "ToStringTranslator")
  public String id;

  @SingleDbFieldMapping(name = MediaStore.Files.FileColumns.MEDIA_TYPE, 
      translatorClass = "MediaTypeTranslator")
  public String type;

  @SingleDbFieldMapping(name = MediaStore.Files.FileColumns.MIME_TYPE)
  public String mimeType;

  @SingleDbFieldMapping(name = MediaStore.Files.FileColumns.TITLE)
  public String title;

  @SingleDbFieldMapping(name = MediaStore.Files.FileColumns.DATA)
  public String itemURI;

  public String[] thumbnailURIs;
  public Date releaseDate;

  @SingleDbFieldMapping(name = MediaStore.Files.FileColumns.DATE_MODIFIED, 
      translatorClass = "DateTranslator")
  public Date modifiedDate;

  @SingleDbFieldMapping(name = MediaStore.Files.FileColumns.SIZE)
  public long size;

  public String description;
  public float rating;

  public MediaItem() {
    this.editableAttributes = new String[0];
  }

  public MediaItem(Map<String, Object> valueSet) {
    super();

    if (valueSet.containsKey("id")) {
      this.id = (String) valueSet.get("id");
    }
    if (valueSet.containsKey("type")) {
      this.type = (String) valueSet.get("type");
    }
    if (valueSet.containsKey("mimeType")) {
      this.mimeType = (String) valueSet.get("mimeType");
    }
    if (valueSet.containsKey("title")) {
      this.title = (String) valueSet.get("title");
    }
    if (valueSet.containsKey("itemURI")) {
      this.itemURI = (String) valueSet.get("itemURI");
    }
    if (valueSet.containsKey("thumbnailURIs")) {
      this.thumbnailURIs = (String[]) valueSet.get("thumbnailURIs");
    }
    if (valueSet.containsKey("releaseDate")) {
      this.releaseDate = (Date) valueSet.get("releaseDate");
    }
    if (valueSet.containsKey("modifiedDate")) {
      this.modifiedDate = (Date) valueSet.get("modifiedDate");
    }
    if (valueSet.containsKey("size")) {
      this.size = (Long) valueSet.get("size");
    }
    if (valueSet.containsKey("rating")) {
      this.rating = (Float) valueSet.get("rating");
    }
  }
}
