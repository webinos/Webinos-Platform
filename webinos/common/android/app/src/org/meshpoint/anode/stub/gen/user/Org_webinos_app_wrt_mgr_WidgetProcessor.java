/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.user;

public class Org_webinos_app_wrt_mgr_WidgetProcessor extends org.meshpoint.anode.js.JSInterface implements org.webinos.app.wrt.mgr.WidgetProcessor {

	private static int classId = org.meshpoint.anode.bridge.Env.getInterfaceId(org.webinos.app.wrt.mgr.WidgetProcessor.class);

	Org_webinos_app_wrt_mgr_WidgetProcessor(long instHandle) { super(instHandle); }

	public void finalize() { super.release(classId); }

	private static Object[] __args = new Object[3];

	public void abortInstall(String arg0) {
		__args[0] = arg0;
		__invoke(classId, 0, __args);
	}

	public void completeInstall(String arg0) {
		__args[0] = arg0;
		__invoke(classId, 1, __args);
	}

	public String[] getInstalledWidgets() {
		return (String[])__invoke(classId, 2, __args);
	}

	public org.webinos.app.wrt.mgr.WidgetConfig getWidgetConfig(String arg0) {
		__args[0] = arg0;
		return (org.webinos.app.wrt.mgr.WidgetConfig)__invoke(classId, 3, __args);
	}

	public String getWidgetDir(String arg0) {
		__args[0] = arg0;
		return (String)__invoke(classId, 4, __args);
	}

	public void prepareInstall(String arg0, org.webinos.app.wrt.mgr.Constraints arg1, org.webinos.app.wrt.mgr.PrepareListener arg2) {
		__args[0] = arg0;
		__args[1] = arg1;
		__args[2] = arg2;
		__invoke(classId, 5, __args);
	}

	public void uninstall(String arg0) {
		__args[0] = arg0;
		__invoke(classId, 6, __args);
	}

}
