/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_deviceorientation_MotionEvent {

	private static Object[] __args = new Object[4];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.deviceorientation.MotionEvent ob, Object[] vals) {
		ob.acceleration = (org.webinos.api.deviceorientation.Acceleration)vals[0];
		ob.accelerationIncludingGravity = (org.webinos.api.deviceorientation.Acceleration)vals[1];
		ob.interval = (Double)vals[2];
		ob.rotationRate = (org.webinos.api.deviceorientation.RotationRate)vals[3];
	}

	public static Object[] __export(org.webinos.api.deviceorientation.MotionEvent ob) {
		__args[0] = ob.acceleration;
		__args[1] = ob.accelerationIncludingGravity;
		__args[2] = ob.interval;
		__args[3] = ob.rotationRate;
		return __args;
	}

}
