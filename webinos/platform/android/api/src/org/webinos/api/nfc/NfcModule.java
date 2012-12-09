package org.webinos.api.nfc;

import org.meshpoint.anode.bridge.Env;
import org.meshpoint.anode.java.Base;
import org.webinos.api.ErrorCallback;

public abstract class NfcModule extends Base {
  private static short classId = Env.getInterfaceId(NfcModule.class);

  protected NfcModule() {
    super(classId);
  }

  public abstract boolean isNfcAvailable();

  public abstract void addTextTypeListener(NfcEventListener listener,
      ErrorCallback fail);

  public abstract void addUriTypeListener(String scheme,
      NfcEventListener listener, ErrorCallback fail);

  public abstract void addMimeTypeListener(String mimeType,
      NfcEventListener listener, ErrorCallback fail);
  
  public abstract void removeListener(NfcEventListener listener);

  public abstract NdefRecord textRecord(String lang, String text);

  public abstract NdefRecord uriRecord(String uri);

  public abstract NdefRecord mimeRecord(String mimeType, byte[] data);

  public abstract void log(String message);

}
