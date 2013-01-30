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

package org.webinos.api.sensor;

import org.meshpoint.anode.bridge.Env;
import org.meshpoint.anode.java.Base;

public abstract class Sensor extends Base {
  private static short classId = Env.getInterfaceId(Sensor.class);
  protected Sensor() { super(classId); }
  
  public static String WEBINOS_SENSOR_TYPE_LIGHT = "light";
  public static String WEBINOS_SENSOR_TYPE_NOISE = "noise";
  public static String WEBINOS_SENSOR_TYPE_TEMPERATURE = "temperature";
  public static String WEBINOS_SENSOR_TYPE_PRESSURE = "pressure";
  public static String WEBINOS_SENSOR_TYPE_PROXIMITY = "proximity";
  public static String WEBINOS_SENSOR_TYPE_HUMIDITY = "humidity";
  public static String WEBINOS_SENSOR_TYPE_HRM = "heartratemonitor";
  
  public static String EVENT_FIRE_MODE_FIXED = "fixedinterval";
  public static String EVENT_FIRE_MODE_VALUECHANGE = "valuechange";
  
  public String type;
  public String displayName;
  public String description;

  public Double maximumRange;
  public Integer minDelay;
  public Double power;
  public Double resolution;
  public String vendor;  
  public Integer version;

  public int rate;
  public String eventFireMode;
  public GeoPosition position;
  
  public abstract void configure(ConfigureSensorOptions cfgOptions);
  public abstract void start(SensorCB cb);
  public abstract void stop();
}