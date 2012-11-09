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
import org.meshpoint.anode.java.Base;
import org.w3c.dom.ObjectArray;

public abstract class NdefMessage extends Base {
	private static short classId = Env.getInterfaceId(NdefMessage.class);
	protected NdefMessage() { super(classId); }

	public static final int NDEFRECTYPE_UNKNOWN = 0;
	public static final int NDEFRECTYPE_URI = 1;
	public static final int NDEFRECTYPE_MEDIA = 2;
	public static final int NDEFRECTYPE_EMPTY = 3;
	public static final int NDEFRECTYPE_RTD = 4;
	public static final int NDEFRECTYPE_EXTERNALRTD = 5;

	public ObjectArray<NdefRecord> ndefRecords;

	public abstract void addTextNdefRecord(int type, String payload) throws NfcError;
	public abstract void addBinaryNdefRecord(int type, byte[] payload) throws NfcError;
}
