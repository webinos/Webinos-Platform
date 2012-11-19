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
* Copyright 2012 Samsung Electronics(UK) Ltd
*
******************************************************************************/

package org.webinos.api.discovery;

import org.meshpoint.anode.bridge.Env;
import org.meshpoint.anode.java.Base;
import org.webinos.api.PendingOperation;
import org.webinos.api.messaging.Message;

public abstract class Service extends Base {

	private static short classId = Env.getInterfaceId(Service.class);
	protected Service() { super(classId); }
	
	public static final int SERVICE_INITATING = 0;             
	public static final int SERVICE_AVAILABLE = 1;
	public static final int SERVICE_UNAVAILABLE = 2;
    
    public int  state;
    public String api;
    public String id;
    public String displayName;
    public String description;
    public String icon;
    
    //added to collect HRM data
    public long[] values;
    
    //added to collect discovery device details
    public String[] deviceNames;
    public String[] deviceAddresses;
    
    public abstract PendingOperation bind(BindCallback bindCallBack, String serviceId) 
    		throws DiscoveryError;
    public abstract void unbind() throws DiscoveryError;
    
    public void finalize() {
    	System.out.println("finalize");
    }
}
