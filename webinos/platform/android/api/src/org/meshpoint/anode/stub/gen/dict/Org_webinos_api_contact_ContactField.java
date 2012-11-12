/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_contact_ContactField {

	private static Object[] __args = new Object[3];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.contact.ContactField ob, Object[] vals) {
		ob.pref = ((org.meshpoint.anode.js.JSValue)vals[0]).getBooleanValue();
		ob.type = (String)vals[1];
		ob.value = (String)vals[2];
	}

	public static Object[] __export(org.webinos.api.contact.ContactField ob) {
		__args[0] = org.meshpoint.anode.js.JSValue.asJSBoolean(ob.pref);
		__args[1] = ob.type;
		__args[2] = ob.value;
		return __args;
	}

}
