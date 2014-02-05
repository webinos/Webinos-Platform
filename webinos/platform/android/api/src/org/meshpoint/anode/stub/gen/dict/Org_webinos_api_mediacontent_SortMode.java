/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_mediacontent_SortMode {

	private static Object[] __args = new Object[4];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.mediacontent.SortMode ob, Object[] vals) {
		ob.attributeName = (String)vals[2];
		ob.sortModeOrder = (String)vals[3];
	}

	public static Object[] __export(org.webinos.api.mediacontent.SortMode ob) {
		__args[2] = ob.attributeName;
		__args[3] = ob.sortModeOrder;
		return __args;
	}

}
