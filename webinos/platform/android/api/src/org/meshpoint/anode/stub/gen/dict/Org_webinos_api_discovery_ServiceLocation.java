/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_discovery_ServiceLocation {

	private static Object[] __args = new Object[3];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.discovery.ServiceLocation ob, Object[] vals) {
		ob.accuracy = ((org.meshpoint.anode.js.JSValue)vals[0]).dblValue;
		ob.latitude = ((org.meshpoint.anode.js.JSValue)vals[1]).dblValue;
		ob.longitude = ((org.meshpoint.anode.js.JSValue)vals[2]).dblValue;
	}

	public static Object[] __export(org.webinos.api.discovery.ServiceLocation ob) {
		__args[0] = org.meshpoint.anode.js.JSValue.asJSNumber(ob.accuracy);
		__args[1] = org.meshpoint.anode.js.JSValue.asJSNumber(ob.latitude);
		__args[2] = org.meshpoint.anode.js.JSValue.asJSNumber(ob.longitude);
		return __args;
	}

}
