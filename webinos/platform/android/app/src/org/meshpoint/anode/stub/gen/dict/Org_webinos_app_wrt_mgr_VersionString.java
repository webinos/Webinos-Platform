/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_app_wrt_mgr_VersionString {

	private static Object[] __args = new Object[3];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.app.wrt.mgr.VersionString ob, Object[] vals) {
		ob.major = (Integer)vals[0];
		ob.micro = (Integer)vals[1];
		ob.minor = (Integer)vals[2];
	}

	public static Object[] __export(org.webinos.app.wrt.mgr.VersionString ob) {
		__args[0] = ob.major;
		__args[1] = ob.micro;
		__args[2] = ob.minor;
		return __args;
	}

}
