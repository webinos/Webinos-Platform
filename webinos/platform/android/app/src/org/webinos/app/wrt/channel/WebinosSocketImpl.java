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


public class WebinosSocketImpl extends WebinosSocket implements WebinosSocketService.ClientListener {
	
	private final WebinosSocketService service;
	private final WebinosSocketService.ClientConnection client;

	WebinosSocketImpl(WebinosSocketServerImpl server, WebinosSocketService.ClientConnection client) {
		super(server.getEnv());
		this.service = server.service;
		this.client = client;
		this.installId = client.installId;
		this.instanceId = client.instanceId;
		client.listener = this;
	}

	@Override
	public void send(String message) {
		service.sendMessage(client, message);
	}

	@Override
	public void onMessage(String message) {
		if(listener != null) {
			Event ev = new Event();
			ev.data = message;
			listener.onMessage(ev);
		}
	}

	@Override
	public void onClose(String reason) {
		if(listener != null) {
			listener.onClose(reason);
		}
	}

	@Override
	public void onError(String reason) {
		if(listener != null) {
			listener.onError(reason);
		}
	}

}
