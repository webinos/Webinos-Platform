/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_app_wrt_mgr_Document {

	private static Object[] __args = new Object[3];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.app.wrt.mgr.Document ob, Object[] vals) {
		ob.contentType = (String)vals[0];
		ob.encoding = (String)vals[1];
		ob.path = (String)vals[2];
	}

	public static Object[] __export(org.webinos.app.wrt.mgr.Document ob) {
		__args[0] = ob.contentType;
		__args[1] = ob.encoding;
		__args[2] = ob.path;
		return __args;
	}

}
