/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_api_nfc_NfcModule {

	private static Object[] __args = new Object[1];

	public static Object[] __getArgs() { return __args; }

	static Object __invoke(org.webinos.api.nfc.NfcModule inst, int opIdx, Object[] args) {
		Object result = null;
		switch(opIdx) {
		case 0: /* addMimeTypeFilter */
			inst.addMimeTypeFilter(
				(String)args[0]
			);
			break;
		case 1: /* addTextTypeFilter */
			inst.addTextTypeFilter();
			break;
		case 2: /* addUriTypeFilter */
			inst.addUriTypeFilter(
				(String)args[0]
			);
			break;
		case 3: /* isNfcAvailable */
			result = org.meshpoint.anode.js.JSValue.asJSBoolean(inst.isNfcAvailable());
			break;
		case 4: /* isNfcPushAvailable */
			result = org.meshpoint.anode.js.JSValue.asJSBoolean(inst.isNfcPushAvailable());
			break;
		case 5: /* launchScanningActivity */
			inst.launchScanningActivity(
				((org.meshpoint.anode.js.JSValue)args[0]).getBooleanValue()
			);
			break;
		case 6: /* removeMimeTypeFilter */
			inst.removeMimeTypeFilter(
				(String)args[0]
			);
			break;
		case 7: /* removeTextTypeFilter */
			inst.removeTextTypeFilter();
			break;
		case 8: /* removeUriTypeFilter */
			inst.removeUriTypeFilter(
				(String)args[0]
			);
			break;
		case 9: /* setListener */
			inst.setListener(
				(org.webinos.api.nfc.NfcEventListener)args[0]
			);
			break;
		case 10: /* shareTag */
			inst.shareTag(
				(org.webinos.api.nfc.NdefRecord[])args[0]
			);
			break;
		case 11: /* unshareTag */
			inst.unshareTag();
			break;
		default:
		}
		return result;
	}

}
