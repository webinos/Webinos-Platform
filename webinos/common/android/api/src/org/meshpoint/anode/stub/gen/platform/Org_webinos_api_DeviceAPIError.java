/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_api_DeviceAPIError {

	private static Object[] __args = new Object[0];

	public static Object[] __getArgs() { return __args; }

	static Object __invoke(org.webinos.api.DeviceAPIError inst, int opIdx, Object[] args) {
		return inst.getMessage();
	}

	static Object __get(org.webinos.api.DeviceAPIError inst, int attrIdx) {
		Object result = null;
		switch(attrIdx) {
		case 0: /* ABORT_ERR */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.DeviceAPIError.ABORT_ERR);
			break;
		case 1: /* DOMSTRING_SIZE_ERR */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.DeviceAPIError.DOMSTRING_SIZE_ERR);
			break;
		case 2: /* HIERARCHY_REQUEST_ERR */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.DeviceAPIError.HIERARCHY_REQUEST_ERR);
			break;
		case 3: /* INDEX_SIZE_ERR */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.DeviceAPIError.INDEX_SIZE_ERR);
			break;
		case 4: /* INUSE_ATTRIBUTE_ERR */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.DeviceAPIError.INUSE_ATTRIBUTE_ERR);
			break;
		case 5: /* INVALID_ACCESS_ERR */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.DeviceAPIError.INVALID_ACCESS_ERR);
			break;
		case 6: /* INVALID_CHARACTER_ERR */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.DeviceAPIError.INVALID_CHARACTER_ERR);
			break;
		case 7: /* INVALID_ERROR */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.DeviceAPIError.INVALID_ERROR);
			break;
		case 8: /* INVALID_MODIFICATION_ERR */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.DeviceAPIError.INVALID_MODIFICATION_ERR);
			break;
		case 9: /* INVALID_STATE_ERR */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.DeviceAPIError.INVALID_STATE_ERR);
			break;
		case 10: /* INVALID_VALUES_ERR */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.DeviceAPIError.INVALID_VALUES_ERR);
			break;
		case 11: /* IO_ERR */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.DeviceAPIError.IO_ERR);
			break;
		case 12: /* NAMESPACE_ERR */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.DeviceAPIError.NAMESPACE_ERR);
			break;
		case 13: /* NETWORK_ERR */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.DeviceAPIError.NETWORK_ERR);
			break;
		case 14: /* NOT_AVAILABLE_ERR */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.DeviceAPIError.NOT_AVAILABLE_ERR);
			break;
		case 15: /* NOT_FOUND_ERR */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.DeviceAPIError.NOT_FOUND_ERR);
			break;
		case 16: /* NOT_SUPPORTED_ERR */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.DeviceAPIError.NOT_SUPPORTED_ERR);
			break;
		case 17: /* NO_DATA_ALLOWED_ERR */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.DeviceAPIError.NO_DATA_ALLOWED_ERR);
			break;
		case 18: /* NO_MODIFICATION_ALLOWED_ERR */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.DeviceAPIError.NO_MODIFICATION_ALLOWED_ERR);
			break;
		case 19: /* SECURITY_ERR */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.DeviceAPIError.SECURITY_ERR);
			break;
		case 20: /* SYNTAX_ERR */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.DeviceAPIError.SYNTAX_ERR);
			break;
		case 21: /* TIMEOUT_ERR */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.DeviceAPIError.TIMEOUT_ERR);
			break;
		case 22: /* TYPE_MISMATCH_ERR */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.DeviceAPIError.TYPE_MISMATCH_ERR);
			break;
		case 23: /* UNKNOWN_ERR */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.DeviceAPIError.UNKNOWN_ERR);
			break;
		case 24: /* VALIDATION_ERR */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.DeviceAPIError.VALIDATION_ERR);
			break;
		case 25: /* WRONG_DOCUMENT_ERR */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.DeviceAPIError.WRONG_DOCUMENT_ERR);
			break;
		case 26: /* code */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)inst.code);
			break;
		case 27: /* message */
			result = inst.message;
			break;
		default:
		}
		return result;
	}

	static void __set(org.webinos.api.DeviceAPIError inst, int attrIdx, Object val) {
		switch(attrIdx) {
		case 26: /* code */
			inst.code = (int)((org.meshpoint.anode.js.JSValue)val).longValue;
			break;
		case 27: /* message */
			inst.message = (String)val;
			break;
		default:
			throw new UnsupportedOperationException();
		}
	}

}
