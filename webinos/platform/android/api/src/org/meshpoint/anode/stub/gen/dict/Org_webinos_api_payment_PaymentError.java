/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.dict;

public final class Org_webinos_api_payment_PaymentError {

	private static Object[] __args = new Object[3];

	public static Object[] __getArgs() { return __args; }

	public static void __import(org.webinos.api.payment.PaymentError ob, Object[] vals) {
		ob.code = (String)vals[0];
		ob.message = (String)vals[1];
		ob.permanent = ((org.meshpoint.anode.js.JSValue)vals[2]).getBooleanValue();
	}

	public static Object[] __export(org.webinos.api.payment.PaymentError ob) {
		__args[0] = ob.code;
		__args[1] = ob.message;
		__args[2] = org.meshpoint.anode.js.JSValue.asJSBoolean(ob.permanent);
		return __args;
	}

}
