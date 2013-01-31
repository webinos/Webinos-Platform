/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_api_nfc_NfcTagTechnology {

	private static Object[] __args = new Object[0];

	public static Object[] __getArgs() { return __args; }

	static Object __invoke(org.webinos.api.nfc.NfcTagTechnology inst, int opIdx, Object[] args) {
		Object result = null;
		switch(opIdx) {
		case 0: /* close */
			inst.close();
			break;
		case 1: /* getType */
			result = inst.getType();
			break;
		case 2: /* isConnected */
			result = org.meshpoint.anode.js.JSValue.asJSBoolean(inst.isConnected());
			break;
		default:
		}
		return result;
	}

	static Object __get(org.webinos.api.nfc.NfcTagTechnology inst, int attrIdx) {
		Object result = null;
		switch(attrIdx) {
		case 0: /* TECH_ISODEP */
			result = org.webinos.api.nfc.NfcTagTechnology.TECH_ISODEP;
			break;
		case 1: /* TECH_NDEF */
			result = org.webinos.api.nfc.NfcTagTechnology.TECH_NDEF;
			break;
		case 2: /* TECH_NFCA */
			result = org.webinos.api.nfc.NfcTagTechnology.TECH_NFCA;
			break;
		case 3: /* TECH_NFCB */
			result = org.webinos.api.nfc.NfcTagTechnology.TECH_NFCB;
			break;
		case 4: /* TECH_NFCF */
			result = org.webinos.api.nfc.NfcTagTechnology.TECH_NFCF;
			break;
		case 5: /* TECH_NFCV */
			result = org.webinos.api.nfc.NfcTagTechnology.TECH_NFCV;
			break;
		case 6: /* TECH_OTHERS */
			result = org.webinos.api.nfc.NfcTagTechnology.TECH_OTHERS;
			break;
		default:
		}
		return result;
	}

	static void __set(org.webinos.api.nfc.NfcTagTechnology inst, int attrIdx, Object val) {
		switch(attrIdx) {
		default:
			throw new UnsupportedOperationException();
		}
	}

}
