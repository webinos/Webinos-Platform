/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.user;

public final class Org_webinos_api_payment_PaymentChallengeCB extends org.meshpoint.anode.js.JSInterface implements org.webinos.api.payment.PaymentChallengeCB {

	static int classId = org.meshpoint.anode.bridge.Env.getCurrent().getInterfaceManager().getByClass(org.webinos.api.payment.PaymentChallengeCB.class).getId();

	Org_webinos_api_payment_PaymentChallengeCB(long instHandle) { super(instHandle); }

	public void finalize() { super.release(classId); }

	private static Object[] __args = new Object[2];

	public void onPaymentChallenge(String arg0, String arg1) {
		__args[0] = arg0;
		__args[1] = arg1;
		__invoke(classId, 0, __args);
	}

}
