/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_api_nfc_NFCTagTechnology {

	private static Object[] __args = new Object[0];

	public static Object[] __getArgs() { return __args; }

	static Object __invoke(org.webinos.api.nfc.NFCTagTechnology inst, int opIdx, Object[] args) {
		Object result = null;
		switch(opIdx) {
		case 0: /* close */
			inst.close();
			break;
		case 1: /* connect */
			inst.connect();
			break;
		default:
		}
		return result;
	}

	static Object __get(org.webinos.api.nfc.NFCTagTechnology inst, int attrIdx) {
		Object result = null;
		switch(attrIdx) {
		case 0: /* TECH_ISODEP */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.nfc.NFCTagTechnology.TECH_ISODEP);
			break;
		case 1: /* TECH_NDEF */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.nfc.NFCTagTechnology.TECH_NDEF);
			break;
		case 2: /* TECH_NFCA */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.nfc.NFCTagTechnology.TECH_NFCA);
			break;
		case 3: /* TECH_NFCB */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.nfc.NFCTagTechnology.TECH_NFCB);
			break;
		case 4: /* TECH_NFCF */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.nfc.NFCTagTechnology.TECH_NFCF);
			break;
		case 5: /* TECH_NFCV */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.nfc.NFCTagTechnology.TECH_NFCV);
			break;
		case 6: /* TECH_OTHERS */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.nfc.NFCTagTechnology.TECH_OTHERS);
			break;
		case 7: /* isConnected */
			result = org.meshpoint.anode.js.JSValue.asJSBoolean(inst.isConnected);
			break;
		case 8: /* type */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)inst.type);
			break;
		default:
		}
		return result;
	}

	static void __set(org.webinos.api.nfc.NFCTagTechnology inst, int attrIdx, Object val) {
		switch(attrIdx) {
		case 7: /* isConnected */
			inst.isConnected = ((org.meshpoint.anode.js.JSValue)val).getBooleanValue();
			break;
		case 8: /* type */
			inst.type = (int)((org.meshpoint.anode.js.JSValue)val).longValue;
			break;
		default:
			throw new UnsupportedOperationException();
		}
	}

}
