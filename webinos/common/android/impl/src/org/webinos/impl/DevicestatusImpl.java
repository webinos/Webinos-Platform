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
*
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

public class DevicestatusImpl extends DevicestatusManager implements IModule {

	private Context androidContext;

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
		/*
		 * perform any module initialisation here ...
		 */
		return this;
	}

	@Override
	public void stopModule() {
		/*
		 * perform any module shutdown here ...
		 */
	}
}
