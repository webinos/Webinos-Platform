package org.webinos.impl.nfc;

import java.io.IOException;

import org.meshpoint.anode.java.ByteArray;
import org.webinos.api.DeviceAPIError;
import org.webinos.api.ErrorCallback;
import org.webinos.api.PendingOperation;
import org.webinos.api.SuccessCallback;
import org.webinos.api.nfc.NdefRecord;
import org.webinos.api.nfc.NfcTagTechnologyNdef;

public class NfcTagTechnologyNdefImpl extends NfcTagTechnologyNdef {

  private class PendingOperationImpl extends PendingOperation {
    @Override
    public void cancel() {
      close();
    }
  }
  
  private android.nfc.tech.Ndef androidNdefTech;
  
  public NfcTagTechnologyNdefImpl(android.nfc.tech.Ndef androidNdefTech) {
    this.androidNdefTech = androidNdefTech;
  }
  
  @Override
  public PendingOperation makeReadOnly(SuccessCallback successCallback,
      ErrorCallback errorCallback) {
    if (errorCallback != null) {
      errorCallback.onerror(new DeviceAPIError(NfcException.UNSUPPORTED_ERR,
          "Not implemented"));
    }
    return new PendingOperationImpl();
  }

  @Override
  public NdefRecord[] readCachedNdefMessage() {
    return createNdefMessage(androidNdefTech.getCachedNdefMessage());
  }

  @Override
  public PendingOperation readNdefMessage(SuccessCallback successCallback,
      ErrorCallback errorCallback) {
    if (errorCallback != null) {
      errorCallback.onerror(new DeviceAPIError(NfcException.UNSUPPORTED_ERR,
          "Not implemented"));
    }
    return new PendingOperationImpl();
  }

  @Override
  public PendingOperation writeNdefMessage(SuccessCallback successCallback,
      ErrorCallback errorCallback, NdefRecord[] message) {
    if (errorCallback != null) {
      errorCallback.onerror(new DeviceAPIError(NfcException.UNSUPPORTED_ERR,
          "Not implemented"));
    }
    return new PendingOperationImpl();
  }

  @Override
  public void close() {
    try {
      androidNdefTech.close();
    } catch (IOException e) {
    }
  }
  
  public static NdefRecord[] createNdefMessage(android.nfc.NdefMessage androidNdefMsg) {
    NdefRecord[] result = new NdefRecord[androidNdefMsg.getRecords().length];
    int i = 0;
    for (android.nfc.NdefRecord androidNdefRecord : androidNdefMsg.getRecords()) {
      result[i++] = createNdefRecord(androidNdefRecord);
    }
    return result;
  }
  
  public static NdefRecord createNdefRecord(android.nfc.NdefRecord androidNdefRecord) {
    return NfcManager.createNdefRecord(new String(androidNdefRecord.getId()),
        androidNdefRecord.getTnf(), new String(androidNdefRecord.getType()),
        androidNdefRecord.getPayload());
  }
}
