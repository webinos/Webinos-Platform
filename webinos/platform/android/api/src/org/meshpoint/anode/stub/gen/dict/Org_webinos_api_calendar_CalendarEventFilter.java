/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_calendar_CalendarEventFilter {

	private static Object[] __args = new Object[14];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.calendar.CalendarEventFilter ob, Object[] vals) {
		ob.description = (String)vals[0];
		ob.end = (String)vals[1];
		ob.endAfter = (String)vals[2];
		ob.endBefore = (String)vals[3];
		ob.id = (String)vals[4];
		ob.location = (String)vals[5];
		ob.recurrence = (org.webinos.api.calendar.CalendarRepeatRule)vals[6];
		ob.reminder = (String)vals[7];
		ob.start = (String)vals[8];
		ob.startAfter = (String)vals[9];
		ob.startBefore = (String)vals[10];
		ob.status = (String)vals[11];
		ob.summary = (String)vals[12];
		ob.transparency = (String)vals[13];
	}

	public static Object[] __export(org.webinos.api.calendar.CalendarEventFilter ob) {
		__args[0] = ob.description;
		__args[1] = ob.end;
		__args[2] = ob.endAfter;
		__args[3] = ob.endBefore;
		__args[4] = ob.id;
		__args[5] = ob.location;
		__args[6] = ob.recurrence;
		__args[7] = ob.reminder;
		__args[8] = ob.start;
		__args[9] = ob.startAfter;
		__args[10] = ob.startBefore;
		__args[11] = ob.status;
		__args[12] = ob.summary;
		__args[13] = ob.transparency;
		return __args;
	}

}
