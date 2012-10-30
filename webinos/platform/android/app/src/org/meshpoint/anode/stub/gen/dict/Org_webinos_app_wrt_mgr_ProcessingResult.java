/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_app_wrt_mgr_ProcessingResult {

	private static Object[] __args = new Object[6];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.app.wrt.mgr.ProcessingResult ob, Object[] vals) {
		ob.comparisonResult = (org.webinos.app.wrt.mgr.ComparisonResult)vals[0];
		ob.error = (org.webinos.app.wrt.mgr.Artifact)vals[1];
		ob.status = (int)((org.meshpoint.anode.js.JSValue)vals[2]).longValue;
		ob.validationResult = (org.webinos.app.wrt.mgr.ValidationResult)vals[3];
		ob.warnings = (org.webinos.app.wrt.mgr.Artifact[])vals[4];
		ob.widgetConfig = (org.webinos.app.wrt.mgr.WidgetConfig)vals[5];
	}

	public static Object[] __export(org.webinos.app.wrt.mgr.ProcessingResult ob) {
		__args[0] = ob.comparisonResult;
		__args[1] = ob.error;
		__args[2] = org.meshpoint.anode.js.JSValue.asJSNumber((long)ob.status);
		__args[3] = ob.validationResult;
		__args[4] = ob.warnings;
		__args[5] = ob.widgetConfig;
		return __args;
	}

}
