/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_mediacontent_MediaItemCollection {

	private static Object[] __args = new Object[4];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.mediacontent.MediaItemCollection ob, Object[] vals) {
		ob.audios = (org.webinos.api.mediacontent.MediaAudio[])vals[0];
		ob.images = (org.webinos.api.mediacontent.MediaImage[])vals[1];
		ob.size = (int)((org.meshpoint.anode.js.JSValue)vals[2]).longValue;
		ob.videos = (org.webinos.api.mediacontent.MediaVideo[])vals[3];
	}

	public static Object[] __export(org.webinos.api.mediacontent.MediaItemCollection ob) {
		__args[0] = ob.audios;
		__args[1] = ob.images;
		__args[2] = org.meshpoint.anode.js.JSValue.asJSNumber((long)ob.size);
		__args[3] = ob.videos;
		return __args;
	}

}
