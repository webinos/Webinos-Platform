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

package org.webinos.api.prompt;

import org.meshpoint.anode.bridge.Env;
import org.meshpoint.anode.java.Base;
import org.webinos.api.DeviceAPIError;

public abstract class PromptManager extends Base {
	private static short classId = Env.getInterfaceId(PromptManager.class);
	protected PromptManager() { super(classId); }

	public abstract int display(String message, String[] choice) throws DeviceAPIError;
}
