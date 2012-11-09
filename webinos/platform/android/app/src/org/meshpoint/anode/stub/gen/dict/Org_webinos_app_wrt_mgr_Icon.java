/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_app_wrt_mgr_Icon {

	private static Object[] __args = new Object[3];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.app.wrt.mgr.Icon ob, Object[] vals) {
		ob.height = (int)((org.meshpoint.anode.js.JSValue)vals[0]).longValue;
		ob.path = (String)vals[1];
		ob.width = (int)((org.meshpoint.anode.js.JSValue)vals[2]).longValue;
	}

	public static Object[] __export(org.webinos.app.wrt.mgr.Icon ob) {
		__args[0] = org.meshpoint.anode.js.JSValue.asJSNumber((long)ob.height);
		__args[1] = ob.path;
		__args[2] = org.meshpoint.anode.js.JSValue.asJSNumber((long)ob.width);
		return __args;
	}

}
