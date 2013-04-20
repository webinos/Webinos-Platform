package org.webinos.api.payment;

import org.meshpoint.anode.idl.Callback;

public interface PaymentChallengeCB extends Callback {
	public void onPaymentChallenge(String type, String challenge);
}
