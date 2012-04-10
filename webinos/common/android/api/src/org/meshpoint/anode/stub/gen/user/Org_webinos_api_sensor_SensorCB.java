/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.user;

public class Org_webinos_api_sensor_SensorCB extends org.meshpoint.anode.js.JSInterface implements org.webinos.api.sensor.SensorCB {

	private static int classId = org.meshpoint.anode.bridge.Env.getInterfaceId(org.webinos.api.sensor.SensorCB.class);

	Org_webinos_api_sensor_SensorCB(long instHandle) { super(instHandle); }

	public void finalize() { super.release(classId); }

	private static Object[] __args = new Object[1];

	public void onSensorEvent(org.webinos.api.sensor.SensorEvent arg0) {
		__args[0] = arg0;
		__invoke(classId, 0, __args);
	}

}
