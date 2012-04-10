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

package org.webinos.impl.nfc;

import org.meshpoint.anode.AndroidContext;
import org.meshpoint.anode.module.IModule;
import org.meshpoint.anode.module.IModuleContext;
import org.webinos.api.nfc.NfcEventListener;
import org.webinos.api.nfc.NfcManager;

import android.content.Context;

public class NfcImpl extends NfcManager implements IModule {

	private Context androidContext;
	
	/*****************************
	 * NfcManager methods
	 *****************************/
	@Override
	public void addEventListener(String type, NfcEventListener listener,
			boolean useCapture) {
		// TODO Auto-generated method stub

	}

	@Override
	public void removeEventListener(String type, NfcEventListener listener,
			boolean useCapture) {
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
