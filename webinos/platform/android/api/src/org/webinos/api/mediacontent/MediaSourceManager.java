package org.webinos.api.mediacontent;

import org.meshpoint.anode.bridge.Env;
import org.meshpoint.anode.java.Base;

public abstract class MediaSourceManager extends Base {
  private static short classId = Env.getInterfaceId(MediaSourceManager.class);
  protected MediaSourceManager() { super(classId); }
  
  public abstract MediaSource getLocalMediaSource();
}
