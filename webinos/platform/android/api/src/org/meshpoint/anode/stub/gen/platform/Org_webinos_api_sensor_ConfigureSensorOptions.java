/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_api_sensor_ConfigureSensorOptions {

	private static Object[] __args = new Object[0];

	public static Object[] __getArgs() { return __args; }

	static Object __get(org.webinos.api.sensor.ConfigureSensorOptions inst, int attrIdx) {
		Object result = null;
		switch(attrIdx) {
		case 0: /* INFINITE */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.sensor.ConfigureSensorOptions.INFINITE);
			break;
		case 1: /* SENSOR_DELAY_FASTEST */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.sensor.ConfigureSensorOptions.SENSOR_DELAY_FASTEST);
			break;
		case 2: /* SENSOR_DELAY_GAME */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.sensor.ConfigureSensorOptions.SENSOR_DELAY_GAME);
			break;
		case 3: /* SENSOR_DELAY_NORMAL */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.sensor.ConfigureSensorOptions.SENSOR_DELAY_NORMAL);
			break;
		case 4: /* SENSOR_DELAY_UI */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.sensor.ConfigureSensorOptions.SENSOR_DELAY_UI);
			break;
		case 5: /* SENSOR_DELAY_UNDEFINED */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)org.webinos.api.sensor.ConfigureSensorOptions.SENSOR_DELAY_UNDEFINED);
			break;
		case 6: /* interrupt */
			result = org.meshpoint.anode.js.JSValue.asJSBoolean(inst.interrupt);
			break;
		case 7: /* rate */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)inst.rate);
			break;
		case 8: /* timeout */
			result = org.meshpoint.anode.js.JSValue.asJSNumber((long)inst.timeout);
			break;
		default:
		}
		return result;
	}

	static void __set(org.webinos.api.sensor.ConfigureSensorOptions inst, int attrIdx, Object val) {
		switch(attrIdx) {
		case 6: /* interrupt */
			inst.interrupt = ((org.meshpoint.anode.js.JSValue)val).getBooleanValue();
			break;
		case 7: /* rate */
			inst.rate = (int)((org.meshpoint.anode.js.JSValue)val).longValue;
			break;
		case 8: /* timeout */
			inst.timeout = (int)((org.meshpoint.anode.js.JSValue)val).longValue;
			break;
		default:
			throw new UnsupportedOperationException();
		}
	}

}
