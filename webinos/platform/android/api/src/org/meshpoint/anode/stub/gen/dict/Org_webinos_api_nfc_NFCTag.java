/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_nfc_NFCTag {

	private static Object[] __args = new Object[2];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.nfc.NFCTag ob, Object[] vals) {
		ob.tagId = (byte[])vals[0];
		ob.techList = (org.webinos.api.nfc.NFCTagTechnology[])vals[1];
	}

	public static Object[] __export(org.webinos.api.nfc.NFCTag ob) {
		__args[0] = ob.tagId;
		__args[1] = ob.techList;
		return __args;
	}

}
