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

import org.webinos.wrt.core.WrtManager;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.IBinder;
import android.os.Message;
import android.os.Messenger;
import android.os.RemoteException;
import android.util.Log;

public class Session {
    private static final String SERVICE_ID = "org.webinos.wrt.channel.SERVER";
    private static Messenger remoteService = null;
    private static ServiceConnection connection = null;
    private static boolean bound = false;
    private static boolean registered = false;
    private static Session currentSession;

    private static final String TAG = "org.webinos.wrt.channel.Session";
    
    public static synchronized Session getSession() {
    	if(currentSession == null) {
        	Log.v(TAG, "Session: creating new session");
    		currentSession = new Session();
    		currentSession.bind();
    	}
    	return currentSession;
    }

    public static synchronized void dispose() {
    	if(currentSession != null) {
    		currentSession.unbind();
    		currentSession = null;
    	}
    }

    void bind() {
    	connection = new ServiceConnection() {
            public void onServiceConnected(ComponentName className, IBinder service) {
            	remoteService = new Messenger(service);
            	Log.v(TAG, "Session: onServiceConnected");

                try {
                    Message msg = Message.obtain(null, ProtocolConstants.toWhat(ProtocolConstants.MSG_REGISTER));
                    remoteService.send(msg);
                    registered = true;
                } catch (RemoteException e) {
                    /* In this case the service has crashed before we could even
                     * do anything with it; we can count on soon being
                     * disconnected (and then reconnected if it can be restarted)
                     * so there is no need to do anything here. */
                }
            }

            public void onServiceDisconnected(ComponentName className) {
            	remoteService = null;
            	currentSession = null;
                bound = false;
            }
        };
        WrtManager.getInstance().bindService(new Intent(SERVICE_ID), connection, Context.BIND_AUTO_CREATE);
        bound = true;
    }

    void unbind() {
		if(bound) {
            if (remoteService != null) {
                try {
                    Message msg = Message.obtain(null, ProtocolConstants.toWhat(ProtocolConstants.MSG_UNREGISTER));
                    remoteService.send(msg);
                } catch (RemoteException e) {
                    /* There is nothing special we need to do if the service
                     * has crashed. */
                } finally {
                	registered = false;
                	remoteService = null;
                }
            }

            WrtManager.getInstance().unbindService(connection);
            bound = false;
		}
    }

	void checkState() {
		if(!bound) {
			throw new RuntimeException("Attempt to use socket before bind");
		}
		if(!registered) {
			throw new RuntimeException("Attempt to use socket before registered");
		}
	}

	void send(Message msg, Messenger replyTo) throws RemoteException {
        msg.replyTo = (replyTo == null) ? remoteService : replyTo;
        remoteService.send(msg);
	}
}
