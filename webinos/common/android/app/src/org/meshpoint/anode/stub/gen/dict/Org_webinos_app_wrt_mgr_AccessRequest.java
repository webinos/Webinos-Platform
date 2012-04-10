/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_app_wrt_mgr_AccessRequest {

	private static Object[] __args = new Object[1];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.app.wrt.mgr.AccessRequest ob, Object[] vals) {
		ob.subdomains = ((org.meshpoint.anode.js.JSValue)vals[0]).getBooleanValue();
	}

	public static Object[] __export(org.webinos.app.wrt.mgr.AccessRequest ob) {
		__args[0] = org.meshpoint.anode.js.JSValue.asJSBoolean(ob.subdomains);
		return __args;
	}

}
