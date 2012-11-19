/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_calendar_CalendarEvent {

	private static Object[] __args = new Object[10];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.calendar.CalendarEvent ob, Object[] vals) {
		ob.description = (String)vals[0];
		ob.end = (String)vals[1];
		ob.id = (String)vals[2];
		ob.location = (String)vals[3];
		ob.recurrence = (org.webinos.api.calendar.CalendarRepeatRule)vals[4];
		ob.reminder = (String)vals[5];
		ob.start = (String)vals[6];
		ob.status = (String)vals[7];
		ob.summary = (String)vals[8];
		ob.transparency = (String)vals[9];
	}

	public static Object[] __export(org.webinos.api.calendar.CalendarEvent ob) {
		__args[0] = ob.description;
		__args[1] = ob.end;
		__args[2] = ob.id;
		__args[3] = ob.location;
		__args[4] = ob.recurrence;
		__args[5] = ob.reminder;
		__args[6] = ob.start;
		__args[7] = ob.status;
		__args[8] = ob.summary;
		__args[9] = ob.transparency;
		return __args;
	}

}
