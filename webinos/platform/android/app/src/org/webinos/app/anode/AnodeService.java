/*
 * Copyright 2011-2012 Paddy Byers
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

package org.webinos.app.anode;

import java.io.File;
import java.util.Collection;
import java.util.HashMap;

import org.meshpoint.anode.Isolate;
import org.meshpoint.anode.Runtime;
import org.meshpoint.anode.Runtime.IllegalStateException;
import org.meshpoint.anode.Runtime.InitialisationException;
import org.meshpoint.anode.Runtime.NodeException;
import org.meshpoint.anode.Runtime.StateListener;
import org.webinos.app.platform.PlatformInit;
import org.webinos.util.ArgProcessor;
import org.webinos.util.Constants;
import org.webinos.util.ModuleUtils;

import android.app.AlarmManager;
import android.app.IntentService;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.SystemClock;
import android.util.Log;

public class AnodeService extends IntentService {

	private static String TAG = "anode::AnodeService";
	
	/**********************
	 * Instance table
	 ***********************/
	private static int counter;
	private static HashMap<String, Isolate> instances = new HashMap<String, Isolate>();
	
	public static synchronized String addInstance(String instance, Isolate isolate) {
		if(instance == null) instance = String.valueOf(counter++);
		instances.put(instance, isolate);
		return instance;
	}
	
	static synchronized Isolate getInstance(String instance) {
		return instances.get(instance);
	}
	
	static synchronized void removeInstance(String instance) {
		instances.remove(instance);
	}
	
	static synchronized String soleInstance() {
		String instance = null;
		if(instances.size() == 1)
			instance = instances.keySet().iterator().next();
		return instance;
	}
	
	static synchronized Collection<Isolate> getAll() {
		return instances.values();
	}

	/**********************
	 * Service
	 **********************/
	public AnodeService() {
		super(":anode.AnodeService");
		/* android.os.Debug.waitForDebugger(); */
		(new File(Constants.APP_DIR)).mkdirs();
		(new File(Constants.MODULE_DIR)).mkdirs();
		(new File(Constants.RESOURCE_DIR)).mkdirs();
		(new File(Constants.WRT_DIR)).mkdirs();
	}

    private void initRuntime(String[] opts) {
    	try {
    		Runtime.initRuntime(this, opts);
		} catch (InitialisationException e) {
			Log.v(TAG, "AnodeService.initRuntime: exception: " + e + "; cause: " + e.getCause());
		}
    }

	@Override
	protected void onHandleIntent(Intent intent) {
		/* we should not get a stop action; should have been intercepted by the receiver */
		String action = intent.getAction();
		if(AnodeReceiver.ACTION_STOP.equals(action)) {
			Log.v(TAG, "AnodeService.onHandleIntent::stop: internal error");
			return;
		}

		if(PlatformInit.ACTION_POSTINSTALL.equals(action)) {
			if(Runtime.isInitialised()) {
				/* the runtime is running .. we can't replace
				 * the modules while we're running. Therefore
				 * we have to kill the process and reschedule 
				 * the intent to be handled by starting us
				 * again .... 
				 *
				 * First kill all isolates */
				for(Isolate isolate : AnodeService.getAll())
					stopInstance(isolate);

				/* post alarm event to re-wake us */
				Log.v(TAG, "AnodeReceiver.onReceive::postinstall: service is running, so exit and reschedule");
				PendingIntent pendingIntent = PendingIntent.getBroadcast(this, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT);
				AlarmManager alarmMgr = (AlarmManager)getSystemService(Context.ALARM_SERVICE);
				alarmMgr.set(AlarmManager.ELAPSED_REALTIME, SystemClock.uptimeMillis() + 2000, pendingIntent);

				/* kill this process */
				System.exit(0);
				return;
			}
			/* otherwise, we can just update the modules */
			Log.v(TAG, "AnodeReceiver.onReceive::postinstall: starting PlatformInit service");
			intent.setClass(this, PlatformInit.class);
			startService(intent);
			return;
		}

		if(AnodeReceiver.ACTION_START.equals(action)) {
			/* get system options before handling this invocation */
			String options = intent.getStringExtra(AnodeReceiver.OPTS);
			String[] opts = options == null ? null : options.split("\\s");
			initRuntime(opts);
			handleStart(intent);
		} else if(AnodeReceiver.ACTION_MODULE_INSTALL.equals(action)) {
			handleInstall(intent);
		} else if(AnodeReceiver.ACTION_MODULE_UNINSTALL.equals(action)) {
			handleUninstall(intent);
		}
	}

	private void handleStart(Intent intent) {

		/* get the launch commandline */
		String args = intent.getStringExtra(AnodeReceiver.CMD);
		
		/* if no cmdline was sent, then launch the activity for interactive behaviour */
		if(args == null || args.isEmpty()) {
			intent.setClassName(getApplication(), AnodeActivity.class.getName());
			getApplication().startActivity(intent);
			return;
		}

		/* create a new instance based on the supplied args */
		ArgProcessor argProcessor = new ArgProcessor(intent.getExtras(), args);
		String[] processedArgs = argProcessor.processArray();

		/* launch directly */
		try {
			Isolate isolate = Runtime.createIsolate();
			String instance = intent.getStringExtra(AnodeReceiver.INST);
			isolate.addStateListener(new ServiceListener(addInstance(instance, isolate)));
			isolate.start(processedArgs);
		} catch (IllegalStateException e) {
			Log.v(TAG, "AnodeReceiver.onReceive::start: exception: " + e + "; cause: " + e.getCause());
		} catch (NodeException e) {
			Log.v(TAG, "AnodeReceiver.onReceive::start: exception: " + e + "; cause: " + e.getCause());
		}
	}

	class ServiceListener implements StateListener {
		String instance;
		
		private ServiceListener(String instance) {
			this.instance = instance;
		}

		@Override
		public void stateChanged(final int state) {
			/* exit remove the instance if exited */
			if(state == Runtime.STATE_STOPPED) {
				removeInstance(instance);
			}
		}
	}

	private void handleInstall(Intent intent) {
		String module = intent.getStringExtra(AnodeReceiver.MODULE);
		String path = intent.getStringExtra(AnodeReceiver.PATH);
		ModuleUtils.install(this, module, path);
	}

	private void handleUninstall(Intent intent) {
		ModuleUtils.uninstall(intent.getStringExtra(AnodeReceiver.MODULE));
	}

	static void stopInstance(Isolate isolate) {
		try {
			isolate.stop();
		} catch (IllegalStateException e) {
			Log.v(TAG, "AnodeReceiver.onReceive::stop: exception: " + e + "; cause: " + e.getCause());
		} catch (NodeException e) {
			Log.v(TAG, "AnodeReceiver.onReceive::stop: exception: " + e + "; cause: " + e.getCause());
		}
	}
}
