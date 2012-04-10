/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_discovery_Options {

	private static Object[] __args = new Object[1];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.discovery.Options ob, Object[] vals) {
		ob.timeout = (int)((org.meshpoint.anode.js.JSValue)vals[0]).longValue;
	}

	public static Object[] __export(org.webinos.api.discovery.Options ob) {
		__args[0] = org.meshpoint.anode.js.JSValue.asJSNumber((long)ob.timeout);
		return __args;
	}

}
