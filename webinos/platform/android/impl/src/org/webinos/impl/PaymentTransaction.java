package org.webinos.impl;

import java.util.LinkedList;
import java.util.Queue;

import org.meshpoint.anode.bridge.Env;
import org.webinos.api.payment.PaymentError;
import org.webinos.api.payment.PaymentErrorCB;
import org.webinos.api.payment.PaymentErrors;
import org.webinos.api.payment.PaymentSuccessCB;
import org.webinos.api.payment.ShoppingItem;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import de.dtag.tlabs.wallet.extensions.shopping.api.Answer;
import de.dtag.tlabs.wallet.extensions.shopping.api.Item;
import de.dtag.tlabs.wallet.extensions.shopping.api.Merchant;
import de.dtag.tlabs.wallet.extensions.shopping.api.ShopEngine;

public class PaymentTransaction {

	private Context context;
	private Env env;
	private ShopEngine shopEngine;
	@SuppressWarnings("unused")
	private String customerID;
	private String sellerID;
	final private PaymentSuccessCB successCallback;
	final private PaymentErrorCB errorCallback;
	private Looper answerLooper;
	private Handler answerHandler;
	private Handler.Callback answerCallback;
	private boolean exit;

	private Queue<AsyncCall> callQueue = new LinkedList<AsyncCall>();

	private abstract class AsyncCall implements Runnable {
		private void call() { answerHandler.postDelayed(this, 400L); }
	}

	private class OpenShop extends AsyncCall {
		@Override
		public void run() {
			shopEngine = new ShopEngine(context, answerCallback);
			/* we need to wait for a short time to allow the
			 * library to connect to the shop service; there is
			 * no synchronisation for this */
			try { Thread.sleep(500L); } catch(InterruptedException ie) {}
			/* FIXME: where will we get the merchant token? */
			Merchant merchant = new Merchant(sellerID, "knownMerchantToken");
			shopEngine.openShop(merchant);
		}
	}

	private class AddItems extends AsyncCall {
		private ShoppingItem bill;
		AddItems(ShoppingItem bill) { this.bill = bill; }
		@Override
		public void run() {
			String productID = bill.productID;
			String productName = bill.productID; /* FIXME: do we need an explicit product name */
			String productDescription = bill.description;
			String currency = bill.currency;
			/* FIXME: change this multiplier based on currency? */
			long price = (long)(bill.itemsPrice * 100);
			Item billItem = new Item(productID, productName, productDescription, currency, price, 1);
			shopEngine.addItem(billItem);
		}
	}

	private class Checkout extends AsyncCall {
		@Override
		public void run() {
			shopEngine.checkout();
		}
	}

	private PaymentError handleAnswer(Answer answer) {
		/* if we've been told to exit, then this answer
		 * is the answer we were waiting for .. so exit on return */
		if(exit)
			answerLooper.quit();

		if(answer.state == Answer.STATE_OK || answer.state == Answer.STATE_CHECKOUT_SUCCESSFUL) {
			return null;
		}

		PaymentError error = new PaymentError();
		error.message = answer.message;
		switch(answer.state) {
		case Answer.STATE_ERROR_SHOP_ALLREADY_OPENED:
			/* we allow this to pass as a non-error - if the shop
			 * is already open, then we treat the openShop() call as
			 * having succeeded */
			return null;
		case Answer.STATE_CHECKOUT_FAILED:
			//error.code = PaymentErrors.PAYMENT_AUTHENTICATION_FAILED;
			//error.code = PaymentErrors.PAYMENT_CHARGEABLE_EXCEEDED;
			error.code = PaymentErrors.PAYMENT_CHARGE_FAILED;
			break;
		case Answer.STATE_CHECKOUT_NO_ITEMS:
			error.code = PaymentErrors.INVALID_OPTION;
			break;
		case Answer.STATE_ERROR:
			error.code = PaymentErrors.INVALID_OPTION;
			break;
		case Answer.STATE_ERROR_NO_ITEMS:
			error.code = PaymentErrors.INVALID_OPTION;
			break;
		case Answer.STATE_ERROR_NO_SHOP:
			error.code = PaymentErrors.UNKNOWN_SHOP;
			break;
		case Answer.STATE_ERROR_UNKNOWN_ITEM:
			error.code = PaymentErrors.INVALID_OPTION;
			break;
		case Answer.STATE_ERROR_UNKNOWN_SHOP:
			error.code = PaymentErrors.UNKNOWN_SHOP;
			break;
		case Answer.STATE_UNKNOWN:
			error.code = PaymentErrors.INVALID_OPTION;
			break;
		}
		return error;
	}

	PaymentTransaction(Context ctx, String customerID, String sellerID, PaymentSuccessCB successCallback,
			PaymentErrorCB errorCallback) {
		this.context = ctx;
		this.env = Env.getCurrent();
		this.customerID = customerID;
		this.sellerID = sellerID;
		this.successCallback = successCallback;
		this.errorCallback = errorCallback;
	}

	void perform(final ShoppingItem[] itemList, final ShoppingItem bill) {
		callQueue.add(new OpenShop());
		callQueue.add(new AddItems(bill));
		callQueue.add(new Checkout());

		/* Callbacks for async indications from the shop engine */
		answerCallback = new Handler.Callback() {
			@Override
			public boolean handleMessage(Message msg) {
				/* get the answer for the current operation */
				PaymentError error = handleAnswer(new Answer(msg));
				if(error != null) {
					/* if there was an error, end here */
					errorCallback.onError(error);
					finish();
					return true;
				}
				/* if there's no next call, we're done */
				if(callQueue.isEmpty()) {
					if(finish()) {
						String proofOfPurchase = ""; /* we don't get one from the engine */
						successCallback.onSuccess(proofOfPurchase);
					}
					return true;
				}

				/* if there's a next item, call it */
				callQueue.remove().call();
				return true;
			}
		};

		/* this thread is the handler that handles answer messages
		 * from the shop engine; therefore we have to open the shop
		 * in this thread */
		synchronized(this) {
			(new Thread() {
				@Override
				public void run() {
					Env.setEnv(env);
					Looper.prepare();
					answerHandler = new Handler();
					synchronized(PaymentTransaction.this) {PaymentTransaction.this.notify();}
					answerLooper = Looper.myLooper();
					Looper.loop();
				}
			}).start();
			try {
				wait();
			} catch(InterruptedException ie) {}
		}

		/* call the first item in the queue */
		callQueue.remove().call();
	}

	private boolean finish() {
		/* ensure we don't reenter this */
		if(exit)
			return false;

		if(shopEngine != null) {
			/* we need to release the engine, and don't
			 * exit the looper until we've had the answer to that */
			exit = true;
			shopEngine.release();
			shopEngine = null;
			return true;
		}
		/* otherwise there's nothing to do, so we can
		 * quit immediately */
		answerLooper.quit();
		return true;
	}
}