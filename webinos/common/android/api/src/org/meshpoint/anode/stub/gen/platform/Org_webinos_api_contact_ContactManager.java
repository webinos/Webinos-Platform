/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_api_contact_ContactManager {

	private static Object[] __args = new Object[4];

	public static Object[] __getArgs() { return __args; }

	static Object __invoke(org.webinos.api.contact.ContactManager inst, int opIdx, Object[] args) {
		return inst.find(
			(java.util.HashMap<String, String>)args[0],
			(org.webinos.api.contact.ContactFindCB)args[1],
			(org.webinos.api.contact.ContactErrorCB)args[2],
			(org.webinos.api.contact.ContactFindOptions)args[3]
		);
	}

}
