/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_calendar_CalendarFindOptions {

	private static Object[] __args = new Object[2];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.calendar.CalendarFindOptions ob, Object[] vals) {
		ob.filter = (org.webinos.api.calendar.CalendarEventFilter)vals[0];
		ob.multiple = (Boolean)vals[1];
	}

	public static Object[] __export(org.webinos.api.calendar.CalendarFindOptions ob) {
		__args[0] = ob.filter;
		__args[1] = ob.multiple;
		return __args;
	}

}
