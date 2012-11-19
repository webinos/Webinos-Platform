/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_api_applauncher_AppLauncherManager {

	private static Object[] __args = new Object[3];

	public static Object[] __getArgs() { return __args; }

	static Object __invoke(org.webinos.api.applauncher.AppLauncherManager inst, int opIdx, Object[] args) {
		Object result = null;
		switch(opIdx) {
		case 0: /* launch */
			inst.launchApplication(
				(org.webinos.api.applauncher.AppLauncherCallback)args[0],
				(org.webinos.api.applauncher.AppLauncherErrorCallback)args[1],
				(String)args[2]
			);
			break;
		default:
		}
		return result;
	}

}
