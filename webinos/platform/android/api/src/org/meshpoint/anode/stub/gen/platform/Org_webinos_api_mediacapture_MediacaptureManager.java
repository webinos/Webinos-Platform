/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_api_mediacapture_MediacaptureManager {

	private static Object[] __args = new Object[3];

	public static Object[] __getArgs() { return __args; }

	static Object __invoke(org.webinos.api.mediacapture.MediacaptureManager inst, int opIdx, Object[] args) {
		Object result = null;
		switch(opIdx) {
		case 0: /* captureAudio */
			result = inst.captureAudio(
				(org.webinos.api.mediacapture.CaptureCB)args[0],
				(org.webinos.api.mediacapture.CaptureErrorCB)args[1],
				(org.webinos.api.mediacapture.CaptureMediaOptions)args[2]
			);
			break;
		case 1: /* captureImage */
			result = inst.captureImage(
				(org.webinos.api.mediacapture.CaptureCB)args[0],
				(org.webinos.api.mediacapture.CaptureErrorCB)args[1],
				(org.webinos.api.mediacapture.CaptureMediaOptions)args[2]
			);
			break;
		case 2: /* captureVideo */
			result = inst.captureVideo(
				(org.webinos.api.mediacapture.CaptureCB)args[0],
				(org.webinos.api.mediacapture.CaptureErrorCB)args[1],
				(org.webinos.api.mediacapture.CaptureVideoOptions)args[2]
			);
			break;
		default:
		}
		return result;
	}

	static Object __get(org.webinos.api.mediacapture.MediacaptureManager inst, int attrIdx) {
		Object result = null;
		switch(attrIdx) {
		case 0: /* supportedAudioFormats */
			result = inst.supportedAudioFormats;
			break;
		case 1: /* supportedImageFormats */
			result = inst.supportedImageFormats;
			break;
		case 2: /* supportedVideoFormats */
			result = inst.supportedVideoFormats;
			break;
		default:
		}
		return result;
	}

	static void __set(org.webinos.api.mediacapture.MediacaptureManager inst, int attrIdx, Object val) {
		switch(attrIdx) {
		case 0: /* supportedAudioFormats */
			inst.supportedAudioFormats = (org.w3c.dom.ObjectArray<org.webinos.api.mediacapture.MediaFileData>)val;
			break;
		case 1: /* supportedImageFormats */
			inst.supportedImageFormats = (org.w3c.dom.ObjectArray<org.webinos.api.mediacapture.MediaFileData>)val;
			break;
		case 2: /* supportedVideoFormats */
			inst.supportedVideoFormats = (org.w3c.dom.ObjectArray<org.webinos.api.mediacapture.MediaFileData>)val;
			break;
		default:
			throw new UnsupportedOperationException();
		}
	}

}
