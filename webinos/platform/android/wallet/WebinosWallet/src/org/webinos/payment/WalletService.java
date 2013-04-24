package org.webinos.payment;

import android.app.Service;
import android.content.Intent;
import android.os.IBinder;
import android.os.Messenger;
import android.util.Log;


public class WalletService extends Service {
    private final static String TAG = WalletService.class.getName();
    private final WalletServiceMessageHandler messageHandler = new WalletServiceMessageHandler(this);
    private final Messenger messenger = new Messenger(messageHandler);

    @Override
    public void onCreate() {
        Log.d(TAG, "onCreate()");
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.d(TAG, "onStartCommand() " + startId + " : " + intent);
//      Toast.makeText(this, "Service started.", Toast.LENGTH_SHORT).show();
        // We want this service to continue running until it is explicitly
        // stopped, so return sticky.
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        Log.d(TAG, "onDestroy()");
//      Toast.makeText(this, "Service stopped.", Toast.LENGTH_SHORT).show();
    }

    @Override
    public IBinder onBind(Intent intent) {
        Log.d(TAG, "onBind()");
//    Toast.makeText(this, "Service bound.", Toast.LENGTH_SHORT).show();
        return messenger.getBinder();
    }

}
