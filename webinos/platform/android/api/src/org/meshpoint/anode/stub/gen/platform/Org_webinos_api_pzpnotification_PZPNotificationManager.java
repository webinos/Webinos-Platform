/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_api_pzpnotification_PZPNotificationManager {

	private static Object[] __args = new Object[2];

	public static Object[] __getArgs() { return __args; }

	static Object __invoke(org.webinos.api.pzpnotification.PZPNotificationManager inst, int opIdx, Object[] args) {
		Object result = null;
		switch(opIdx) {
		case 0: /* eventNotify */
			inst.eventNotify(
				(String)args[0],
				(org.webinos.api.pzpnotification.PZPNotificationCallback)args[1]
			);
			break;
		case 1: /* eventRegister */
			inst.eventRegister(
				(org.webinos.api.pzpnotification.PZPonReceiveNotificationCallback)args[0]
			);
			break;
		case 2: /* eventUnregister */
			inst.eventUnregister();
			break;
		default:
		}
		return result;
	}

}
