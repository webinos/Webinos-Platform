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
* Copyright 2011-2012 Paddy Byers
* Copyright 2011-2012 Ziran Sun Samsung Electronics(UK) Ltd
******************************************************************************/

package org.webinos.impl;

import org.meshpoint.anode.AndroidContext;
import org.meshpoint.anode.module.IModule;
import org.meshpoint.anode.module.IModuleContext;
import org.webinos.api.DeviceAPIError;
import org.webinos.api.ErrorCallback;
import org.webinos.api.PendingOperation;
import org.webinos.api.devicestatus.DevicestatusManager;
import org.webinos.api.devicestatus.PropertyRef;
import org.webinos.api.devicestatus.PropertyValueSuccessCallback;
import org.webinos.api.devicestatus.WatchOptions;

import android.content.Context;

import android.telephony.TelephonyManager;
import android.net.wifi.WifiManager;
import android.provider.Settings.System;
import android.util.Log;

public class DevicestatusImpl extends DevicestatusManager implements IModule {

	private Context androidContext;
	private static final String TAG = "org.webinos.impl.DevicestatusImpl";
	private static final boolean D = true;
	
	private TelephonyManager tm;
	private WifiManager mWiFiManager;
	
	/*****************************
	 * DevicestatusManager methods
	 *****************************/
	@Override
	public String[] getComponents(String aspect) throws DeviceAPIError {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public boolean isSupported(String aspect, String property)
			throws DeviceAPIError {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public PendingOperation getPropertyValue(
			PropertyValueSuccessCallback successCallback,
			ErrorCallback errorCallback, PropertyRef prop)
			throws DeviceAPIError {
		// TODO Auto-generated method stub
		
		String prop_value = null;
		
		if(prop.aspect.equals("Device")) 
		{	
			if (prop.property.equals("imei"))
				prop_value = tm.getDeviceId();
			else if (prop.property.equals("model"))
				prop_value = android.os.Build.MODEL;
			//To get unqiue Android ID
			else if (prop.property.equals("identity"))
				prop_value = System.getString(androidContext.getContentResolver(),System.ANDROID_ID);
		}
		else if (prop.aspect.equals("WiFiNetwork"))
		{
			if(prop.property.equals("macAddress"))
				prop_value = mWiFiManager.getConnectionInfo().getMacAddress();
		}
		
		Log.d(TAG, String.format("getPropertyValue: aspect=%s, prop_value=%s", prop.aspect, prop_value));
		
		if(prop_value != null)
			successCallback.onsuccess(prop_value, prop);
		
		return null;
	}

	@Override
	public int watchPropertyChange(
			PropertyValueSuccessCallback successCallback,
			ErrorCallback errorCallback, PropertyRef prop, WatchOptions options)
			throws DeviceAPIError {
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public void clearPropertyChange(int watchHandler) throws DeviceAPIError {
		// TODO Auto-generated method stub
		
	}
	
	/*****************************
	 * IModule methods
	 *****************************/
	@Override
	public Object startModule(IModuleContext ctx) {
		androidContext = ((AndroidContext)ctx).getAndroidContext();
		
		if(D) Log.v(TAG, "DevicestatusImpl: startModule");
		/*
		 * perform any module initialisation here ...
		 */
		
		androidContext = ((AndroidContext)ctx).getAndroidContext();
		
		// Setup WiFi
		mWiFiManager = (WifiManager) androidContext.getSystemService(Context.WIFI_SERVICE);
		if(!mWiFiManager.isWifiEnabled()){
			Log.v(TAG, "DevicestatusImpl: Enable WiFi");
			mWiFiManager.setWifiEnabled(true);  
		}
		
		return this;
	}

	@Override
	public void stopModule() {
		/*
		 * perform any module shutdown here ...
		 */
		if(D) Log.v(TAG, "DevicestatusImpl: stopModule");
	}
}
