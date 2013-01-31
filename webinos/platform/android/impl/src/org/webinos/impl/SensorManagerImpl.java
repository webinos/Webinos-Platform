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
 * Copyright 2013 Sony Mobile Communications
 * 
 ******************************************************************************/

package org.webinos.impl;

import java.util.ArrayList;
import java.util.List;

import org.meshpoint.anode.AndroidContext;
import org.meshpoint.anode.module.IModule;
import org.meshpoint.anode.module.IModuleContext;
import org.webinos.api.sensor.Sensor;
import org.webinos.api.sensor.SensorManager;

import android.content.Context;
import android.util.Log;


public class SensorManagerImpl extends SensorManager implements IModule {

  private static final String TAG = SensorManagerImpl.class.getName();
  
  private Context androidContext;
  private android.hardware.SensorManager androidSensorManager;
  
  private List<Sensor> sensors = new ArrayList<Sensor>();
  
  @Override
  public Object startModule(IModuleContext ctx) {
    Log.i(TAG, "Sensor module started");
    androidContext = ((AndroidContext)ctx).getAndroidContext();
    androidSensorManager = (android.hardware.SensorManager)androidContext.getSystemService(Context.SENSOR_SERVICE);
    
    List<android.hardware.Sensor> androidSensorList = androidSensorManager.getSensorList(android.hardware.Sensor.TYPE_ALL);
    for (android.hardware.Sensor sensor : androidSensorList) {
      if (SensorImpl.sensorTypes.containsKey(sensor.getType())) {
        sensors.add(new SensorImpl(this, sensor));
      }
    }
    
    return this;
  }

  @Override
  public void stopModule() {
    Log.i(TAG, "Sensor module stopped");
    for (Sensor sensor : sensors) {
      sensor.stop();
    }
  }
  
  @Override
  public Sensor[] findSensors() {
    return sensors.toArray(new Sensor[sensors.size()]);
  }
  
  android.hardware.SensorManager getAndroidSensorManager() {
    return androidSensorManager;
  }

  @Override
  public void log(String message) {
    Log.i(TAG, message);
  }
}
