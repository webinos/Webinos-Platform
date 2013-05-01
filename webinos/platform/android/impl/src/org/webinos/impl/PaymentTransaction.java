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
import android.util.Log;

import org.webinos.payment.Store;
import org.webinos.payment.BillableItem;
import org.webinos.payment.WalletEngine;


public class PaymentTransaction {
	private final static String TAG = PaymentTransaction.class.getName();
	private Context context;
	private Env env;
	private WalletEngine walletEngine;
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
			walletEngine = new WalletEngine(context, answerCallback);
			/* we need to wait for a short time to allow the
			 * library to connect to the webinos wallet service; there is
			 * no synchronisation for this */
			try { Thread.sleep(500L); } catch(InterruptedException ie) {}
            Store store = new Store(sellerID, "Webinos Application");
			walletEngine.openShop(store);
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
			Log.d(TAG, "Received item " +  productDescription + " with price " + bill.itemsPrice + " and sending " + price + " to the payment");
            BillableItem billItem = new BillableItem(productID, productName, productDescription, currency, price, 1);
			walletEngine.addItem(billItem);
		}
	}

	private class Checkout extends AsyncCall {
		@Override
		public void run() {
			walletEngine.checkout();
		}
	}

	private PaymentError handleAnswer(Message msg) {
		/* if we've been told to exit, then this answer
		 * is the answer we were waiting for .. so exit on return */
		if(exit)
			answerLooper.quit();

		if(msg.what == WalletEngine.RESPONSE_CODE_OK || msg.what == WalletEngine.RESPONSE_CODE_CHECKOUT_OK) {
			return null;
		}

		PaymentError error = new PaymentError();
		error.message = "The payment failed";
		switch(msg.what) {
		case WalletEngine.RESPONSE_CODE_CHECKOUT_FAIL:
			//error.code = PaymentErrors.PAYMENT_AUTHENTICATION_FAILED;
			//error.code = PaymentErrors.PAYMENT_CHARGEABLE_EXCEEDED;
			error.code = PaymentErrors.PAYMENT_CHARGE_FAILED;
			break;
		case WalletEngine.RESPONSE_CODE_UNKNOWN:
			error.code = PaymentErrors.INVALID_OPTION;
			break;
		case WalletEngine.RESPONSE_CODE_FAIL:
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
				PaymentError error = handleAnswer(msg);
				if(error != null) {
					/* if there was an error, end here */
					errorCallback.onError(error);
					finish();
					return true;
				}
				/* if there's no next call, we're done */
				if(callQueue.isEmpty()) {
					if(finish()) {
						String proofOfPurchase = "Reciept received"; /* we don't get one from the engine */
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

		if(walletEngine != null) {
			/* we need to release the engine, and don't
			 * exit the looper until we've had the answer to that */
			exit = true;
			walletEngine.release();
			walletEngine = null;
			return true;
		}
		/* otherwise there's nothing to do, so we can
		 * quit immediately */
		answerLooper.quit();
		return true;
	}
}