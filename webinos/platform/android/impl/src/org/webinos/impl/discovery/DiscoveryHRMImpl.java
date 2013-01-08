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
* Copyright 2012 Ziran Sun, Samsung Electronics(UK) Ltd
* 
******************************************************************************/
package org.webinos.impl.discovery;

import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Set;
import java.util.ArrayList;
import android.util.Log;

import android.os.Handler;
import android.os.Looper;


import org.meshpoint.anode.AndroidContext;
import org.meshpoint.anode.idl.Dictionary;
import org.meshpoint.anode.module.IModule;
import org.meshpoint.anode.module.IModuleContext;

import org.webinos.api.PendingOperation;
import org.webinos.api.discovery.DiscoveryManager;
import org.webinos.api.discovery.Filter;
import org.webinos.api.discovery.FindCallback;
import org.webinos.api.discovery.Options;
import org.webinos.api.discovery.Service;
import org.webinos.api.discovery.ServiceType;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;

import android.content.Context;

public class DiscoveryHRMImpl extends DiscoveryManager implements IModule {
	
	private Context androidContext;
	private BluetoothAdapter mBluetoothAdapter;

	private static final String TAG = "org.webinos.impl.DiscoveryHRMImpl";
	private static final boolean D = true;

	/* hard coded array length */
	ArrayList<BluetoothDevice> devicesAvailable = new ArrayList<BluetoothDevice>(10);
	ArrayList<BluetoothDevice> devicesFound = new ArrayList<BluetoothDevice>(10);

	DiscoveryServiceImpl srv = new DiscoveryServiceImpl();

	//DEMO parameters
	private BluetoothSocket mmSocket;

	private String mHxMName = null;
	private String mHxMAddress = null;

	private ConnectedThread mConnectedThread = null;
    
	/*****************************
	 * DiscoveryManager methods
	 *****************************/
	@Override
	public synchronized PendingOperation findServices(
		ServiceType serviceType,
		FindCallback findCallback,
		Options options, 
		Filter filter)   
	{
		if(D) Log.v(TAG, "DiscoveryHRMImpl: findservices");

		if(serviceType == null) {
		Log.e(TAG, "DiscoveryHRMImpl: Please specify a serviceType");
		return null;
		}
		
		DiscoveryRunnable bluetoothFindService = new BluetoothFindService(serviceType, findCallback, options, filter);
		Thread t = new Thread(bluetoothFindService);
		t.start();
		
		Log.v(TAG, "findServices - thread started with id "+(int)t.getId());
		return new DiscoveryPendingOperation(t, bluetoothFindService);
	}

	public void advertServices(String serviceType){
		//start advertisement
	}
	
	public String getServiceId(String serviceType){
		// TODO Auto-generated method stub - this probably is not applicable for BT discovery
		return null; 
	 }

	public Service createService(){
		DiscoveryServiceImpl srv = new DiscoveryServiceImpl();
		return srv;
	}
	
	/*****************************
	 * IModule methods
	 *****************************/
	@Override
	public Object startModule(IModuleContext ctx) {

		if(D) Log.v(TAG, "DiscoveryHRMImpl: startModule");
		androidContext = ((AndroidContext)ctx).getAndroidContext();
		
		mBluetoothAdapter = getDefaultBluetoothAdapter();
		
		if (mBluetoothAdapter == null) {
			if(D) Log.e(TAG, "Bluetooth is not available");
			return null;
		}
		else{
			if (!mBluetoothAdapter.isEnabled()){ 
				if(D) Log.d(TAG, "Bluetooth is not enabled");
				// TODO start UI activity to enable Bluetooth
				return null;
			}
			else
			{
				Log.d(TAG, "Found Bluetooth adapter");
				return this;
			}
		} 
	}
	
	@Override
	public void stopModule() {
		/*
		 * perform any module shutdown here ...
		 */

		if (mConnectedThread != null) {
					mConnectedThread.cancel(); mConnectedThread = null;
		}
		Log.v(TAG, "DiscoveryHRMImpl: stopModule");
	}
	
