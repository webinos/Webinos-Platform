/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_mediacontent_MediaAudio {

	private static Object[] __args = new Object[11];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.mediacontent.MediaAudio ob, Object[] vals) {
		ob.album = (String)vals[0];
		ob.artists = (String[])vals[1];
		ob.bitrate = ((org.meshpoint.anode.js.JSValue)vals[2]).longValue;
		ob.composers = (String[])vals[3];
		ob.copyright = (String)vals[4];
		ob.duration = ((org.meshpoint.anode.js.JSValue)vals[5]).longValue;
		ob.genres = (String[])vals[6];
		ob.lyrics = (org.webinos.api.mediacontent.MediaLyrics)vals[7];
		ob.playCount = ((org.meshpoint.anode.js.JSValue)vals[8]).longValue;
		ob.playedTime = ((org.meshpoint.anode.js.JSValue)vals[9]).longValue;
		ob.trackNumber = (int)((org.meshpoint.anode.js.JSValue)vals[10]).longValue;
	}

	public static Object[] __export(org.webinos.api.mediacontent.MediaAudio ob) {
		__args[0] = ob.album;
		__args[1] = ob.artists;
		__args[2] = org.meshpoint.anode.js.JSValue.asJSNumber(ob.bitrate);
		__args[3] = ob.composers;
		__args[4] = ob.copyright;
		__args[5] = org.meshpoint.anode.js.JSValue.asJSNumber(ob.duration);
		__args[6] = ob.genres;
		__args[7] = ob.lyrics;
		__args[8] = org.meshpoint.anode.js.JSValue.asJSNumber(ob.playCount);
		__args[9] = org.meshpoint.anode.js.JSValue.asJSNumber(ob.playedTime);
		__args[10] = org.meshpoint.anode.js.JSValue.asJSNumber((long)ob.trackNumber);
		return __args;
	}

}
