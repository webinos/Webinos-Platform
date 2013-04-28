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
import java.util.List;

import org.meshpoint.anode.bridge.Env;
import org.webinos.app.platform.PlatformInit;
import org.webinos.app.pzp.PzpService;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.IBinder;

public class WidgetManagerService extends Service {
	private static final String TAG = WidgetManagerService.class.getCanonicalName();

	private ArrayList<WidgetManagerLaunchListener> wgtMgrListeners = new ArrayList<WidgetManagerLaunchListener>();
	private WidgetManagerImpl theManager;

	/**
	 * The singleton service
	 */
	private static WidgetManagerService theService;

	/**
	 * Listener for asynchronous indications of service availability
	 */
	interface WidgetManagerServiceListener {
		public void onServiceAvailable(WidgetManagerService service);
	}

	/**
	 * Listeners waiting for widgetmanager availability
	 */
	public interface WidgetManagerLaunchListener {
		public void onLaunch(WidgetManagerImpl mgr);
	}

	/**
	 * Listeners waiting for service availability
	 */
	private static List<WidgetManagerServiceListener> serviceListeners = new ArrayList<WidgetManagerServiceListener>();

	/**
	 * Synchronously obtain the service instance, if it already exists.
	 * This will not trigger the service being started; only use in contexts
	 * where it is known that the service will already have been started.
	 * @return the service instance if available
	 */
	static synchronized WidgetManagerService getService() { return theService; }

	/**
	 * Get the service instance, registering a callback for the case that
	 * the service is not currently available. If not available, the service
	 * will be started.
	 * @param ctx a context to use to start the service if required.
	 * @param listener a listener to call with the service instance, in the case that
	 * the service was not available already. If the service was available at the time
	 * the call was made, then the instance will be returned directly and the listener
	 * will NOT be called.
	 * @return the service instance if available; or null otherwise
	 */
	static void getService(Context ctx, WidgetManagerServiceListener listener) {
		WidgetManagerService foundService = null;
		/* synchronously check, and add listener if necessary */
		synchronized(WidgetManagerService.class) {
			if(theService == null) {
				serviceListeners.add(listener);
			}
			foundService = theService;
		}
		/* start service if necessary */
		if(foundService == null) {
			ctx.startService(new Intent(ctx, WidgetManagerService.class));
		} else {
			listener.onServiceAvailable(foundService);
		}
	}

	@Override
	public void onCreate() {
		super.onCreate();
		/* ensure the PZP service is started, in case nobody else did */
		PzpService.getService(this, null);
		/* synchronously set ourselves as the singleton instance, and notify
		 * and pending listeners */
		synchronized(WidgetManagerService.class) {
			theService = this;
			for(WidgetManagerServiceListener listener : serviceListeners)
				listener.onServiceAvailable(theService);
			serviceListeners = null;
		}
	}

	public synchronized void setWidgetManager(WidgetManagerImpl mgr) {
		theManager = mgr;
		if(wgtMgrListeners.size() > 0)
			for(WidgetManagerLaunchListener listener : wgtMgrListeners)
				listener.onLaunch(mgr);
		wgtMgrListeners = null;
	}

	public WidgetManagerImpl getWidgetManager() {
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
			/* temp - don't launch in separate isolate
			String launchScript = Constants.RESOURCE_DIR + "/widgetmanager.js";
			AssetUtils.writeAssetToFile(ctx,"js/widgetmanager.js", launchScript);
			Intent intent = new Intent(ctx, AnodeService.class);
			Log.v(TAG, launchScript);
			intent.setAction(AnodeReceiver.ACTION_START);
			intent.putExtra(AnodeReceiver.CMD, launchScript);
			ctx.startService(intent); */
		} catch(Throwable t) {
			Env.logger.e(TAG, "Unable to start widgetmanager", t);
		}
	}

	public static WidgetManagerImpl getWidgetManagerInstance(Context ctx, final WidgetManagerLaunchListener listener) {
		WidgetManagerImpl result;
		/* if we have the service and wgtmgr already, return it */
		if(theService != null && (result = theService.getWidgetManager()) != null)
			return result;

		/* otherwise, get the service asynchronously, and then get the wgtmgr */
		if(listener != null) {
			getService(ctx, new WidgetManagerServiceListener() {
				@Override
				public void onServiceAvailable(WidgetManagerService service) {
					synchronized(service) {
						WidgetManagerImpl result = service.getWidgetManager();
						if(result != null) {
							listener.onLaunch(result);
							return;
						}
						service.wgtMgrListeners.add(listener);
					}
				}
			});
		}
		return null;
	}
	
	public static WidgetManagerImpl getWidgetManagerInstance() {
		return getWidgetManagerInstance(null, null);
	}

	@Override
	public IBinder onBind(Intent arg0) {
		return null;
	}

}
