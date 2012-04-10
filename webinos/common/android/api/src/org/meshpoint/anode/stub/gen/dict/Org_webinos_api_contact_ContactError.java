/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_contact_ContactError {

	private static Object[] __args = new Object[8];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.contact.ContactError ob, Object[] vals) {
		ob.code = (int)((org.meshpoint.anode.js.JSValue)vals[7]).longValue;
	}

	public static Object[] __export(org.webinos.api.contact.ContactError ob) {
		__args[7] = org.meshpoint.anode.js.JSValue.asJSNumber((long)ob.code);
		return __args;
	}

}
