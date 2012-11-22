/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_api_qrencoder_QRManager {

	private static Object[] __args = new Object[4];

	public static Object[] __getArgs() { return __args; }

	static Object __invoke(org.webinos.api.qrencoder.QRManager inst, int opIdx, Object[] args) {
		inst.enCode(
			(String)args[0],
			(int)((org.meshpoint.anode.js.JSValue)args[1]).longValue,
			(int)((org.meshpoint.anode.js.JSValue)args[2]).longValue,
			(String)args[3]
		);
		return null;
	}

}
