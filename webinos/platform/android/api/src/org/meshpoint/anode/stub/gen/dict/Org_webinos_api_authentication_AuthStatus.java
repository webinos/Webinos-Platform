/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_authentication_AuthStatus {

	private static Object[] __args = new Object[3];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.authentication.AuthStatus ob, Object[] vals) {
		ob.authMethod = (String)vals[0];
		ob.authMethodDetails = (String)vals[1];
		ob.lastAuthTime = (String)vals[2];
	}

	public static Object[] __export(org.webinos.api.authentication.AuthStatus ob) {
		__args[0] = ob.authMethod;
		__args[1] = ob.authMethodDetails;
		__args[2] = ob.lastAuthTime;
		return __args;
	}

}
