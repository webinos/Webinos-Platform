/*******************************************************************************
 *  Code contributed to the webinos project
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0
 *  
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * Copyright 2013 Sony Mobile Communications
 * 
 ******************************************************************************/

package org.webinos.impl.nfc;

import java.io.IOException;
import java.util.Arrays;

import org.meshpoint.anode.bridge.Env;
import org.meshpoint.anode.java.ByteArray;
import org.webinos.api.DeviceAPIError;
import org.webinos.api.PendingOperation;
import org.webinos.api.SuccessCallback;
import org.webinos.api.nfc.NdefRecord;
import org.webinos.api.nfc.NfcErrorCallback;
import org.webinos.api.nfc.NfcTagTechnologyNdef;
import org.webinos.api.nfc.ReadNdefMessageCallback;

import android.nfc.FormatException;

public class NfcTagTechnologyNdefImpl extends NfcTagTechnologyNdef {

  private Object readWriteLock = new Object();
  
  private class ReadOperation implements Runnable {

    private ReadNdefMessageCallback readCallback;
    private NfcErrorCallback errorCallback;
    
    public ReadOperation(ReadNdefMessageCallback readCallback, NfcErrorCallback errorCallback) {
      this.readCallback = readCallback;
      this.errorCallback = errorCallback;
    }
    
    @Override
    public void run() {
      try {
        synchronized (readWriteLock) {
          if (!isConnected()) {
            androidNdefTech.connect();
          }
          readCallback.onMessage(createNdefMessage(androidNdefTech
              .getNdefMessage()));
        }
      } catch (IOException e) {
        if (errorCallback!= null) {
          errorCallback.onError("IO error " + e.getMessage());
        }
      } catch (FormatException e) {
        if (errorCallback!= null) {
          errorCallback.onError("Format error " + e.getMessage());
        }
      }
    }
  }
  
  private class WriteOperation implements Runnable {

    private NdefRecord[] ndefMessage;
    private SuccessCallback successCallback;
    private NfcErrorCallback errorCallback;

    public WriteOperation(NdefRecord[] ndefMessage,
        SuccessCallback successCallback, NfcErrorCallback errorCallback) {
      this.ndefMessage = ndefMessage;
      this.successCallback = successCallback;
      this.errorCallback = errorCallback;
    }

    @Override
    public void run() {
      try {
        synchronized (readWriteLock) {
          if (!isConnected()) {
            androidNdefTech.connect();
          }
          androidNdefTech.writeNdefMessage(createNdefMessage(ndefMessage));
        }
      } catch (IOException e) {
        if (errorCallback!= null) {
          errorCallback.onError("IO error " + e.getMessage());
        }
      } catch (FormatException e) {
        if (errorCallback!= null) {
          errorCallback.onError("Format error " + e.getMessage());
        }
      }
      successCallback.onsuccess();
    }
  }
  
  private class PendingOperationImpl extends PendingOperation {
    @Override
    public void cancel() {
      try {
        close();
      } catch (Throwable t) {
      }
    }
  }

  private android.nfc.tech.Ndef androidNdefTech;

  public NfcTagTechnologyNdefImpl(Env env, android.nfc.tech.Ndef androidNdefTech) {
    super(env);
    this.androidNdefTech = androidNdefTech;
  }

  @Override
  public PendingOperation makeReadOnly(SuccessCallback successCallback) {
    throw new NfcError(DeviceAPIError.NOT_SUPPORTED_ERR, "Not implemented");
  }

  @Override
  public NdefRecord[] readCachedNdefMessage() {
    return createNdefMessage(androidNdefTech.getCachedNdefMessage());
  }

  @Override
  public PendingOperation readNdefMessage(ReadNdefMessageCallback readCallback, NfcErrorCallback errorCallback) {
    new Thread(new ReadOperation(readCallback, errorCallback)).start();
    return new PendingOperationImpl();
  }

  @Override
  public PendingOperation writeNdefMessage(NdefRecord[] ndefMessage, SuccessCallback successCallback, NfcErrorCallback errorCallback) {
    new Thread(new WriteOperation(ndefMessage, successCallback, errorCallback)).start();
    return new PendingOperationImpl();
  }

  @Override
  public void close() {
    try {
      androidNdefTech.close();
    } catch (IOException e) {
      throw new NfcError(DeviceAPIError.IO_ERR, e.getMessage());
    }
  }

  @Override
  public boolean isConnected() {
    return androidNdefTech.isConnected();
  }

  static NdefRecord[] createNdefMessage(
      android.nfc.NdefMessage androidNdefMsg) {
    NdefRecord[] result = null;
    if (androidNdefMsg != null) {
      result = new NdefRecord[androidNdefMsg.getRecords().length];
      int i = 0;
      for (android.nfc.NdefRecord androidNdefRecord : androidNdefMsg
          .getRecords()) {
        result[i++] = createNdefRecord(androidNdefRecord);
      }
    }
    return result;
  }

  static NdefRecord createNdefRecord(
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
  
  static android.nfc.NdefMessage createNdefMessage(NdefRecord[] ndefMsg) {
    android.nfc.NdefMessage result = null;
    if (ndefMsg != null) {
      android.nfc.NdefRecord[] ndefRecords = new android.nfc.NdefRecord[ndefMsg.length];
      int i = 0;
      for (NdefRecord ndefRecord : ndefMsg) {
        ndefRecords[i++] = createNdefRecord(ndefRecord);
      }
      result = new android.nfc.NdefMessage(ndefRecords);
    }
    return result;
  }
  
  static android.nfc.NdefRecord createNdefRecord(NdefRecord ndefRecord) {
    byte[] payload = new byte[ndefRecord.payload.getLength()];
    for (int i = 0; i < payload.length; i++) {
      payload[i] = ndefRecord.payload.getElement(i);
    }
    return new android.nfc.NdefRecord((short)ndefRecord.TNF, ndefRecord.type.getBytes(), ndefRecord.id.getBytes(), payload);
  }
}
