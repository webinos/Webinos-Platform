/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_mediacontent_MediaImage {

	private static Object[] __args = new Object[12];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.mediacontent.MediaImage ob, Object[] vals) {
		ob.geolocation = (org.webinos.api.mediacontent.SimpleCoordinates)vals[8];
		ob.height = ((org.meshpoint.anode.js.JSValue)vals[9]).longValue;
		ob.orientation = (String)vals[10];
		ob.width = ((org.meshpoint.anode.js.JSValue)vals[11]).longValue;
	}

	public static Object[] __export(org.webinos.api.mediacontent.MediaImage ob) {
		__args[8] = ob.geolocation;
		__args[9] = org.meshpoint.anode.js.JSValue.asJSNumber(ob.height);
		__args[10] = ob.orientation;
		__args[11] = org.meshpoint.anode.js.JSValue.asJSNumber(ob.width);
		return __args;
	}

}
