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

import org.meshpoint.anode.Isolate;
import org.meshpoint.anode.Runtime;
import org.webinos.app.wrt.ui.WidgetInstallActivity;
import org.webinos.app.wrt.ui.WidgetUninstallActivity;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class AnodeReceiver extends BroadcastReceiver {

	private static String TAG = "anode::AnodeReceiver";
	public static final String ACTION_START = "org.webinos.app.START";
	public static final String ACTION_STOP = "org.webinos.app.STOP";
	public static final String ACTION_STOPALL = "org.webinos.app.STOPALL";
	public static final String ACTION_MODULE_INSTALL = "org.webinos.app.module.INSTALL";
	public static final String ACTION_MODULE_UNINSTALL = "org.webinos.app.module.UNINSTALL";
	public static final String ACTION_WGT_INSTALL = "org.webinos.app.wgt.INSTALL";
	public static final String ACTION_WGT_UNINSTALL = "org.webinos.app.wgt.UNINSTALL";
	public static final String CMD = "cmdline";
	public static final String INST = "instance";
	public static final String OPTS = "options";
	public static final String MODULE = "module";
	public static final String PATH = "path";
	
	public AnodeReceiver() {
		super();
	}

	@Override
	public void onReceive(Context ctx, Intent intent) {
		/* get the system options */
		String action = intent.getAction();
		if(ACTION_STOPALL.equals(action)) {
			if(Runtime.isInitialised()) {
				for(Isolate isolate : AnodeService.getAll())
					AnodeService.stopInstance(isolate);
			}
			/* temporary ... kill the process */
			System.exit(0);
			return;
		}
		if(ACTION_STOP.equals(action)) {
			if(Runtime.isInitialised()) {
				String instance = intent.getStringExtra(INST);
				if(instance == null) {
					instance = AnodeService.soleInstance();
					if(instance == null) {
						Log.v(TAG, "AnodeReceiver.onReceive::stop: no instance specified");
						return;
					}
				}
				Isolate isolate = AnodeService.getInstance(instance);
				if(isolate == null) {
					Log.v(TAG, "AnodeReceiver.onReceive::stop: instance " + instance + " not found");
					return;
				}
				AnodeService.stopInstance(isolate);
			}
			/* temporary ... Kill the process */
			System.exit(0); // This was added for the review meeting to free up the ports
			return;
		}
		
		if(ACTION_START.equals(action)) {
			/* get the launch commandline */
			String args = intent.getStringExtra(CMD);
		
			/* if no cmdline was sent, then launch the activity for interactive behaviour */
			if(args == null || args.isEmpty()) {
				intent.setClassName(ctx, AnodeActivity.class.getName());
				intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
				ctx.startActivity(intent);
				return;
			}
		}

		if(ACTION_WGT_INSTALL.equals(action)) {
			intent.setClassName(ctx, WidgetInstallActivity.class.getName());
			intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
			ctx.startActivity(intent);
			return;
		}

		if(ACTION_WGT_UNINSTALL.equals(action)) {
			intent.setClassName(ctx, WidgetUninstallActivity.class.getName());
			intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
			ctx.startActivity(intent);
			return;
		}

		/* otherwise, start service */
		intent.setClassName(ctx, AnodeService.class.getName());
		ctx.startService(intent);
	}
}
