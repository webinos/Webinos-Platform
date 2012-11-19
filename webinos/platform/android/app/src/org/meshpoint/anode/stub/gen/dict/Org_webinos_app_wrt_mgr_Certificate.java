/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_app_wrt_mgr_Certificate {

	private static Object[] __args = new Object[2];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.app.wrt.mgr.Certificate ob, Object[] vals) {
		ob.fingerprint = (String)vals[0];
		ob.subject = (String)vals[1];
	}

	public static Object[] __export(org.webinos.app.wrt.mgr.Certificate ob) {
		__args[0] = ob.fingerprint;
		__args[1] = ob.subject;
		return __args;
	}

}
