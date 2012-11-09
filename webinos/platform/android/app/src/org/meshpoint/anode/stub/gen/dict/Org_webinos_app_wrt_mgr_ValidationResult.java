/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_app_wrt_mgr_ValidationResult {

	private static Object[] __args = new Object[3];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.app.wrt.mgr.ValidationResult ob, Object[] vals) {
		ob.authorSignature = (org.webinos.app.wrt.mgr.Signature)vals[0];
		ob.distributorSignatures = (org.webinos.app.wrt.mgr.Signature[])vals[1];
		ob.status = (int)((org.meshpoint.anode.js.JSValue)vals[2]).longValue;
	}

	public static Object[] __export(org.webinos.app.wrt.mgr.ValidationResult ob) {
		__args[0] = ob.authorSignature;
		__args[1] = ob.distributorSignatures;
		__args[2] = org.meshpoint.anode.js.JSValue.asJSNumber((long)ob.status);
		return __args;
	}

}
