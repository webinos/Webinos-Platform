package org.webinos.impl.nfc;

import java.io.IOException;
import java.util.Arrays;

import org.meshpoint.anode.bridge.Env;
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

  public NfcTagTechnologyNdefImpl(Env env, android.nfc.tech.Ndef androidNdefTech) {
    super(env);
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

  private static NdefRecord[] createNdefMessage(
      android.nfc.NdefMessage androidNdefMsg) {
    NdefRecord[] result = new NdefRecord[androidNdefMsg.getRecords().length];
    int i = 0;
    for (android.nfc.NdefRecord androidNdefRecord : androidNdefMsg.getRecords()) {
      result[i++] = createNdefRecord(androidNdefRecord);
    }
    return result;
  }

  private static NdefRecord createNdefRecord(
      android.nfc.NdefRecord androidNdefRecord) {
    NdefRecord result = new NdefRecord();
    result.id = new String(androidNdefRecord.getId());
    result.TNF = androidNdefRecord.getTnf();
    result.type = new String(androidNdefRecord.getType());
    byte[] payload = androidNdefRecord.getPayload();
    result.payload = new ByteArray(payload);
    if (result.TNF == NdefRecord.TNF_WELL_KNOWN
        && Arrays.equals(result.type.getBytes(), NdefRecord.RTD_TEXT)) {
      int langBytesLength = payload[0] & 0x3F;
      byte[] textBytes = new byte[payload.length - (1 + langBytesLength)];
      System.arraycopy(payload, 1 + langBytesLength, textBytes, 0,
          textBytes.length);
      result.info = new String(textBytes);
    } else if (result.TNF == NdefRecord.TNF_WELL_KNOWN
        && Arrays.equals(result.type.getBytes(), NdefRecord.RTD_URI)) {
      byte uriIdentifierCode = payload[0];
      byte[] uriBytes = new byte[payload.length - 1];
      System.arraycopy(payload, 1, uriBytes, 0, uriBytes.length);
      result.info = Util.uriPrefixFromCode(uriIdentifierCode)
          + new String(uriBytes);
    } else if (result.TNF == NdefRecord.TNF_MIME_MEDIA) {
      result.info = new String(payload);
    }

    return result;
  }
}
