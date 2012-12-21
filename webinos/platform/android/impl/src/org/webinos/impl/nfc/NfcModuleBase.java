package org.webinos.impl.nfc;

import org.webinos.api.DeviceAPIError;
import org.webinos.api.ErrorCallback;
import org.webinos.api.nfc.NdefRecord;
import org.webinos.api.nfc.NfcEventListener;
import org.webinos.api.nfc.NfcModule;
import org.webinos.impl.nfc.NfcManager.NfcDiscoveryListener;

public abstract class NfcModuleBase extends NfcModule implements
    NfcDiscoveryListener {

  protected NfcManager nfcMgr;
  protected NfcEventListener mNfcEventListener;

  public NfcModuleBase() {
    nfcMgr = NfcManager.getInstance();
  }

  public void setListener(NfcEventListener listener) {
    mNfcEventListener = listener;
    if (mNfcEventListener != null) {
      nfcMgr.addListener(this);
    } else {
      nfcMgr.removeListener(this);
    }
  }

  @Override
  public void addTextTypeFilter(ErrorCallback fail) {
    try {
      checkNfcAvailability();
      nfcMgr.addTextTypeFilter();
    } catch (NfcException e) {
      fail.onerror(translateException(e));
    }
  }

  @Override
  public void addUriTypeFilter(String scheme, ErrorCallback fail) {
    try {
      checkNfcAvailability();
      nfcMgr.addUriTypeFilter(scheme);
    } catch (NfcException e) {
      fail.onerror(translateException(e));
    }
  }

  @Override
  public void addMimeTypeFilter(String mimeType, ErrorCallback fail) {
    try {
      checkNfcAvailability();
      nfcMgr.addMimeTypeFilter(mimeType);
    } catch (NfcException e) {
      fail.onerror(translateException(e));
    }
  }

  @Override
  public void removeTextTypeFilter(ErrorCallback fail) {
    try {
      checkNfcAvailability();
      nfcMgr.removeTextTypeFilter();
    } catch (NfcException e) {
      fail.onerror(translateException(e));
    }
  }

  @Override
  public void removeUriTypeFilter(String scheme, ErrorCallback fail) {
    try {
      checkNfcAvailability();
      nfcMgr.removeUriTypeFilter(scheme);
    } catch (NfcException e) {
      fail.onerror(translateException(e));
    }
  }

  @Override
  public void removeMimeTypeFilter(String mimeType, ErrorCallback fail) {
    try {
      checkNfcAvailability();
      nfcMgr.addMimeTypeFilter(mimeType);
    } catch (NfcException e) {
      fail.onerror(translateException(e));
    }
  }

  private void checkNfcAvailability() throws NfcException {
    if (!isNfcAvailable()) {
      throw new NfcException(NfcException.UNSUPPORTED_ERR,
          "NFC is not supported on this device");
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
