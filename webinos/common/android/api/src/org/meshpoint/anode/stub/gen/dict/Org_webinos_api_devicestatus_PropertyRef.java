/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_devicestatus_PropertyRef {

	private static Object[] __args = new Object[3];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.devicestatus.PropertyRef ob, Object[] vals) {
		ob.aspect = (String)vals[0];
		ob.component = (String)vals[1];
		ob.property = (String)vals[2];
	}

	public static Object[] __export(org.webinos.api.devicestatus.PropertyRef ob) {
		__args[0] = ob.aspect;
		__args[1] = ob.component;
		__args[2] = ob.property;
		return __args;
	}

}
