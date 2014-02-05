package org.webinos.impl.mediacontent;

import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

import org.webinos.api.mediacontent.CompositeDbFieldMapping;
import org.webinos.api.mediacontent.MediaAudio;
import org.webinos.api.mediacontent.MediaImage;
import org.webinos.api.mediacontent.MediaItem;
import org.webinos.api.mediacontent.MediaVideo;
import org.webinos.api.mediacontent.SingleDbFieldMapping;

class Mapping {

  public static abstract class DbField {
    private String attributeName;
    private Class<?> attributeType;
    
    public DbField(String attributeName, Class<?> attributeType) {
      this.attributeName = attributeName;
      this.attributeType = attributeType;
    }
    
    public String getAttributeName() {
      return attributeName;
    }
    public Class<?> getAttributeType() {
      return attributeType;
    }
  }
  
  final static class SingleDbField extends DbField {
    private String name;
    private Translator translator;

    public SingleDbField(SingleDbFieldMapping mapping) {
      this(null, null, mapping);
    }
    
    public SingleDbField(String attributeName, Class<?> attributeType, SingleDbFieldMapping mapping) {
      super(attributeName, attributeType);
      this.name = mapping.name();
      try {
        this.translator = (Translator) Class.forName("org.webinos.impl.mediacontent.Translator$" + mapping.translatorClass())
            .newInstance();
      } catch (Exception e) {
        e.printStackTrace();
      }
    }

    public String getName() {
      return name;
    }
    
    public Translator getTranslator() {
      return translator;
    }
  }

  final static class CompositeDbField extends DbField {
    private SingleDbField[] dbFields;
    private CompositeHandler compositeHandler;

    public CompositeDbField(String attributeName, Class<?> attributeType, CompositeDbFieldMapping mapping) {
      super(attributeName, attributeType);
      this.dbFields = new SingleDbField[mapping.fields().length];
      int i = 0;
      for (SingleDbFieldMapping singleDbFieldMapping : mapping.fields()) {
        this.dbFields[i++] = new SingleDbField(singleDbFieldMapping);
      }
      try {
        this.compositeHandler = (CompositeHandler) Class.forName(
            "org.webinos.impl.mediacontent.CompositeHandler$" + mapping.compositeHandlerClass()).newInstance();
      } catch (Exception e) {
        // This should not happen since it would indicate a erroneous annotation
        // in the API.
      }
    }

    public SingleDbField[] getDbFields() {
      return dbFields;
    }

    public CompositeHandler getCompositeHandler() {
      return compositeHandler;
    }
  }
  
  private static Map<String, DbField> dbMeta = new HashMap<String, DbField>();
  
  private static void scanForMappings(Class<?>[] classesToScan) {
    for (Class<?> clazz : classesToScan) {
      for (Field attribute : clazz.getFields()) {
        SingleDbFieldMapping singleDbFieldMapping = (SingleDbFieldMapping) attribute
            .getAnnotation(SingleDbFieldMapping.class);
        if (singleDbFieldMapping != null) {
          if (!dbMeta.containsKey(attribute.getName())) {
            dbMeta.put(attribute.getName(),
                new SingleDbField(attribute.getName(), attribute.getType(),
                    singleDbFieldMapping));
          }
        } else {
          CompositeDbFieldMapping compositeDbFieldMapping = (CompositeDbFieldMapping) attribute
              .getAnnotation(CompositeDbFieldMapping.class);
          if (compositeDbFieldMapping != null) {
            if (!dbMeta.containsKey(attribute.getName())) {
              dbMeta.put(attribute.getName(),
                  new CompositeDbField(attribute.getName(),
                      attribute.getType(), compositeDbFieldMapping));
            }
          }
        }
      }
    }
  }

  public static void init() {
    Class<?>[] classesToScan = new Class<?>[] {MediaItem.class, MediaAudio.class, MediaImage.class, MediaVideo.class};
    scanForMappings(classesToScan);
  }

  public static String[] getAttributes() {
    return dbMeta.keySet().toArray(new String[dbMeta.size()]);
  }
  
  public static DbField getDbField(String attributeName) {
    return dbMeta.get(attributeName);
  }
  
  public static String[] getProjection() {
    String[] projection = new String[dbMeta.size()];
    int i = 0;
    for (DbField dbField : dbMeta.values()) {
      if (dbField instanceof SingleDbField) {
        projection[i] = ((SingleDbField) dbField).getName();
      } else if (dbField instanceof CompositeDbField) {
        for (SingleDbField singleDbField : ((CompositeDbField) dbField)
            .getDbFields()) {
          projection[i] = singleDbField.getName();
        }
      }
      i++;
    }
    return projection;
  }
}
