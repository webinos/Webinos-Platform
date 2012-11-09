/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_api_messaging_MessagingManager {

	private static Object[] __args = new Object[3];

	public static Object[] __getArgs() { return __args; }

	static Object __invoke(org.webinos.api.messaging.MessagingManager inst, int opIdx, Object[] args) {
		Object result = null;
		switch(opIdx) {
		case 0: /* createMessage */
			result = inst.createMessage(
				(Integer)args[0]
			);
			break;
		case 1: /* findMessages */
			result = inst.findMessages(
				(org.webinos.api.messaging.FindMessagesSuccessCallback)args[0],
				(org.webinos.api.ErrorCallback)args[1],
				(org.webinos.api.messaging.MessageFilter)args[2]
			);
			break;
		case 2: /* onEmail */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)inst.onEmail(
				(org.webinos.api.messaging.OnIncomingMessage)args[0]
			));
			break;
		case 3: /* onIM */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)inst.onIM(
				(org.webinos.api.messaging.OnIncomingMessage)args[0]
			));
			break;
		case 4: /* onMMS */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)inst.onMMS(
				(org.webinos.api.messaging.OnIncomingMessage)args[0]
			));
			break;
		case 5: /* onSMS */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)inst.onSMS(
				(org.webinos.api.messaging.OnIncomingMessage)args[0]
			));
			break;
		case 6: /* sendMessage */
			result = inst.sendMessage(
				(org.webinos.api.messaging.MessageSendCallback)args[0],
				(org.webinos.api.ErrorCallback)args[1],
				(org.webinos.api.messaging.Message)args[2]
			);
			break;
		case 7: /* unsubscribe */
			inst.unsubscribe(
				(int)((org.meshpoint.anode.js.JSValue)args[0]).longValue
			);
			break;
		default:
		}
		return result;
	}

	static Object __get(org.webinos.api.messaging.MessagingManager inst, int attrIdx) {
		Object result = null;
		switch(attrIdx) {
		case 0: /* FOLDER_DRAFTS */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.messaging.MessagingManager.FOLDER_DRAFTS);
			break;
		case 1: /* FOLDER_INBOX */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.messaging.MessagingManager.FOLDER_INBOX);
			break;
		case 2: /* FOLDER_OUTBOX */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.messaging.MessagingManager.FOLDER_OUTBOX);
			break;
		case 3: /* FOLDER_SENTBOX */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.messaging.MessagingManager.FOLDER_SENTBOX);
			break;
		case 4: /* TYPE_EMAIL */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.messaging.MessagingManager.TYPE_EMAIL);
			break;
		case 5: /* TYPE_IM */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.messaging.MessagingManager.TYPE_IM);
			break;
		case 6: /* TYPE_MMS */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.messaging.MessagingManager.TYPE_MMS);
			break;
		case 7: /* TYPE_SMS */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.messaging.MessagingManager.TYPE_SMS);
			break;
		default:
		}
		return result;
	}

	static void __set(org.webinos.api.messaging.MessagingManager inst, int attrIdx, Object val) {
		switch(attrIdx) {
		default:
			throw new UnsupportedOperationException();
		}
	}

}
