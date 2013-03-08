package org.webinos.api.mediacontent;

import java.util.Date;

import org.meshpoint.anode.idl.Dictionary;

public class MediaFolder implements Dictionary {

  public static String STORAGE_TYPE_INTERNAL = "INTERNAL";
  public static String STORAGE_TYPE_EXTERNAL = "EXTERNAL";
  public static String STORAGE_TYPE_UNKNOWN = "UNKNOWN";
  
  public String id;
  public String folderURI;
  public String title;
  public String storageType;
  public Date modifiedDate;
  
  public MediaFolder() {
    
  }
  
  public MediaFolder(String id, String uri, String title, String storageType,
      Date modifiedDate) {
    this.id = id;
    this.folderURI = uri;
    this.title = title != null ? title: uri;
    this.storageType = storageType;
    this.modifiedDate = modifiedDate;
  }
}
