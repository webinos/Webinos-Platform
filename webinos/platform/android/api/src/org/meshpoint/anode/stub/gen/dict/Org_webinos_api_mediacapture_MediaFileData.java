/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_mediacapture_MediaFileData {

	private static Object[] __args = new Object[5];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.mediacapture.MediaFileData ob, Object[] vals) {
		ob.bitrate = (int)((org.meshpoint.anode.js.JSValue)vals[0]).longValue;
		ob.codecs = (String)vals[1];
		ob.duration = ((org.meshpoint.anode.js.JSValue)vals[2]).dblValue;
		ob.height = (int)((org.meshpoint.anode.js.JSValue)vals[3]).longValue;
		ob.width = (int)((org.meshpoint.anode.js.JSValue)vals[4]).longValue;
	}

	public static Object[] __export(org.webinos.api.mediacapture.MediaFileData ob) {
		__args[0] = org.meshpoint.anode.js.JSValue.asJSNumber((long)ob.bitrate);
		__args[1] = ob.codecs;
		__args[2] = org.meshpoint.anode.js.JSValue.asJSNumber(ob.duration);
		__args[3] = org.meshpoint.anode.js.JSValue.asJSNumber((long)ob.height);
		__args[4] = org.meshpoint.anode.js.JSValue.asJSNumber((long)ob.width);
		return __args;
	}

}
