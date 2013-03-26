/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_api_nfc_NfcTagTechnologyNdef {

	private static Object[] __args = new Object[3];

	public static Object[] __getArgs() { return __args; }

	static Object __invoke(org.webinos.api.nfc.NfcTagTechnologyNdef inst, int opIdx, Object[] args) {
		Object result = null;
		switch(opIdx) {
		case 0: /* makeReadOnly */
			result = inst.makeReadOnly(
				(org.webinos.api.SuccessCallback)args[0]
			);
			break;
		case 1: /* readCachedNdefMessage */
			result = inst.readCachedNdefMessage();
			break;
		case 2: /* readNdefMessage */
			result = inst.readNdefMessage(
				(org.webinos.api.nfc.ReadNdefMessageCallback)args[0],
				(org.webinos.api.nfc.NfcErrorCallback)args[1]
			);
			break;
		case 3: /* writeNdefMessage */
			result = inst.writeNdefMessage(
				(org.webinos.api.nfc.NdefRecord[])args[0],
				(org.webinos.api.SuccessCallback)args[1],
				(org.webinos.api.nfc.NfcErrorCallback)args[2]
			);
			break;
		default:
		}
		return result;
	}

}
