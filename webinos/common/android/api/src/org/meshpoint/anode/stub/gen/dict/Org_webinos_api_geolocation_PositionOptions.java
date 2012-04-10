/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_geolocation_PositionOptions {

	private static Object[] __args = new Object[3];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.geolocation.PositionOptions ob, Object[] vals) {
		ob.enableHighAccuracy = (Boolean)vals[0];
		ob.maximumAge = (Long)vals[1];
		ob.timeout = (Long)vals[2];
	}

	public static Object[] __export(org.webinos.api.geolocation.PositionOptions ob) {
		__args[0] = ob.enableHighAccuracy;
		__args[1] = ob.maximumAge;
		__args[2] = ob.timeout;
		return __args;
	}

}
