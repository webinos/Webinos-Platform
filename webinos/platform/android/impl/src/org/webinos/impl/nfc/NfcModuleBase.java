package org.webinos.impl.nfc;

import org.webinos.api.DeviceAPIError;
import org.webinos.api.ErrorCallback;
import org.webinos.api.nfc.NdefRecord;
import org.webinos.api.nfc.NfcEventListener;
import org.webinos.api.nfc.NfcModule;

public abstract class NfcModuleBase extends NfcModule {
  
  protected NfcManager nfcMgr;
  
  public NfcModuleBase() {
    nfcMgr = NfcManager.getInstance();
  }
  
  @Override
  public NdefRecord textRecord(String lang, String text) {
    return NfcManager.createTextNdefRecord(lang, text);
  }
  
  @Override
  public NdefRecord uriRecord(String uri) {
    return NfcManager.createUriNdefRecord(uri);
  }
  
  @Override
  public NdefRecord mimeRecord(String mimeType, byte[] data) {
    return NfcManager.createMimeNdefRecord(mimeType, data);
  }
  
  @Override
  public void addTextTypeListener(NfcEventListener listener, ErrorCallback fail) {
    try {
      checkNfcAvailability();
      nfcMgr.addTextTypeListener(listener);
    } catch (NfcException e) {
      fail.onerror(translateException(e));
    }
  }

  @Override
  public void addUriTypeListener(String scheme, NfcEventListener listener, ErrorCallback fail) {
    try {
      checkNfcAvailability();
      nfcMgr.addUriTypeListener(scheme, listener);
    } catch (NfcException e) {
      fail.onerror(translateException(e));
    }
  }

  @Override
  public void addMimeTypeListener(String mimeType,
      NfcEventListener listener, ErrorCallback fail) {
    try {
      checkNfcAvailability();
      nfcMgr.addMimeTypeListener(mimeType, listener);
    } catch (NfcException e) {
      fail.onerror(translateException(e));
    }
  }
  
  public void removeListener(NfcEventListener listener) {
    nfcMgr.removeListener(listener);
  }
  
  private void checkNfcAvailability() throws NfcException {
    if (!isNfcAvailable()) {
      throw new NfcException(NfcException.UNSUPPORTED_ERR, "NFC is not supported on this device");
    }
  }
  
  private DeviceAPIError translateException(NfcException e) {
    switch (e.code) {
    case NfcException.UNKNOWN_ERR:
      return new DeviceAPIError(DeviceAPIError.UNKNOWN_ERR, e.getMessage());
    case NfcException.UNSUPPORTED_ERR:
      return new DeviceAPIError(DeviceAPIError.NOT_SUPPORTED_ERR,
          e.getMessage());
    case NfcException.IO_ERR:
      return new DeviceAPIError(DeviceAPIError.IO_ERR, e.getMessage());
    default:
      return new DeviceAPIError(DeviceAPIError.UNKNOWN_ERR, e.getMessage());
    }
  }
  
  @Override
  public void log(String message) {
    System.out.println("[NfcModuleBase] " + message);
  }
}
