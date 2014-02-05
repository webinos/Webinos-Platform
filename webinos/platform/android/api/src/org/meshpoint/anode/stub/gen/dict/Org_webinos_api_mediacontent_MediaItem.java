/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_mediacontent_MediaItem {

	private static Object[] __args = new Object[15];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.mediacontent.MediaItem ob, Object[] vals) {
		ob.description = (String)vals[4];
		ob.editableAttributes = (String[])vals[5];
		ob.id = (String)vals[6];
		ob.itemURI = (String)vals[7];
		ob.mimeType = (String)vals[8];
		ob.modifiedDate = (java.util.Date)vals[9];
		ob.releaseDate = (java.util.Date)vals[10];
		ob.size = ((org.meshpoint.anode.js.JSValue)vals[11]).longValue;
		ob.thumbnailURIs = (String[])vals[12];
		ob.title = (String)vals[13];
		ob.type = (String)vals[14];
	}

	public static Object[] __export(org.webinos.api.mediacontent.MediaItem ob) {
		__args[4] = ob.description;
		__args[5] = ob.editableAttributes;
		__args[6] = ob.id;
		__args[7] = ob.itemURI;
		__args[8] = ob.mimeType;
		__args[9] = ob.modifiedDate;
		__args[10] = ob.releaseDate;
		__args[11] = org.meshpoint.anode.js.JSValue.asJSNumber(ob.size);
		__args[12] = ob.thumbnailURIs;
		__args[13] = ob.title;
		__args[14] = ob.type;
		return __args;
	}

}
