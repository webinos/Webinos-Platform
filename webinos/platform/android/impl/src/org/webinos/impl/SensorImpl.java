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
* Copyright 2012 Sony Mobile Communications
* 
******************************************************************************/

/*****************************************************************************
* Implements SensorImpl.java
* 
* This module starts listening to a sensor of a given type using the Android SensorManager.
* 
* Note that configureSensor() is not implemented in this module. Instead it must be implemented in pure JS. The only 
* configuration possible for Anndroid sensors is rate and this is an in-par to watchSensor()
*	
******************************************************************************/


package org.webinos.impl;

import java.util.List;

import org.webinos.api.PendingOperation;
import org.webinos.api.sensor.SensorCB;
import org.webinos.api.sensor.ConfigureSensorOptions;
import org.webinos.api.sensor.SensorError;
import org.webinos.api.sensor.SensorErrorCB;

import org.meshpoint.anode.AndroidContext;
import org.meshpoint.anode.module.IModule;
import org.meshpoint.anode.module.IModuleContext;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEventListener;
import android.util.Log;

public class SensorImpl extends org.webinos.api.sensor.SensorManager implements IModule {

	private Context androidContext;
	private android.hardware.SensorManager androidSensorManager;
	
	private WebinosSensorListener webinosSensorListener;
	private List<Sensor> androidSensorList;
	
	private static final String TAG = "org.webinos.impl.SensorImpl";
	
	
	/*****************************
	 * Webinos Sensor methods
	 *****************************/
	
	/*
	 * The first sensor found matching the requested sensor type is registered. Assumes that there is only one sensor 
	 * of a certain type in Android
	 * 
	 */
  @Override
	public synchronized void watchSensor(String api, int rate, SensorCB sensorCb, SensorErrorCB errorCB) {
		  
	  int sensorType = -100;
	  
	  if ("http://webinos.org/api/sensors.accelerometer".equals(api))
	    sensorType = Sensor.TYPE_ACCELEROMETER;
 	  else if ("http://webinos.org/api/sensors.gravity".equals(api))
	    sensorType = Sensor.TYPE_GRAVITY;
 	  else if ("http://webinos.org/api/sensors.orientation".equals(api))
	    sensorType = Sensor.TYPE_ORIENTATION;	    
 	  else if ("http://webinos.org/api/sensors.gyro".equals(api))
	    sensorType = Sensor.TYPE_GYROSCOPE;	  
 	  else if ("http://webinos.org/api/sensors.light".equals(api))
	    sensorType = Sensor.TYPE_LIGHT;
 	  else if ("http://webinos.org/api/sensors.linearacceleration".equals(api))
	    sensorType = Sensor.TYPE_LINEAR_ACCELERATION;	    
 	  else if ("http://webinos.org/api/sensors.magneticfield".equals(api))
	    sensorType = Sensor.TYPE_MAGNETIC_FIELD;
 	  else if ("http://webinos.org/api/sensors.pressure".equals(api))
	    sensorType = Sensor.TYPE_PRESSURE;	    	    
 	  else if ("http://webinos.org/api/sensors.proximity".equals(api))
	    sensorType = Sensor.TYPE_PROXIMITY;	 	    
 	  else if ("http://webinos.org/api/sensors.rotationvector".equals(api))
	    sensorType = Sensor.TYPE_ROTATION_VECTOR;	 	    
 	  else if ("http://webinos.org/api/sensors.temperature".equals(api))
	    sensorType = Sensor.TYPE_TEMPERATURE; 
 	  else if ("http://webinos.org/api/sensors".equals(api))
	    sensorType = Sensor.TYPE_ALL; 	    	  
 	  else
	    Log.e(TAG, "Ilegal sensor type selected");  
	  
	  if ((sensorType != -100)&&(sensorType != Sensor.TYPE_ALL)){  

  		  for (Sensor androidSensor : androidSensorList) {
	  	     if (androidSensor.getType() == sensorType) {
	  	       (webinosSensorListener = new WebinosSensorListener(sensorCb)).start();
		         androidSensorManager.registerListener(webinosSensorListener, androidSensor, rate);
	  	       return;
	  	     }	
	  	  }	
	  }	
		else if ((sensorType != -100) && (sensorType == Sensor.TYPE_ALL)) {
		   
		    for (Sensor androidSensor : androidSensorList) {
		  	  (webinosSensorListener = new WebinosSensorListener(sensorCb)).start();
		      androidSensorManager.registerListener(webinosSensorListener, androidSensor, rate);
	  	  }			   		   
		}
		else {
			// Error callback
		  SensorError sensorError = new SensorError();
		  sensorError.code = SensorError.ILLEGAL_SENSOR_TYPE_ERROR; 
		  errorCB.onError (sensorError); 
		
		}
	}
	
