package org.webinos.api.nfc;

import org.meshpoint.anode.bridge.Env;
import org.meshpoint.anode.java.Base;
import org.meshpoint.anode.js.JSObjectArray;
import org.webinos.api.ErrorCallback;

public abstract class NfcModule extends Base {
  private static short classId = Env.getInterfaceId(NfcModule.class);

  protected NfcModule() {
    super(classId);
  }

  public abstract void setListener(NfcEventListener listener);

  public abstract boolean isNfcAvailable();
  
  public abstract boolean isNfcPushAvailable();

  public abstract void addTextTypeFilter(ErrorCallback fail);

  public abstract void addUriTypeFilter(String scheme, ErrorCallback fail);

  public abstract void addMimeTypeFilter(String mimeType, ErrorCallback fail);

  public abstract void removeTextTypeFilter(ErrorCallback fail);

  public abstract void removeUriTypeFilter(String scheme, ErrorCallback fail);

  public abstract void removeMimeTypeFilter(String mimeType,
      ErrorCallback fail);

  public abstract void shareTag(NdefRecord[] ndefMessage,  ErrorCallback fail);
  
  public abstract void unshareTag(ErrorCallback fail);

  public abstract void log(String message);

}