/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_api_gallery_GalleryManager {

	private static Object[] __args = new Object[4];

	public static Object[] __getArgs() { return __args; }

	static Object __invoke(org.webinos.api.gallery.GalleryManager inst, int opIdx, Object[] args) {
		Object result = null;
		switch(opIdx) {
		case 0: /* find */
			result = inst.find(
				(String[])args[0],
				(org.webinos.api.gallery.GalleryFindCB)args[1],
				(org.webinos.api.gallery.GalleryErrorCB)args[2],
				(org.webinos.api.gallery.GalleryFindOptions)args[3]
			);
			break;
		case 1: /* getGalleries */
			result = inst.getGalleries(
				(org.webinos.api.gallery.GalleryInfoCB)args[0],
				(org.webinos.api.gallery.GalleryErrorCB)args[1]
			);
			break;
		default:
		}
		return result;
	}

	static Object __get(org.webinos.api.gallery.GalleryManager inst, int attrIdx) {
		Object result = null;
		switch(attrIdx) {
		case 0: /* AUDIO_TYPE */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.gallery.GalleryManager.AUDIO_TYPE);
			break;
		case 1: /* IMAGE_TYPE */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.gallery.GalleryManager.IMAGE_TYPE);
			break;
		case 2: /* SORT_BY_ALBUM */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.gallery.GalleryManager.SORT_BY_ALBUM);
			break;
		case 3: /* SORT_BY_ASCENDING */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.gallery.GalleryManager.SORT_BY_ASCENDING);
			break;
		case 4: /* SORT_BY_AUTHOR */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.gallery.GalleryManager.SORT_BY_AUTHOR);
			break;
		case 5: /* SORT_BY_DATE */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.gallery.GalleryManager.SORT_BY_DATE);
			break;
		case 6: /* SORT_BY_DESCENDING */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.gallery.GalleryManager.SORT_BY_DESCENDING);
			break;
		case 7: /* SORT_BY_FILEDATE */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.gallery.GalleryManager.SORT_BY_FILEDATE);
			break;
		case 8: /* SORT_BY_FILENAME */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.gallery.GalleryManager.SORT_BY_FILENAME);
			break;
		case 9: /* SORT_BY_MEDIATYPE */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.gallery.GalleryManager.SORT_BY_MEDIATYPE);
			break;
		case 10: /* SORT_BY_TITLE */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.gallery.GalleryManager.SORT_BY_TITLE);
			break;
		case 11: /* VIDEO_TYPE */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.gallery.GalleryManager.VIDEO_TYPE);
			break;
		case 12: /* length */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)inst.length);
			break;
		default:
		}
		return result;
	}

	static void __set(org.webinos.api.gallery.GalleryManager inst, int attrIdx, Object val) {
		switch(attrIdx) {
		case 12: /* length */
			inst.length = (int)((org.meshpoint.anode.js.JSValue)val).longValue;
			break;
		default:
			throw new UnsupportedOperationException();
		}
	}

}
