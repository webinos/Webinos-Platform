/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_devicestatus_WatchOptions {

	private static Object[] __args = new Object[3];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.devicestatus.WatchOptions ob, Object[] vals) {
		ob.maxNotificationInterval = (Integer)vals[0];
		ob.minChangePercent = (Integer)vals[1];
		ob.minNotificationInterval = (Integer)vals[2];
	}

	public static Object[] __export(org.webinos.api.devicestatus.WatchOptions ob) {
		__args[0] = ob.maxNotificationInterval;
		__args[1] = ob.minChangePercent;
		__args[2] = ob.minNotificationInterval;
		return __args;
	}

}
