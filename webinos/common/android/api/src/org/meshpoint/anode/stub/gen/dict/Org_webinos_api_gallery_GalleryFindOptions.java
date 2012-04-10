/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_gallery_GalleryFindOptions {

	private static Object[] __args = new Object[8];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.gallery.GalleryFindOptions ob, Object[] vals) {
		ob.endDate = (java.util.Date)vals[0];
		ob.filter = (String)vals[1];
		ob.firstSortOption = (Integer)vals[2];
		ob.gallery = (org.webinos.api.gallery.GalleryInfo[])vals[3];
		ob.mediaType = (Integer)vals[4];
		ob.order = (Integer)vals[5];
		ob.secondSortOption = (Integer)vals[6];
		ob.startDate = (java.util.Date)vals[7];
	}

	public static Object[] __export(org.webinos.api.gallery.GalleryFindOptions ob) {
		__args[0] = ob.endDate;
		__args[1] = ob.filter;
		__args[2] = ob.firstSortOption;
		__args[3] = ob.gallery;
		__args[4] = ob.mediaType;
		__args[5] = ob.order;
		__args[6] = ob.secondSortOption;
		__args[7] = ob.startDate;
		return __args;
	}

}
