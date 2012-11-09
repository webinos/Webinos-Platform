/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_mediacapture_CaptureMediaOptions {

	private static Object[] __args = new Object[1];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.mediacapture.CaptureMediaOptions ob, Object[] vals) {
		ob.limit = (int)((org.meshpoint.anode.js.JSValue)vals[0]).longValue;
	}

	public static Object[] __export(org.webinos.api.mediacapture.CaptureMediaOptions ob) {
		__args[0] = org.meshpoint.anode.js.JSValue.asJSNumber((long)ob.limit);
		return __args;
	}

}
