package org.webinos.payment;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.*;
import android.util.Log;


public class WalletEngine {

    private final static String TAG = WalletEngine.class.getName();
    private static final String ACTION_WALLETSHOPPINGSERVICE_START = "org.webinos.payment.WalletService.Start";
    private static final String ACTION_WALLETSHOPPINGSERVICE_PACKAGE = "org.webinos.payment";
    public static final int CMD_CODE_WALLET_OPEN = 1982;
    public static final int CMD_CODE_WALLET_ADDITEM = 1983;
    public static final int CMD_CODE_WALLET_CHECKOUT = 1984;
    public static final int CMD_CODE_WALLET_CLOSE = 1985;

    public static final int RESPONSE_CODE_OK = 2013;
    public static final int RESPONSE_CODE_FAIL = -2013;
    public static final int RESPONSE_CODE_CHECKOUT_OK = 2014;
    public static final int RESPONSE_CODE_CHECKOUT_FAIL = -2014;
    public static final int RESPONSE_CODE_UNKNOWN = -1999;


    private Context context = null;
    private Handler.Callback resultHandler = null;
    private Messenger messenger = null;
    private ServiceConnection conn = null;

    public WalletEngine (Context context, Handler.Callback resultHandler) {
        Log.d(TAG, "ShopEngine()");

        this.context = context;
        this.resultHandler = resultHandler;

        Log.d(TAG, "ShopEngine() : startet=" + start());
    }

    private boolean start() {
        Log.d(TAG, "start()");

        Intent intent = new Intent(ACTION_WALLETSHOPPINGSERVICE_START);
        intent.setPackage(ACTION_WALLETSHOPPINGSERVICE_PACKAGE);
        context.startService(intent);
        conn = new ServiceConnection() {

            @Override
            public void onServiceDisconnected(ComponentName name) {
                Log.d(TAG, "ServiceConnection.onServiceDisconnected()");
                messenger = null;
            }

            @Override
            public void onServiceConnected(ComponentName name, IBinder service) {
                Log.d(TAG, "ServiceConnection.onServiceConnected()");
                messenger = new Messenger(service);
            }
        };

        return context.bindService(intent, conn, Context.BIND_AUTO_CREATE);
    }

    public void openShop(Store store) {
        Log.d(TAG, "openShop()");
        sendMessage(CMD_CODE_WALLET_OPEN, "Store", store.toBundle());
    }

    /**
     * Adds the item.
     *
     * @param item : the shopping item
     */
    public void addItem(BillableItem item) {
        Log.d(TAG, "addItem() with descr:" + item.productDescription);
        sendMessage(CMD_CODE_WALLET_ADDITEM, "BillableItem", item.toBundle());
    }


    /**
     * Checkout. Ask for payment.
     */
    public void checkout() {
        Log.d(TAG, "checkout()");
        sendMessage(CMD_CODE_WALLET_CHECKOUT);
    }

    /**
     * Release shop.
     */
    public void release() {
        Log.d(TAG, "release()");
        sendMessage(CMD_CODE_WALLET_CLOSE);
        if(conn != null) {
            context.unbindService(conn);
            conn = null;
        }
    }

    /**
     * Sends a message through the messenger
     */
    private void sendMessage(int code) {
        Message message = new Message();
        message.replyTo = new Messenger(new WalletEngineIncomingMessageHandler());
        message.what = code;
        try {
            messenger.send(message);
        } catch (RemoteException e) {
            Log.e(TAG, "Can not send message",e);
        }
    }

    /**
     * Sends a message through the messenger
     */
    private void sendMessage(int code, String key, Bundle bundle) {
        Bundle msgBundle = new Bundle();
        msgBundle.putBundle(key, bundle);

        Message message = new Message();
        message.replyTo = new Messenger(new WalletEngineIncomingMessageHandler());
        message.what = code;
        message.setData(msgBundle);

        try {
            messenger.send(message);
        } catch (RemoteException e) {
            Log.e(TAG, "Can not send message",e);
        }
    }

    private class WalletEngineIncomingMessageHandler extends Handler {
        private final String TAG = WalletEngineIncomingMessageHandler.class.getName();

        @Override
        public void handleMessage(Message msg) {
            Log.d(TAG, "handleMessage()");
//            Answer answer = null;
//            int what = msg.what;
//            Log.d(TAG, "handleMessage() what=" + what);
//            if(Activity.RESULT_OK == what) {
//                Log.d(TAG, "handleMessage() what=RESULT_OK");
//                Bundle bundle = msg.getData().getBundle("Answer");
//                if (bundle != null) {
//                    answer = new Answer(bundle);
//                    Log.d(TAG, "handleMessage() answer=" + answer.state + " " + answer.message);
//                } else {
//                    Log.d(TAG, "handleMessage() Got no answer!");
//                }
//            }
            if(resultHandler != null) {
                resultHandler.handleMessage(msg);
            }
            Log.d(TAG, "handleMessage() Finished");
        }
    }
}
