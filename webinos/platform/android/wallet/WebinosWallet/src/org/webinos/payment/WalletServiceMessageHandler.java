package org.webinos.payment;

import android.content.Context;
import android.content.Intent;
import android.os.*;
import android.util.Log;


public class WalletServiceMessageHandler extends Handler {
    private final static String TAG = WalletServiceMessageHandler.class.getName();
    private Context context = null;
    private long totalBill = 0;
    private String lastDescription;

    private static final String ACTION_WALLET_START = "org.webinos.payment.TestWallet.Start";
    static final String ACTION_PARAMETER_TOTALPRICE = "org.webinos.payment.totalAmmount";

//
//
//    public class SynchronizeMessageExchange implements Runnable {
//        private final String TAG = SynchronizeMessageExchange.class.getName();
//        private MessageHandler messageHandler = null;
//        private Message message = null;
//        private Looper myLooper = null;
//
//        public class MessageHandler extends Handler {
//            private final String TAG = MessageHandler.class.getName();
//
//            @Override
//            public void handleMessage(Message msg) {
//                Log.d(TAG, "handleMessage() " + msg.what + "/" + msg.arg1);
//                message = new Message();
//                message.copyFrom(msg);
//
//                synchronized (synchronizerThread) {
//                    synchronizerThread.notify();
//                }
//            }
//        }
//
//        @Override
//        public void run() {
//            Log.d(TAG, "run() ... start");
//            if(Looper.myLooper() == null) {
//                Looper.prepare();
//                myLooper = Looper.myLooper();
//            }
//            if(messageHandler == null) {
//                messageHandler = new MessageHandler();
//            }
//            Looper.loop();
//            Log.d(TAG, "run() ... end");
//        }
//
//        protected void release() {
//            myLooper.quit();
//        }
//
//        protected MessageHandler getMessageHandler() {
//            return messageHandler;
//        }
//
//        protected Message getMessage() {
//            Message msg = new Message();
//            if(message != null) {
//                msg.copyFrom(message);
//                message = null;
//            }
//            return msg;
//        }
//    }
//
//    private SynchronizeMessageExchange synchronizeMessageExchange = new SynchronizeMessageExchange();
//    private Thread synchronizerThread = new Thread(synchronizeMessageExchange);


    private WalletServiceMessageHandler() {
        Log.d(TAG, "WalletServiceMessageHandler()");
    }

    public WalletServiceMessageHandler(Context context) {
        Log.d(TAG, "WalletServiceMessageHandler()");

        this.context = context;
    }

    @Override
    public void handleMessage(Message msg) {
        Log.d(TAG, "handleMessage() start");

        int responseCode = -1;
        boolean canReply = false;
        int what = msg.what;
        Log.d(TAG, "handleMessage() what=" + what);
        if(WalletEngine.CMD_CODE_WALLET_OPEN == what) {
            totalBill = 0;
            Log.d(TAG, "handleMessage() what=CMD_CODE_WALLET_OPEN");
            responseCode = WalletEngine.RESPONSE_CODE_OK;
            canReply = true;
        } else if(WalletEngine.CMD_CODE_WALLET_ADDITEM == what) {
            Log.d(TAG, "handleMessage() what=CMD_CODE_WALLET_ADDITEM");
            Bundle bundle = msg.getData().getBundle("BillableItem");
            BillableItem item = new BillableItem(bundle);
            lastDescription = item.productDescription;
            Log.d(TAG, "Item : " +  item.productDescription);
            Log.d(TAG, "Item price : " +  item.price);
            totalBill += item.price;
            Log.d(TAG, "New total : " +  totalBill);
            responseCode = WalletEngine.RESPONSE_CODE_OK;
            canReply = true;
        } else if(WalletEngine.CMD_CODE_WALLET_CHECKOUT == what) {
            Log.d(TAG, "handleMessage() what=CMD_CODE_WALLET_CHECKOUT");
            Intent intent = new Intent(ACTION_WALLET_START);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            double amount = totalBill / 100.0;
            Log.d(TAG,"Sending to pay for " + amount);
            // TODO: Hack since the price is always passed as 0
            intent.putExtra(ACTION_PARAMETER_TOTALPRICE, lastDescription );
            TestWallet.setMessage(msg);
            context.startActivity(intent);
//            synchronized (synchronizerThread) {
//                try {
//                    synchronizerThread.wait();
//                } catch (InterruptedException e) {
//                    Log.d(TAG,"Interrupted exception. should be ok");
//                }
//            }
            canReply = false; // We will have to let the intent answer that
        } else if(WalletEngine.CMD_CODE_WALLET_CLOSE == what) {
            Log.d(TAG, "handleMessage() what=CMD_CODE_WALLET_CLOSE");
            responseCode = WalletEngine.RESPONSE_CODE_OK;
            canReply = true;
        } else {
            Log.d(TAG, "handleMessage() what=RESPONSE_CODE_UNKNOWN actual code was " + what);
            responseCode = WalletEngine.RESPONSE_CODE_UNKNOWN;
            canReply = true;
        }

        if (canReply) {
            Log.d(TAG, "handleMessage() send result");
            Message answ = new Message();
            answ.what = responseCode;
            try {
                msg.replyTo.send(answ);
            } catch (RemoteException e) {
                Log.e(TAG, "Can not reply",e);
            }
        }

        Log.d(TAG, "handleMessage() finish");
    }
}
