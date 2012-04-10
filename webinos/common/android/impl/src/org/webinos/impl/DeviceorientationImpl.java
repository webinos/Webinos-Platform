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

import java.util.List;

import org.webinos.api.deviceorientation.Acceleration;
import org.webinos.api.deviceorientation.DeviceorientationManager;
import org.webinos.api.deviceorientation.MotionCB;
import org.webinos.api.deviceorientation.MotionEvent;
import org.webinos.api.deviceorientation.OrientationCB;
import org.webinos.api.deviceorientation.OrientationEvent;
import org.webinos.api.deviceorientation.RotationRate;

import org.meshpoint.anode.AndroidContext;
import org.meshpoint.anode.module.IModule;
import org.meshpoint.anode.module.IModuleContext;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.util.Log;

public class DeviceorientationImpl extends DeviceorientationManager implements
		IModule {

	private Context androidContext;
	private SensorManager sensorManager;

	private OrientationListener orientationListener;
	private Sensor orientationSensor;
	private Sensor magneticSensor;

	private AccelerometerListener accelerometerListener;
	private Sensor accelerometerSensor;
	private Sensor linearAccelerometerSensor;
	private boolean integrateLinearAcceleration;

	private static final String TAG = "org.webinos.impl.DeviceorientationImpl";
	
	/*****************************
	 * DeviceorientationManager methods
	 *****************************/
	@Override
	public synchronized void watchOrientation(OrientationCB orientationCb) {
		(orientationListener = new OrientationListener(orientationCb)).start();
		sensorManager.registerListener(orientationListener, orientationSensor, SensorManager.SENSOR_DELAY_FASTEST);
	}

	@Override
	public synchronized void watchMotion(MotionCB motionCb) {
		(accelerometerListener = new AccelerometerListener(motionCb)).start();
		sensorManager.registerListener(accelerometerListener, accelerometerSensor, SensorManager.SENSOR_DELAY_FASTEST);
		if(linearAccelerometerSensor != null)
			sensorManager.registerListener(accelerometerListener, linearAccelerometerSensor, SensorManager.SENSOR_DELAY_FASTEST);
		if(magneticSensor != null)
			sensorManager.registerListener(accelerometerListener, magneticSensor, SensorManager.SENSOR_DELAY_FASTEST);
	}

	@Override
	public synchronized void unwatchOrientation() {
		if(orientationListener != null) {
			sensorManager.unregisterListener(orientationListener);
			orientationListener.kill();
			orientationListener = null;
		}
	}

	@Override
	public synchronized void unwatchMotion() {
		if(accelerometerListener != null) {
			sensorManager.unregisterListener(accelerometerListener);
			accelerometerListener.kill();
			accelerometerListener = null;
		}
	}

	/*****************************
	 * IModule methods
	 *****************************/
	@Override
	public Object startModule(IModuleContext ctx) {
		androidContext = ((AndroidContext)ctx).getAndroidContext();
		sensorManager = (SensorManager)androidContext.getSystemService(Context.SENSOR_SERVICE);
		
		/* get orientation sensor - legacy devices */
		List<Sensor> sensorList = sensorManager.getSensorList(Sensor.TYPE_ORIENTATION);
		if(sensorList.isEmpty())
			Log.e(TAG, "No orientation device found");
		else
			orientationSensor = sensorList.get(0);

		/* get magnetic field sensor */
		sensorList = sensorManager.getSensorList(Sensor.TYPE_MAGNETIC_FIELD);
		if(sensorList.isEmpty())
			Log.e(TAG, "No magnetic field device found");
		else
			magneticSensor = sensorList.get(0);

		/* get motion sensors */
		sensorList = sensorManager.getSensorList(Sensor.TYPE_ACCELEROMETER);
		if(sensorList.isEmpty()) {
			Log.e(TAG, "No accelerometer device found");
		} else {
			accelerometerSensor = sensorList.get(0);
			sensorList = sensorManager.getSensorList(Sensor.TYPE_LINEAR_ACCELERATION);
			if(sensorList.isEmpty()) {
				Log.e(TAG, "No linear accelerometer device found");
				integrateLinearAcceleration = true;
			} else {
				linearAccelerometerSensor = sensorList.get(0);
			}
		}
		
		if(accelerometerSensor == null && orientationSensor == null) {
			Log.e(TAG, "No orientation or accelerometer device found - aborting");
			return null;
		}
		return this;
	}

	@Override
	public void stopModule() {
		unwatchOrientation();
		unwatchMotion();
	}

	/*****************************
	 * Helpers
	 *****************************/
	
	class OrientationListener extends Thread implements SensorEventListener {

		private OrientationCB orientationCb;
		private OrientationEvent pendingEvent;
		private boolean isKilled;

		private OrientationListener(OrientationCB orientationCb) {
			this.orientationCb = orientationCb;
		}

		private void kill() {
			isKilled = true;
			interrupt();
		}
		
		private synchronized void postOrientation(OrientationEvent ev) {
			pendingEvent = ev;
			notify();
		}
		
		@Override
		public void run() {
			while(!isKilled) {
				synchronized(this) {
					try {
						wait();
					} catch(InterruptedException ie) { break; }
					if(pendingEvent != null) {
						OrientationEvent ev = pendingEvent;
						pendingEvent = null;
						if(orientationCb != null)
							orientationCb.onOrientationEvent(ev);
					}
				}
			}
		}

		@Override
		public void onAccuracyChanged(Sensor arg0, int arg1) {}

		@Override
		public void onSensorChanged(SensorEvent sensorEvent) {
			OrientationEvent ev = new OrientationEvent();
			ev.alpha = sensorEvent.values[0];
			ev.beta = sensorEvent.values[1];
			ev.gamma = sensorEvent.values[2];
			ev.absolute = true;
			postOrientation(ev);
		}
	}
	
	class AccelerometerListener extends Thread implements SensorEventListener {
		
		private MotionCB motionCb;

		private float[] lastAccelerationValues;
		private float[] lastMagneticValues;
		private long lastMagneticTime;
		private float[] R = new float[9];
		private float[] I = new float[9];
		private float[] orientation = new float[3];

		private Acceleration pendingAcceleration;
		private Acceleration pendingLinearAcceleration;
		private Acceleration gravity;
		private MotionEvent pendingEvent;
		private long lastMotionEventTime;
		
		private OrientationEvent lastOrientation;
		private RotationRate lastRotationRate;
		private long lastOrientationEventTime;

		private boolean isKilled;
		private final float alpha = 0.8F;
		private static final double degreesPerRadian = 180 / Math.PI;
		
		private AccelerometerListener(MotionCB motionCb) {
			this.motionCb = motionCb;
			lastMotionEventTime = System.currentTimeMillis();
			if(integrateLinearAcceleration)
				gravity = new Acceleration();
		}
		
		private void kill() {
			isKilled = true;
			interrupt();
		}
		
		private synchronized void updateRotationRate(OrientationEvent ev, long time) {
			long timeDelta = time - lastOrientationEventTime;
			if(timeDelta > 0 && lastOrientationEventTime > 0) {
				RotationRate result = new RotationRate();
				double factor = degreesPerRadian * 1000 / timeDelta;
				result.alpha = factor * (ev.alpha - lastOrientation.alpha);
				result.beta = factor * (ev.beta - lastOrientation.beta);
				result.gamma = factor * (ev.alpha - lastOrientation.alpha);
				lastOrientation = ev;
				lastOrientationEventTime = time;
				lastRotationRate = result;
			}
		}

		private synchronized void postAcceleration(Acceleration acc, Acceleration lin) {
			MotionEvent ev = new MotionEvent();
			ev.acceleration = lin;
			ev.accelerationIncludingGravity = acc;
			ev.rotationRate = lastRotationRate;

			long thisEventTime = System.currentTimeMillis();
			ev.interval = (double)(thisEventTime - lastMotionEventTime);
			lastMotionEventTime = thisEventTime;
			pendingEvent = ev;
			notify();
		}
		
		@Override
		public void run() {
			while(!isKilled) {
				synchronized(this) {
					try {
						wait();
					} catch(InterruptedException ie) { break; }
					if(pendingEvent != null) {
						MotionEvent ev = pendingEvent;
						pendingEvent = null;
						if(motionCb != null)
							motionCb.onMotionEvent(ev);
					}
				}
			}
		}

		@Override
		public void onAccuracyChanged(Sensor arg0, int arg1) {}

		@Override
		public void onSensorChanged(SensorEvent sensorEvent) {
			Acceleration acc = null, lin = null;		
			if(sensorEvent.sensor.getType() == Sensor.TYPE_ACCELEROMETER) {
				lastAccelerationValues = sensorEvent.values.clone();
				acc = new Acceleration();
				acc.x = sensorEvent.values[SensorManager.AXIS_X - 1];
				acc.y = sensorEvent.values[SensorManager.AXIS_Y - 1];
				acc.z = sensorEvent.values[SensorManager.AXIS_Z - 1];
				if(integrateLinearAcceleration) {
					gravity.x = alpha * gravity.x + (1 - alpha) * acc.x;
					gravity.y = alpha * gravity.y + (1 - alpha) * acc.y;
					gravity.z = alpha * gravity.z + (1 - alpha) * acc.z;

					lin = new Acceleration();
					lin.x = acc.x - gravity.x;
					lin.y = acc.y - gravity.y;
					lin.z = acc.z - gravity.z;
					
					postAcceleration(acc, lin);
					return;
				}
				pendingAcceleration = acc;
			} else if(sensorEvent.sensor.getType() == Sensor.TYPE_LINEAR_ACCELERATION) {
				lin = new Acceleration();
				lin.x = sensorEvent.values[SensorManager.AXIS_X - 1];
				lin.y = sensorEvent.values[SensorManager.AXIS_Y - 1];
				lin.z = sensorEvent.values[SensorManager.AXIS_Z - 1];
				pendingLinearAcceleration = lin;
			} else if(sensorEvent.sensor.getType() == Sensor.TYPE_MAGNETIC_FIELD) {
				lastMagneticValues = sensorEvent.values.clone();
				lastMagneticTime = sensorEvent.timestamp;
			}
			/*
			 * This procedure to combine information from the magnetic field sensor and the
			 * accelerometer to get the rotation matrix, and hence the orientation.
			 * However, it doesn't seem to give meaningful data on the Nexus S at least.
			 * So to get orientation, we're sticking with the (legacy) ORIENTATION sensor
			 * for now.
			 */
			if(lastAccelerationValues != null && lastMagneticValues != null) {
				SensorManager.getRotationMatrix(R, I, lastAccelerationValues, lastMagneticValues);
				SensorManager.getOrientation(R, orientation);
				OrientationEvent orientationEvent = new OrientationEvent();
				orientationEvent.alpha = orientation[0];
				orientationEvent.beta = orientation[1];
				orientationEvent.gamma = orientation[2];
				updateRotationRate(orientationEvent, lastMagneticTime);
				lastAccelerationValues = lastMagneticValues = null;
			}
			if(pendingAcceleration != null && pendingLinearAcceleration != null) {
				postAcceleration(pendingAcceleration, pendingLinearAcceleration);
				pendingAcceleration = pendingLinearAcceleration = null;
			}
		}		
	}
}
