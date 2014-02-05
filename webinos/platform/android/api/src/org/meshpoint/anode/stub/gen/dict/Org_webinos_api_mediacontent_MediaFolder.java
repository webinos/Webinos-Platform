/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_api_mediacontent_MediaFolder {

	private static Object[] __args = new Object[8];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.mediacontent.MediaFolder ob, Object[] vals) {
		ob.folderURI = (String)vals[3];
		ob.id = (String)vals[4];
		ob.modifiedDate = (java.util.Date)vals[5];
		ob.storageType = (String)vals[6];
		ob.title = (String)vals[7];
	}

	public static Object[] __export(org.webinos.api.mediacontent.MediaFolder ob) {
		__args[3] = ob.folderURI;
		__args[4] = ob.id;
		__args[5] = ob.modifiedDate;
		__args[6] = ob.storageType;
		__args[7] = ob.title;
		return __args;
	}

}
