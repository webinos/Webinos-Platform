/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public class Org_webinos_app_wrt_mgr_WidgetConfig {

	private static Object[] __args = new Object[28];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.app.wrt.mgr.WidgetConfig ob, Object[] vals) {
		ob.accessRequests = (org.webinos.app.wrt.mgr.AccessRequest[])vals[10];
		ob.author = (org.webinos.app.wrt.mgr.Author)vals[11];
		ob.defaultLocale = (String)vals[12];
		ob.description = (org.webinos.app.wrt.mgr.LocalisableString)vals[13];
		ob.features = (org.webinos.app.wrt.mgr.FeatureRequest[])vals[14];
		ob.height = (int)((org.meshpoint.anode.js.JSValue)vals[15]).longValue;
		ob.icons = (String[])vals[16];
		ob.id = (String)vals[17];
		ob.installId = (String)vals[18];
		ob.license = (org.webinos.app.wrt.mgr.License)vals[19];
		ob.name = (org.webinos.app.wrt.mgr.LocalisableString)vals[20];
		ob.origin = (org.webinos.app.wrt.mgr.Origin)vals[21];
		ob.prefIcon = (String)vals[22];
		ob.preferences = (org.webinos.app.wrt.mgr.Preference[])vals[23];
		ob.shortName = (org.webinos.app.wrt.mgr.LocalisableString)vals[24];
		ob.startFile = (org.webinos.app.wrt.mgr.Document)vals[25];
		ob.version = (org.webinos.app.wrt.mgr.VersionString)vals[26];
		ob.width = (int)((org.meshpoint.anode.js.JSValue)vals[27]).longValue;
	}

	public static Object[] __export(org.webinos.app.wrt.mgr.WidgetConfig ob) {
		__args[10] = ob.accessRequests;
		__args[11] = ob.author;
		__args[12] = ob.defaultLocale;
		__args[13] = ob.description;
		__args[14] = ob.features;
		__args[15] = org.meshpoint.anode.js.JSValue.asJSNumber((long)ob.height);
		__args[16] = ob.icons;
		__args[17] = ob.id;
		__args[18] = ob.installId;
		__args[19] = ob.license;
		__args[20] = ob.name;
		__args[21] = ob.origin;
		__args[22] = ob.prefIcon;
		__args[23] = ob.preferences;
		__args[24] = ob.shortName;
		__args[25] = ob.startFile;
		__args[26] = ob.version;
		__args[27] = org.meshpoint.anode.js.JSValue.asJSNumber((long)ob.width);
		return __args;
	}

}
