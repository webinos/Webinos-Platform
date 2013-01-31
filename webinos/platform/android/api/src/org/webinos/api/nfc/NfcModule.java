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

package org.webinos.api.nfc;

import org.meshpoint.anode.bridge.Env;
import org.meshpoint.anode.java.Base;
import org.webinos.api.ErrorCallback;

public abstract class NfcModule extends Base {
  private static short classId = Env.getInterfaceId(NfcModule.class);

  protected NfcModule() {
    super(classId);
  }

  public abstract void setListener(NfcEventListener listener);

  public abstract boolean isNfcAvailable();
  
  public abstract boolean isNfcPushAvailable();

  public abstract void addTextTypeFilter();

  public abstract void addUriTypeFilter(String scheme);

  public abstract void addMimeTypeFilter(String mimeType);

  public abstract void removeTextTypeFilter(ErrorCallback fail);

  public abstract void removeUriTypeFilter(String scheme);

  public abstract void removeMimeTypeFilter(String mimeType);

  public abstract void shareTag(NdefRecord[] ndefMessage);
  
  public abstract void unshareTag();

  public abstract void log(String message);

}