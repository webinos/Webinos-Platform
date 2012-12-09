/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_api_nfc_NfcModule {

	private static Object[] __args = new Object[3];

	public static Object[] __getArgs() { return __args; }

	static Object __invoke(org.webinos.api.nfc.NfcModule inst, int opIdx, Object[] args) {
		Object result = null;
		switch(opIdx) {
		case 0: /* addMimeTypeListener */
			inst.addMimeTypeListener(
				(String)args[0],
				(org.webinos.api.nfc.NfcEventListener)args[1],
				(org.webinos.api.ErrorCallback)args[2]
			);
			break;
		case 1: /* addTextTypeListener */
			inst.addTextTypeListener(
				(org.webinos.api.nfc.NfcEventListener)args[0],
				(org.webinos.api.ErrorCallback)args[1]
			);
			break;
		case 2: /* addUriTypeListener */
			inst.addUriTypeListener(
				(String)args[0],
				(org.webinos.api.nfc.NfcEventListener)args[1],
				(org.webinos.api.ErrorCallback)args[2]
			);
			break;
		case 3: /* isNfcAvailable */
			result = org.meshpoint.anode.js.JSValue.asJSBoolean(inst.isNfcAvailable());
			break;
		case 4: /* log */
			inst.log(
				(String)args[0]
			);
			break;
		case 5: /* mimeRecord */
			result = inst.mimeRecord(
				(String)args[0],
				(byte[])args[1]
			);
			break;
		case 6: /* removeListener */
			inst.removeListener(
				(org.webinos.api.nfc.NfcEventListener)args[0]
			);
			break;
		case 7: /* textRecord */
			result = inst.textRecord(
				(String)args[0],
				(String)args[1]
			);
			break;
		case 8: /* uriRecord */
			result = inst.uriRecord(
				(String)args[0]
			);
			break;
		default:
		}
		return result;
	}

}
