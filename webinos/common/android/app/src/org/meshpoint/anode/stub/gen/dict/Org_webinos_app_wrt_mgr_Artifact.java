/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_app_wrt_mgr_Artifact {

	private static Object[] __args = new Object[22];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.app.wrt.mgr.Artifact ob, Object[] vals) {
		ob.code = (int)((org.meshpoint.anode.js.JSValue)vals[18]).longValue;
		ob.details = (Object[])vals[19];
		ob.reason = (String)vals[20];
		ob.status = (int)((org.meshpoint.anode.js.JSValue)vals[21]).longValue;
	}

	public static Object[] __export(org.webinos.app.wrt.mgr.Artifact ob) {
		__args[18] = org.meshpoint.anode.js.JSValue.asJSNumber((long)ob.code);
		__args[19] = ob.details;
		__args[20] = ob.reason;
		__args[21] = org.meshpoint.anode.js.JSValue.asJSNumber((long)ob.status);
		return __args;
	}

}
