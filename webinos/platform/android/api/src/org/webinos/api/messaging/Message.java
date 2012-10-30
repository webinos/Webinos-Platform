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

package org.webinos.api.messaging;

import java.util.Date;

import org.meshpoint.anode.bridge.Env;
import org.meshpoint.anode.java.Base;
import org.w3c.dom.ObjectArray;
import org.webinos.api.DeviceAPIError;
import org.webinos.api.ErrorCallback;
import org.webinos.api.File;
import org.webinos.api.PendingOperation;

public abstract class Message extends Base {
	private static short classId = Env.getInterfaceId(Message.class);
	protected Message() { super(classId); }

	public String id;
	public int type; 
	public int folder;
	public Date timestamp;
	public String from;
	public ObjectArray<String> to;
	public ObjectArray<String> cc;
	public ObjectArray<String> bcc;
	public String body;
	public boolean isRead;
	public boolean priority;
	public String subject;
	public ObjectArray<File> attachments;
	
    public abstract PendingOperation update(UpdateMessageSuccessCallback successCallback, ErrorCallback errorCallback) throws DeviceAPIError;
}
