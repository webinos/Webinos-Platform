/*******************************************************************************
 *  Code contributed to the webinos project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright 2013 Ziran Sun Samsung Electronics(UK) Ltd
 *
 ******************************************************************************/
package org.webinos.impl;

import org.meshpoint.anode.AndroidContext;
import org.meshpoint.anode.module.IModule;
import org.meshpoint.anode.module.IModuleContext;
import org.webinos.api.DeviceAPIError;
import org.webinos.api.pzpnotification.PZPNotificationCallback;
import org.webinos.api.pzpnotification.PZPNotificationManager;
import org.webinos.api.pzpnotification.PZPonReceiveNotificationCallback;
import org.webinos.app.R;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.util.Log;

public class PZPNotificationManagerImpl extends PZPNotificationManager implements IModule {

    private Context androidContext;

    private static final String notificationResponseAction = "org.webinos.pzp.notification.response";
    private static final String TAG = PZPNotificationManagerImpl.class.getSimpleName();

	private static final int PZP_STATUS_NOTIFICATION = 1;
	private PZPEventReceiver eventReceiver;

    @Override
    public void eventNotify(String status,
                            PZPNotificationCallback pzpCallBack) throws DeviceAPIError {
        Log.v(TAG, "eventNotify");
        
        try {
            NotificationManager mNotificationManager = (NotificationManager) androidContext
                    .getSystemService(Context.NOTIFICATION_SERVICE);
            
            Notification updateStatus = new Notification();
            updateStatus.icon = R.drawable.webinos_notify;
            
            updateStatus.tickerText = status;
            updateStatus.when = System.currentTimeMillis();
            
            CharSequence contentTitle = "PZP Status Notification";
            CharSequence contentText = status;
            
            Intent notificationIntent = new Intent(androidContext, PZPNotificationManagerImpl.class);
            PendingIntent contentIntent = PendingIntent.getActivity(androidContext, 0, notificationIntent, 0);
            
            updateStatus.setLatestEventInfo(androidContext, contentTitle, contentText, contentIntent); 
            
            mNotificationManager.notify(PZP_STATUS_NOTIFICATION, updateStatus);
            
            Intent responseIntent = new Intent(notificationResponseAction);
            responseIntent.putExtra("status", status);
            androidContext.sendBroadcast(responseIntent);
            pzpCallBack.onSuccess(status);
        } catch (Exception e)
        {
            Log.v(TAG, "display exception "+e.getMessage());
        }
    }
    
    @Override
    public void eventRegister(PZPonReceiveNotificationCallback onReceiveCallBack) throws DeviceAPIError {
        Log.v(TAG, "Register PZP event notification");
        eventReceiver = new PZPEventReceiver(onReceiveCallBack);
        androidContext.registerReceiver(eventReceiver, new IntentFilter(notificationResponseAction));
    }
    
    public void eventUnregister() throws DeviceAPIError {
        Log.v(TAG, "Unregister PZP notification event");
        if(eventReceiver!=null)
            androidContext.unregisterReceiver(eventReceiver);
    }
    
    //PZP Event Response receiver
    class PZPEventReceiver extends BroadcastReceiver {
        private PZPonReceiveNotificationCallback successCallback;
        
        @Override
        public void onReceive(Context ctx, Intent intent) {
            try {
                Bundle extras = intent.getExtras();
                if(extras!=null){
                    String status = extras.getString("status");
                    if(status!= null)
                        eventReceived(status);
                }
            }
            catch (Exception e){
                Log.v(TAG, "PZPEventReceiver - onReceive exception "+e.getMessage());
            }
        }
        
        private PZPEventReceiver(PZPonReceiveNotificationCallback successCbk) {
            Log.v(TAG, "PZPEventReceiver constructor - succCbk: "+successCbk+" - thread: "+(int)Thread.currentThread().getId());
            successCallback = successCbk;
        }
        
        private void eventReceived(String status) {
            successCallback.onSuccess(status);
        }
    }

    public Object startModule(IModuleContext ctx) {
        androidContext = ((AndroidContext)ctx).getAndroidContext();
        Log.v(TAG, "PZPNotification - startModule");
        return this;
    }

    public void stopModule() {
        Log.v(TAG, "PZPNotification: stopModule");
    }
}
