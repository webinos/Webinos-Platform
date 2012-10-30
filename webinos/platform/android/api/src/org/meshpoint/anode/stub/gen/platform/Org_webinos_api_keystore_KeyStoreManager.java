/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_api_keystore_KeyStoreManager {

	private static Object[] __args = new Object[4];

	public static Object[] __getArgs() { return __args; }

	static Object __invoke(org.webinos.api.keystore.KeyStoreManager inst, int opIdx, Object[] args) {
		Object result = null;
		switch(opIdx) {
		case 0: /* delete */
			inst.delete(
				(org.webinos.api.SuccessCallback)args[0],
				(org.webinos.api.ErrorCallback)args[1],
				(String)args[2]
			);
			break;
		case 1: /* get */
			inst.get(
				(org.webinos.api.keystore.KeyStoreSuccessCallback)args[0],
				(org.webinos.api.ErrorCallback)args[1],
				(String)args[2]
			);
			break;
		case 2: /* put */
			inst.put(
				(org.webinos.api.SuccessCallback)args[0],
				(org.webinos.api.ErrorCallback)args[1],
				(String)args[2],
				(String)args[3]
			);
			break;
		default:
		}
		return result;
	}

}
