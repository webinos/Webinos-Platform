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

import java.util.HashMap;
import java.util.Map;

import org.webinos.api.DeviceAPIError;
import org.webinos.api.sensor.ConfigureSensorOptions;
import org.webinos.api.sensor.Sensor;
import org.webinos.api.sensor.SensorCB;
import org.webinos.api.sensor.SensorError;
import org.webinos.api.sensor.SensorEvent;

import android.hardware.SensorEventListener;

public class SensorImpl extends Sensor {

  private SensorManagerImpl sensorManager;
  private android.hardware.Sensor sensor;

  public SensorImpl(SensorManagerImpl sensorManager,
      android.hardware.Sensor sensor) {
    super();
    this.sensorManager = sensorManager;
    this.sensor = sensor;
    
    type = sensorTypes.get(sensor.getType());
    displayName = sensor.getName();
    description = sensor.getName();
    
    maximumRange = (double)sensor.getMaximumRange();
    minDelay = sensor.getMinDelay();
    power = (double)sensor.getPower();
    resolution = (double)sensor.getResolution();
    vendor = sensor.getVendor();
    version = sensor.getVersion();
    
    rate = android.hardware.SensorManager.SENSOR_DELAY_NORMAL;
    eventFireMode = Sensor.EVENT_FIRE_MODE_FIXED;
    position = null;
  }

  static Map<Integer, String> sensorTypes = new HashMap<Integer, String>();

  static {
    sensorTypes.put(android.hardware.Sensor.TYPE_LIGHT,
        WEBINOS_SENSOR_TYPE_LIGHT);
    sensorTypes.put(android.hardware.Sensor.TYPE_TEMPERATURE,
        WEBINOS_SENSOR_TYPE_TEMPERATURE);
    sensorTypes.put(android.hardware.Sensor.TYPE_PRESSURE,
        WEBINOS_SENSOR_TYPE_PRESSURE);
    sensorTypes.put(android.hardware.Sensor.TYPE_PROXIMITY,
        WEBINOS_SENSOR_TYPE_PROXIMITY);
  }

  private static final String TAG = SensorImpl.class.getName();

  private SensorEventListener sensorListener;

  @Override
  public void configure(ConfigureSensorOptions cfgOptions) {
    eventFireMode = cfgOptions.eventFireMode;
    if (eventFireMode.equals(EVENT_FIRE_MODE_FIXED)) {
      rate = cfgOptions.rate;
    } else {
      rate = android.hardware.SensorManager.SENSOR_DELAY_NORMAL;
    }
    position = cfgOptions.position;
  }
  
  @Override
  public synchronized void start(final SensorCB cb) {
    if (cb == null) {
      return;
    }
    if (sensorListener == null) {
      sensorListener = new SensorEventListener() {
        @Override
        public void onAccuracyChanged(android.hardware.Sensor sensor,
            int accuracy) {
        }

        @Override
        public void onSensorChanged(android.hardware.SensorEvent event) {
          cb.onSensorEvent(getSensorEvent(event));
        }
      };
      sensorManager.getAndroidSensorManager().registerListener(sensorListener,
          sensor, rate);
    }
  }

  SensorEvent getSensorEvent(android.hardware.SensorEvent androidEvent) {
    SensorEvent event = new SensorEvent();
    event.sensorType = type;
    event.position = position;
    event.eventFireMode = eventFireMode;
    event.rate = rate;
    event.accuracy = androidEvent.accuracy;
    
    if (event.sensorType.equals(WEBINOS_SENSOR_TYPE_LIGHT)) {
      event.values = new double[1];
      event.values[0] = androidEvent.values[0];
    } else if (event.sensorType.equals(WEBINOS_SENSOR_TYPE_TEMPERATURE)) {
      event.values = new double[1];
      event.values[0] = androidEvent.values[0];
    } else if (event.sensorType.equals(WEBINOS_SENSOR_TYPE_PRESSURE)) {
      event.values = new double[1];
      event.values[0] = androidEvent.values[0];
    } else if (event.sensorType.equals(WEBINOS_SENSOR_TYPE_PROXIMITY)) {
      event.values = new double[1];
      event.values[0] = androidEvent.values[0];
    }
    
    return event;
  }

  @Override
  public synchronized void stop() {
    if (sensorListener != null) {
      sensorManager.getAndroidSensorManager()
          .unregisterListener(sensorListener);
    }
  }
}
