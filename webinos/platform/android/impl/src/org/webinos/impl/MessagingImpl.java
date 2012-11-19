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

import android.telephony.SmsManager;
import android.telephony.SmsMessage;
import android.util.Log;
import android.app.Activity;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.ContentValues;
import android.content.BroadcastReceiver;
import android.os.Bundle;
import android.database.Cursor;
import android.net.Uri;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.List;

import org.meshpoint.anode.AndroidContext;
import org.meshpoint.anode.bridge.Env;
import org.meshpoint.anode.module.IModule;
import org.meshpoint.anode.module.IModuleContext;
import org.w3c.dom.ObjectArray;
import org.webinos.api.DeviceAPIError;
import org.webinos.api.ErrorCallback;
import org.webinos.api.PendingOperation;
import org.webinos.api.messaging.FindMessagesSuccessCallback;
import org.webinos.api.messaging.Message;
import org.webinos.api.messaging.MessageFilter;
import org.webinos.api.messaging.MessageSendCallback;
import org.webinos.api.messaging.MessagingManager;
import org.webinos.api.messaging.OnIncomingMessage;

import android.content.Context;

public class MessagingImpl extends MessagingManager implements IModule {

	private Context androidContext;
	private	SmsManager	smsManager;
	private Map<Integer, SmsReceiver> smsReceiverList;
	private int counter;

	private static final String LABEL = "org.webinos.impl.MessagingImpl";
	
	/*****************************
	 * MessagingManager methods
	 *****************************/
	@Override
	public Message createMessage(Integer type) throws DeviceAPIError {
		Log.v(LABEL, "createMessage");
		if (type == null) {
			throw new DeviceAPIError(DeviceAPIError.TYPE_MISMATCH_ERR);
		}
		if (type == TYPE_SMS) {
			MessageImpl msg = new MessageImpl();
			msg.setContext(androidContext);
			msg.type = type;
			msg.folder = FOLDER_DRAFTS;
			return msg;
		}
		else if (type==TYPE_MMS || type==TYPE_EMAIL || type==TYPE_IM) {
			 //TODO Add support for mms, email and im
			return null;
		}
		else {
			throw new DeviceAPIError(DeviceAPIError.INVALID_VALUES_ERR);
		}
	}

	@Override
	public PendingOperation sendMessage(MessageSendCallback successCallback,
			ErrorCallback errorCallback, Message message) throws DeviceAPIError {
		Log.v(LABEL, "sendMessage");
		if(successCallback == null || message == null) {
			Log.v(LABEL, "sendMessage error (successCallback or message null)");
			if(errorCallback!=null) {
				errorCallback.onerror(new DeviceAPIError(DeviceAPIError.INVALID_VALUES_ERR));
			}
			return null;
		}
		Log.v(LABEL, "sendMessage - 02 ("+message.to.getLength()+")");
		if(message.type == TYPE_SMS) {
			if(message.to.getLength()>0){
				MessagingRunnable smsSender = new SmsSender(successCallback, errorCallback, message);
				Thread t = new Thread(smsSender);
				t.start();
				Log.v(LABEL, "sendMessage - thread started with id "+(int)t.getId());
				//MessagingPendingOperation pOp = new MessagingPendingOperation(t, smsSender);
				//pOp.setData(t, smsSender);
				//return pOp;
				return new MessagingPendingOperation(t, smsSender);
			}
			else {
				//TODO what if the message has 0 recipients?
				Log.v(LABEL, "sendMessage - message has 0 recipients");
			}
		}
		else {
			Log.v(LABEL, "sendMessage - 08");
			//TODO Add support for mms, email and im
			throw new DeviceAPIError(DeviceAPIError.NOT_SUPPORTED_ERR);
		}
		//TODO The method should always return a PendingOperation?
		return null;
	}

