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

package org.webinos.api.devicestatus;

import org.meshpoint.anode.bridge.Env;
import org.meshpoint.anode.java.Base;
import org.webinos.api.DeviceAPIError;
import org.webinos.api.ErrorCallback;
import org.webinos.api.PendingOperation;

public abstract class DevicestatusManager extends Base {
	private static short classId = Env.getInterfaceId(DevicestatusManager.class);
	protected DevicestatusManager() { super(classId); }

	public abstract String[] getComponents(String aspect) throws DeviceAPIError;
	public abstract boolean isSupported(String aspect, String property) throws DeviceAPIError;
	public abstract PendingOperation getPropertyValue(PropertyValueSuccessCallback successCallback, ErrorCallback errorCallback, PropertyRef prop) throws DeviceAPIError;
	public abstract int watchPropertyChange(PropertyValueSuccessCallback successCallback, ErrorCallback errorCallback, PropertyRef prop, WatchOptions options) throws DeviceAPIError;
	public abstract void clearPropertyChange(int watchHandler) throws DeviceAPIError;
}