	/*****************************
	 * Helpers
	 *****************************/
	private static BluetoothAdapter getDefaultBluetoothAdapter() {
		// Check if the calling thread is the main application thread,
		// if it is, do it directly.
		if (Thread.currentThread().equals(Looper.getMainLooper().getThread())) {
			Log.v(TAG, "main thread - get bluetooth");
			return BluetoothAdapter.getDefaultAdapter();
		}
		
		// If the calling thread, isn't the main application thread,
		// then get the main application thread to return the default adapter.
		final ArrayList<BluetoothAdapter> adapters = new ArrayList<BluetoothAdapter>(1);
		final Object mutex = new Object();
		
		Handler handler = new Handler(Looper.getMainLooper());
		handler.post(new Runnable() {
			@Override
			public void run() {
				adapters.add(BluetoothAdapter.getDefaultAdapter());
				synchronized (mutex) {
					mutex.notify();
				}
			}
		});
		    
		while (adapters.isEmpty()) {
			Log.d(TAG, "wait for adapter");
				
			synchronized (mutex) {
				try {
					mutex.wait(1000L);
				} catch (InterruptedException e) {
					Log.e(TAG, "Interrupted while waiting for default bluetooth adapter", e);
				}
			}
		}
		    
		if (adapters.get(0) == null) {
			 Log.e(TAG, "No bluetooth adapter found!");
		}
		return adapters.get(0);
	}
	
 	class BluetoothFindService implements DiscoveryRunnable {

		private ServiceType serviceType;
		private FindCallback findCallback;
		private Options options;
		private Filter filter;
		
		private boolean stopped;
		
		private BluetoothFindService(ServiceType srvType,
				FindCallback findCB,
				Options opts, 
				Filter fltr) {
			serviceType = srvType;
			findCallback = findCB;
			options = opts;
			filter = fltr;
			
			stopped = false;
			if(D) Log.v(TAG,"constructed BluetoothFindService");
		}
		
		public synchronized boolean isStopped() {
			return stopped;
		}

		public synchronized void stop() {
			stopped = true;
		}
			
		public void run() {
			//Simply connect to the HRM device
			Log.d(TAG, "Connecting to HRM");
			//get the list of bonded devices
			Set<BluetoothDevice> devicesPaired = mBluetoothAdapter.getBondedDevices();
			if (devicesPaired.isEmpty() && devicesAvailable.isEmpty())
			Log.e(TAG, "No bluetooth device is available");
			//TODO: check if HRM is paired
			else{
				//Assume that HXM device is paired
				if(!devicesPaired.isEmpty()){
					for (BluetoothDevice device : devicesPaired) {
						String deviceName = device.getName();
						if ( deviceName.startsWith("HXM") ) {
							/*
							 * we found an HxM to try to talk to!, let's remember its name and 
							 * stop looking for more
							 */
							mHxMAddress = device.getAddress();
							mHxMName = device.getName();
							Log.d(TAG,"getConnectedHxm() found a device whose name starts with 'HXM', its name is "+mHxMName+" and its address is ++mHxMAddress");
													
							// start connecting to Hxm
							BluetoothSocket tmp = null;
							try {
								Method m = device.getClass().getMethod("createRfcommSocket", new Class[] {int.class});
								tmp = (BluetoothSocket) m.invoke(device, 1);            	            	
							}catch (SecurityException e) {
									Log.e(TAG, "ConnectThread() SecurityException");
									e.printStackTrace();
							} catch (NoSuchMethodException e) {
									Log.e(TAG, "ConnectThread() SecurityException");
									e.printStackTrace();
							} catch (IllegalArgumentException e) {
									Log.e(TAG, "ConnectThread() SecurityException");
									e.printStackTrace();
							} catch (IllegalAccessException e) {
									Log.e(TAG, "ConnectThread() SecurityException");
									e.printStackTrace();
							} catch (InvocationTargetException e) {
									Log.e(TAG, "ConnectThread() SecurityException");
									e.printStackTrace();
							}
							mmSocket = tmp;
																 
							try {
								// This is a blocking call and will only return on a successful connection or an exception
								mmSocket.connect();
							} catch (IOException e) {
								//inform widget that socket is not connected
								long[] values = {1000, 0 , 0, 0, 0, 0};
								srv.values = values;
								findCallback.onFound(srv);
								Log.d(TAG, "END connectionFailed");
								// Close the socket
								try {
									mmSocket.close();
								} catch (IOException e2) {
									Log.e(TAG, "ConnectThread.run(): unable to close() socket during connection failure", e2);
								}
							}
							//	srv.api = serviceType.api;

							// Cancel any thread currently running a connection
							if (mConnectedThread != null) {
								mConnectedThread.cancel(); mConnectedThread = null;
							}
							mConnectedThread = new ConnectedThread(mmSocket, findCallback);
							mConnectedThread.start(); 
						}
					}	
				}
			}
		}  //end of run
	} // end of runnable  	  
   
