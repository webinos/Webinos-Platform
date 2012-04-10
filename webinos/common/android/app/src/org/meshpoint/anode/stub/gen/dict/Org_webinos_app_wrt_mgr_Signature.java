/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_app_wrt_mgr_Signature {

	private static Object[] __args = new Object[4];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.app.wrt.mgr.Signature ob, Object[] vals) {
		ob.key = (org.webinos.app.wrt.mgr.Certificate)vals[0];
		ob.name = (String)vals[1];
		ob.root = (org.webinos.app.wrt.mgr.Certificate)vals[2];
		ob.signatureId = (String)vals[3];
	}

	public static Object[] __export(org.webinos.app.wrt.mgr.Signature ob) {
		__args[0] = ob.key;
		__args[1] = ob.name;
		__args[2] = ob.root;
		__args[3] = ob.signatureId;
		return __args;
	}

}
