/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_deviceorientation_RotationRate {

	private static Object[] __args = new Object[3];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.deviceorientation.RotationRate ob, Object[] vals) {
		ob.alpha = (Double)vals[0];
		ob.beta = (Double)vals[1];
		ob.gamma = (Double)vals[2];
	}

	public static Object[] __export(org.webinos.api.deviceorientation.RotationRate ob) {
		__args[0] = ob.alpha;
		__args[1] = ob.beta;
		__args[2] = ob.gamma;
		return __args;
	}

}
