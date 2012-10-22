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

import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;

import org.meshpoint.anode.AndroidContext;
import org.meshpoint.anode.module.IModule;
import org.meshpoint.anode.module.IModuleContext;
import org.webinos.api.DeviceAPIError;
import org.webinos.api.geolocation.Coordinates;
import org.webinos.api.geolocation.GeolocationManager;
import org.webinos.api.geolocation.Position;
import org.webinos.api.geolocation.PositionCallback;
import org.webinos.api.geolocation.PositionError;
import org.webinos.api.geolocation.PositionErrorCallback;
import org.webinos.api.geolocation.PositionOptions;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;
import android.location.Criteria;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.location.LocationProvider;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;

public class GeolocationImpl extends GeolocationManager implements IModule, LocationListener {

	/*****************************
	 * private state
	 *****************************/
	private Context androidContext;
	private Handler timerHandler;

	private Set<Request> pendingRequests;
	private HashMap<String, Watch> watches;
	private long nextWatchId = 1;
	private int watchCount;
	private int highAccuracyCount;

	private LocationManager locationManager;
	private Criteria lowAccuracyCriteria;
	private Criteria highAccuracyCriteria;
	private String currentWatchProvider;

	private static final float minDistanceChange = 1;
	private static final long minTimeChange = 100;
	
	private static final String TAG = "org.webinos.impl.GeolocationImpl";

	/*****************************
	 * GeolocationManager methods
	 *****************************/
	@Override
	public void getCurrentPosition(PositionCallback successCallback,
			PositionErrorCallback errorCallback, PositionOptions options) {

		Log.v(TAG, "getCurrentPosition(): ent");
		if(successCallback == null) {
			Log.e(TAG, "getCurrentPosition(): no successCallback; aborting");
			throw new DeviceAPIError(DeviceAPIError.TYPE_MISMATCH_ERR);
		}
		Request req = new Request(successCallback, errorCallback, options);
		if(req.inError) {
			Log.e(TAG, "getCurrentPosition(): request inError; aborting");
			return;
		}

		Criteria criteria = (req.enableHighAccuracy && highAccuracyCriteria != null) ? highAccuracyCriteria : lowAccuracyCriteria;
		String provider = locationManager.getBestProvider(criteria, true);
		if(req.tryLastKnownPosition(provider)) {
			Log.v(TAG, "getCurrentPosition(): responding with last known position");
			return;
		}

		if(provider == null) {
			Log.e(TAG, "getCurrentPosition(): no available provider; responding with position unavailable");
			PositionError error = new PositionError();
			error.code = PositionError.POSITION_UNAVAILABLE;
			req.dispatch(error);
			return;
		}

		synchronized(this) {
			Log.v(TAG, "getCurrentPosition(): scheduling request");
			req.schedule();
			locationManager.requestSingleUpdate(criteria, req, androidContext.getMainLooper());
		}
	}

	@Override
	public long watchPosition(PositionCallback successCallback,
			PositionErrorCallback errorCallback, PositionOptions options) {

		Log.v(TAG, "watchPosition(): ent");
		if(successCallback == null) {
			Log.e(TAG, "watchPosition(): no successCallback; aborting");
			throw new DeviceAPIError(DeviceAPIError.TYPE_MISMATCH_ERR);
		}
		Watch watch = new Watch(successCallback, errorCallback, options);
		if(watch.inError) {
			Log.e(TAG, "watchPosition(): request inError; returning 0");
			return 0;
		}
		Log.v(TAG, "watchPosition(): ret " + watch.id);
		return watch.id;
	}

	@Override
	public void clearWatch(long id) {
		Log.v(TAG, "clearWatch(): ent id = " + id);
		getWatch(id).deschedule();
	}

