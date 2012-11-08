/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_geolocation_Position {

	private static Object[] __args = new Object[2];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.geolocation.Position ob, Object[] vals) {
		ob.coords = (org.webinos.api.geolocation.Coordinates)vals[0];
		ob.timestamp = ((org.meshpoint.anode.js.JSValue)vals[1]).longValue;
	}

	public static Object[] __export(org.webinos.api.geolocation.Position ob) {
		__args[0] = ob.coords;
		__args[1] = org.meshpoint.anode.js.JSValue.asJSNumber(ob.timestamp);
		return __args;
	}

}
