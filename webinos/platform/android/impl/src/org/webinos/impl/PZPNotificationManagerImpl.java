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
import org.webinos.app.R;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class PZPNotificationManagerImpl extends PZPNotificationManager implements IModule {

    private Context androidContext;

    private static final String notificationResponseAction = "org.webinos.pzp.notification.response";
    private static final String TAG = PZPNotificationManagerImpl.class.getSimpleName();

	private static final int PZP_STATUS_NOTIFICATION = 1;

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

    public Object startModule(IModuleContext ctx) {
        androidContext = ((AndroidContext)ctx).getAndroidContext();
        Log.v(TAG, "PZPNotification - startModule");
        return this;
    }

    public void stopModule() {
        Log.v(TAG, "PZPNotification: stopModule");
    }
}
