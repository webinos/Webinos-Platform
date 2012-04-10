/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_api_nfc_NdefMessage {

	private static Object[] __args = new Object[2];

	public static Object[] __getArgs() { return __args; }

	static Object __invoke(org.webinos.api.nfc.NdefMessage inst, int opIdx, Object[] args) {
		Object result = null;
		switch(opIdx) {
		case 0: /* addBinaryNdefRecord */
			inst.addBinaryNdefRecord(
				(int)((org.meshpoint.anode.js.JSValue)args[0]).longValue,
				(byte[])args[1]
			);
			break;
		case 1: /* addTextNdefRecord */
			inst.addTextNdefRecord(
				(int)((org.meshpoint.anode.js.JSValue)args[0]).longValue,
				(String)args[1]
			);
			break;
		default:
		}
		return result;
	}

	static Object __get(org.webinos.api.nfc.NdefMessage inst, int attrIdx) {
		Object result = null;
		switch(attrIdx) {
		case 0: /* NDEFRECTYPE_EMPTY */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.nfc.NdefMessage.NDEFRECTYPE_EMPTY);
			break;
		case 1: /* NDEFRECTYPE_EXTERNALRTD */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.nfc.NdefMessage.NDEFRECTYPE_EXTERNALRTD);
			break;
		case 2: /* NDEFRECTYPE_MEDIA */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.nfc.NdefMessage.NDEFRECTYPE_MEDIA);
			break;
		case 3: /* NDEFRECTYPE_RTD */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.nfc.NdefMessage.NDEFRECTYPE_RTD);
			break;
		case 4: /* NDEFRECTYPE_UNKNOWN */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.nfc.NdefMessage.NDEFRECTYPE_UNKNOWN);
			break;
		case 5: /* NDEFRECTYPE_URI */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.nfc.NdefMessage.NDEFRECTYPE_URI);
			break;
		case 6: /* ndefRecords */
			result = inst.ndefRecords;
			break;
		default:
		}
		return result;
	}

	static void __set(org.webinos.api.nfc.NdefMessage inst, int attrIdx, Object val) {
		switch(attrIdx) {
		case 6: /* ndefRecords */
			inst.ndefRecords = (org.w3c.dom.ObjectArray<org.webinos.api.nfc.NdefRecord>)val;
			break;
		default:
			throw new UnsupportedOperationException();
		}
	}

}
