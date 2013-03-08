package org.webinos.impl.mediacontent;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;

import org.webinos.api.mediacontent.MediaImage;
import org.webinos.api.mediacontent.MediaItem;

import android.provider.MediaStore;

interface Translator {
  Object getDbValue(Object attribValue);
  Object getAttribValue(Object dbValue);
  
  // Assumes one-to-one mapping
  static class MappingTranslator implements Translator {
    protected Map<Object, Object> mapping = new HashMap<Object, Object>();
    protected Object defaultValue;
    
    @Override
    public Object getDbValue(Object attribValue) {
      return mapping.containsKey(attribValue) ? mapping.get(attribValue)
          : getDbValue(defaultValue);
    }

    @Override
    public Object getAttribValue(Object dbValue) {
      for (Entry<Object, Object> entry : mapping.entrySet()) {
        Object val = entry.getValue();
        if (val.equals(dbValue)) {
          return entry.getKey();
        }
      }
      return defaultValue;
    }
  }

  static class OrientationTranslator extends MappingTranslator {
    public OrientationTranslator() {
      mapping.put(MediaImage.ORIENTATION_NORMAL, 0L);
      mapping.put(MediaImage.ORIENTATION_ROTATE_90, 90L);
      mapping.put(MediaImage.ORIENTATION_ROTATE_180, 180L);
      mapping.put(MediaImage.ORIENTATION_ROTATE_270, 270L);
      defaultValue = MediaImage.ORIENTATION_NORMAL;
    }
  }

  static class MediaTypeTranslator extends MappingTranslator {
    public MediaTypeTranslator() {
      mapping.put(MediaItem.MEDIATYPE_IMAGE, Long.valueOf(MediaStore.Files.FileColumns.MEDIA_TYPE_IMAGE));
      mapping.put(MediaItem.MEDIATYPE_VIDEO, Long.valueOf(MediaStore.Files.FileColumns.MEDIA_TYPE_VIDEO));
      mapping.put(MediaItem.MEDIATYPE_AUDIO, Long.valueOf(MediaStore.Files.FileColumns.MEDIA_TYPE_AUDIO));
      mapping.put(MediaItem.MEDIATYPE_UNKNOWN, Long.valueOf(MediaStore.Files.FileColumns.MEDIA_TYPE_NONE));
      defaultValue = MediaItem.MEDIATYPE_UNKNOWN;
    }
  }

  static class DateTranslator implements Translator {
    private int factor = 1000;
    
    public DateTranslator() {
    }
    
    public DateTranslator(int factor) {
      this.factor = factor;
    }
    
    @Override
    public Object getDbValue(Object attribValue) {
      return attribValue != null ? ((Date)attribValue).getTime() / factor : null;
    }

    @Override
    public Object getAttribValue(Object dbValue) {
      return dbValue != null ? new Date((Long)dbValue * factor) : null;
    }
  }

  public static class ToStringArrayTranslator implements Translator {
    @Override
    public Object getDbValue(Object attribValue) {
      return ((String[])attribValue)[0];
    }

    @Override
    public Object getAttribValue(Object dbValue) {
      return new String[] {dbValue != null ? dbValue.toString() : null};
    }
  }

  static class ToStringTranslator implements Translator {
    @Override
    public Object getDbValue(Object attribValue) {
      return attribValue != null ? String.valueOf(attribValue) : null;
    }

    @Override
    public Object getAttribValue(Object dbValue) {
      return dbValue != null ? dbValue.toString() : null;
    }
  }
}