	/*
	* This thread runs during a connection with the Hxm.
	* It handles all incoming data
	*/
	private class ConnectedThread extends Thread {
		private final BluetoothSocket mmSocket;
		private final FindCallback findCallback;
		private final InputStream mmInStream;

		public ConnectedThread(BluetoothSocket socket, FindCallback findCB) {
			Log.d(TAG, "ConnectedThread(): starting");

			mmSocket = socket;
			findCallback = findCB;
			InputStream tmpIn = null;

			// Get the BluetoothSocket input and output streams
			try {
				tmpIn = socket.getInputStream();
			} catch (IOException e) {
				Log.e(TAG, "ConnectedThread(): temp sockets not created", e);
			}
			mmInStream = tmpIn;
			Log.d(TAG, "ConnectedThread(): finished");
		}

		/*
		* The code below is a basic implementation of a reader specific to the HxM device.  It is 
		* intended to illustrate the packet structure and field extraction.  Consider if your 
		* implementation should include more robust error detection logic to prevent things like 
		* buffer sizes from causing read overruns, or recomputing the CRC and comparing it to the 
		* contents of the message to detect transmission erros.
		*/
		private final int STX = 0x02;
		private final int MSGID = 0x26;
		private final int DLC = 55;
		private final int ETX = 0x03;
       
		@Override
		public void run() {
			Log.d(TAG, "ConnectedThread.run(): starting");
			byte[] buffer = new byte[1024];
			int b = 0;
			int bufferIndex = 0;
			int payloadBytesRemaining;
           
			// Keep listening to the InputStream while connected
			while (true) {
				try {
					bufferIndex = 0;
					// Read bytes from the stream until we encounter the the start of message character
					while (( b = mmInStream.read()) != STX )
						;

					buffer[bufferIndex++] = (byte) b;

					// The next byte must be the message ID, see the basic message format in the document 
					if ((b = mmInStream.read()) != MSGID )
						continue;

					buffer[bufferIndex++] = (byte) b;

					// The next byte must be the expected data length code, we don't handle variable length messages, see the doc 
					if ((b = mmInStream.read()) != DLC )
						continue;

					buffer[bufferIndex++] = (byte) b;

					payloadBytesRemaining = b;

					while ( (payloadBytesRemaining--) > 0 ) {
						buffer[bufferIndex++] = (byte) (b = mmInStream.read());                		                		
					}

					// The next byte should be a CRC
					buffer[bufferIndex++] = (byte) (b = mmInStream.read());
					
					// The next byte must be the end of text indicator, or there was sadness, see the basic message format in the document 
					if ((b = mmInStream.read()) != ETX )
						continue;
									
					buffer[bufferIndex++] = (byte) b;
											
					Log.d(TAG, "mConnectedThread: read "+Integer.toString(bufferIndex)+" bytes");

					long[] values = {0, 0 , 0, 0, 0, 0};
					srv.values = values;
					HrmReading hrm = new HrmReading( buffer, srv.values);
					findCallback.onFound(srv);

				} catch (IOException e) {
					Log.e(TAG, "disconnected", e);
					//connectionLost();
					break;
				}
			}            
			Log.d(TAG, "ConnectedThread.run(): finished");
		}

		public void cancel()	{
			Log.e(TAG, "cancel connection");
			try {
				mmInStream.close();} catch (IOException e) {
					Log.e(TAG, "ConnectedThread.cancel(): close() of InputStream failed", e);
				}
			try {
				mmSocket.close();
			} catch (IOException e) {
				Log.e(TAG, "ConnectedThread.cancel(): close() of connect socket failed", e);
			}
		}
	}
   
