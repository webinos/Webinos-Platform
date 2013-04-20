/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public final class Org_webinos_api_payment_PaymentManager {

	private static Object[] __args = new Object[7];

	public static Object[] __getArgs() { return __args; }

	static Object __invoke(org.webinos.api.payment.PaymentManager inst, int opIdx, Object[] args) {
		inst.pay(
			(org.webinos.api.payment.PaymentSuccessCB)args[0],
			(org.webinos.api.payment.PaymentErrorCB)args[1],
			(org.webinos.api.payment.PaymentChallengeCB)args[2],
			(org.webinos.api.payment.ShoppingItem[])args[3],
			(org.webinos.api.payment.ShoppingItem)args[4],
			(String)args[5],
			(String)args[6]
		);
		return null;
	}

}
