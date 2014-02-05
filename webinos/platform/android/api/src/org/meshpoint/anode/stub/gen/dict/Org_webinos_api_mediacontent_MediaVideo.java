/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_mediacontent_MediaVideo {

	private static Object[] __args = new Object[8];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.mediacontent.MediaVideo ob, Object[] vals) {
		ob.album = (String)vals[0];
		ob.artists = (String[])vals[1];
		ob.duration = ((org.meshpoint.anode.js.JSValue)vals[2]).longValue;
		ob.geolocation = (org.webinos.api.mediacontent.SimpleCoordinates)vals[3];
		ob.height = ((org.meshpoint.anode.js.JSValue)vals[4]).longValue;
		ob.playCount = ((org.meshpoint.anode.js.JSValue)vals[5]).longValue;
		ob.playedTime = ((org.meshpoint.anode.js.JSValue)vals[6]).longValue;
		ob.width = ((org.meshpoint.anode.js.JSValue)vals[7]).longValue;
	}

	public static Object[] __export(org.webinos.api.mediacontent.MediaVideo ob) {
		__args[0] = ob.album;
		__args[1] = ob.artists;
		__args[2] = org.meshpoint.anode.js.JSValue.asJSNumber(ob.duration);
		__args[3] = ob.geolocation;
		__args[4] = org.meshpoint.anode.js.JSValue.asJSNumber(ob.height);
		__args[5] = org.meshpoint.anode.js.JSValue.asJSNumber(ob.playCount);
		__args[6] = org.meshpoint.anode.js.JSValue.asJSNumber(ob.playedTime);
		__args[7] = org.meshpoint.anode.js.JSValue.asJSNumber(ob.width);
		return __args;
	}

}
