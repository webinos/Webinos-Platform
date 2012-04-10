/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_messaging_MessageFilter {

	private static Object[] __args = new Object[13];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.messaging.MessageFilter ob, Object[] vals) {
		ob.bcc = (String[])vals[0];
		ob.body = (String)vals[1];
		ob.cc = (String[])vals[2];
		ob.endTimestamp = (java.util.Date)vals[3];
		ob.folder = (int[])vals[4];
		ob.from = (String)vals[5];
		ob.id = (String)vals[6];
		ob.isRead = (Boolean)vals[7];
		ob.messagePriority = (Boolean)vals[8];
		ob.startTimestamp = (java.util.Date)vals[9];
		ob.subject = (String)vals[10];
		ob.to = (String[])vals[11];
		ob.type = (int[])vals[12];
	}

	public static Object[] __export(org.webinos.api.messaging.MessageFilter ob) {
		__args[0] = ob.bcc;
		__args[1] = ob.body;
		__args[2] = ob.cc;
		__args[3] = ob.endTimestamp;
		__args[4] = ob.folder;
		__args[5] = ob.from;
		__args[6] = ob.id;
		__args[7] = ob.isRead;
		__args[8] = ob.messagePriority;
		__args[9] = ob.startTimestamp;
		__args[10] = ob.subject;
		__args[11] = ob.to;
		__args[12] = ob.type;
		return __args;
	}

}
