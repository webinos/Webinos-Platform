/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_api_nfc_NfcManager {

	private static Object[] __args = new Object[3];

	public static Object[] __getArgs() { return __args; }

	static Object __invoke(org.webinos.api.nfc.NfcManager inst, int opIdx, Object[] args) {
		Object result = null;
		switch(opIdx) {
		case 0: /* addEventListener */
			inst.addEventListener(
				(String)args[0],
				(org.webinos.api.nfc.NfcEventListener)args[1],
				((org.meshpoint.anode.js.JSValue)args[2]).getBooleanValue()
			);
			break;
		case 1: /* removeEventListener */
			inst.removeEventListener(
				(String)args[0],
				(org.webinos.api.nfc.NfcEventListener)args[1],
				((org.meshpoint.anode.js.JSValue)args[2]).getBooleanValue()
			);
			break;
		default:
		}
		return result;
	}

}
