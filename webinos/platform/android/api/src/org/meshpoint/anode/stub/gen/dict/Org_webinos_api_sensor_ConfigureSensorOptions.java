/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_sensor_ConfigureSensorOptions {

	private static Object[] __args = new Object[10];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.sensor.ConfigureSensorOptions ob, Object[] vals) {
		ob.eventFireMode = (String)vals[6];
		ob.position = (org.webinos.api.sensor.GeoPosition)vals[7];
		ob.rate = (int)((org.meshpoint.anode.js.JSValue)vals[8]).longValue;
		ob.timeout = (int)((org.meshpoint.anode.js.JSValue)vals[9]).longValue;
	}

	public static Object[] __export(org.webinos.api.sensor.ConfigureSensorOptions ob) {
		__args[6] = ob.eventFireMode;
		__args[7] = ob.position;
		__args[8] = org.meshpoint.anode.js.JSValue.asJSNumber((long)ob.rate);
		__args[9] = org.meshpoint.anode.js.JSValue.asJSNumber((long)ob.timeout);
		return __args;
	}

}
