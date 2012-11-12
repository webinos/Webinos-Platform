/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.user;

public class Org_webinos_api_deviceorientation_MotionCB extends org.meshpoint.anode.js.JSInterface implements org.webinos.api.deviceorientation.MotionCB {

	private static int classId = org.meshpoint.anode.bridge.Env.getInterfaceId(org.webinos.api.deviceorientation.MotionCB.class);

	Org_webinos_api_deviceorientation_MotionCB(long instHandle) { super(instHandle); }

	public void finalize() { super.release(classId); }

	private static Object[] __args = new Object[1];

	public void onMotionEvent(org.webinos.api.deviceorientation.MotionEvent arg0) {
		__args[0] = arg0;
		__invoke(classId, 0, __args);
	}

}
