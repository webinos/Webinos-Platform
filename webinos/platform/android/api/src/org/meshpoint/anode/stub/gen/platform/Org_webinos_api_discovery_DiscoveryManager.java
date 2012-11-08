/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_api_discovery_DiscoveryManager {

	private static Object[] __args = new Object[4];

	public static Object[] __getArgs() { return __args; }

	static Object __invoke(org.webinos.api.discovery.DiscoveryManager inst, int opIdx, Object[] args) {
		Object result = null;
		switch(opIdx) {
		case 0: /* createService */
			result = inst.createService();
			break;
		case 1: /* findServices */
			result = inst.findServices(
				(org.webinos.api.discovery.ServiceType)args[0],
				(org.webinos.api.discovery.FindCallback)args[1],
				(org.webinos.api.discovery.Options)args[2],
				(org.webinos.api.discovery.Filter)args[3]
			);
			break;
		case 2: /* getServiceId */
			result = inst.getServiceId(
				(String)args[0]
			);
			break;
		default:
		}
		return result;
	}

}