	@Override
	public PendingOperation findMessages(
			FindMessagesSuccessCallback successCallback,
			ErrorCallback errorCallback, MessageFilter filter)
			throws DeviceAPIError {
		Log.v(LABEL, "findMessages");

		MessagingRunnable smsFinder = new SmsFinder(successCallback, errorCallback, filter);
		Thread t = new Thread(smsFinder);
		t.start();

		//MessagingPendingOperation pOp = new MessagingPendingOperation(t, smsFinder);
		//pOp.setData(t, smsFinder);
		//return pOp;
		return new MessagingPendingOperation(t, smsFinder);
	}

	@Override
	public int onSMS(OnIncomingMessage messageHandler) throws DeviceAPIError {
		counter++;
		Log.v(LABEL, "onSMS - "+counter);
		SmsReceiver smsReceiver = new SmsReceiver(messageHandler);
		androidContext.registerReceiver(smsReceiver, new IntentFilter("android.provider.Telephony.SMS_RECEIVED"));
		smsReceiverList.put(counter, smsReceiver);
		return counter;
	}

	@Override
	public int onMMS(OnIncomingMessage messageHandler) throws DeviceAPIError {
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public int onEmail(OnIncomingMessage messageHandler) throws DeviceAPIError {
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public int onIM(OnIncomingMessage messageHandler) throws DeviceAPIError {
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public void unsubscribe(int subscriptionHandler) throws DeviceAPIError {
		Log.v(LABEL, "unsubscribe - "+subscriptionHandler);
		SmsReceiver smsReceiver = smsReceiverList.get(subscriptionHandler);
		if(smsReceiver != null) {
			androidContext.unregisterReceiver(smsReceiver);
			smsReceiverList.remove(subscriptionHandler);
		}
	}

	/*****************************
	 * IModule methods
	 *****************************/
	@Override
	public Object startModule(IModuleContext ctx) {
		Log.v(LABEL, "startModule");
		androidContext = ((AndroidContext)ctx).getAndroidContext();
		smsManager = SmsManager.getDefault();
		smsReceiverList = new HashMap<Integer, SmsReceiver>();
		counter = 0;
		return this;
	}

	@Override
	public void stopModule() {
		//TODO stop all findMessages and sendMessages
		Log.v(LABEL, "stopModule");
		if(!smsReceiverList.isEmpty()) {
			Set<Integer> listenersId = smsReceiverList.keySet();
			for(Integer i: listenersId) {
				androidContext.unregisterReceiver(smsReceiverList.get(i));
			}
		}
	}

	class SmsSender implements MessagingRunnable {
		
		private MessageSendCallback successCallback;
		private ErrorCallback errorCallback;
		private Message message;
		private int smsCounter;
		private SmsResponseReceiver smsResponseReceiver;
		private String SMS_SENT;
		private ArrayList<String> bodyParts;
		private boolean stopped;

		private SmsSender(MessageSendCallback succCallback, ErrorCallback errCallback, Message msg) {
			successCallback = succCallback;
			errorCallback = errCallback;
			message = msg;
			smsCounter = 0;
			stopped = false;
			smsResponseReceiver = new SmsResponseReceiver(successCallback, errorCallback, message.to.getLength(), this);
			Log.v(LABEL, "SmsSender constructed");
		}

		public synchronized boolean isStopped() {
			return stopped;
		}

		public synchronized void stop() {
			stopped = true;
		}
		
		public void run() {
			
			SMS_SENT = "org.webinos.messaging.SMS_SENT_"+(int)Thread.currentThread().getId();
			androidContext.registerReceiver(smsResponseReceiver, new IntentFilter(SMS_SENT));
			bodyParts = smsManager.divideMessage(message.body);
			Log.v(LABEL, "SmsSender run - number of parts is "+bodyParts.size()+" - SMS_SENT is "+SMS_SENT);
			sendNextMessage();
			
			/*
			ArrayList<String> bodyParts = smsManager.divideMessage(message.body);
			Log.v(LABEL, "SmsSender run - number of parts is "+bodyParts.size());
			for(int i=0; i<message.to.getLength(); i++) {
				Log.v(LABEL, "SmsSender run - 04 ("+i+")");
				try {
					Intent intent=new Intent(SMS_SENT);
					intent.putExtra("rec", message.to.getElement(i));
					PendingIntent pnd = PendingIntent.getBroadcast(androidContext, 0, intent, 0);
					if(bodyParts.size() == 1) {
						smsManager.sendTextMessage(message.to.getElement(i), null, message.body, pnd, null);
					}
					else {
						ArrayList<PendingIntent> pndList = new ArrayList<PendingIntent>();
						for(int j=0;j<bodyParts.size()-1;j++){
							pndList.add(null);
						}
						pndList.add(pnd);
						smsManager.sendMultipartTextMessage(message.to.getElement(i), null, bodyParts, pndList, null);
					}
				}
//				catch(IllegalArgumentException e) {
				catch(Exception e) {
					Log.v(LABEL, "SmsSender run - error "+e);
					smsResponseReceiver.errorCaught(message.to.getElement(i));
				}
			}
			*/
		}
		
		public void sendFinished() {
			Log.v(LABEL, "SmsSender - sendFinished");
			androidContext.unregisterReceiver(smsResponseReceiver);
		}
		
		public void sendNextMessage() {
			Log.v(LABEL, "SmsSender - sendNextMessage");
			if(isStopped()) {
				Log.v(LABEL, "SmsSender - sendNextMessage - stopped");
				sendFinished();
				return;
			}
			if(smsCounter<message.to.getLength()) {
				try {
					//TODO Investigate why in case of multiple recipients the Extra of the intent is not correct...
					Intent intent=new Intent(SMS_SENT);
					intent.putExtra("rec", message.to.getElement(smsCounter));
					intent.putExtra("body", message.body);
					Log.v(LABEL, "intent created with rec = "+intent.getExtras().getString("rec"));
					PendingIntent pnd = PendingIntent.getBroadcast(androidContext, 0, intent, 0);
					if(bodyParts.size() == 1) {
						smsManager.sendTextMessage(message.to.getElement(smsCounter), null, message.body, pnd, null);
					}
					else {
						ArrayList<PendingIntent> pndList = new ArrayList<PendingIntent>();
						for(int j=0;j<bodyParts.size()-1;j++){
							pndList.add(null);
						}
						pndList.add(pnd);
						smsManager.sendMultipartTextMessage(message.to.getElement(smsCounter), null, bodyParts, pndList, null);
					}
				}
//				catch(IllegalArgumentException e) {
				catch(Exception e) {
					Log.v(LABEL, "SmsSender run - error "+e);
					smsResponseReceiver.errorCaught(message.to.getElement(smsCounter));
				}

				smsCounter++;
			}
		}
	}
	
	
	//SMS Response receiver
	class SmsResponseReceiver extends BroadcastReceiver {
		
		private MessageSendCallback successCallback;
		private ErrorCallback errorCallback;
		private int smsNumber;
		private int smsCounter;
		private int errorCounter;
		private SmsSender smsSender;
		
		@Override
		public void onReceive(Context ctx, Intent intent) {
			if(smsSender.isStopped()) {
				Log.v(LABEL, "SmsResponseReceiver onReceive - stopped");
				smsSender.sendNextMessage();
				return;
			}
			try {
				String rec=null;
				String body=null;
				Bundle extras = intent.getExtras();
				if(extras!=null){
					rec=extras.getString("rec");
					body=extras.getString("body");
				}
				switch(getResultCode()) {
				case Activity.RESULT_OK:
					Log.v(LABEL, "SmsResponseReceiver - Received intent OK ("+getResultCode()+") for rec "+rec);
					//Insert the message in the db
					ContentValues msgData = new ContentValues();
					msgData.put("address", rec);
					msgData.put("body", body);
					msgData.put("read", 1);
					Log.v(LABEL, "SmsResponseReceiver - 05");
					androidContext.getContentResolver().insert(Uri.parse("content://sms/sent"), msgData);
					Log.v(LABEL, "SmsResponseReceiver - 06");
					sendFinished(0, rec);
					break;
				default:
					Log.v(LABEL, "SmsResponseReceiver - Received intent error ("+getResultCode()+") for rec "+rec);
					sendFinished(1, rec);
					break;
				}
			}
			catch(Exception e){
				Log.v(LABEL, "SmsResponseReceiver - onReceive exception "+e.getMessage());
			}
		}
		
		private SmsResponseReceiver(MessageSendCallback successCbk, ErrorCallback errorCbk, int smsNum, SmsSender sender) {
			Log.v(LABEL, "SmsResponseReceiver constructor - succCbk: "+successCbk+" - errCbk: "+errorCbk+" - thread: "+(int)Thread.currentThread().getId());
			successCallback = successCbk;
			errorCallback = errorCbk;
			smsNumber = smsNum;
			smsCounter = 0;
			errorCounter = 0;
			smsSender = sender;
		}
		
		public void errorCaught(String recipient) {
			sendFinished(1, recipient);
		}
		
		private void sendFinished(int res, String recipient) {
			smsCounter++;
			errorCounter+=res;
			//TODO save the message in sent folder
			Log.v(LABEL, "SmsResponseReceiver sendFinished - sms n "+smsCounter+" - err n "+errorCounter);
			if(smsCounter == smsNumber) {
				smsSender.sendFinished();
				if(errorCounter==0) {
					Log.v(LABEL, "SmsResponseReceiver sendFinished - successCallback");
					successCallback.onsuccess();
				}
				else {
					Log.v(LABEL, "SmsResponseReceiver sendFinished - errorCallback");
					errorCallback.onerror(new DeviceAPIError(DeviceAPIError.UNKNOWN_ERR));
				}
			}
			else {
				if(res==0) {
					Log.v(LABEL, "SmsResponseReceiver sendFinished - msgSendSuccess");
					successCallback.onmessagesendsuccess(recipient);
				}
				else {
					Log.v(LABEL, "SmsResponseReceiver sendFinished - msgSendError");
					successCallback.onmessagesenderror(new DeviceAPIError(DeviceAPIError.UNKNOWN_ERR), recipient);
				}
				smsSender.sendNextMessage();
			}
		}
		
	}
	
	class SmsFinder implements MessagingRunnable {

		private Env env = Env.getCurrent();
		private FindMessagesSuccessCallback successCallback;
		private ErrorCallback errorCallback;
		private MessageFilter filter;
		private boolean stopped;
		
		private SmsFinder(FindMessagesSuccessCallback successCallback, ErrorCallback errorCallback, MessageFilter filter) {
			this.successCallback = successCallback;
			this.errorCallback = errorCallback;
			this.filter = filter;
		}
		
		public synchronized boolean isStopped() {
			return stopped;
		}

		public synchronized void stop() {
			stopped = true;
		}

		private boolean searchSms() {
			Log.v(LABEL, "searchSms - 01");
			try {
				if(filter==null) {
					return true;
				}
				else if(filter.type==null) {
					Log.v(LABEL, "searchSms - 02");
					return true;
				}
				else for(int i=0; i<filter.type.length; i++) {
					Log.v(LABEL, "searchSms - 03");
					if(filter.type[i]==TYPE_SMS)
						return true;
				}
			}
			catch(Exception e) {
				Log.v(LABEL, "searchSms exception: "+e.getMessage());
			}
			Log.v(LABEL, "searchSms - 09");
			return false;
		}

		private boolean searchMms() {
			Log.v(LABEL, "searchMms - 01");
			try {
				if(filter==null) {
					return true;
				}
				else if(filter.type==null) {
					Log.v(LABEL, "searchMms - 02");
					return true;
				}
				else for(int i=0; i<filter.type.length; i++) {
					Log.v(LABEL, "searchMms - 03");
					if(filter.type[i]==TYPE_MMS)
						return true;
				}
			}
			catch(Exception e) {
				Log.v(LABEL, "searchMms exception: "+e.getMessage());
			}
			Log.v(LABEL, "searchMms - 09");
			return false;
		}
		
		private boolean searchDir(int dir) {
			if(filter==null)
				return true;
			else if(filter.folder==null)
				return true;
			else for(int i=0; i<filter.folder.length; i++) {
				if(filter.folder[i]==dir)
					return true;
			}
			return false;
		}

		private String getFilterString(int folder) {
			Log.v(LABEL, "getFilterString");
			if(filter==null)
				return null;
			String res=new String();
			boolean initialized=false;
			if(filter.id!=null){
				Log.v(LABEL, "getFilterString - id");
				if(initialized)
					res+=" AND ";
				res+="_id="+filter.id;
				initialized=true;
			}
			if(filter.from!=null){
				Log.v(LABEL, "getFilterString - from");
				if(initialized)
					res+=" AND ";
				if(folder==FOLDER_INBOX) {
					res+="address=\'"+filter.from+"\'";
				}
				else {
					res+="address=\'00000000\'";
				}
				initialized=true;
			}
			if(filter.to!=null) {
				Log.v(LABEL, "getFilterString - to");
				if(initialized)
					res+=" AND ";
				if(folder==FOLDER_INBOX) {
					Log.v(LABEL, "getFilterString - to - inbox");
					res+="address=\'00000000\'";
				}
				else {
					if(filter.to.length == 1) {
						Log.v(LABEL, "getFilterString - to - 1");
						res+="address=\'"+filter.to[0]+"\'";
					}
					else {
						Log.v(LABEL, "getFilterString - to - >1");
						res+="(address=\'"+filter.to[0]+"\'";
						for(int i=1;i<filter.to.length;i++) {
							res+=" OR address=\'"+filter.to[i]+"\'";
						}
						res+=")";
					}
				}
				initialized=true;
			}
			if(filter.body!=null){
				Log.v(LABEL, "getFilterString - body");
				if(initialized)
					res+=" AND ";
				res+="body=\'"+filter.body+"\'";
				initialized=true;
			}
			if(filter.isRead!=null){
				Log.v(LABEL, "getFilterString - isRead");
				if(initialized)
					res+=" AND ";
				res+="read=";
				if(filter.isRead){
					res+="1";
				}
				else {
					res+="0";
				}
				initialized=true;
			}
			if(initialized)
				return res;
			else
				return null;
		}
		
		private Uri getUri(int type, int folder) {
			Uri res=null;
			if (type==TYPE_SMS) {
				switch(folder) {
				case FOLDER_INBOX:
					res=Uri.parse("content://sms/inbox");
					break;
				case FOLDER_OUTBOX:
					res=Uri.parse("content://sms/outbox");
					break;
				case FOLDER_SENTBOX:
					res=Uri.parse("content://sms/sent");
					break;
				case FOLDER_DRAFTS:
					res=Uri.parse("content://sms/draft");
					break;
				}
			}
			else if(type==TYPE_MMS) {
				res=Uri.parse("content://mms/part");
			}
			return res;
		}
		
		private boolean checkTimestamp(Date timestamp) {
			if(filter==null)
				return true;
			Log.v(LABEL, "checkTimestamp - timestamp is "+timestamp+", start is "+filter.startTimestamp+", end is "+filter.endTimestamp);
			if(filter.startTimestamp!=null) {
				if(timestamp.before(filter.startTimestamp))
					return false;
			}
			if(filter.endTimestamp!=null) {
				if(timestamp.after(filter.endTimestamp))
					return false;
			}
			return true;
		}
		
		private List<Message> getSms(List<Message> list, int folder) {
			String filterString=getFilterString(folder);
			Log.v(LABEL, "smsFinder getSms - filter string is "+filterString);
//			Uri searchUri=getUri(TYPE_SMS, folder);
			Cursor cursor = androidContext.getContentResolver().query(getUri(TYPE_SMS, folder), new String[] { "_id", "thread_id", "address", "date", "read", "status", "type", "body" }, filterString, null,null);
			MessageImpl msg;
			Log.v(LABEL, "smsFinder getSms - 03 - messages found "+cursor.getCount());
			cursor.moveToFirst();
			for(int i=0; i<cursor.getCount(); i++) {
				Log.v(LABEL, "smsFinder getSms - iteration n "+i);
				msg = new MessageImpl();
				msg.setContext(androidContext);
				msg.timestamp = new Date(cursor.getLong(cursor.getColumnIndex("date")));
				if(checkTimestamp(msg.timestamp)) {
					msg.type = TYPE_SMS;
					msg.id = cursor.getString(cursor.getColumnIndex("_id"));
					msg.body = cursor.getString(cursor.getColumnIndex("body"));
					msg.isRead = (cursor.getInt(cursor.getColumnIndex("read"))==0) ? false : true;
					ObjectArray<String> toTmp;
					Log.v(LABEL, "smsFinder getSms - 04");
					switch(cursor.getInt(cursor.getColumnIndex("type"))) {
					case 1:
						Log.v(LABEL, "smsFinder getSms - 041");
						msg.folder = FOLDER_INBOX;
						msg.from = cursor.getString(cursor.getColumnIndex("address"));
						toTmp = new org.meshpoint.anode.java.ObjectArray<String>(new String[]{"me"});
						msg.to = toTmp;
						list.add(msg);
						break;
					case 2:
						Log.v(LABEL, "smsFinder getSms - 042");
						msg.folder = FOLDER_SENTBOX;
						msg.from = "me";
						toTmp = new org.meshpoint.anode.java.ObjectArray<String>(new String[]{cursor.getString(cursor.getColumnIndex("address"))});
						msg.to = toTmp;
						list.add(msg);
						break;
					case 3:
						Log.v(LABEL, "smsFinder getSms - 043");
						msg.folder = FOLDER_DRAFTS;
						msg.from = "me";
						toTmp = new org.meshpoint.anode.java.ObjectArray<String>(new String[]{cursor.getString(cursor.getColumnIndex("address"))});
						msg.to = toTmp;
						list.add(msg);
						break;
					case 4:
						//TODO verify if outbox is type 4... 
						Log.v(LABEL, "smsFinder getSms - 044");
						msg.folder = FOLDER_OUTBOX;
						msg.from = "me";
						toTmp = new org.meshpoint.anode.java.ObjectArray<String>(new String[]{cursor.getString(cursor.getColumnIndex("address"))});
						msg.to = toTmp;
						list.add(msg);
						break;
					default:
						//unknown type: skip the message
						Log.v(LABEL, "smsFinder getSms - error - unexpected type of dir "+cursor.getInt(cursor.getColumnIndex("type")));
						break;
					}
				}
				cursor.moveToNext();
			}
			Log.v(LABEL, "smsFinder getSms - 05");
			return list;
		}

		private List<Message> getMms(List<Message> list, int folder) {
			Cursor cursor = androidContext.getContentResolver().query(Uri.parse("content://mms"), null, null, null,null);
			Log.v(LABEL, "smsFinder getMms - 03 - messages found "+cursor.getCount());
			cursor.moveToFirst();
			for(int i=0; i<cursor.getCount(); i++) {
				String id = cursor.getString(cursor.getColumnIndex("_id"));
				Log.v(LABEL, "Messaggio "+i);
				Log.v(LABEL, "id: "+id);
				Log.v(LABEL, "date: "+cursor.getString(cursor.getColumnIndex("date")));
				Log.v(LABEL, "read: "+cursor.getString(cursor.getColumnIndex("read")));
				Log.v(LABEL, "seen: "+cursor.getString(cursor.getColumnIndex("seen")));
				Cursor cursor2 = androidContext.getContentResolver().query(Uri.parse("content://mms/"+id+"/addr"), null, null, null,null);
				Log.v(LABEL, "campi addr; righe "+cursor2.getCount()+" - colonne "+cursor2.getColumnCount());
				cursor2.moveToFirst();
				for (int k=0; k<cursor2.getCount(); k++) {
					for(int j=0; j<cursor2.getColumnCount(); j++) {
						Log.v(LABEL, cursor2.getColumnName(j)+": "+cursor2.getString(j));
					}
					cursor2.moveToNext();
				}
				cursor.moveToNext();
			}
			return list;
		}
		
		public void run() {
			Log.v(LABEL, "smsFinder run");
			Env.setEnv(env);
			try {
				Log.v(LABEL, "smsFinder run - 01");
				List<Message> res = new ArrayList<Message>();
				if(searchSms()) {
					Log.v(LABEL, "smsFinder run - 02");
					if(searchDir(FOLDER_INBOX)) {
						Log.v(LABEL, "smsFinder run - search inbox");
						res = getSms(res, FOLDER_INBOX);
					}
					if(searchDir(FOLDER_SENTBOX)) {
						Log.v(LABEL, "smsFinder run - search sentbox");
						res = getSms(res, FOLDER_SENTBOX);
					}
					if(searchDir(FOLDER_OUTBOX)) {
						Log.v(LABEL, "smsFinder run - search outbox");
						res = getSms(res, FOLDER_OUTBOX);
					}
					if(searchDir(FOLDER_DRAFTS)) {
						Log.v(LABEL, "smsFinder run - search drafts");
						res = getSms(res, FOLDER_DRAFTS);
					}
				}
				if(searchMms()) {
					Log.v(LABEL, "smsFinder run - 03");
					//Uri uriSMSURI;
					//uriSMSURI = Uri.parse("content://mms");
					res = getMms(res, FOLDER_INBOX);
				}
				//TODO what if no results found? Return a null?
				Log.v(LABEL, "smsFinder run - sending callback");
				successCallback.onSuccess(res.toArray(new MessageImpl[res.size()]));
				Log.v(LABEL, "smsFinder run - callback sent");
			}
			catch(Exception e) {
				Log.v(LABEL, "smsFinder run, error: "+e);
				errorCallback.onerror(new DeviceAPIError(DeviceAPIError.UNKNOWN_ERR));
			}
		      
			Log.v(LABEL, "smsFinder run - END");
			
		}
	}
	
	public class SmsReceiver extends BroadcastReceiver {

		private OnIncomingMessage messageHandler;

		private SmsReceiver(OnIncomingMessage messageHandler) {
			this.messageHandler = messageHandler;
		}
		
		@Override
		public void onReceive(Context context, Intent intent) {
			Log.v(LABEL, "SMSReceiver - onreceive");
			Env.setEnv(env);
			Bundle bundle = intent.getExtras();

			Object messages[] = (Object[]) bundle.get("pdus");
			for (int i = 0; i < messages.length; i++) {
				SmsMessage smsMessage = SmsMessage.createFromPdu((byte[]) messages[i]);
				MessageImpl msg = new MessageImpl();
				msg.setContext(androidContext);
				msg.type = TYPE_SMS;
//				msg.id = ;
				msg.body = smsMessage.getMessageBody();
				msg.isRead = false;
				msg.timestamp = new Date(smsMessage.getTimestampMillis());
				ObjectArray<String> toTmp;
				msg.folder = FOLDER_INBOX;
				msg.from = smsMessage.getOriginatingAddress();
				toTmp = new org.meshpoint.anode.java.ObjectArray<String>(new String[]{"me"});
				msg.to = toTmp;
				messageHandler.onEvent(msg);
			}
		}
	}
	
}

abstract interface MessagingRunnable extends Runnable {
	public abstract void stop();
	public abstract boolean isStopped();
}

class MessagingPendingOperation extends PendingOperation {

	private Thread t=null;
	private MessagingRunnable r=null;
	
	public MessagingPendingOperation(Thread t, MessagingRunnable r) {
		this.t = t;
		this.r = r;
	}

//	public void setData(Thread t, MessagingRunnable r) {
//		this.t = t;
//		this.r = r;
//	}
	
	public void cancel() {
//		Log.v(LABEL, "MessagingPendingOperation cancel");
		if(t!=null) {
//			Log.v(LABEL, "MessagingPendingOperation cancel - send interrupt...");
			//TODO is this interrupt needed???
			t.interrupt();
			if(r!=null)
				r.stop();
		}
	}

}

