/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_api_sensor_Sensor {

	private static Object[] __args = new Object[1];

	public static Object[] __getArgs() { return __args; }

	static Object __invoke(org.webinos.api.sensor.Sensor inst, int opIdx, Object[] args) {
		Object result = null;
		switch(opIdx) {
		case 0: /* configure */
			inst.configure(
				(org.webinos.api.sensor.ConfigureSensorOptions)args[0]
			);
			break;
		case 1: /* start */
			inst.start(
				(org.webinos.api.sensor.SensorCB)args[0]
			);
			break;
		case 2: /* stop */
			inst.stop();
			break;
		default:
		}
		return result;
	}

	static Object __get(org.webinos.api.sensor.Sensor inst, int attrIdx) {
		Object result = null;
		switch(attrIdx) {
		case 0: /* EVENT_FIRE_MODE_FIXED */
			result = org.webinos.api.sensor.Sensor.EVENT_FIRE_MODE_FIXED;
			break;
		case 1: /* EVENT_FIRE_MODE_VALUECHANGE */
			result = org.webinos.api.sensor.Sensor.EVENT_FIRE_MODE_VALUECHANGE;
			break;
		case 2: /* WEBINOS_SENSOR_TYPE_HRM */
			result = org.webinos.api.sensor.Sensor.WEBINOS_SENSOR_TYPE_HRM;
			break;
		case 3: /* WEBINOS_SENSOR_TYPE_HUMIDITY */
			result = org.webinos.api.sensor.Sensor.WEBINOS_SENSOR_TYPE_HUMIDITY;
			break;
		case 4: /* WEBINOS_SENSOR_TYPE_LIGHT */
			result = org.webinos.api.sensor.Sensor.WEBINOS_SENSOR_TYPE_LIGHT;
			break;
		case 5: /* WEBINOS_SENSOR_TYPE_NOISE */
			result = org.webinos.api.sensor.Sensor.WEBINOS_SENSOR_TYPE_NOISE;
			break;
		case 6: /* WEBINOS_SENSOR_TYPE_PRESSURE */
			result = org.webinos.api.sensor.Sensor.WEBINOS_SENSOR_TYPE_PRESSURE;
			break;
		case 7: /* WEBINOS_SENSOR_TYPE_PROXIMITY */
			result = org.webinos.api.sensor.Sensor.WEBINOS_SENSOR_TYPE_PROXIMITY;
			break;
		case 8: /* WEBINOS_SENSOR_TYPE_TEMPERATURE */
			result = org.webinos.api.sensor.Sensor.WEBINOS_SENSOR_TYPE_TEMPERATURE;
			break;
		case 9: /* description */
			result = inst.description;
			break;
		case 10: /* displayName */
			result = inst.displayName;
			break;
		case 11: /* eventFireMode */
			result = inst.eventFireMode;
			break;
		case 12: /* maximumRange */
			result = inst.maximumRange;
			break;
		case 13: /* minDelay */
			result = inst.minDelay;
			break;
		case 14: /* position */
			result = inst.position;
			break;
		case 15: /* power */
			result = inst.power;
			break;
		case 16: /* rate */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)inst.rate);
			break;
		case 17: /* resolution */
			result = inst.resolution;
			break;
		case 18: /* type */
			result = inst.type;
			break;
		case 19: /* vendor */
			result = inst.vendor;
			break;
		case 20: /* version */
			result = inst.version;
			break;
		default:
		}
		return result;
	}

	static void __set(org.webinos.api.sensor.Sensor inst, int attrIdx, Object val) {
		switch(attrIdx) {
		case 0: /* EVENT_FIRE_MODE_FIXED */
			org.webinos.api.sensor.Sensor.EVENT_FIRE_MODE_FIXED = (String)val;
			break;
		case 1: /* EVENT_FIRE_MODE_VALUECHANGE */
			org.webinos.api.sensor.Sensor.EVENT_FIRE_MODE_VALUECHANGE = (String)val;
			break;
		case 2: /* WEBINOS_SENSOR_TYPE_HRM */
			org.webinos.api.sensor.Sensor.WEBINOS_SENSOR_TYPE_HRM = (String)val;
			break;
		case 3: /* WEBINOS_SENSOR_TYPE_HUMIDITY */
			org.webinos.api.sensor.Sensor.WEBINOS_SENSOR_TYPE_HUMIDITY = (String)val;
			break;
		case 4: /* WEBINOS_SENSOR_TYPE_LIGHT */
			org.webinos.api.sensor.Sensor.WEBINOS_SENSOR_TYPE_LIGHT = (String)val;
			break;
		case 5: /* WEBINOS_SENSOR_TYPE_NOISE */
			org.webinos.api.sensor.Sensor.WEBINOS_SENSOR_TYPE_NOISE = (String)val;
			break;
		case 6: /* WEBINOS_SENSOR_TYPE_PRESSURE */
			org.webinos.api.sensor.Sensor.WEBINOS_SENSOR_TYPE_PRESSURE = (String)val;
			break;
		case 7: /* WEBINOS_SENSOR_TYPE_PROXIMITY */
			org.webinos.api.sensor.Sensor.WEBINOS_SENSOR_TYPE_PROXIMITY = (String)val;
			break;
		case 8: /* WEBINOS_SENSOR_TYPE_TEMPERATURE */
			org.webinos.api.sensor.Sensor.WEBINOS_SENSOR_TYPE_TEMPERATURE = (String)val;
			break;
		case 9: /* description */
			inst.description = (String)val;
			break;
		case 10: /* displayName */
			inst.displayName = (String)val;
			break;
		case 11: /* eventFireMode */
			inst.eventFireMode = (String)val;
			break;
		case 12: /* maximumRange */
			inst.maximumRange = (Double)val;
			break;
		case 13: /* minDelay */
			inst.minDelay = (Integer)val;
			break;
		case 14: /* position */
			inst.position = (org.webinos.api.sensor.GeoPosition)val;
			break;
		case 15: /* power */
			inst.power = (Double)val;
			break;
		case 16: /* rate */
			inst.rate = (int)((org.meshpoint.anode.js.JSValue)val).longValue;
			break;
		case 17: /* resolution */
			inst.resolution = (Double)val;
			break;
		case 18: /* type */
			inst.type = (String)val;
			break;
		case 19: /* vendor */
			inst.vendor = (String)val;
			break;
		case 20: /* version */
			inst.version = (Integer)val;
			break;
		default:
			throw new UnsupportedOperationException();
		}
	}

}
