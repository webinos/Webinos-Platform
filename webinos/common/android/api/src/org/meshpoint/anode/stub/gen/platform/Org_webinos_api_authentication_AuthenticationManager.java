/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_api_authentication_AuthenticationManager {

	private static Object[] __args = new Object[2];

	public static Object[] __getArgs() { return __args; }

	static Object __invoke(org.webinos.api.authentication.AuthenticationManager inst, int opIdx, Object[] args) {
		Object result = null;
		switch(opIdx) {
		case 0: /* authenticate */
			inst.authenticate(
				(org.webinos.api.authentication.AuthSuccessCB)args[0],
				(org.webinos.api.authentication.AuthErrorCB)args[1]
			);
			break;
		case 1: /* getAuthenticationStatus */
			result = inst.getAuthenticationStatus();
			break;
		case 2: /* isAuthenticated */
			result = org.meshpoint.anode.js.JSValue.asJSBoolean(inst.isAuthenticated());
			break;
		default:
		}
		return result;
	}

}
