/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_geolocation_PositionError {

	private static Object[] __args = new Object[6];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.geolocation.PositionError ob, Object[] vals) {
		ob.code = (int)((org.meshpoint.anode.js.JSValue)vals[4]).longValue;
		ob.message = (String)vals[5];
	}

	public static Object[] __export(org.webinos.api.geolocation.PositionError ob) {
		__args[4] = org.meshpoint.anode.js.JSValue.asJSNumber((long)ob.code);
		__args[5] = ob.message;
		return __args;
	}

}
