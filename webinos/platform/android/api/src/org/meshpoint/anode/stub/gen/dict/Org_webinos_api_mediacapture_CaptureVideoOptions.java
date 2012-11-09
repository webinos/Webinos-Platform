/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_mediacapture_CaptureVideoOptions {

	private static Object[] __args = new Object[1];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.mediacapture.CaptureVideoOptions ob, Object[] vals) {
		ob.duration = ((org.meshpoint.anode.js.JSValue)vals[0]).dblValue;
	}

	public static Object[] __export(org.webinos.api.mediacapture.CaptureVideoOptions ob) {
		__args[0] = org.meshpoint.anode.js.JSValue.asJSNumber(ob.duration);
		return __args;
	}

}
