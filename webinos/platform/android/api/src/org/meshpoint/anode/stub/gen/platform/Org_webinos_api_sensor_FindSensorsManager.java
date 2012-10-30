/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_api_sensor_FindSensorsManager {

	private static Object[] __args = new Object[3];

	public static Object[] __getArgs() { return __args; }

	static Object __invoke(org.webinos.api.sensor.FindSensorsManager inst, int opIdx, Object[] args) {
		return inst.findSensors(
			(String)args[0],
			(org.webinos.api.sensor.SensorFindCB)args[1],
			(org.webinos.api.sensor.SensorErrorCB)args[2]
		);
	}

}
