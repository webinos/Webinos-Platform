/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_app_wrt_mgr_License {

	private static Object[] __args = new Object[3];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.app.wrt.mgr.License ob, Object[] vals) {
		ob.file = (String)vals[0];
		ob.href = (String)vals[1];
		ob.text = (org.webinos.app.wrt.mgr.LocalisableString)vals[2];
	}

	public static Object[] __export(org.webinos.app.wrt.mgr.License ob) {
		__args[0] = ob.file;
		__args[1] = ob.href;
		__args[2] = ob.text;
		return __args;
	}

}
