package org.webinos.api.mediacontent;

import java.util.Map;

import android.provider.MediaStore;

public class MediaImage extends MediaItem {

  public static String ORIENTATION_NORMAL = "NORMAL";
  public static String ORIENTATION_FLIP_HORIZONTAL = "FLIP_HORIZONTAL";
  public static String ORIENTATION_ROTATE_180 = "ROTATE_180";
  public static String ORIENTATION_FLIP_VERTICAL = "FLIP_VERTICAL";
  public static String ORIENTATION_TRANSPOSE = "TRANSPOSE";
  public static String ORIENTATION_ROTATE_90 = "ROTATE_90";
  public static String ORIENTATION_TRANSVERSE = "TRANSVERSE";
  public static String ORIENTATION_ROTATE_270 = "ROTATE_270";

  @CompositeDbFieldMapping(compositeHandlerClass = "GeoCompositor", 
      fields = { @SingleDbFieldMapping(name = MediaStore.Images.ImageColumns.LATITUDE), 
                 @SingleDbFieldMapping(name = MediaStore.Images.ImageColumns.LONGITUDE) })
  public SimpleCoordinates geolocation;
  
  //@SingleDbFieldMapping(name = MediaStore.Files.FileColumns.WIDTH)
  public long width;
  
  //@SingleDbFieldMapping(name = MediaStore.Files.FileColumns.HEIGHT)
  public long height;
  
  @SingleDbFieldMapping(name = MediaStore.Images.ImageColumns.ORIENTATION, 
      translatorClass = "OrientationTranslator")
  public String orientation;

  public MediaImage() {
    super();
  }
  
  public MediaImage(Map<String, Object> valueSet) {
    super(valueSet);
    
    if (valueSet.containsKey("geolocation")) {
      this.geolocation = (SimpleCoordinates) valueSet.get("geolocation");
    }
    if (valueSet.containsKey("width")) {
      this.width = (Long) valueSet.get("width");
    }
    if (valueSet.containsKey("height")) {
      this.height = (Long) valueSet.get("height");
    }
    if (valueSet.containsKey("orientation")) {
      this.orientation = (String) valueSet.get("orientation");
    }
  }

}
