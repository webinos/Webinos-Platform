/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_contact_ContactAddress {

	private static Object[] __args = new Object[8];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.contact.ContactAddress ob, Object[] vals) {
		ob.country = (String)vals[0];
		ob.formatted = (String)vals[1];
		ob.locality = (String)vals[2];
		ob.postalCode = (String)vals[3];
		ob.pref = ((org.meshpoint.anode.js.JSValue)vals[4]).getBooleanValue();
		ob.region = (String)vals[5];
		ob.streetAddress = (String)vals[6];
		ob.type = (String)vals[7];
	}

	public static Object[] __export(org.webinos.api.contact.ContactAddress ob) {
		__args[0] = ob.country;
		__args[1] = ob.formatted;
		__args[2] = ob.locality;
		__args[3] = ob.postalCode;
		__args[4] = org.meshpoint.anode.js.JSValue.asJSBoolean(ob.pref);
		__args[5] = ob.region;
		__args[6] = ob.streetAddress;
		__args[7] = ob.type;
		return __args;
	}

}
