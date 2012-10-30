/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_sensor_SensorError {

	private static Object[] __args = new Object[11];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.sensor.SensorError ob, Object[] vals) {
		ob.code = (int)((org.meshpoint.anode.js.JSValue)vals[10]).longValue;
	}

	public static Object[] __export(org.webinos.api.sensor.SensorError ob) {
		__args[10] = org.meshpoint.anode.js.JSValue.asJSNumber((long)ob.code);
		return __args;
	}

}