	/*****************************
	 * IModule methods
	 *****************************/
	@Override
	public Object startModule(IModuleContext ctx) {
		Log.v(TAG, "startModule(): ent");
		try {
			androidContext = ((AndroidContext)ctx).getAndroidContext();
			timerHandler = new Handler(androidContext.getMainLooper());

			pendingRequests = new HashSet<Request>();
			watches = new HashMap<String, Watch>();
			locationManager = (LocationManager) androidContext.getSystemService(Context.LOCATION_SERVICE);

			String[] permissions = androidContext.getPackageManager().getPackageInfo(androidContext.getPackageName(), PackageManager.GET_PERMISSIONS).requestedPermissions;
			boolean hasCoarsePermission = false, hasFinePermission = false;
			for(String perm : permissions) {
				hasCoarsePermission |= (perm.equals(Manifest.permission.ACCESS_COARSE_LOCATION));
				hasFinePermission |= (perm.equals(Manifest.permission.ACCESS_FINE_LOCATION));
				if(hasCoarsePermission & hasFinePermission) break;
			}
			Log.v(TAG, "startModule(): hasCoarsePermission = " + hasCoarsePermission + "; hasFinePermission = " + hasFinePermission);
			if(hasCoarsePermission | hasFinePermission) {
				lowAccuracyCriteria = new Criteria();
				lowAccuracyCriteria.setAccuracy(Criteria.ACCURACY_COARSE);
				lowAccuracyCriteria.setPowerRequirement(Criteria.POWER_LOW);
				if(hasFinePermission) {
					highAccuracyCriteria = new Criteria();
					highAccuracyCriteria.setAccuracy(Criteria.ACCURACY_FINE);
				}
				Log.v(TAG, "startModule(): ret (success)");
				return this;
			}
			Log.e(TAG, "startModule(): no permission");
		} catch (NameNotFoundException e) {
			/* Internal error - should not happen */
			Log.e(TAG, "Package manager exception: ", e);
		}
		Log.v(TAG, "startModule(): ret (failed)");
		return null;
	}

	@Override
	public void stopModule() {
		Log.v(TAG, "stopModule(): ent");
		PositionError error = new PositionError();
		error.code = PositionError.POSITION_UNAVAILABLE;
		for(Request req : pendingRequests) {
			req.dispatch(error);
		}
		for(Watch req : watches.values()) {
			req.dispatch(error);
		}
		Log.v(TAG, "stopModule(): ret");
	}

	/*****************************
	 * Provider management
	 *****************************/

	private synchronized void resetProvider() {
		Log.v(TAG, "resetProvider(): ent");
		if(watchCount == 0) {
			locationManager.removeUpdates(this);
			currentWatchProvider = null;
			Log.v(TAG, "resetProvider(): ret (no watches)");
			return;
		}

		Criteria criteria = (highAccuracyCount > 0 && highAccuracyCriteria != null) ? highAccuracyCriteria : lowAccuracyCriteria;
		String provider = locationManager.getBestProvider(criteria, true);
		if(provider == null) {
			currentWatchProvider = null;
			PositionError error = new PositionError();
			error.code = PositionError.POSITION_UNAVAILABLE;
			for(Watch watch : watches.values()) {
				Log.e(TAG, "resetProvider(): cancelling watch id " + watch.id + " (no provider)");
				watch.dispatch(error);
				watch.deschedule();
			}
			Log.v(TAG, "resetProvider(): ret (no provider)");
			return;
		}

		if(!provider.equals(currentWatchProvider)) {
			Log.v(TAG, "resetProvider(): changing provider to: " + provider);
			locationManager.removeUpdates(this);
			currentWatchProvider = provider;
			locationManager.requestLocationUpdates(provider, minTimeChange, minDistanceChange, this);
		}
		Log.v(TAG, "resetProvider(): ret");
	}

	/*****************************
	 * Watches
	 *****************************/

	class Request implements LocationListener, Runnable {
		protected PositionCallback successCallback;
		protected PositionErrorCallback errorCallback;
		protected boolean inError;
		public long timeout = Long.MAX_VALUE;
		public long maximumAge;
		public boolean enableHighAccuracy;

		private Request(PositionCallback successCallback, PositionErrorCallback errorCallback, PositionOptions options) {
			this.successCallback = successCallback;
			this.errorCallback = errorCallback;
			if(options != null && options.timeout != null) {
				timeout = options.timeout.longValue();
				timeout = (timeout < 0) ? 0 : timeout;
			}
			if(options != null && options.maximumAge != null) {
				maximumAge = options.maximumAge.longValue();
				maximumAge = (maximumAge < 0) ? 0 : maximumAge;
			}
			if (timeout == 0 && maximumAge == 0) {
				PositionError error = new PositionError();
				error.code = PositionError.TIMEOUT;
				dispatch(error);
				return;
			}
			if(options != null && options.enableHighAccuracy != null) {
				enableHighAccuracy = options.enableHighAccuracy.booleanValue();
			}
		}

		protected void startTimer() {
			if(timeout > 0)
				timerHandler.postDelayed(this, timeout);
		}

		protected void stopTimer() {
			timerHandler.removeCallbacks(this);
		}

		protected synchronized void dispatch(Position position) {
			stopTimer();
			if(successCallback != null) {
				successCallback.handleEvent(position);
			}
		}
		
		protected synchronized void dispatch(PositionError error) {
			stopTimer();
			if(errorCallback != null) {
				errorCallback.handleEvent(error);
			}
			inError = true;
		}
		
