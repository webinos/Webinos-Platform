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

package org.webinos.wrt.channel;

import java.util.HashSet;

import org.webinos.wrt.core.WidgetConfig;
import org.webinos.wrt.renderer.WebView;

import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.os.Messenger;
import android.os.RemoteException;
import android.util.Log;

public class ClientSocket {
	
    public static final String SOCKETJS_ASSET = "js/webinossocket.js";
    public static final String WEBINOSJS_ASSET = "js/webinos.js";
    private static final String TAG = "org.webinos.wrt.channel.ClientSocket";

    private final WebView webView;
	private WidgetConfig widgetConfig;
	private String instanceId;
	private Session session;
    private Messenger incomingHandler = null;
    private HashSet<String> ids = new HashSet<String>();

    private static String escapeString(String text) {
    	StringBuffer buf = new StringBuffer();
    	for(int i = 0; i < text.length(); i++) {
    		char c = text.charAt(i);
    		switch(c) {
    		case '\'':
    			buf.append("\\\'");
    			break;
    		case '"':
    			buf.append("\\\"");
    			break;
    		case '\\':
    			buf.append("\\\\");
    			break;
    		case '\n':
    			buf.append("\\n");
    			break;
    		case '\r':
    			buf.append("\\r");
    			break;
    		case '\t':
    			buf.append("\\t");
    			break;
    		default:
    			buf.append(c);
    		}
    	}
    	return buf.toString();
    }
    
	public ClientSocket(WebView webView, WidgetConfig widgetConfig, String instanceId) {
		this.webView = webView;
		this.widgetConfig = widgetConfig;
		this.instanceId = instanceId;
		session = Session.getSession();
	}

	public void dispose() {
		for(String id : ids)
			closeSocket(Integer.parseInt(id));
	}

	public void openSocket(final int id) {
    	Log.v(TAG, "openSocket()");
    	session.checkState();
    	incomingHandler = new Messenger(new Handler() {
            @Override
            public void handleMessage(Message msg) {
            	Log.v(TAG, "handleMessage: msg: " + msg.toString());
                switch (ProtocolConstants.whatToMsg(msg.what)) {
                case ProtocolConstants.MSG_DISCONNECT:
                	Log.v(TAG, "IncomingHandler: disconnect");
                	break;
                case ProtocolConstants.MSG_DATA:
                	Log.v(TAG, "IncomingHandler: data");
                	String data = ((Bundle)msg.obj).getString("data");
                	Log.v(TAG, "IncomingHander: data: " + data);
                	int id = ProtocolConstants.whatToId(msg.what);
                    webView.callScript("WebinosSocket.handleMessage(" + id + ", '" +  escapeString(data) + "');");
                	break;
               default:
                    super.handleMessage(msg);
                }
            	Log.v(TAG, "handleMessage: ret");
            }
    	});

        try {
        	Log.v(TAG, "sending connect message");
        	Bundle clientDetails = new Bundle();
        	clientDetails.putString("instanceId", instanceId);
        	clientDetails.putString("installId", widgetConfig.getInstallId());
            Message msg = Message.obtain(null, ProtocolConstants.toWhat(ProtocolConstants.MSG_CONNECT, id), clientDetails);
            session.send(msg, incomingHandler);
            ids.add(String.valueOf(id));
            webView.callScript("WebinosSocket.handleConnect(" + id + ");");
        } catch (RemoteException e) {
        	throw new RuntimeException("Exception opening socket", e);
        }
	}

	public void closeSocket(int id) {
		session.checkState();
        try {
            Message msg = Message.obtain(null, ProtocolConstants.toWhat(ProtocolConstants.MSG_DISCONNECT, id));
            session.send(msg, null);
        } catch (RemoteException e) {
        	throw new RuntimeException("Exception closing socket", e);
        }
	}

	public void send(int id, String message) {
		session.checkState();
        try {
        	Bundle messageBundle = new Bundle();
        	messageBundle.putString("data", message);
            Message msg = Message.obtain(null, ProtocolConstants.toWhat(ProtocolConstants.MSG_DATA, id), messageBundle);
            session.send(msg, null);
        } catch (RemoteException e) {
        	throw new RuntimeException("Exception sending on socket", e);
        }
	}
}
