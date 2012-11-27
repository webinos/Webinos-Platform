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

package org.webinos.app.wrt.mgr;

import java.util.ArrayList;

import org.meshpoint.anode.bridge.Env;
import org.webinos.app.anode.AnodeReceiver;
import org.webinos.app.anode.AnodeService;
import org.webinos.app.platform.PlatformInit;
import org.webinos.util.AssetUtils;
import org.webinos.util.Constants;

import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class WidgetManagerService {
    private static ArrayList<LaunchListener> listeners = new ArrayList<LaunchListener>();
	private static WidgetManagerImpl theManager;

    private static final String TAG = "org.webinos.app.wrt.mgr.WidgetManagerService";
	
	public static WidgetManagerImpl getInstance() {
		return theManager;
	}
	
	private static void startInstance(final Context ctx) {
		try {
			/* if the platform is not yet initialised, wait until that
			 * has completed and retry */
			if(!PlatformInit.onInit(ctx, new Runnable() {
				@Override
				public void run() {
					startInstance(ctx);
				}
			})) {
				return;
			}
			String launchScript = Constants.RESOURCE_DIR + "/widgetmanager.js";
			AssetUtils.writeAssetToFile(ctx,"js/widgetmanager.js", launchScript);
			Intent intent = new Intent(ctx, AnodeService.class);
			Log.v(TAG, launchScript);
			intent.setAction(AnodeReceiver.ACTION_START);
			intent.putExtra(AnodeReceiver.CMD, launchScript);
			ctx.startService(intent);
		} catch(Throwable t) {
			Env.logger.e(TAG, "Unable to start widgetmanager", t);
		}
	}

	public static WidgetManagerImpl getInstance(Context ctx, LaunchListener listener) {
		WidgetManagerImpl result = null;
		synchronized(listeners) {
			if(theManager != null) {
				result = theManager;
			} else if(listener != null) {
				listeners.add(listener);
				startInstance(ctx);
			}
		}
		return result;
	}
	
	static void onStarted(WidgetManagerImpl mgr) {
		theManager = mgr;
        synchronized(listeners) {
        	for(LaunchListener listener : listeners) {
        		listener.onLaunch(mgr);
        		listeners.remove(listener);
        	}
        }
	}

	public interface LaunchListener {
		public void onLaunch(WidgetManagerImpl mgr);
	}

}
