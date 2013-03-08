/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_api_mediacontent_MediaSource {

	private static Object[] __args = new Object[7];

	public static Object[] __getArgs() { return __args; }

	static Object __invoke(org.webinos.api.mediacontent.MediaSource inst, int opIdx, Object[] args) {
		Object result = null;
		switch(opIdx) {
		case 0: /* findItems */
			inst.findItems(
				(org.webinos.api.mediacontent.MediaItemSuccessCallback)args[0],
				(org.webinos.api.mediacontent.MediaContentErrorCallback)args[1],
				(String)args[2],
				(org.webinos.api.mediacontent.FilterValues)args[3],
				(org.webinos.api.mediacontent.SortMode)args[4],
				((org.meshpoint.anode.js.JSValue)args[5]).longValue,
				((org.meshpoint.anode.js.JSValue)args[6]).longValue
			);
			break;
		case 1: /* getFolders */
			inst.getFolders(
				(org.webinos.api.mediacontent.MediaFolderSuccessCallback)args[0],
				(org.webinos.api.mediacontent.MediaContentErrorCallback)args[1]
			);
			break;
		default:
		}
		return result;
	}

}
