/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.user;

public class Org_webinos_api_devicestatus_PropertyValueSuccessCallback extends org.meshpoint.anode.js.JSInterface implements org.webinos.api.devicestatus.PropertyValueSuccessCallback {

	private static int classId = org.meshpoint.anode.bridge.Env.getInterfaceId(org.webinos.api.devicestatus.PropertyValueSuccessCallback.class);

	Org_webinos_api_devicestatus_PropertyValueSuccessCallback(long instHandle) { super(instHandle); }

	public void finalize() { super.release(classId); }

	private static Object[] __args = new Object[2];

	public void onsuccess(Object arg0, org.webinos.api.devicestatus.PropertyRef arg1) {
		__args[0] = arg0;
		__args[1] = arg1;
		__invoke(classId, 0, __args);
	}

}
