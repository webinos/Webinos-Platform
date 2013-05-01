/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public final class Org_webinos_api_payment_PaymentErrors {

	private static Object[] __args = new Object[0];

	public static Object[] __getArgs() { return __args; }

	static Object __get(org.webinos.api.payment.PaymentErrors inst, int attrIdx) {
		Object result = null;
		switch(attrIdx) {
		case 0: /* CURRENCY_NOT_SUPPORTED */
			result = org.webinos.api.payment.PaymentErrors.CURRENCY_NOT_SUPPORTED;
			break;
		case 1: /* INVALID_OPTION */
			result = org.webinos.api.payment.PaymentErrors.INVALID_OPTION;
			break;
		case 2: /* PAYMENT_AUTHENTICATION_FAILED */
			result = org.webinos.api.payment.PaymentErrors.PAYMENT_AUTHENTICATION_FAILED;
			break;
		case 3: /* PAYMENT_CHARGEABLE_EXCEEDED */
			result = org.webinos.api.payment.PaymentErrors.PAYMENT_CHARGEABLE_EXCEEDED;
			break;
		case 4: /* PAYMENT_CHARGE_FAILED */
			result = org.webinos.api.payment.PaymentErrors.PAYMENT_CHARGE_FAILED;
			break;
		case 5: /* UNKNOWN_SHOP */
			result = org.webinos.api.payment.PaymentErrors.UNKNOWN_SHOP;
			break;
		default:
		}
		return result;
	}

	static void __set(org.webinos.api.payment.PaymentErrors inst, int attrIdx, Object val) {
		switch(attrIdx) {
		default:
			throw new UnsupportedOperationException();
		}
	}

}
