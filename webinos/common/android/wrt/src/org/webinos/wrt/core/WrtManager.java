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

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;

import org.webinos.wrt.channel.Session;
import org.webinos.wrt.ui.RendererActivity;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.IBinder;
import android.util.Log;

public class WrtManager extends Service implements Iterable<RendererActivity> {
	private static WrtManager theService;
	private static final String TAG = "org.webinos.wrt.core.WrtManager";
	
	private HashMap<String, RendererActivity> activities = new HashMap<String, RendererActivity>();
    private static ArrayList<LaunchListener> listeners = new ArrayList<LaunchListener>();
    private static boolean started = false;
    
	public interface LaunchListener {
		public void onLaunch(WrtManager service);
	}

	public static WrtManager getInstance(Context ctx, LaunchListener listener) {
		WrtManager result;
		synchronized(listeners) {
			result = theService;
			if(result == null && listener != null) {
				listeners.add(listener);
			}
			if(!started) {
				ctx.startService(new Intent(ctx, WrtManager.class));
				started = true;
			}
				
		}
		return result;
	}

	public static WrtManager getInstance() {
		return theService;
	}

	public synchronized RendererActivity get(String id) {
		return activities.get(id);
	}

	public synchronized void put(String id, RendererActivity activity) {
		activities.put(id, activity);
	}

    @Override
	public void onCreate() {
		theService = this;
		Config.init(this);
		try {
	        synchronized(listeners) {
	        	theService = this;
	        	for(LaunchListener listener : listeners) {
	        		listener.onLaunch(this);
	        		listeners.remove(listener);
	        	}
	        }
		} catch(Throwable t) {
			Log.v(TAG, "WrtManager.init: uable to bind to Webinos service; exception thrown", t);
		}
		super.onCreate();
	}

    @Override
    public void onDestroy() {
		try {
			Session.dispose();
		} catch(Throwable t) {
			Log.v(TAG, "WrtManager.finalize: exception thrown", t);
		}
		super.onDestroy();
	}

	public Iterator<RendererActivity> iterator() {
		return activities.values().iterator();
	}

	public void stopInstance(RendererActivity activity) {
		/* stop the activity */
		activity.finish();
		synchronized(this) {
			activities.remove(activity.instanceId);
		}
	}

	public WidgetConfig getWidgetConfig(String installId) {
		try {
			return new WidgetConfig(getContentResolver(), installId);
		} catch(FileNotFoundException e) {
			Log.v(TAG, "WrtManager.getWidgetConfig(): requested widget not found: " + installId, e);
		} catch(IOException ioe) {
			Log.v(TAG, "WrtManager.getWidgetConfig(): unexpected exception reading widget configuration: ", ioe);
		}
		return null;
	}

	public String getWrtDir() {
		return Config.getInstance().getProperty("wrt.home");
	}

	@Override
	public IBinder onBind(Intent intent) {
		// TODO Auto-generated method stub
		return null;
	}
}
