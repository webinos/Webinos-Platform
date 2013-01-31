/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_sensor_SensorEvent {

	private static Object[] __args = new Object[11];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.sensor.SensorEvent ob, Object[] vals) {
		ob.accuracy = (int)((org.meshpoint.anode.js.JSValue)vals[5]).longValue;
		ob.eventFireMode = (String)vals[6];
		ob.position = (org.webinos.api.sensor.GeoPosition)vals[7];
		ob.rate = (int)((org.meshpoint.anode.js.JSValue)vals[8]).longValue;
		ob.sensorType = (String)vals[9];
		ob.values = (double[])vals[10];
	}

	public static Object[] __export(org.webinos.api.sensor.SensorEvent ob) {
		__args[5] = org.meshpoint.anode.js.JSValue.asJSNumber((long)ob.accuracy);
		__args[6] = ob.eventFireMode;
		__args[7] = ob.position;
		__args[8] = org.meshpoint.anode.js.JSValue.asJSNumber((long)ob.rate);
		__args[9] = ob.sensorType;
		__args[10] = ob.values;
		return __args;
	}

}
