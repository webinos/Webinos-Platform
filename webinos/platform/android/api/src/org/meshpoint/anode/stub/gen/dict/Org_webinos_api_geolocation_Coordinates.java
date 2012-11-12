/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_geolocation_Coordinates {

	private static Object[] __args = new Object[7];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.geolocation.Coordinates ob, Object[] vals) {
		ob.accuracy = (Double)vals[0];
		ob.altitude = (Double)vals[1];
		ob.altitudeAccuracy = (Double)vals[2];
		ob.heading = ((org.meshpoint.anode.js.JSValue)vals[3]).dblValue;
		ob.latitude = ((org.meshpoint.anode.js.JSValue)vals[4]).dblValue;
		ob.longitude = ((org.meshpoint.anode.js.JSValue)vals[5]).dblValue;
		ob.speed = (Double)vals[6];
	}

	public static Object[] __export(org.webinos.api.geolocation.Coordinates ob) {
		__args[0] = ob.accuracy;
		__args[1] = ob.altitude;
		__args[2] = ob.altitudeAccuracy;
		__args[3] = org.meshpoint.anode.js.JSValue.asJSNumber(ob.heading);
		__args[4] = org.meshpoint.anode.js.JSValue.asJSNumber(ob.latitude);
		__args[5] = org.meshpoint.anode.js.JSValue.asJSNumber(ob.longitude);
		__args[6] = ob.speed;
		return __args;
	}

}
