/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_app_wrt_channel_WebinosSocket {

	private static Object[] __args = new Object[1];

	public static Object[] __getArgs() { return __args; }

	static Object __invoke(org.webinos.app.wrt.channel.WebinosSocket inst, int opIdx, Object[] args) {
		inst.send(
			(String)args[0]
		);
		return null;
	}

	static Object __get(org.webinos.app.wrt.channel.WebinosSocket inst, int attrIdx) {
		Object result = null;
		switch(attrIdx) {
		case 0: /* installId */
			result = inst.installId;
			break;
		case 1: /* instanceId */
			result = inst.instanceId;
			break;
		case 2: /* listener */
			result = inst.listener;
			break;
		default:
		}
		return result;
	}

	static void __set(org.webinos.app.wrt.channel.WebinosSocket inst, int attrIdx, Object val) {
		switch(attrIdx) {
		case 0: /* installId */
			inst.installId = (String)val;
			break;
		case 1: /* instanceId */
			inst.instanceId = (String)val;
			break;
		case 2: /* listener */
			inst.listener = (org.webinos.app.wrt.channel.WebinosSocketListener)val;
			break;
		default:
			throw new UnsupportedOperationException();
		}
	}

}
