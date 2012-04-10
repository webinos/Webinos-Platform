/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_contact_ContactFindOptions {

	private static Object[] __args = new Object[3];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.contact.ContactFindOptions ob, Object[] vals) {
		ob.filter = (String)vals[0];
		ob.multiple = (Boolean)vals[1];
		ob.updatedSince = (java.util.Date)vals[2];
	}

	public static Object[] __export(org.webinos.api.contact.ContactFindOptions ob) {
		__args[0] = ob.filter;
		__args[1] = ob.multiple;
		__args[2] = ob.updatedSince;
		return __args;
	}

}
