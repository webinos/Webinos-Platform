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
 * Copyright 2011 Telecom Italia SpA
 * 
 ******************************************************************************/

package org.webinos.impl;

//import java.util.ArrayList;
//import java.util.Date;
//import java.util.List;

import org.meshpoint.anode.bridge.Env;
//import org.w3c.dom.ObjectArray;
import org.webinos.api.DeviceAPIError;
import org.webinos.api.ErrorCallback;
import org.webinos.api.PendingOperation;
import org.webinos.api.messaging.Message;
import org.webinos.api.messaging.UpdateMessageSuccessCallback;
import org.webinos.impl.MessagingPendingOperation;
import org.webinos.impl.MessagingRunnable;

import android.content.ContentValues;
import android.content.Context;
import android.net.Uri;
import android.util.Log;

public class MessageImpl extends Message {

	private static final String LABEL = "org.webinos.impl.MessageImpl";
	private Context androidContext;

	@Override
    public PendingOperation update(UpdateMessageSuccessCallback successCallback, ErrorCallback errorCallback) throws DeviceAPIError {
		Log.v(LABEL, "update");
		MessageUpdater messageUpdater = new MessageUpdater(successCallback, errorCallback);
		Thread t = new Thread(messageUpdater);
		t.start();

		//MessagingPendingOperation pOp = new MessagingPendingOperation(t, messageUpdater);
		//pOp.setData(t, messageUpdater);
		//return pOp;
		return new MessagingPendingOperation(t, messageUpdater);
	}
	
	public void setContext(Context androidContext) {
		Log.v(LABEL, "setContext");
		this.androidContext = androidContext;
	}
	
	class MessageUpdater implements MessagingRunnable {

		private Env env = Env.getCurrent();
		private boolean stopped;
		private UpdateMessageSuccessCallback successCallback;
		private ErrorCallback errorCallback;
		
		private MessageUpdater(UpdateMessageSuccessCallback successCallback, ErrorCallback errorCallback) {
			this.errorCallback = errorCallback;
			this.successCallback = successCallback;
			stopped = false;
		}
		
		public synchronized boolean isStopped() {
			return stopped;
		}

		public synchronized void stop() {
			stopped = true;
		}
		
		public void run() {
			Env.setEnv(env);
			Log.v(LABEL, "MessageUpdater run");
			try {
				if(id!=null) {
					if(type==MessagingImpl.TYPE_SMS){
						ContentValues msgData;
						int read = isRead?1:0;
						boolean updated=false;
						switch(folder) {
						case MessagingImpl.FOLDER_INBOX:
							msgData = new ContentValues();
							msgData.put("read", read);
							androidContext.getContentResolver().update(Uri.parse("content://sms/inbox"), msgData, "_id="+id, null);
							updated=true;
							break;
						case MessagingImpl.FOLDER_OUTBOX:
							msgData = new ContentValues();
							msgData.put("read", read);
							androidContext.getContentResolver().update(Uri.parse("content://sms/outbox"), msgData, "_id="+id, null);
							updated=true;
							break;
						case MessagingImpl.FOLDER_SENTBOX:
							msgData = new ContentValues();
							msgData.put("read", read);
							androidContext.getContentResolver().update(Uri.parse("content://sms/sent"), msgData, "_id="+id, null);
							updated=true;
							break;
						case MessagingImpl.FOLDER_DRAFTS:
							msgData = new ContentValues();
							msgData.put("read", read);
							msgData.put("body", body);
							//TODO: It can have a single address????
							msgData.put("address", to.getElement(0));
							androidContext.getContentResolver().update(Uri.parse("content://sms/draft"), msgData, "_id="+id, null);
							updated=true;
							break;
						}
						if(updated) {
							MessageImpl msg = new MessageImpl();
							msg.androidContext = androidContext;
							msg.type = type;
							msg.body = body;
							msg.isRead = isRead;
							msg.timestamp = timestamp;
							msg.folder = folder;
							msg.from = from;
							msg.to = to;
							msg.id = id;
							successCallback.onsuccess(msg);
							return;
						}
					}
				}
				if(errorCallback!=null){
					errorCallback.onerror(new DeviceAPIError(DeviceAPIError.UNKNOWN_ERR));
				}
			}
			catch(Exception e) {
				Log.v(LABEL, "MessageUpdater run exception "+e.getMessage());
				if(errorCallback!=null){
					errorCallback.onerror(new DeviceAPIError(DeviceAPIError.UNKNOWN_ERR));
				}
			}
		}
	}
}
