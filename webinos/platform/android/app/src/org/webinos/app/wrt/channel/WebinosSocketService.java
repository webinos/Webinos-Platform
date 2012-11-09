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

import java.util.ArrayList;
import java.util.HashMap;

import android.app.Service;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Message;
import android.os.Messenger;
import android.os.RemoteException;
import android.util.Log;

public class WebinosSocketService extends Service {

	private static final String TAG = "org.webinos.app.wrt.channel.WebinosSocketServer";

    private static WebinosSocketService theService;
    private static ArrayList<LaunchListener> listeners = new ArrayList<LaunchListener>();
    
    private Messenger messenger;
    private HashMap<String, ClientConnection> clients = new HashMap<String, ClientConnection>();
    private ConnectionListener connectionListener;

	public interface LaunchListener {
		public void onLaunch(WebinosSocketService service);
	}

	public interface ConnectionListener {
		public void onConnection(ClientConnection client);
	}

	public static WebinosSocketService getInstance(LaunchListener listener) {
		WebinosSocketService result;
		synchronized(listeners) {
			result = theService;
			if(result == null && listener != null) {
				listeners.add(listener);
			}			
		}
		return result;
	}

	public interface ClientListener {
		public void onMessage(String message);
		public void onClose(String reason);
		public void onError(String reason);
	}

    public static class ClientConnection {
    	public int id;
    	public String installId;
    	public String instanceId;
    	public Messenger messenger;
    	public ClientListener listener;
    }

    @Override
    public void onCreate() {
    	theService = this;
        messenger = new Messenger(new IncomingHandler());
        synchronized(listeners) {
        	theService = this;
        	for(LaunchListener listener : listeners) {
        		listener.onLaunch(this);
        		listeners.remove(listener);
        	}
        }
        super.onCreate();
    }

    public void setConnectionListener(ConnectionListener listener) {
    	connectionListener = listener;
    }

    private void removeClient(String clientKey, String reason) {
    	ClientConnection client = clients.get(clientKey);
    	if(client != null) {
    		if(client.listener != null)
    			client.listener.onClose(reason);
    		clients.remove(clientKey);
    	}
    }

    private class IncomingHandler extends Handler {
        @Override
        public void handleMessage(Message msg) {
        	ClientConnection client;
        	Log.v(TAG, "handleMessage: msg: " + msg.toString());
        	int clientId = ProtocolConstants.whatToId(msg.what);
            switch (ProtocolConstants.whatToMsg(msg.what)) {
            case ProtocolConstants.MSG_REGISTER:
            	Log.v(TAG, "IncomingHander: register");
            	break;
            case ProtocolConstants.MSG_UNREGISTER:
            	Log.v(TAG, "IncomingHander: unregister");
            	break;
            case ProtocolConstants.MSG_CONNECT:
            	Log.v(TAG, "IncomingHander: connect");
            	/* construct new ClientConnection */
            	client = new ClientConnection();
            	Bundle bundle = (Bundle)msg.obj;
            	client.installId = bundle.getString("installId");
            	client.instanceId = bundle.getString("instanceId");
            	client.id = ProtocolConstants.whatToId(msg.what);
            	client.messenger = msg.replyTo;
            	clients.put(String.valueOf(client.id), client);
            	if(connectionListener != null)
            		connectionListener.onConnection(client);
            	break;
            case ProtocolConstants.MSG_DISCONNECT:
            	Log.v(TAG, "IncomingHander: disconnect");
            	removeClient(String.valueOf(clientId), "Connection disconnected by client");
            	break;
            case ProtocolConstants.MSG_DATA:
            	Log.v(TAG, "IncomingHander: data");
            	String data = ((Bundle)msg.obj).getString("data");
            	client = clients.get(String.valueOf(clientId));
            	if(client != null && client.listener != null)
            		client.listener.onMessage(data);
            	break;
           default:
                super.handleMessage(msg);
            }
        	Log.v(TAG, "handleMessage: ret");
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
    	Log.v(TAG, "onBind()");
        IBinder result = messenger.getBinder();
        return result;
    }

    @Override
    public boolean onUnbind(Intent intent) {
    	Log.v(TAG, "onUnbind()");
    	for(String clientKey : clients.keySet()) {
    		removeClient(clientKey, "WRT exited");
    	}
    	return super.onUnbind(intent);
    }

    public void sendMessage(ClientConnection client, String message) {
    	Bundle messageBundle = new Bundle();
    	messageBundle.putString("data", message);
    	Message msg = Message.obtain(null, ProtocolConstants.toWhat(ProtocolConstants.MSG_DATA, client.id), messageBundle);
        try {
        	client.messenger.send(msg);
        } catch(RemoteException e) {
        	Log.v(TAG, "RemoteException attempting to send message: ", e);
        }
    }

}
