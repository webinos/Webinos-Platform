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
 * Copyright 2011-2012 Paddy Byers
 *
 ******************************************************************************/

package org.webinos.api.nfc;

import org.meshpoint.anode.bridge.Env;
import org.webinos.api.ErrorCallback;
import org.webinos.api.PendingOperation;
import org.webinos.api.SuccessCallback;

public abstract class NfcTagTechnologyNdef extends NfcTagTechnology {
  protected NfcTagTechnologyNdef(Env env) {
    super(env, TECH_NDEF);
  }

  public abstract PendingOperation makeReadOnly(
      SuccessCallback successCallback, ErrorCallback errorCallback);

  public abstract NdefRecord[] readCachedNdefMessage();

  public abstract PendingOperation readNdefMessage(
      SuccessCallback successCallback, ErrorCallback errorCallback);

  public abstract PendingOperation writeNdefMessage(
      SuccessCallback successCallback, ErrorCallback errorCallback,
      NdefRecord[] message);
}
