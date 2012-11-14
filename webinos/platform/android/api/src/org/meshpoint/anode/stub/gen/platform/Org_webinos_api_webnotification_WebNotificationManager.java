/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_api_webnotification_WebNotificationManager {

	private static Object[] __args = new Object[3];

	public static Object[] __getArgs() { return __args; }

	static Object __invoke(org.webinos.api.webnotification.WebNotificationManager inst, int opIdx, Object[] args) {
		Object result = null;
		switch(opIdx) {
		case 0: /* notify */
			inst.notify(
				((String[])args[0]),
				(org.webinos.api.webnotification.WebNotificationCallback)args[1],
				(org.webinos.api.webnotification.WebNotificationErrorCallback)args[2]				
			);
			break;
		default:
		}
		return result;
	}

}
