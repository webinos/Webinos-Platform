/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_mediacontent_SimpleCoordinates {

	private static Object[] __args = new Object[2];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.mediacontent.SimpleCoordinates ob, Object[] vals) {
		ob.latitude = ((org.meshpoint.anode.js.JSValue)vals[0]).dblValue;
		ob.longitude = ((org.meshpoint.anode.js.JSValue)vals[1]).dblValue;
	}

	public static Object[] __export(org.webinos.api.mediacontent.SimpleCoordinates ob) {
		__args[0] = org.meshpoint.anode.js.JSValue.asJSNumber(ob.latitude);
		__args[1] = org.meshpoint.anode.js.JSValue.asJSNumber(ob.longitude);
		return __args;
	}

}
