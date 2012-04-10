/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_api_deviceorientation_DeviceorientationManager {

	private static Object[] __args = new Object[1];

	public static Object[] __getArgs() { return __args; }

	static Object __invoke(org.webinos.api.deviceorientation.DeviceorientationManager inst, int opIdx, Object[] args) {
		Object result = null;
		switch(opIdx) {
		case 0: /* unwatchMotion */
			inst.unwatchMotion();
			break;
		case 1: /* unwatchOrientation */
			inst.unwatchOrientation();
			break;
		case 2: /* watchMotion */
			inst.watchMotion(
				(org.webinos.api.deviceorientation.MotionCB)args[0]
			);
			break;
		case 3: /* watchOrientation */
			inst.watchOrientation(
				(org.webinos.api.deviceorientation.OrientationCB)args[0]
			);
			break;
		default:
		}
		return result;
	}

}
