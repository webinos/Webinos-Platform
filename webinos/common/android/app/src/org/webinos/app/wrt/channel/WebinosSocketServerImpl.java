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

package org.webinos.app.wrt.channel;

import org.meshpoint.anode.AndroidContext;
import org.meshpoint.anode.module.IModule;
import org.meshpoint.anode.module.IModuleContext;
import org.webinos.app.wrt.channel.WebinosSocketService.ClientConnection;

import android.content.Context;
import android.content.Intent;

public class WebinosSocketServerImpl extends WebinosSocketServer 
		implements IModule, WebinosSocketService.LaunchListener, WebinosSocketService.ConnectionListener {

	private Context androidContext;	
	WebinosSocketService service;

	/*****************************
	 * Listener methods
	 *****************************/
	@Override
	public void onLaunch(WebinosSocketService service) {
		this.service = service;
		service.setConnectionListener(this);
	}

	@Override
	public void onConnection(ClientConnection client) {
		if(listener != null) {
			WebinosSocketImpl socket = new WebinosSocketImpl(this, client);
			listener.onConnect(socket);
		}
	}

	/*****************************
	 * IModule methods
	 *****************************/
	@Override
	public Object startModule(IModuleContext ctx) {
		androidContext = ((AndroidContext)ctx).getAndroidContext();
		androidContext.startService(new Intent(androidContext, WebinosSocketService.class));
		service = WebinosSocketService.getInstance(this);
		if(service != null)
			service.setConnectionListener(this);
		return this;
	}

	@Override
	public void stopModule() {
		if(service != null)
			androidContext.stopService(new Intent(androidContext, WebinosSocketService.class));
	}
}