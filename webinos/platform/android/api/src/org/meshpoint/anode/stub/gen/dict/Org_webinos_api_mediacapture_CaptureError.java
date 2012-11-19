/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_mediacapture_CaptureError {

	private static Object[] __args = new Object[5];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.mediacapture.CaptureError ob, Object[] vals) {
		ob.code = (int)((org.meshpoint.anode.js.JSValue)vals[4]).longValue;
	}

	public static Object[] __export(org.webinos.api.mediacapture.CaptureError ob) {
		__args[4] = org.meshpoint.anode.js.JSValue.asJSNumber((long)ob.code);
		return __args;
	}

}
