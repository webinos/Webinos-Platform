/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_nfc_NdefRecord {

	private static Object[] __args = new Object[3];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.nfc.NdefRecord ob, Object[] vals) {
		ob.binaryPayload = (byte[])vals[0];
		ob.textPayload = (String)vals[1];
		ob.type = (int)((org.meshpoint.anode.js.JSValue)vals[2]).longValue;
	}

	public static Object[] __export(org.webinos.api.nfc.NdefRecord ob) {
		__args[0] = ob.binaryPayload;
		__args[1] = ob.textPayload;
		__args[2] = org.meshpoint.anode.js.JSValue.asJSNumber((long)ob.type);
		return __args;
	}

}
