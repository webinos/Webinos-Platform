/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public final class Org_webinos_api_payment_ShoppingItem {

	private static Object[] __args = new Object[4];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.payment.ShoppingItem ob, Object[] vals) {
		ob.currency = (String)vals[0];
		ob.description = (String)vals[1];
		ob.itemCount = (int)((org.meshpoint.anode.js.JSValue)vals[2]).longValue;
		ob.productID = (String)vals[3];
	}

	public static Object[] __export(org.webinos.api.payment.ShoppingItem ob) {
		__args[0] = ob.currency;
		__args[1] = ob.description;
		__args[2] = org.meshpoint.anode.js.JSValue.asJSNumber((long)ob.itemCount);
		__args[3] = ob.productID;
		return __args;
	}

}
