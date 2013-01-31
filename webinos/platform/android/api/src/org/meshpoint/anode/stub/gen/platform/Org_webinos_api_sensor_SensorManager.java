/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_api_sensor_SensorManager {

	private static Object[] __args = new Object[1];

	public static Object[] __getArgs() { return __args; }

	static Object __invoke(org.webinos.api.sensor.SensorManager inst, int opIdx, Object[] args) {
		Object result = null;
		switch(opIdx) {
		case 0: /* findSensors */
			result = inst.findSensors();
			break;
		case 1: /* log */
			inst.log(
				(String)args[0]
			);
			break;
		default:
		}
		return result;
	}

}
