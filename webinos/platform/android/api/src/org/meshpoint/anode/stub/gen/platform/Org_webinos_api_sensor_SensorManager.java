/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_api_sensor_SensorManager {

	private static Object[] __args = new Object[4];

	public static Object[] __getArgs() { return __args; }

	static Object __invoke(org.webinos.api.sensor.SensorManager inst, int opIdx, Object[] args) {
		Object result = null;
		switch(opIdx) {
		case 0: /* unwatchSensor */
			inst.unwatchSensor();
			break;
		case 1: /* watchSensor */
			inst.watchSensor(
				(String)args[0],
				(int)((org.meshpoint.anode.js.JSValue)args[1]).longValue,
				(org.webinos.api.sensor.SensorCB)args[2],
				(org.webinos.api.sensor.SensorErrorCB)args[3]
			);
			break;
		default:
		}
		return result;
	}

	static Object __get(org.webinos.api.sensor.SensorManager inst, int attrIdx) {
		Object result = null;
		switch(attrIdx) {
		case 0: /* SERVICE_AVAILABLE */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.sensor.SensorManager.SERVICE_AVAILABLE);
			break;
		case 1: /* SERVICE_INITATING */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.sensor.SensorManager.SERVICE_INITATING);
			break;
		case 2: /* SERVICE_UNAVAILABLE */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.sensor.SensorManager.SERVICE_UNAVAILABLE);
			break;
		case 3: /* api */
			result = inst.api;
			break;
		case 4: /* description */
			result = inst.description;
			break;
		case 5: /* displayName */
			result = inst.displayName;
			break;
		case 6: /* icon */
			result = inst.icon;
			break;
		case 7: /* id */
			result = inst.id;
			break;
		case 8: /* maximumRange */
			result = inst.maximumRange;
			break;
		case 9: /* minDelay */
			result = inst.minDelay;
			break;
		case 10: /* power */
			result = inst.power;
			break;
		case 11: /* resolution */
			result = inst.resolution;
			break;
		case 12: /* state */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)inst.state);
			break;
		case 13: /* vendor */
			result = inst.vendor;
			break;
		case 14: /* version */
			result = inst.version;
			break;
		default:
		}
		return result;
	}

	static void __set(org.webinos.api.sensor.SensorManager inst, int attrIdx, Object val) {
		switch(attrIdx) {
		case 3: /* api */
			inst.api = (String)val;
			break;
		case 4: /* description */
			inst.description = (String)val;
			break;
		case 5: /* displayName */
			inst.displayName = (String)val;
			break;
		case 6: /* icon */
			inst.icon = (String)val;
			break;
		case 7: /* id */
			inst.id = (String)val;
			break;
		case 8: /* maximumRange */
			inst.maximumRange = (Double)val;
			break;
		case 9: /* minDelay */
			inst.minDelay = (Integer)val;
			break;
		case 10: /* power */
			inst.power = (Double)val;
			break;
		case 11: /* resolution */
			inst.resolution = (Double)val;
			break;
		case 12: /* state */
			inst.state = (int)((org.meshpoint.anode.js.JSValue)val).longValue;
			break;
		case 13: /* vendor */
			inst.vendor = (String)val;
			break;
		case 14: /* version */
			inst.version = (Integer)val;
			break;
		default:
			throw new UnsupportedOperationException();
		}
	}

}
