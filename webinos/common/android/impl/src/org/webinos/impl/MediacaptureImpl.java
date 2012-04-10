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
import org.webinos.api.PendingOperation;
import org.webinos.api.mediacapture.CaptureCB;
import org.webinos.api.mediacapture.CaptureErrorCB;
import org.webinos.api.mediacapture.CaptureMediaOptions;
import org.webinos.api.mediacapture.CaptureVideoOptions;
import org.webinos.api.mediacapture.MediacaptureManager;

import android.content.Context;

public class MediacaptureImpl extends MediacaptureManager implements IModule {

	private Context androidContext;
	
	/*****************************
	 * MediacaptureManager methods
	 *****************************/
	@Override
	public PendingOperation captureImage(CaptureCB successCB,
			CaptureErrorCB errorCB, CaptureMediaOptions options) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public PendingOperation captureVideo(CaptureCB successCB,
			CaptureErrorCB errorCB, CaptureVideoOptions options) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public PendingOperation captureAudio(CaptureCB successCB,
			CaptureErrorCB errorCB, CaptureMediaOptions options) {
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
