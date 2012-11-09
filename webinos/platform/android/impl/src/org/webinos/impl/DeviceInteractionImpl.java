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
import org.webinos.api.SuccessCallback;
import org.webinos.api.deviceinteraction.DeviceInteractionManager;

import android.content.Context;

public class DeviceInteractionImpl extends DeviceInteractionManager implements IModule {

	private Context androidContext;
	
	/*****************************
	 * DeviceInteractionManager methods
	 *****************************/
	@Override
	public PendingOperation startNotify(SuccessCallback successCallback,
			ErrorCallback errorCallback, int duration) throws DeviceAPIError {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void stopNotify() {
		// TODO Auto-generated method stub
		
	}

	@Override
	public PendingOperation startVibrate(SuccessCallback successCallback,
			ErrorCallback errorCallback, Integer duration)
			throws DeviceAPIError {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void stopVibrate() {
		// TODO Auto-generated method stub
		
	}

	@Override
	public PendingOperation lightOn(SuccessCallback successCallback,
			ErrorCallback errorCallback, int duration) throws DeviceAPIError {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void lightOff() {
		// TODO Auto-generated method stub
		
	}

	@Override
	public PendingOperation setWallpaper(SuccessCallback successCallback,
			ErrorCallback errorCallback, String fileName) throws DeviceAPIError {
		// TODO Auto-generated method stub
		return null;
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
