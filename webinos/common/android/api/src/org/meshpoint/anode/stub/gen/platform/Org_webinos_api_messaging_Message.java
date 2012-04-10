/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_api_messaging_Message {

	private static Object[] __args = new Object[2];

	public static Object[] __getArgs() { return __args; }

	static Object __invoke(org.webinos.api.messaging.Message inst, int opIdx, Object[] args) {
		return inst.update(
			(org.webinos.api.messaging.UpdateMessageSuccessCallback)args[0],
			(org.webinos.api.ErrorCallback)args[1]
		);
	}

	static Object __get(org.webinos.api.messaging.Message inst, int attrIdx) {
		Object result = null;
		switch(attrIdx) {
		case 0: /* attachments */
			result = inst.attachments;
			break;
		case 1: /* bcc */
			result = inst.bcc;
			break;
		case 2: /* body */
			result = inst.body;
			break;
		case 3: /* cc */
			result = inst.cc;
			break;
		case 4: /* folder */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)inst.folder);
			break;
		case 5: /* from */
			result = inst.from;
			break;
		case 6: /* id */
			result = inst.id;
			break;
		case 7: /* isRead */
			result = org.meshpoint.anode.js.JSValue.asJSBoolean(inst.isRead);
			break;
		case 8: /* priority */
			result = org.meshpoint.anode.js.JSValue.asJSBoolean(inst.priority);
			break;
		case 9: /* subject */
			result = inst.subject;
			break;
		case 10: /* timestamp */
			result = inst.timestamp;
			break;
		case 11: /* to */
			result = inst.to;
			break;
		case 12: /* type */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)inst.type);
			break;
		default:
		}
		return result;
	}

	static void __set(org.webinos.api.messaging.Message inst, int attrIdx, Object val) {
		switch(attrIdx) {
		case 0: /* attachments */
			inst.attachments = (org.w3c.dom.ObjectArray<org.webinos.api.File>)val;
			break;
		case 1: /* bcc */
			inst.bcc = (org.w3c.dom.ObjectArray<String>)val;
			break;
		case 2: /* body */
			inst.body = (String)val;
			break;
		case 3: /* cc */
			inst.cc = (org.w3c.dom.ObjectArray<String>)val;
			break;
		case 4: /* folder */
			inst.folder = (int)((org.meshpoint.anode.js.JSValue)val).longValue;
			break;
		case 5: /* from */
			inst.from = (String)val;
			break;
		case 6: /* id */
			inst.id = (String)val;
			break;
		case 7: /* isRead */
			inst.isRead = ((org.meshpoint.anode.js.JSValue)val).getBooleanValue();
			break;
		case 8: /* priority */
			inst.priority = ((org.meshpoint.anode.js.JSValue)val).getBooleanValue();
			break;
		case 9: /* subject */
			inst.subject = (String)val;
			break;
		case 10: /* timestamp */
			inst.timestamp = (java.util.Date)val;
			break;
		case 11: /* to */
			inst.to = (org.w3c.dom.ObjectArray<String>)val;
			break;
		case 12: /* type */
			inst.type = (int)((org.meshpoint.anode.js.JSValue)val).longValue;
			break;
		default:
			throw new UnsupportedOperationException();
		}
	}

}
