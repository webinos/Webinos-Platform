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
  public void addTextTypeFilter() {
    checkNfcAvailability();
    nfcMgr.addTextTypeFilter();
  }

  @Override
  public void addUriTypeFilter(String scheme) {
    checkNfcAvailability();
    nfcMgr.addUriTypeFilter(scheme);
  }

  @Override
  public void addMimeTypeFilter(String mimeType) {
    checkNfcAvailability();
    nfcMgr.addMimeTypeFilter(mimeType);
  }

  @Override
  public void removeTextTypeFilter() {
    checkNfcAvailability();
    nfcMgr.removeTextTypeFilter();
  }

  @Override
  public void removeUriTypeFilter(String scheme) {
    checkNfcAvailability();
    nfcMgr.removeUriTypeFilter(scheme);
  }

  @Override
  public void removeMimeTypeFilter(String mimeType) {
    checkNfcAvailability();
    nfcMgr.addMimeTypeFilter(mimeType);
  }

  private void checkNfcAvailability() {
    if (!isNfcAvailable()) {
      throw new NfcError(DeviceAPIError.NOT_SUPPORTED_ERR,
          "NFC is not supported on this device");
    }
  }

  @Override
  public void shareTag(NdefRecord[] ndefMessage) {
    checkNfcPushAvailability();
    setSharedTag(ndefMessage);
  }

  @Override
  public void unshareTag() {
    checkNfcPushAvailability();
    setSharedTag(null);
  }

  protected abstract void setSharedTag(NdefRecord[] ndefMessage);

  private void checkNfcPushAvailability() {
    if (!isNfcAvailable()) {
      throw new NfcError(DeviceAPIError.NOT_SUPPORTED_ERR,
          "NFC push is not supported on this device");
    }
  }
}
