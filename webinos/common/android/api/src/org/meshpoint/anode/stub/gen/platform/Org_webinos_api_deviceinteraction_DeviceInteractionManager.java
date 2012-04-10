/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_api_deviceinteraction_DeviceInteractionManager {

	private static Object[] __args = new Object[3];

	public static Object[] __getArgs() { return __args; }

	static Object __invoke(org.webinos.api.deviceinteraction.DeviceInteractionManager inst, int opIdx, Object[] args) {
		Object result = null;
		switch(opIdx) {
		case 0: /* lightOff */
			inst.lightOff();
			break;
		case 1: /* lightOn */
			result = inst.lightOn(
				(org.webinos.api.SuccessCallback)args[0],
				(org.webinos.api.ErrorCallback)args[1],
				(int)((org.meshpoint.anode.js.JSValue)args[2]).longValue
			);
			break;
		case 2: /* setWallpaper */
			result = inst.setWallpaper(
				(org.webinos.api.SuccessCallback)args[0],
				(org.webinos.api.ErrorCallback)args[1],
				(String)args[2]
			);
			break;
		case 3: /* startNotify */
			result = inst.startNotify(
				(org.webinos.api.SuccessCallback)args[0],
				(org.webinos.api.ErrorCallback)args[1],
				(int)((org.meshpoint.anode.js.JSValue)args[2]).longValue
			);
			break;
		case 4: /* startVibrate */
			result = inst.startVibrate(
				(org.webinos.api.SuccessCallback)args[0],
				(org.webinos.api.ErrorCallback)args[1],
				(Integer)args[2]
			);
			break;
		case 5: /* stopNotify */
			inst.stopNotify();
			break;
		case 6: /* stopVibrate */
			inst.stopVibrate();
			break;
		default:
		}
		return result;
	}

}
