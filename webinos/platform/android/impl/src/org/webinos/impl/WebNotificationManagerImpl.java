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
* Copyright 2011-2012 Andre Paul
*
******************************************************************************/

package org.webinos.impl;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Hashtable;
import java.util.Set;

import org.meshpoint.anode.AndroidContext;
import org.meshpoint.anode.module.IModule;
import org.meshpoint.anode.module.IModuleContext;
import org.webinos.api.DeviceAPIError;

import org.webinos.api.webnotification.WebNotificationManager;
import org.webinos.api.webnotification.WebNotificationCallback;
import org.webinos.api.webnotification.WebNotificationErrorCallback;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.util.Log;
import android.widget.Button;

import org.webinos.app.R;

public class WebNotificationManagerImpl extends WebNotificationManager implements IModule {

	IModuleContext ctx;
	private Context androidContext;
	private static final String notificationResponseAction = "org.webinos.app.notification.response";
	private static final String TAG = "org.webinos.impl.WebNotificationManagerImpl";
	
	private Hashtable<Integer, WebNotificationCallback> successCallbacks = new Hashtable<Integer, WebNotificationCallback>();
	int id = 0;
	@Override
	public void notify(String[] params,
			WebNotificationCallback successCallback,
			WebNotificationErrorCallback errorCallback){
		
		Log.v("WebNotificationManagerImpl", "notify");
		if (params.length >= 0) Log.v("WebNotificationManagerImpl", params[0]);
		if (params.length >= 1) Log.v("WebNotificationManagerImpl", params[1]);
		if (params.length >= 2) Log.v("WebNotificationManagerImpl", params[2]);
		
		
		successCallbacks.put(id, successCallback);
        

        /*
        androidContext.registerReceiver(new BroadcastReceiver() {
          public void onReceive(Context arg0, Intent response) {
            Log.i("MainActivity","Received Broadcast");
          }
        }, new IntentFilter(notificationResponseAction));
*/

        Intent responseIntent = new Intent(notificationResponseAction);
        responseIntent.putExtra("id", id);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(androidContext, 0, responseIntent, PendingIntent.FLAG_ONE_SHOT);
        int icon = R.drawable.icon;
        Notification notification = new Notification(icon, "KATWARN WARNING", System.currentTimeMillis());
        notification.setLatestEventInfo(androidContext, params[0], params[1], pendingIntent);
        notification.flags = Notification.FLAG_AUTO_CANCEL;
        notification.defaults = Notification.DEFAULT_SOUND;
        NotificationManager mNotificationManager = (NotificationManager) androidContext.getSystemService(Context.NOTIFICATION_SERVICE);
        mNotificationManager.notify(1, notification);
      
        id++;

	}
	
	
	
	public Object startModule(IModuleContext ctx) {
		Log.v(TAG, "WebNotificationManagerImpl: startModule");
		this.ctx = ctx;
		androidContext = ((AndroidContext)ctx).getAndroidContext();
        androidContext.registerReceiver(new BroadcastReceiver() {
            public void onReceive(Context arg0, Intent response) {
              Log.i("MainActivity","Received Broadcast");
              int id = response.getIntExtra("id", -1);
              Log.i(TAG, "ID is: " + id);
              
              WebNotificationCallback cb = successCallbacks.remove(id);
              if (cb != null){
            	  cb.handleEvent("onclick");
              }
            }
          }, new IntentFilter(notificationResponseAction));
        Log.v(TAG, "WebNotificationManagerImpl: intent receiver registered");
		return this;
	}

	public void stopModule() {
		Log.v(TAG, "WebNotificationManagerImpl: stopModule");
	}
}