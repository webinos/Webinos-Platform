/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_app_wrt_mgr_Origin {

	private static Object[] __args = new Object[3];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.app.wrt.mgr.Origin ob, Object[] vals) {
		ob.host = (String)vals[0];
		ob.port = (int)((org.meshpoint.anode.js.JSValue)vals[1]).longValue;
		ob.scheme = (String)vals[2];
	}

	public static Object[] __export(org.webinos.app.wrt.mgr.Origin ob) {
		__args[0] = ob.host;
		__args[1] = org.meshpoint.anode.js.JSValue.asJSNumber((long)ob.port);
		__args[2] = ob.scheme;
		return __args;
	}

}