		protected void schedule() {
			startTimer();
			pendingRequests.add(this);
		}

		protected void deschedule() {
			stopTimer();
			pendingRequests.remove(this);
		}
		
		protected boolean tryLastKnownPosition(String provider) {
			if(provider == null) {
				/* no providers enabled; try all disabled ones */
				for(String someProvider : locationManager.getProviders(false)) {
					if(tryLastKnownPosition(someProvider))
						return true;
				}
				return false;
			}

			Location location = locationManager.getLastKnownLocation(provider);
			if(location != null) {
				if((location.getTime() - System.currentTimeMillis()) < maximumAge) {
					dispatch(toPosition(location));
					return true;
				}
			}
			return false;
		}

		@Override
		public void onLocationChanged(Location location) {
			if((location.getTime() - System.currentTimeMillis()) < maximumAge) {
				dispatch(toPosition(location));
				deschedule();
			}
		}

		@Override
		public void onProviderDisabled(String arg0) {
			PositionError error = new PositionError();
			error.code = PositionError.POSITION_UNAVAILABLE;
			dispatch(error);
			deschedule();
		}

		@Override
		public void onProviderEnabled(String arg0) {}

		@Override
		public void onStatusChanged(String arg0, int status, Bundle arg2) {
			if(status == LocationProvider.OUT_OF_SERVICE) {
				PositionError error = new PositionError();
				error.code = PositionError.POSITION_UNAVAILABLE;
				dispatch(error);
				deschedule();
			}
		}

		@Override
		public void run() {
			/* initial timeout expired */
			synchronized(this) {
				PositionError error = new PositionError();
				error.code = PositionError.TIMEOUT;
				dispatch(error);
				deschedule();
			}
		}
	}

	class Watch extends Request {
		private long id;
		private String key;
		private Position lastUpdatedPosition;

		private Watch(PositionCallback successCallback, PositionErrorCallback errorCallback, PositionOptions options) {
			super(successCallback, errorCallback, options);
			if(!inError) {
				id = nextWatchId++;
				key = String.valueOf(id).intern();
				synchronized(GeolocationImpl.this) {
					addWatch(this);
					if(!tryLastKnownPosition(currentWatchProvider)) {
						schedule();
					}
				}
			}
		}

		protected synchronized void dispatch(Position position) {
			if(lastUpdatedPosition == null || distance(lastUpdatedPosition.coords, position.coords) > minDistanceChange) {
				lastUpdatedPosition = position;
				super.dispatch(position);
			}
		}

		protected void deschedule() {
			stopTimer();
			removeWatch(this);
		}
	}

	private synchronized void addWatch(Watch watch) {
		watches.put(watch.key, watch);
		boolean statusChange = (watchCount++ == 0);
		if(watch.enableHighAccuracy) {
			statusChange |= (highAccuracyCount++ == 0);
		}
		if(statusChange) resetProvider();
	}

	private synchronized void removeWatch(Watch watch) {
		watches.remove(watch.key);
		boolean statusChange = (--watchCount == 0);
		if(watch.enableHighAccuracy) {
			statusChange |= (--highAccuracyCount == 0);
		}
		if(statusChange) resetProvider();
	}

	private synchronized Watch getWatch(long watchId) {
		return watches.get(String.valueOf(watchId).intern());
	}

	/*****************************
	 * Watch event listener
	 *****************************/

	@Override
	public void onLocationChanged(Location location) {
		Position position = toPosition(location);
		for(Watch watch : watches.values()) {
			watch.dispatch(position);
		}
	}

	@Override
	public void onProviderDisabled(String arg0) {
		resetProvider();
	}

	@Override
	public void onProviderEnabled(String arg0) {
		resetProvider();
	}

	@Override
	public void onStatusChanged(String arg0, int arg1, Bundle arg2) {
		resetProvider();
	}

	/*****************************
	 * Misc
	 *****************************/

	private static Position toPosition(Location location) {
		Position position = new Position();
		position.coords = new Coordinates();
		position.coords.accuracy = location.hasAccuracy() ? new Double(location.getAccuracy()) : null;
		position.coords.altitude = location.hasAltitude() ? new Double(location.getAltitude()) : null;
		position.coords.latitude = location.getLatitude();
		position.coords.longitude = location.getLongitude();
		position.coords.speed = location.hasSpeed() ? new Double(location.getSpeed()) : null;
		position.timestamp = location.getTime();
		return position;
	}

	private double distance(Coordinates a, Coordinates b) {
		return Math.pow((a.latitude - b.latitude), 2) + Math.pow((a.longitude - b.longitude), 2);
	}

}
