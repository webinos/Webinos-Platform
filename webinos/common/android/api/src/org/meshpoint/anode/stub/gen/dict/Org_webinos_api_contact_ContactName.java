/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_contact_ContactName {

	private static Object[] __args = new Object[6];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.contact.ContactName ob, Object[] vals) {
		ob.familyName = (String)vals[0];
		ob.formatted = (String)vals[1];
		ob.givenName = (String)vals[2];
		ob.honorificPrefix = (String)vals[3];
		ob.honorificSuffix = (String)vals[4];
		ob.middleName = (String)vals[5];
	}

	public static Object[] __export(org.webinos.api.contact.ContactName ob) {
		__args[0] = ob.familyName;
		__args[1] = ob.formatted;
		__args[2] = ob.givenName;
		__args[3] = ob.honorificPrefix;
		__args[4] = ob.honorificSuffix;
		__args[5] = ob.middleName;
		return __args;
	}

}
