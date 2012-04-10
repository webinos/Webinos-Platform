/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_api_nfc_NFCTagTechnologyNdef {

	private static Object[] __args = new Object[3];

	public static Object[] __getArgs() { return __args; }

	static Object __invoke(org.webinos.api.nfc.NFCTagTechnologyNdef inst, int opIdx, Object[] args) {
		Object result = null;
		switch(opIdx) {
		case 0: /* createNdefMessage */
			result = inst.createNdefMessage();
			break;
		case 1: /* makeReadOnly */
			result = inst.makeReadOnly(
				(org.webinos.api.SuccessCallback)args[0],
				(org.webinos.api.ErrorCallback)args[1]
			);
			break;
		case 2: /* readCachedNdefMessage */
			result = inst.readCachedNdefMessage();
			break;
		case 3: /* readNdefMessage */
			result = inst.readNdefMessage(
				(org.webinos.api.nfc.NdefSuccessCallback)args[0],
				(org.webinos.api.ErrorCallback)args[1]
			);
			break;
		case 4: /* writeNdefMessage */
			result = inst.writeNdefMessage(
				(org.webinos.api.SuccessCallback)args[0],
				(org.webinos.api.ErrorCallback)args[1],
				(org.webinos.api.nfc.NdefMessage)args[2]
			);
			break;
		default:
		}
		return result;
	}

	static Object __get(org.webinos.api.nfc.NFCTagTechnologyNdef inst, int attrIdx) {
		Object result = null;
		switch(attrIdx) {
		case 0: /* NDEFTYPE_MIFARECLASSIC */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.nfc.NFCTagTechnologyNdef.NDEFTYPE_MIFARECLASSIC);
			break;
		case 1: /* NDEFTYPE_NFCFORUMTYPE1 */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.nfc.NFCTagTechnologyNdef.NDEFTYPE_NFCFORUMTYPE1);
			break;
		case 2: /* NDEFTYPE_NFCFORUMTYPE2 */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.nfc.NFCTagTechnologyNdef.NDEFTYPE_NFCFORUMTYPE2);
			break;
		case 3: /* NDEFTYPE_NFCFORUMTYPE3 */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.nfc.NFCTagTechnologyNdef.NDEFTYPE_NFCFORUMTYPE3);
			break;
		case 4: /* NDEFTYPE_NFCFORUMTYPE4 */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.nfc.NFCTagTechnologyNdef.NDEFTYPE_NFCFORUMTYPE4);
			break;
		case 5: /* NDEFTYPE_OTHERS */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.nfc.NFCTagTechnologyNdef.NDEFTYPE_OTHERS);
			break;
		case 6: /* isWritable */
			result = org.meshpoint.anode.js.JSValue.asJSBoolean(inst.isWritable);
			break;
		case 7: /* maxNdefMessageSize */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)inst.maxNdefMessageSize);
			break;
		case 8: /* ndefType */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)inst.ndefType);
			break;
		default:
		}
		return result;
	}

	static void __set(org.webinos.api.nfc.NFCTagTechnologyNdef inst, int attrIdx, Object val) {
		switch(attrIdx) {
		case 6: /* isWritable */
			inst.isWritable = ((org.meshpoint.anode.js.JSValue)val).getBooleanValue();
			break;
		case 7: /* maxNdefMessageSize */
			inst.maxNdefMessageSize = (int)((org.meshpoint.anode.js.JSValue)val).longValue;
			break;
		case 8: /* ndefType */
			inst.ndefType = (int)((org.meshpoint.anode.js.JSValue)val).longValue;
			break;
		default:
			throw new UnsupportedOperationException();
		}
	}

}
