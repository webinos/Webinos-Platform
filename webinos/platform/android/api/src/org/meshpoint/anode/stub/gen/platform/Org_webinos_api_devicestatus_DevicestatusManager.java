/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_api_devicestatus_DevicestatusManager {

	private static Object[] __args = new Object[4];

	public static Object[] __getArgs() { return __args; }

	static Object __invoke(org.webinos.api.devicestatus.DevicestatusManager inst, int opIdx, Object[] args) {
		Object result = null;
		switch(opIdx) {
		case 0: /* clearPropertyChange */
			inst.clearPropertyChange(
				(int)((org.meshpoint.anode.js.JSValue)args[0]).longValue
			);
			break;
		case 1: /* getComponents */
			result = inst.getComponents(
				(String)args[0]
			);
			break;
		case 2: /* getPropertyValue */
			result = inst.getPropertyValue(
				(org.webinos.api.devicestatus.PropertyValueSuccessCallback)args[0],
				(org.webinos.api.ErrorCallback)args[1],
				(org.webinos.api.devicestatus.PropertyRef)args[2]
			);
			break;
		case 3: /* isSupported */
			result = org.meshpoint.anode.js.JSValue.asJSBoolean(inst.isSupported(
				(String)args[0],
				(String)args[1]
			));
			break;
		case 4: /* watchPropertyChange */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)inst.watchPropertyChange(
				(org.webinos.api.devicestatus.PropertyValueSuccessCallback)args[0],
				(org.webinos.api.ErrorCallback)args[1],
				(org.webinos.api.devicestatus.PropertyRef)args[2],
				(org.webinos.api.devicestatus.WatchOptions)args[3]
			));
			break;
		default:
		}
		return result;
	}

}
