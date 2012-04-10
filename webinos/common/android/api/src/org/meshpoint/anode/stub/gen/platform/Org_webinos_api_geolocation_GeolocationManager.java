/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_api_geolocation_GeolocationManager {

	private static Object[] __args = new Object[3];

	public static Object[] __getArgs() { return __args; }

	static Object __invoke(org.webinos.api.geolocation.GeolocationManager inst, int opIdx, Object[] args) {
		Object result = null;
		switch(opIdx) {
		case 0: /* clearWatch */
			inst.clearWatch(
				((org.meshpoint.anode.js.JSValue)args[0]).longValue
			);
			break;
		case 1: /* getCurrentPosition */
			inst.getCurrentPosition(
				(org.webinos.api.geolocation.PositionCallback)args[0],
				(org.webinos.api.geolocation.PositionErrorCallback)args[1],
				(org.webinos.api.geolocation.PositionOptions)args[2]
			);
			break;
		case 2: /* watchPosition */
			result = org.meshpoint.anode.js.JSValue.asJSNumber(inst.watchPosition(
				(org.webinos.api.geolocation.PositionCallback)args[0],
				(org.webinos.api.geolocation.PositionErrorCallback)args[1],
				(org.webinos.api.geolocation.PositionOptions)args[2]
			));
			break;
		default:
		}
		return result;
	}

}
