/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_api_calendar_CalendarManager {

	private static Object[] __args = new Object[3];

	public static Object[] __getArgs() { return __args; }

	static Object __invoke(org.webinos.api.calendar.CalendarManager inst, int opIdx, Object[] args) {
		inst.findEvents(
			(org.webinos.api.calendar.CalendarEventSuccessCB)args[0],
			(org.webinos.api.calendar.CalendarErrorCB)args[1],
			(org.webinos.api.calendar.CalendarFindOptions)args[2]
		);
		return null;
	}

}
