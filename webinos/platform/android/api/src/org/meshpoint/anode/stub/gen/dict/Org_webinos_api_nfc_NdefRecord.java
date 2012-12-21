/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_nfc_NdefRecord {

	private static Object[] __args = new Object[20];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.nfc.NdefRecord ob, Object[] vals) {
		ob.TNF = (int)((org.meshpoint.anode.js.JSValue)vals[7]).longValue;
		ob.id = (String)vals[16];
		ob.info = (String)vals[17];
		ob.payload = (org.w3c.dom.ByteArray)vals[18];
		ob.type = (String)vals[19];
	}

	public static Object[] __export(org.webinos.api.nfc.NdefRecord ob) {
		__args[7] = org.meshpoint.anode.js.JSValue.asJSNumber((long)ob.TNF);
		__args[16] = ob.id;
		__args[17] = ob.info;
		__args[18] = ob.payload;
		__args[19] = ob.type;
		return __args;
	}

}
