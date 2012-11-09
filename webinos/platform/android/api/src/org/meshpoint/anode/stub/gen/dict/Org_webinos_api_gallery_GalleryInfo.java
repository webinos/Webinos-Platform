/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_gallery_GalleryInfo {

	private static Object[] __args = new Object[5];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.gallery.GalleryInfo ob, Object[] vals) {
		ob.createdDate = (java.util.Date)vals[0];
		ob.description = (String[])vals[1];
		ob.location = (String)vals[2];
		ob.supportedMediaObjectType = (String[])vals[3];
		ob.title = (String)vals[4];
	}

	public static Object[] __export(org.webinos.api.gallery.GalleryInfo ob) {
		__args[0] = ob.createdDate;
		__args[1] = ob.description;
		__args[2] = ob.location;
		__args[3] = ob.supportedMediaObjectType;
		__args[4] = ob.title;
		return __args;
	}

}
