/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_nfc_NfcError {

	private static Object[] __args = new Object[4];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.nfc.NfcError ob, Object[] vals) {
		ob.code = (int)((org.meshpoint.anode.js.JSValue)vals[2]).longValue;
		ob.message = (String)vals[3];
	}

	public static Object[] __export(org.webinos.api.nfc.NfcError ob) {
		__args[2] = org.meshpoint.anode.js.JSValue.asJSNumber((long)ob.code);
		__args[3] = ob.message;
		return __args;
	}

}
