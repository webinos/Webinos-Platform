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

public abstract class NFCTagTechnology extends Base {
	private static short classId = Env.getInterfaceId(NFCTagTechnology.class);
	protected NFCTagTechnology() { super(classId); }

	public static final int TECH_OTHERS = 0;
	public static final int TECH_NFCA = 1;
	public static final int TECH_NFCB = 2;
	public static final int TECH_NFCF = 3;
	public static final int TECH_NFCV = 4;
	public static final int TECH_ISODEP = 5;
	public static final int TECH_NDEF = 6;

	public int type;
	public boolean isConnected;

	public abstract void connect();
	public abstract void close();	
}
