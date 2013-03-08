package org.webinos.api.mediacontent;

import org.meshpoint.anode.bridge.Env;
import org.meshpoint.anode.java.Base;

public abstract class MediaSource extends Base {
  private static short classId = Env.getInterfaceId(MediaSource.class);

  protected MediaSource() {
    super(classId);
  }

  public abstract void getFolders(MediaFolderSuccessCallback successCallback,
      MediaContentErrorCallback errorCallback);

  public abstract void findItems(MediaItemSuccessCallback successCallback,
      MediaContentErrorCallback errorCallback, String folderId,
      FilterValues filter, SortMode sortMode, long count, long offset);
}
