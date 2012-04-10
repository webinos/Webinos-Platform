/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_deviceorientation_OrientationEvent {

	private static Object[] __args = new Object[4];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.deviceorientation.OrientationEvent ob, Object[] vals) {
		ob.absolute = ((org.meshpoint.anode.js.JSValue)vals[0]).getBooleanValue();
		ob.alpha = ((org.meshpoint.anode.js.JSValue)vals[1]).dblValue;
		ob.beta = ((org.meshpoint.anode.js.JSValue)vals[2]).dblValue;
		ob.gamma = ((org.meshpoint.anode.js.JSValue)vals[3]).dblValue;
	}

	public static Object[] __export(org.webinos.api.deviceorientation.OrientationEvent ob) {
		__args[0] = org.meshpoint.anode.js.JSValue.asJSBoolean(ob.absolute);
		__args[1] = org.meshpoint.anode.js.JSValue.asJSNumber(ob.alpha);
		__args[2] = org.meshpoint.anode.js.JSValue.asJSNumber(ob.beta);
		__args[3] = org.meshpoint.anode.js.JSValue.asJSNumber(ob.gamma);
		return __args;
	}

}
