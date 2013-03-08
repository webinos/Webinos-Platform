/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_mediacontent_FilterValues {

	private static Object[] __args = new Object[7];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.mediacontent.FilterValues ob, Object[] vals) {
		ob.attributeName = (String)vals[0];
		ob.endValue = vals[1];
		ob.filters = (org.webinos.api.mediacontent.FilterValues[])vals[2];
		ob.initialValue = vals[3];
		ob.matchFlag = (String)vals[4];
		ob.matchValue = vals[5];
		ob.type = (String)vals[6];
	}

	public static Object[] __export(org.webinos.api.mediacontent.FilterValues ob) {
		__args[0] = ob.attributeName;
		__args[1] = ob.endValue;
		__args[2] = ob.filters;
		__args[3] = ob.initialValue;
		__args[4] = ob.matchFlag;
		__args[5] = ob.matchValue;
		__args[6] = ob.type;
		return __args;
	}

}
