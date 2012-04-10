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

package org.webinos.wrt.core;

import org.webinos.wrt.ui.RendererActivity;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class WrtReceiver extends BroadcastReceiver {

	public static final String ACTION_START = "org.webinos.wrt.START";
	public static final String ACTION_STOP = "org.webinos.wrt.STOP";
	public static final String ACTION_STOPALL = "org.webinos.wrt.STOPALL";
	public static final String CMD = "cmdline";
	public static final String INST = "instance";
	public static final String ID = "id";
	public static final String OPTS = "options";
	
	private static final String TAG = "org.webinos.wrt.core.WrtReceiver";
	
	private static WrtManager wrtManager = WrtManager.getInstance();

	@Override
	public void onReceive(Context ctx, Intent intent) {
		/* get the system options */
		String action = intent.getAction();
		if(ACTION_STOPALL.equals(action)) {
			for(RendererActivity activity : wrtManager)
				wrtManager.stopInstance(activity);
			return;
		}
		if(ACTION_STOP.equals(action)) {
			String instance = intent.getStringExtra(INST);
			RendererActivity activity = wrtManager.get(instance);
			if(activity == null) {
				Log.v(TAG, "WRTReceiver.onReceive::stop: instance " + instance + " not found");
				return;
			}
			wrtManager.stopInstance(activity);
			return;
		}

		if(ACTION_START.equals(action)) {
			intent.setClassName(ctx, RendererActivity.class.getName());
			intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
			ctx.startActivity(intent);
			return;
		}
	}

}
