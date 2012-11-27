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

package org.webinos.app.platform;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.webinos.app.R;
import org.webinos.util.AssetUtils;
import org.webinos.util.ModuleUtils;
import org.webinos.util.ModuleUtils.ModuleType;

import android.app.Activity;
import android.app.ProgressDialog;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.res.AssetManager;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.IBinder;
import android.util.Log;

public class PlatformInit extends Service {

	public static final String ACTION_POSTINSTALL = "org.webinos.app.POSTINSTALL";
	private static String ACTION_POSTINSTALL_COMPLETE = "org.webinos.installer.POSTINSTALL_COMPLETE";

	private static final String TAG = "org.webinos.app.platform.PlatformInit";
	private static final String MODULE_PATH = "modules";

	/**
	 * Listener for asynchronous indications of service availability
	 */
	interface PlatformServiceListener {
		public void onServiceAvailable(PlatformInit service);
	}

	/**
	 * Listeners waiting for service availability
	 */
	private static List<PlatformServiceListener> serviceListeners = new ArrayList<PlatformServiceListener>();

	/**
	 * The singleton service
	 */
	private static PlatformInit theService;

	/*******************
	 * public API
	 *******************/

	/**
	 * Synchronously obtain the service instance, if it already exists.
	 * This will not trigger the service being started; only use in contexts
	 * where it is known that the service will already have been started.
	 * @return the service instance if available
	 */
	public static synchronized PlatformInit getService() {
		if(theService == null || theService.initialised)
			return theService;
		return null;
	}
		
	/**
	 * Get the service instance, registering a callback for the case that
	 * the service is not currently avaiable. If not available, the service
	 * will be started.
	 * @param ctx a context to use to start the service if required.
	 * @param listener a listener to call with the service instance, in the case that
	 * the service was not available already. If the service was available at the time
	 * the call was made, then the instance will be returned directly and the listener
	 * will NOT be called.
	 * @return the service instance if available; or null otherwise
	 */
	public static PlatformInit getService(Context ctx, PlatformServiceListener listener) {
		PlatformInit foundService = null;
		/* synchronously check, and add listener if necessary */
		synchronized(PlatformInit.class) {
			if(theService == null || !theService.initialised) {
				if(listener != null)
					serviceListeners.add(listener);
			} else {
				foundService = theService;
			}
		}
		/* start service if necessary */
		if(theService == null) {
			Config.init(ctx);
			ctx.startService(new Intent(ctx, PlatformInit.class));
		}
		/* return synchronously obtained instance */
		return foundService;
	}

	public static boolean onInit(final Context context, final Runnable handler) {
		if(getService() != null)
				return true;

		if(handler == null)
			return (getService(context, null) != null);

		class Waiter implements PlatformServiceListener {
			private ProgressDialog progressDialog;
			private boolean blocked;

			private void onBlock() {
				blocked = true;
				if(context instanceof Activity) {
					((Activity)context).runOnUiThread(new Runnable() {
						@Override
						public void run() {
							/* put up progress dialog until the service is available */
							progressDialog = new ProgressDialog(context);
							progressDialog.setCancelable(true);
							progressDialog.setMessage(context.getString(R.string.initialising_runtime));
							progressDialog.setProgressStyle(ProgressDialog.STYLE_HORIZONTAL);
							progressDialog.setIndeterminate(true);
							progressDialog.show();
						}
					});
				}
			}

			private void onUnblock() {
				if(context instanceof Activity) {
					((Activity)context).runOnUiThread(new Runnable() {
						@Override
						public void run() {
							if(progressDialog != null) {
								progressDialog.dismiss();
								progressDialog = null;
							}
							if(blocked)
								handler.run();
						}
					});
					return;
				}
				if(blocked)
					handler.run();
			}

			@Override
			public void onServiceAvailable(PlatformInit service) {
				onUnblock();
			}
		}
		Waiter waiter = new Waiter();
		getService(context, waiter);
		boolean result;
		synchronized(PlatformInit.class) {
			result = (getService() != null);
			if(!result)
				waiter.onBlock();
		}
		return result;	
	}

	/*******************
	 * lifecycle
	 *******************/

	@Override
	public int onStartCommand(Intent intent, int flags, int startId) {
		final boolean force = (intent.getAction() == ACTION_POSTINSTALL);
		/* synchronously set ourselves as the singleton instance, and notify
		 * and pending listeners */
		synchronized(PlatformInit.class) {
			if(theService == null) {
				theService = this;
				(new AsyncTask<Void, Void, Void>() {
					@Override
					protected Void doInBackground(Void... params) {
						installModuleDependencies(force);
						synchronized(PlatformInit.class) {
							if(serviceListeners != null) {
								for(PlatformServiceListener listener : serviceListeners)
									listener.onServiceAvailable(theService);
								serviceListeners = null;
							}
						}
						return null;
					}}).execute();
			}
		}
		return START_NOT_STICKY;
	}

	@Override
	public void onCreate() {
		super.onCreate();
		Config.init(this);
	}
	
	/*******************
	 * private state
	 *******************/

	private boolean initialised;

	/**
	 * Install all module dependencies located in assets/modules
	 * @param ctx the service context
	 * @param force force update, even if module is already present
	 */
	private void installModuleDependencies(boolean force) {
		if(initialised && !force)
			return;

		AssetManager mgr = getAssets();
		try {
			String[] modules = mgr.list(MODULE_PATH);
			if (modules != null) {
				for(String module : modules) {
					Log.v(TAG, "Checking module: " + module);
					checkModule(module, force);
				}
			}
		} catch (IOException e) {
			Log.v(TAG, "Unable to get assets in " + MODULE_PATH);
		}
		initialised = true;
		/* broadcast intent to indicate we're finished */
		Intent postInstallIntent = new Intent(ACTION_POSTINSTALL_COMPLETE);
		postInstallIntent.setData(Uri.parse("package://org.webinos.app"));
		sendBroadcast(postInstallIntent);
	}
	
	private void checkModule(String asset, boolean force) {
		ModuleType modType = ModuleUtils.guessModuleType(asset);
		String module = ModuleUtils.guessModuleName(asset, modType);
		File installLocation = ModuleUtils.getModuleFile(module, modType);
		if(installLocation.exists()) {
			if(force) {
				Log.v(TAG, "Module already installed, removing: " + module);
				ModuleUtils.uninstall(module);
			} else {
				Log.v(TAG, "Module already installed, ignoring: " + module);
				return;
			}
		}
		Log.v(TAG, "Installing module from package: " + module);
		ModuleUtils.install(this, module, AssetUtils.ASSET_URI + MODULE_PATH + '/' + asset);
	}

	@Override
	public IBinder onBind(Intent arg0) {
		// TODO Auto-generated method stub
		return null;
	}
}