 //start of HrmReading    
	public class HrmReading implements Dictionary {
		public final int STX = 0x02;
		public final int MSGID = 0x26;
		public final int DLC = 55;
		public final int ETX = 0x03;

		private static final String TAG = "HrmReading";

		int serial;
		byte stx;
		byte msgId;
		byte dlc;
		int firmwareId;
		int firmwareVersion;
		int hardWareId;
		int hardwareVersion;
		int batteryIndicator;
		int heartRate;
		int heartBeatNumber;
		long hbTime1;
		long hbTime2;
		long hbTime3;
		long hbTime4;
		long hbTime5;
		long hbTime6;
		long hbTime7;
		long hbTime8;
		long hbTime9;
		long hbTime10;
		long hbTime11;
		long hbTime12;
		long hbTime13;
		long hbTime14;
		long hbTime15;
		long reserved1;
		long reserved2;
		long reserved3;
		long distance;
		long speed; 

		byte strides;    
		byte reserved4;
		long reserved5;
		byte crc;
		byte etx;
 
		long[] values = {0, 0 , 0, 0, 0, 0};
		public HrmReading (byte[] buffer, long[] val) {
		int bufferIndex = 0;
		values = val;

		Log.d ( TAG, "HrmReading being built from byte buffer");
       	
		try {
			stx 				= buffer[bufferIndex++];
			msgId 				= buffer[bufferIndex++];
			dlc 				= buffer[bufferIndex++];
			firmwareId 			= (int)((0x000000FF & (int)buffer[bufferIndex++]) | (int)(0x000000FF & (int)buffer[bufferIndex++])<< 8);
			firmwareVersion 	= (int)((0x000000FF & (int)buffer[bufferIndex++]) | (int)(0x000000FF & (int)buffer[bufferIndex++])<< 8);
			hardWareId 			= (int)((0x000000FF & (int)buffer[bufferIndex++]) | (int)(0x000000FF & (int)buffer[bufferIndex++])<< 8);
			hardwareVersion		= (int)((0x000000FF & (int)buffer[bufferIndex++]) | (int)(0x000000FF & (int)buffer[bufferIndex++])<< 8);
			batteryIndicator  	= (int)(0x000000FF & (int)(buffer[bufferIndex++]));
			heartRate  			= (int)(0x000000FF & (int)(buffer[bufferIndex++]));
			heartBeatNumber  	= (int)(0x000000FF & (int)(buffer[bufferIndex++]));
			hbTime1				= (long) (int)((0x000000FF & (int)buffer[bufferIndex++]) | (int)(0x000000FF & (int)buffer[bufferIndex++])<< 8);
			hbTime2				= (long) (int)((0x000000FF & (int)buffer[bufferIndex++]) | (int)(0x000000FF & (int)buffer[bufferIndex++])<< 8);
			hbTime3				= (long) (int)((0x000000FF & (int)buffer[bufferIndex++]) | (int)(0x000000FF & (int)buffer[bufferIndex++])<< 8);
			hbTime4				= (long) (int)((0x000000FF & (int)buffer[bufferIndex++]) | (int)(0x000000FF & (int)buffer[bufferIndex++])<< 8);
			hbTime5				= (long) (int)((0x000000FF & (int)buffer[bufferIndex++]) | (int)(0x000000FF & (int)buffer[bufferIndex++])<< 8);
			hbTime6				= (long) (int)((0x000000FF & (int)buffer[bufferIndex++]) | (int)(0x000000FF & (int)buffer[bufferIndex++])<< 8);
			hbTime7				= (long) (int)((0x000000FF & (int)buffer[bufferIndex++]) | (int)(0x000000FF & (int)buffer[bufferIndex++])<< 8);
			hbTime8				= (long) (int)((0x000000FF & (int)buffer[bufferIndex++]) | (int)(0x000000FF & (int)buffer[bufferIndex++])<< 8);
			hbTime9				= (long) (int)((0x000000FF & (int)buffer[bufferIndex++]) | (int)(0x000000FF & (int)buffer[bufferIndex++])<< 8);
			hbTime10			= (long) (int)((0x000000FF & (int)buffer[bufferIndex++]) | (int)(0x000000FF & (int)buffer[bufferIndex++])<< 8);
			hbTime11			= (long) (int)((0x000000FF & (int)buffer[bufferIndex++]) | (int)(0x000000FF & (int)buffer[bufferIndex++])<< 8);
			hbTime12			= (long) (int)((0x000000FF & (int)buffer[bufferIndex++]) | (int)(0x000000FF & (int)buffer[bufferIndex++])<< 8);
			hbTime13			= (long) (int)((0x000000FF & (int)buffer[bufferIndex++]) | (int)(0x000000FF & (int)buffer[bufferIndex++])<< 8);
			hbTime14			= (long) (int)((0x000000FF & (int)buffer[bufferIndex++]) | (int)(0x000000FF & (int)buffer[bufferIndex++])<< 8);
			hbTime15			= (long) (int)((0x000000FF & (int)buffer[bufferIndex++]) | (int)(0x000000FF & (int)buffer[bufferIndex++])<< 8);
			reserved1			= (long) (int)((0x000000FF & (int)buffer[bufferIndex++]) | (int)(0x000000FF & (int)buffer[bufferIndex++])<< 8);
			reserved2			= (long) (int)((0x000000FF & (int)buffer[bufferIndex++]) | (int)(0x000000FF & (int)buffer[bufferIndex++])<< 8);
			reserved3			= (long) (int)((0x000000FF & (int)buffer[bufferIndex++]) | (int)(0x000000FF & (int)buffer[bufferIndex++])<< 8);
			distance			= (long) (int)((0x000000FF & (int)buffer[bufferIndex++]) | (int)(0x000000FF & (int)buffer[bufferIndex++])<< 8);
			speed				= (long) (int)((0x000000FF & (int)buffer[bufferIndex++]) | (int)(0x000000FF & (int)buffer[bufferIndex++])<< 8);
			strides 			= buffer[bufferIndex++];    
			reserved4 			= buffer[bufferIndex++];
			reserved5 			= (long)(int)((0x000000FF & (int)buffer[bufferIndex++]) | (int)(0x000000FF & (int)buffer[bufferIndex++])<< 8);
			crc 				= buffer[bufferIndex++];
			etx 				= buffer[bufferIndex];
   	} catch (Exception e) {
			Log.d(TAG, "Failure building HrmReading from byte buffer, probably an incopmplete or corrupted buffer");
		}

		Log.d(TAG, "Building HrmReading from byte buffer complete, consumed " + bufferIndex + " bytes in the process");
           
           
		if ( etx != ETX )
			Log.e(TAG,"...ETX mismatch!  The HxM message was not parsed properly");

		//pass values to srv
		Log.d(TAG,"...heartRate "+ ( heartRate ));
		val[0] = (long)(int)heartRate;

		Log.d(TAG,"...heartBeatNumber "+ ( heartBeatNumber ));
		val[1] = (long)(int)heartBeatNumber;

		Log.d(TAG,"...distance "+ ( distance ));
		val[2] = distance;

		Log.d(TAG,"...speed "+ ( speed ));
		val[3] = speed;

		Log.d(TAG,"...strides "+ ( strides ));
		val[4] = strides;
		}
	}
   // end of HXM reading        
   
	abstract interface DiscoveryRunnable extends Runnable {
		//for supports on PendingOperation
		public abstract void stop();
		public abstract boolean isStopped();
	}
   
	class DiscoveryPendingOperation extends PendingOperation {

		private Thread t=null;
		private DiscoveryRunnable r=null;

		public DiscoveryPendingOperation(Thread t, DiscoveryRunnable r) {
		this.t = t;
		this.r = r;
		}
	
		public void cancel() {
			Log.d(TAG, "DiscoveryPendingOperation cancel");
			if(t!=null) {
				Log.v(TAG, "DiscoveryPendingOperation cancel - send interrupt...");
				//Is this interrupt needed??? - copied from messaging
				t.interrupt();
				if(r!=null)
					r.stop();
			}
		}
	}
}