	@Override
	public synchronized void unwatchSensor() {
		if(webinosSensorListener != null) {
			androidSensorManager.unregisterListener(webinosSensorListener);
			webinosSensorListener.kill();
			webinosSensorListener = null;
		}
	}
	

	/*****************************
	 * IModule methods
	 *****************************/
	@Override
	public Object startModule(IModuleContext ctx) {
		Log.e(TAG, "Sensor module started");
		androidContext = ((AndroidContext)ctx).getAndroidContext();
		androidSensorManager = (android.hardware.SensorManager)androidContext.getSystemService(Context.SENSOR_SERVICE);
		
		/*  
		 * Get sensor list for all sensors in device
		 */
		androidSensorList = androidSensorManager.getSensorList(Sensor.TYPE_ALL);
		if(androidSensorList.isEmpty())
			Log.e(TAG, "No sensor found");
					
		return this;
	}

	@Override
	public void stopModule() {
		Log.e(TAG, "Sensor module stopped");
		unwatchSensor();
		
	}
	
	
	/*****************************
	 * Helpers
	 *****************************/
	 
	 class WebinosSensorListener extends Thread implements SensorEventListener {
	 
	 	private SensorCB sensorCb;
		private org.webinos.api.sensor.SensorEvent webinosPendingEvent;
		private boolean isKilled;
		private Sensor androidSensor;
		private int sensorType;
		
		
	  private WebinosSensorListener(SensorCB sensorCb) {
			this.sensorCb = sensorCb;
		}

		private void kill() {
			isKilled = true;
			interrupt();
		}
		
		private synchronized void postSensor(org.webinos.api.sensor.SensorEvent webinosSensorEvent) {
			webinosPendingEvent = webinosSensorEvent;
			/* Execute thread */
			notify();  
		}
	 
	 /* run() excutes the active part of the class' code */
	 	@Override
		public void run() {
			while(!isKilled) {
				synchronized(this) {
					try {
						wait();
					} catch(InterruptedException ie) { break; }
					if(webinosPendingEvent != null) {
						org.webinos.api.sensor.SensorEvent webinosSensorEvent = webinosPendingEvent;
						webinosPendingEvent = null;
						if(sensorCb != null)
							sensorCb.onSensorEvent(webinosSensorEvent);
					}
				}
			}
		}
		
		/* 
		 * The Webinos Sensor API does not have a specific event for change of accuracy and can't fire a Webinos SensorEvent as 
		 * don't have any values to send with the onAccuracyChanged event. So do nothing. Assume that the accuracy is updated with 
		 * the next onSensorChanged event.
		 */		
		@Override
		public void onAccuracyChanged(Sensor sensor, int accuracy) {}

