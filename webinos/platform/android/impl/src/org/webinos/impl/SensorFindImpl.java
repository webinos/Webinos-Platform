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
* Implements SensorFindImpl.java
* 
* This module retrieves a list of all sensors available in the Android device and returns a 
* SensorManager object for each sensor found.
* 
******************************************************************************/

package org.webinos.impl;

import java.util.List;

import org.webinos.api.PendingOperation;

import org.webinos.api.sensor.SensorError;
import org.webinos.api.sensor.SensorErrorCB;
import org.webinos.api.sensor.FindSensorsManager;
import org.webinos.api.sensor.SensorFindCB;

import org.meshpoint.anode.AndroidContext;
import org.meshpoint.anode.module.IModule;
import org.meshpoint.anode.module.IModuleContext;

import android.content.Context;
import android.hardware.Sensor;
import android.util.Log;

public class SensorFindImpl extends FindSensorsManager implements IModule {

	private Context androidContext;
	private android.hardware.SensorManager androidSensorManager;
	
	private List<Sensor> androidSensorList;
	
	private static final String TAG = "org.webinos.impl.SensorFindImpl";
	
	
	/*****************************
	 * Webinos FindSensorsanager methods
	 *****************************/

	@Override
	public PendingOperation findSensors(String api, SensorFindCB successCB, SensorErrorCB errorCB) {
			
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
	  
	  if (sensorType != -100){  
	  
	   /* 
		  * Get sensor list for requested sensor type 
		  */
		  androidSensorList = androidSensorManager.getSensorList(sensorType);
		  if(androidSensorList.isEmpty())
		  	Log.e(TAG, "No sensor found");

      for (Sensor androidSensor : androidSensorList) {
	      if ((androidSensor.getType() == sensorType)||(sensorType == Sensor.TYPE_ALL)) {
	        // Callback for each sensor of requested type found in Android device
	        SensorImpl foundWebinosSensor = new SensorImpl();
	        foundWebinosSensor.state = org.webinos.api.sensor.SensorManager.SERVICE_INITATING;        
	        
	        /* Match Android sensor type to Webinos sensor type */			
    			if (androidSensor.getType() == Sensor.TYPE_ACCELEROMETER)
    			  foundWebinosSensor.api = "http://webinos.org/api/sensors.accelerometer";
    			else if (androidSensor.getType() == Sensor.TYPE_GRAVITY)
    			  foundWebinosSensor.api = "http://webinos.org/api/sensors.gravity";
    			else if (androidSensor.getType() == Sensor.TYPE_ORIENTATION)
    			  foundWebinosSensor.api = "http://webinos.org/api/sensors.orientation";			  
    			else if (androidSensor.getType() == Sensor.TYPE_GYROSCOPE)
    			  foundWebinosSensor.api = "http://webinos.org/api/sensors.gyro";			  
    			else if (androidSensor.getType() == Sensor.TYPE_LIGHT)
    			  foundWebinosSensor.api = "http://webinos.org/api/sensors.light";
    			else if (androidSensor.getType() == Sensor.TYPE_LINEAR_ACCELERATION)
    			  foundWebinosSensor.api = "http://webinos.org/api/sensors.linearacceleration";
    			else if (androidSensor.getType() == Sensor.TYPE_MAGNETIC_FIELD)
    			  foundWebinosSensor.api = "http://webinos.org/api/sensors.magneticfield";
    			else if (androidSensor.getType() == Sensor.TYPE_PRESSURE)
    			  foundWebinosSensor.api = "http://webinos.org/api/sensors.pressure";
    			else if (androidSensor.getType() == Sensor.TYPE_PROXIMITY)
    			  foundWebinosSensor.api = "http://webinos.org/api/sensors.proximity";		
    			else if (androidSensor.getType() == Sensor.TYPE_ROTATION_VECTOR)
    			  foundWebinosSensor.api = "http://webinos.org/api/sensors.rotationvector";		
    			else if (androidSensor.getType() == Sensor.TYPE_TEMPERATURE)
    			  foundWebinosSensor.api = "http://webinos.org/api/sensors.temperature"; 
    			else
    			  foundWebinosSensor.api = "Unkown sensor type"; 
                
	        foundWebinosSensor.id = androidSensor.getName(); // Temporary id as the id of a Service must be unique within a users perzonal zone. So it must be set by the Service Discovery JS implementation
		      foundWebinosSensor.displayName = androidSensor.getName();
		      foundWebinosSensor.description = androidSensor.getName();
		      foundWebinosSensor.icon = " ";
		      foundWebinosSensor.maximumRange =(double) androidSensor.getMaximumRange();
		      foundWebinosSensor.minDelay = androidSensor.getMinDelay();
		      foundWebinosSensor.power = (double) androidSensor.getPower();
		      foundWebinosSensor.resolution = (double) androidSensor.getResolution();
		      foundWebinosSensor.vendor = androidSensor.getVendor();
		      foundWebinosSensor.version = androidSensor.getVersion();		
		      
		      successCB.onSuccess (foundWebinosSensor);      		      
	      }	
	    }	
	  }	  
	  
	  else  {
		   
		  // Error callback
		  SensorError sensorFindError = new SensorError();
		  sensorFindError.code = SensorError.ILLEGAL_SENSOR_TYPE_ERROR; 
		  errorCB.onError (sensorFindError);    	   		   
		}
	  
		return null;
	}

	

	/*****************************
	 * IModule methods
	 *****************************/
	@Override
	public Object startModule(IModuleContext ctx) {
		Log.e(TAG, "Sensor find module started");
		androidContext = ((AndroidContext)ctx).getAndroidContext();
		androidSensorManager = (android.hardware.SensorManager)androidContext.getSystemService(Context.SENSOR_SERVICE);
		
		return this;
	}

	@Override
	public void stopModule() {
		Log.e(TAG, "Sensor find module stopped");
		
	}
	 	
}
