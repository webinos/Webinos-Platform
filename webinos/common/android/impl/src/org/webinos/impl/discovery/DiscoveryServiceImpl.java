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
* Copyright 2012 Samsung Electronics(UK) Ltd
*
******************************************************************************/

package org.webinos.impl.discovery;

import java.io.IOException;
import java.io.InputStream;

import org.meshpoint.anode.bridge.Env;
import org.webinos.api.PendingOperation;
import org.webinos.api.discovery.BindCallback;
import org.webinos.api.discovery.DiscoveryError;
import org.webinos.api.discovery.Service;

import org.webinos.impl.discovery.DiscoveryImpl.DiscoveryRunnable;
import org.webinos.impl.discovery.DiscoveryImpl.DiscoveryPendingOperation;

import android.bluetooth.BluetoothSocket;
import android.content.Context;
import android.util.Log;

public class DiscoveryServiceImpl extends Service{

	private static final String TAG = "org.webinos.impl.DiscoveryServiceImpl";
	private Context androidContext;
	
	@Override
	public PendingOperation bind(BindCallback bindCallback,  String serviceId) throws DiscoveryError{

	Log.v(TAG, "bind Service");
		
	return null;
	
	}
	
	public void setContext(Context androidContext) {
		Log.v(TAG, "setContext");
		this.androidContext = androidContext;
	}
	
    public void unbind() throws DiscoveryError{
    }
}