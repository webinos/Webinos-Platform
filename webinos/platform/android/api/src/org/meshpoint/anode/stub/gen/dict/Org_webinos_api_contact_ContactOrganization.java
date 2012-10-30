/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_contact_ContactOrganization {

	private static Object[] __args = new Object[5];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.contact.ContactOrganization ob, Object[] vals) {
		ob.department = (String)vals[0];
		ob.name = (String)vals[1];
		ob.pref = ((org.meshpoint.anode.js.JSValue)vals[2]).getBooleanValue();
		ob.title = (String)vals[3];
		ob.type = (String)vals[4];
	}

	public static Object[] __export(org.webinos.api.contact.ContactOrganization ob) {
		__args[0] = ob.department;
		__args[1] = ob.name;
		__args[2] = org.meshpoint.anode.js.JSValue.asJSBoolean(ob.pref);
		__args[3] = ob.title;
		__args[4] = ob.type;
		return __args;
	}

}
