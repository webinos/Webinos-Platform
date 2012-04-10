/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_sensor_SensorEvent {

	private static Object[] __args = new Object[11];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.sensor.SensorEvent ob, Object[] vals) {
		ob.accuracy = (int)((org.meshpoint.anode.js.JSValue)vals[5]).longValue;
		ob.interrupt = ((org.meshpoint.anode.js.JSValue)vals[6]).getBooleanValue();
		ob.rate = (int)((org.meshpoint.anode.js.JSValue)vals[7]).longValue;
		ob.sensorId = (String)vals[8];
		ob.sensorType = (String)vals[9];
		ob.sensorValues = (double[])vals[10];
	}

	public static Object[] __export(org.webinos.api.sensor.SensorEvent ob) {
		__args[5] = org.meshpoint.anode.js.JSValue.asJSNumber((long)ob.accuracy);
		__args[6] = org.meshpoint.anode.js.JSValue.asJSBoolean(ob.interrupt);
		__args[7] = org.meshpoint.anode.js.JSValue.asJSNumber((long)ob.rate);
		__args[8] = ob.sensorId;
		__args[9] = ob.sensorType;
		__args[10] = ob.sensorValues;
		return __args;
	}

}
