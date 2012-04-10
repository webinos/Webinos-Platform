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

import org.webinos.api.ErrorCallback;
import org.webinos.api.SuccessCallback;
import org.webinos.api.keystore.KeyStoreManager;
import org.webinos.api.keystore.KeyStoreSuccessCallback;

import org.meshpoint.anode.AndroidContext;
import org.meshpoint.anode.module.IModule;
import org.meshpoint.anode.module.IModuleContext;

import android.content.Context;

public class KeyStoreImpl extends KeyStoreManager implements IModule {

	private Context androidContext;

	/*****************************
	 * AuthenticationManager methods
	 *****************************/
	@Override
	public void get(KeyStoreSuccessCallback successCallback,
			ErrorCallback errorCallback, String key) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void delete(SuccessCallback successCallback,
			ErrorCallback errorCallback, String key) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void put(SuccessCallback successCallback,
			ErrorCallback errorCallback, String key, String value) {
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
