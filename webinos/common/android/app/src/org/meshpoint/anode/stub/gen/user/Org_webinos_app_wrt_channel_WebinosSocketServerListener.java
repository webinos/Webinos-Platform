/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.user;

public class Org_webinos_app_wrt_channel_WebinosSocketServerListener extends org.meshpoint.anode.js.JSInterface implements org.webinos.app.wrt.channel.WebinosSocketServerListener {

	private static int classId = org.meshpoint.anode.bridge.Env.getInterfaceId(org.webinos.app.wrt.channel.WebinosSocketServerListener.class);

	Org_webinos_app_wrt_channel_WebinosSocketServerListener(long instHandle) { super(instHandle); }

	public void finalize() { super.release(classId); }

	private static Object[] __args = new Object[1];

	public void onConnect(org.webinos.app.wrt.channel.WebinosSocket arg0) {
		__args[0] = arg0;
		__invoke(classId, 0, __args);
	}

}
