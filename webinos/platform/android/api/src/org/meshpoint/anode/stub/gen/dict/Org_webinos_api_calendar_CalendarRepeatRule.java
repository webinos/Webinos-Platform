/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_calendar_CalendarRepeatRule {

	private static Object[] __args = new Object[9];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.calendar.CalendarRepeatRule ob, Object[] vals) {
		ob.daysInMonth = (int[])vals[0];
		ob.daysInWeek = (int[])vals[1];
		ob.daysInYear = (int[])vals[2];
		ob.exceptionDates = (String[])vals[3];
		ob.expires = (String)vals[4];
		ob.frequency = (String)vals[5];
		ob.interval = (Integer)vals[6];
		ob.monthsInYear = (int[])vals[7];
		ob.weeksInMonth = (int[])vals[8];
	}

	public static Object[] __export(org.webinos.api.calendar.CalendarRepeatRule ob) {
		__args[0] = ob.daysInMonth;
		__args[1] = ob.daysInWeek;
		__args[2] = ob.daysInYear;
		__args[3] = ob.exceptionDates;
		__args[4] = ob.expires;
		__args[5] = ob.frequency;
		__args[6] = ob.interval;
		__args[7] = ob.monthsInYear;
		__args[8] = ob.weeksInMonth;
		return __args;
	}

}
