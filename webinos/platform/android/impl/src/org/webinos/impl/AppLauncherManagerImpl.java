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

import org.webinos.api.applauncher.AppLauncherManager;
import org.webinos.api.applauncher.AppLauncherCallback;
import org.webinos.api.applauncher.AppLauncherErrorCallback;

import android.Manifest;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.util.Log;
import android.net.Uri;
import org.webinos.app.R;

public class AppLauncherManagerImpl extends AppLauncherManager implements IModule {

	IModuleContext ctx;
	private Context androidContext;
	
	private static final String TAG = "org.webinos.impl.AppLauncherManagerImpl";
	
	
	@Override
	public void launchApplication(
			AppLauncherCallback successCallback,
			AppLauncherErrorCallback errorCallback,
			String app){
		
		Log.v("AppLauncherManagerImpl", "launchApplication");
		Log.v("AppLauncherManagerImpl", app);


		try{
			Intent i = new Intent(Intent.ACTION_VIEW);
			i.setData(Uri.parse(app));
			i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
			androidContext.startActivity(i);
			successCallback.handleEvent("");
		}
		catch (Exception e){
			errorCallback.handleEvent("");
		}
		
	}
	
	
	
	public Object startModule(IModuleContext ctx) {
		Log.v(TAG, "AppLauncherManager: startModule");
		this.ctx = ctx;
		androidContext = ((AndroidContext)ctx).getAndroidContext();
       
		
		return this;
	}

	public void stopModule() {
		Log.v(TAG, "AppLauncherManager: stopModule");
	}
}