		@Override
		public void onSensorChanged(android.hardware.SensorEvent androidSensorEvent) {
			org.webinos.api.sensor.SensorEvent webinosSensorEvent = new org.webinos.api.sensor.SensorEvent();
			webinosSensorEvent.sensorValues = new double[3];
			Sensor androidSensor = androidSensorEvent.sensor;
			sensorType = androidSensor.getType();
			
			/* Match Android sensor type to Webinos sensor type */			
			if (sensorType == Sensor.TYPE_ACCELEROMETER)
			  webinosSensorEvent.sensorType = "http://webinos.org/api/sensors.accelerometer";
			else if (sensorType == Sensor.TYPE_GRAVITY)
			  webinosSensorEvent.sensorType = "http://webinos.org/api/sensors.gravity";
			else if (sensorType == Sensor.TYPE_ORIENTATION)
			  webinosSensorEvent.sensorType = "http://webinos.org/api/sensors.orientation";			  
			else if (sensorType == Sensor.TYPE_GYROSCOPE)
			  webinosSensorEvent.sensorType = "http://webinos.org/api/sensors.gyro";			  
			else if (sensorType == Sensor.TYPE_LIGHT)
			  webinosSensorEvent.sensorType = "http://webinos.org/api/sensors.light";
			else if (sensorType == Sensor.TYPE_LINEAR_ACCELERATION)
			  webinosSensorEvent.sensorType = "http://webinos.org/api/sensors.linearacceleration";
			else if (sensorType == Sensor.TYPE_MAGNETIC_FIELD)
			  webinosSensorEvent.sensorType = "http://webinos.org/api/sensors.magneticfield";
			else if (sensorType == Sensor.TYPE_PRESSURE)
			  webinosSensorEvent.sensorType = "http://webinos.org/api/sensors.pressure";
			else if (sensorType == Sensor.TYPE_PROXIMITY)
			  webinosSensorEvent.sensorType = "http://webinos.org/api/sensors.proximity";		
			else if (sensorType == Sensor.TYPE_ROTATION_VECTOR)
			  webinosSensorEvent.sensorType = "http://webinos.org/api/sensors.rotationvector";		
			else if (sensorType == Sensor.TYPE_TEMPERATURE)
			  webinosSensorEvent.sensorType = "http://webinos.org/api/sensors.temperature"; 			  
			  
			/* Set to same as sensor type temporary. Should be a unique sensor id */  
			webinosSensorEvent.sensorId = webinosSensorEvent.sensorType;  
			
			/* Set accuracy */
			if (androidSensorEvent.accuracy == android.hardware.SensorManager.SENSOR_STATUS_ACCURACY_HIGH)
			  webinosSensorEvent.accuracy = org.webinos.api.sensor.SensorEvent.SENSOR_STATUS_ACCURACY_HIGH;
			else if (androidSensorEvent.accuracy == android.hardware.SensorManager.SENSOR_STATUS_ACCURACY_MEDIUM)
			  webinosSensorEvent.accuracy = org.webinos.api.sensor.SensorEvent.SENSOR_STATUS_ACCURACY_MEDIUM;
			else if (androidSensorEvent.accuracy == android.hardware.SensorManager.SENSOR_STATUS_ACCURACY_LOW)
			  webinosSensorEvent.accuracy = org.webinos.api.sensor.SensorEvent.SENSOR_STATUS_ACCURACY_LOW;
			else if (androidSensorEvent.accuracy == android.hardware.SensorManager.SENSOR_STATUS_UNRELIABLE)
			  webinosSensorEvent.accuracy = org.webinos.api.sensor.SensorEvent.SENSOR_STATUS_UNRELIABLE;
			  
			/* Set rate to undefined. Must be set to configured rate by JS side of sensor API if it has been configured */
			webinosSensorEvent.rate = ConfigureSensorOptions.SENSOR_DELAY_UNDEFINED; 
			
			/* Set to true, i.e. events fired when value changes as this is not configurable in Android */
			webinosSensorEvent.interrupt = true;						  
			  			   
			/* Set sensor values. Specification also defined normalized values between 0 and 1 but 
			   consider skipping this in the specification */  
	
			webinosSensorEvent.sensorValues[0] = androidSensorEvent.values[0];
			webinosSensorEvent.sensorValues[1] = androidSensorEvent.values[1];
			webinosSensorEvent.sensorValues[2] = androidSensorEvent.values[2];

			postSensor(webinosSensorEvent);
		}
	 
	 }
	
}
