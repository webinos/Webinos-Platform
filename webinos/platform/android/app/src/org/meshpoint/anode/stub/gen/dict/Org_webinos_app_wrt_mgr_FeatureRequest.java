/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_app_wrt_mgr_FeatureRequest {

	private static Object[] __args = new Object[3];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.app.wrt.mgr.FeatureRequest ob, Object[] vals) {
		ob.name = (String)vals[0];
		ob.params = (org.webinos.app.wrt.mgr.Param[])vals[1];
		ob.required = ((org.meshpoint.anode.js.JSValue)vals[2]).getBooleanValue();
	}

	public static Object[] __export(org.webinos.app.wrt.mgr.FeatureRequest ob) {
		__args[0] = ob.name;
		__args[1] = ob.params;
		__args[2] = org.meshpoint.anode.js.JSValue.asJSBoolean(ob.required);
		return __args;
	}

}
