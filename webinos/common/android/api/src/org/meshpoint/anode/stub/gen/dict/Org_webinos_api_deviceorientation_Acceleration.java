/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_deviceorientation_Acceleration {

	private static Object[] __args = new Object[3];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.deviceorientation.Acceleration ob, Object[] vals) {
		ob.x = ((org.meshpoint.anode.js.JSValue)vals[0]).dblValue;
		ob.y = ((org.meshpoint.anode.js.JSValue)vals[1]).dblValue;
		ob.z = ((org.meshpoint.anode.js.JSValue)vals[2]).dblValue;
	}

	public static Object[] __export(org.webinos.api.deviceorientation.Acceleration ob) {
		__args[0] = org.meshpoint.anode.js.JSValue.asJSNumber(ob.x);
		__args[1] = org.meshpoint.anode.js.JSValue.asJSNumber(ob.y);
		__args[2] = org.meshpoint.anode.js.JSValue.asJSNumber(ob.z);
		return __args;
	}

}
