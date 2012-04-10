/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.user;

public class Org_webinos_api_SuccessCallback extends org.meshpoint.anode.js.JSInterface implements org.webinos.api.SuccessCallback {

	private static int classId = org.meshpoint.anode.bridge.Env.getInterfaceId(org.webinos.api.SuccessCallback.class);

	Org_webinos_api_SuccessCallback(long instHandle) { super(instHandle); }

	public void finalize() { super.release(classId); }

	private static Object[] __args = new Object[0];

	public void onsuccess() {
		__invoke(classId, 0, __args);
	}

}
