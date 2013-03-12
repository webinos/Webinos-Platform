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
 * Copyright 2013 Ziran Sun
 *
 ******************************************************************************/
package org.webinos.impl;

import org.meshpoint.anode.AndroidContext;
import org.meshpoint.anode.module.IModule;
import org.meshpoint.anode.module.IModuleContext;
import org.webinos.api.DeviceAPIError;
import org.webinos.api.pzpnotification.PZPNotificationCallback;
import org.webinos.api.pzpnotification.PZPNotificationManager;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.widget.Toast;

public class PZPNotificationManagerImpl extends PZPNotificationManager implements IModule {

    private Context androidContext;

    private static final String notificationResponseAction = "org.webinos.pzp.notification.response";
    private static final String TAG = PZPNotificationManagerImpl.class.getSimpleName();

    @Override
    public void eventNotify(String status,
                            PZPNotificationCallback pzpCallBack) throws DeviceAPIError {
        Log.v(TAG, "eventNotify");
        try{
            //toast UI
            final String text = "PZP Status:" + status;
            Handler handler = new Handler(Looper.getMainLooper());
            handler.post(new Runnable() {
                @Override
                public void run() {
                    Toast.makeText(
                            androidContext,
                            text,
                            Toast.LENGTH_LONG).show();
                }
            });

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
