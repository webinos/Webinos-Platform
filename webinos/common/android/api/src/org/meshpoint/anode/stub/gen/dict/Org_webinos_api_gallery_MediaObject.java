/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_gallery_MediaObject {

	private static Object[] __args = new Object[29];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.gallery.MediaObject ob, Object[] vals) {
		ob.CreateDate = (java.util.Date)vals[0];
		ob.Creator = (String)vals[1];
		ob.averageBitRate = (Integer)vals[2];
		ob.collection = (String)vals[3];
		ob.compression = (String)vals[4];
		ob.contributor = (String)vals[5];
		ob.copyright = (String)vals[6];
		ob.description = (String)vals[7];
		ob.duration = (Integer)vals[8];
		ob.format = (String)vals[9];
		ob.fragment = (String)vals[10];
		ob.frameSize = (Integer)vals[11];
		ob.framerate = (Integer)vals[12];
		ob.gallery = (org.webinos.api.gallery.GalleryInfo)vals[13];
		ob.genre = (String)vals[14];
		ob.id = (int)((org.meshpoint.anode.js.JSValue)vals[15]).longValue;
		ob.keyword = (String)vals[16];
		ob.language = (String)vals[17];
		ob.location = (String)vals[18];
		ob.locator = (String)vals[19];
		ob.namedFragment = (String)vals[20];
		ob.numTracks = (Integer)vals[21];
		ob.policy = (String)vals[22];
		ob.publisher = (String)vals[23];
		ob.rating = (Integer)vals[24];
		ob.relation = (String)vals[25];
		ob.samplingRate = (Integer)vals[26];
		ob.targetAudience = (String)vals[27];
		ob.title = (String)vals[28];
	}

	public static Object[] __export(org.webinos.api.gallery.MediaObject ob) {
		__args[0] = ob.CreateDate;
		__args[1] = ob.Creator;
		__args[2] = ob.averageBitRate;
		__args[3] = ob.collection;
		__args[4] = ob.compression;
		__args[5] = ob.contributor;
		__args[6] = ob.copyright;
		__args[7] = ob.description;
		__args[8] = ob.duration;
		__args[9] = ob.format;
		__args[10] = ob.fragment;
		__args[11] = ob.frameSize;
		__args[12] = ob.framerate;
		__args[13] = ob.gallery;
		__args[14] = ob.genre;
		__args[15] = org.meshpoint.anode.js.JSValue.asJSNumber((long)ob.id);
		__args[16] = ob.keyword;
		__args[17] = ob.language;
		__args[18] = ob.location;
		__args[19] = ob.locator;
		__args[20] = ob.namedFragment;
		__args[21] = ob.numTracks;
		__args[22] = ob.policy;
		__args[23] = ob.publisher;
		__args[24] = ob.rating;
		__args[25] = ob.relation;
		__args[26] = ob.samplingRate;
		__args[27] = ob.targetAudience;
		__args[28] = ob.title;
		return __args;
	}

}
