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
* Copyright 2012 Ziran Sun Samsung Electronics(UK) Ltd
******************************************************************************/

package org.webinos.impl.discovery;

import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;

import javax.jmdns.JmDNS;
import javax.jmdns.ServiceEvent;
import javax.jmdns.ServiceInfo;
import javax.jmdns.ServiceListener;

import android.util.Log;

import org.meshpoint.anode.AndroidContext;
import org.meshpoint.anode.module.IModule;
import org.meshpoint.anode.module.IModuleContext;

import org.webinos.api.PendingOperation;
import org.webinos.api.discovery.DiscoveryManager;
import org.webinos.api.discovery.Filter;
import org.webinos.api.discovery.FindCallback;
import org.webinos.api.discovery.Options;
import org.webinos.api.discovery.Service;
import org.webinos.api.discovery.ServiceType;

import android.content.Context;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.net.wifi.WifiManager.MulticastLock;
import android.provider.Settings.System;

public class DiscoveryMdnsImpl extends DiscoveryManager implements IModule {
	
	private Context androidContext;
	
	private static final String TAG = "org.webinos.impl.DiscoveryMdnsImpl";
	private static final boolean D = true;
    
	private String ptl_type = null;
	private JmDNS mZeroconf = null;
	private ServiceListener mListener = null;
	private ServiceInfo mServiceInfo;
    
	private WifiManager mWiFiManager;
	private MulticastLock mLock;
	private WifiInfo mInfo;
    
	private DNSFindService dnsFindService;
    
	DiscoveryServiceImpl srv = new DiscoveryServiceImpl();
    
	/*****************************
	 * DiscoveryManager methods
	 *****************************/
	@Override
	public synchronized PendingOperation findServices(
		ServiceType serviceType,
		FindCallback findCallback,
		Options options, 
		Filter filter){
			
		if(D) Log.v(TAG, "DiscoveryMdnsImpl: findservices");
		
		/*	if(serviceType == null) {
			Log.e(TAG, "DiscoveryMdnsImpl: Please specify a serviceType");
			return null;
		} 
			
		if(serviceType.api != null)
		{
			Log.e(TAG,"servicetype is not null");
			ptl_type = serviceType.api;
			
			//System.out.println("ptl_type: " + ptl_type);
		} */
		
		ptl_type = "_pzp._tcp.local.";

		// new thread 	
		dnsFindService = new DNSFindService(serviceType, findCallback, options, filter);	
		dnsFindService.start();
		
		Log.v(TAG, "Mdns findServices - thread started with id "+(int)dnsFindService.getId());
		return new DiscoveryPendingOperation(dnsFindService, dnsFindService);
	}
	
	public String getServiceId(String serviceType){
		// TODO Auto-generated method stub 
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
	public Object startModule(IModuleContext ctx){

		if(D) Log.v(TAG, "DiscoveryMdnsImpl: startModule");
		androidContext = ((AndroidContext)ctx).getAndroidContext();
		
		// Setup WiFi
		mWiFiManager = (WifiManager) androidContext.getSystemService(Context.WIFI_SERVICE);
		if(!mWiFiManager.isWifiEnabled()){
			Log.v(TAG, "DiscoveryMdnsImpl: Enable WiFi");
			mWiFiManager.setWifiEnabled(true);  
		}
		return this;
	}
	
	@Override
	public void stopModule() {
		/*
		 * perform any module shutdown here ...
		 */
		Log.v(TAG, "DiscoveryMdnsImpl: stopModule");
	}
	
	/*****************************
	 * Helpers
	 *****************************/
	class DNSFindService extends Thread implements Runnable {
		private ServiceType serviceType;
		private FindCallback findCallback;
		private Options options;
		private Filter filter;
		
		private DNSFindService(ServiceType srvType,
			FindCallback findCB,
			Options opts, 
			Filter fltr) {
					
			this.serviceType = srvType;
			this.findCallback = findCB;
		    this.options = opts;
		    this.filter = fltr;
			
			if(D) Log.v(TAG,"constructed WiFiFindService");
		}
		
		public void run() {

			if(mZeroconf != null)
			{	
				//clean up
				mZeroconf.removeServiceListener(ptl_type, mListener);
				try {
					mZeroconf.close();
					mZeroconf = null;
				} catch (IOException e) {
					Log.d(TAG, String.format("ZeroConf Error: %s", e.getMessage()));
				}
				mLock.release();
				mLock = null;
			}
			
			mInfo = mWiFiManager.getConnectionInfo();
			int intaddr = mInfo.getIpAddress();
			byte[] byteaddr = new byte[] { 
					(byte) (intaddr & 0xff), (byte) (intaddr >> 8 & 0xff), (byte) (intaddr >> 16 & 0xff), (byte) (intaddr >> 24 & 0xff)
			};
			InetAddress addr = null;
			try {
				addr = InetAddress.getByAddress(byteaddr);
			} catch (UnknownHostException e1) {
				e1.printStackTrace();
			}
			
			Log.d(TAG, String.format("found intaddr=%d, addr=%s", intaddr, addr.toString()));
			String hostname = System.getString(androidContext.getContentResolver(),System.ANDROID_ID);
			
			// Setup DNS
			mLock = mWiFiManager.createMulticastLock("MdnsLock");
			mLock.setReferenceCounted(true);
			mLock.acquire();
	        
			String[] Addresses = {null, null , null, null, null, null};
			srv.deviceAddresses = Addresses;
            
			String[] Devicenames = {null, null , null, null, null, null};
			srv.deviceNames = Devicenames;
	        
			try {
				Log.d(TAG, "Listener handling\n");
				mZeroconf = JmDNS.create(addr);

				mZeroconf.addServiceListener(ptl_type, mListener = new ServiceListener() {

					@Override
					public void serviceResolved(ServiceEvent ev) {
						Log.d(TAG, "Service resolved: " + ev.getInfo().getQualifiedName());
						Log.d(TAG, " port:\n" + ev.getInfo().getPort() + "\nIP Address:\n" + ev.getInfo().getHostAddresses()[0]
								+ "\nserver name:\n" + ev.getInfo().getServer() + "\nprotocol:\n"  + ev.getInfo().getProtocol()
								+ "\ntype:\n" + ev.getType());
											
						//start passing data
						String[] hostAdresses = ev.getInfo().getHostAddresses();
		
						int i = 0;
											
						for (String ha : hostAdresses) {
												
							//filter out itself
							int intaddr = mInfo.getIpAddress();
							byte[] byteaddr = new byte[] { 
								(byte) (intaddr & 0xff), (byte) (intaddr >> 8 & 0xff), (byte) (intaddr >> 16 & 0xff), (byte) (intaddr >> 24 & 0xff)
							};
							InetAddress hostaddr = null;
							try {
								hostaddr = InetAddress.getByAddress(byteaddr);
							} catch (UnknownHostException e1) {
								e1.printStackTrace();
							}
												
							String devicename = System.getString(androidContext.getContentResolver(),System.ANDROID_ID);
											
							if ((!(hostAdresses[i].equals(hostaddr.toString()))) && (!(devicename.equals(ev.getName()))))
							{	
								srv.deviceAddresses[i] = hostAdresses[i];
								Log.d(TAG, "Service IP addresses: " + srv.deviceAddresses[i]);
								srv.deviceNames[i] = ev.getName();
								Log.d(TAG, "Hostnames:" + srv.deviceNames[i]);
								i++;
							}
						}
						findCallback.onFound(srv); 
					}

					@Override
					public void serviceRemoved(ServiceEvent ev) {
						Log.d(TAG, "Service removed: " + ev.getName());
					}
					@Override
					public void serviceAdded(ServiceEvent ev) {
						// Required to force serviceResolved to be called again (after the first search)
						mZeroconf.requestServiceInfo(ev.getType(), ev.getName(), 1);
					}
				});
	        		
			//TODO: Isolate create service type out in order to enable app to create new service type  	
				mServiceInfo = ServiceInfo.create("_pzp._tcp.local.", hostname , 0, "PZP service from android");
				mZeroconf.registerService(mServiceInfo);
	    } catch (IOException e) {
				e.printStackTrace();
			}
		}
		
		public void discoveryFinished() {

			//release lock
			if (mLock != null) 
				mLock.release();
	   }
	}

   class DiscoveryPendingOperation extends PendingOperation {

		private Thread t=null;
		private Runnable r=null;
		
		public DiscoveryPendingOperation(Thread t, Runnable r) {
			this.t = t;
			this.r = r;
		}
		
		public void cancel() {
			Log.d(TAG, "DiscoveryPendingOperation cancel");
			if(t!=null) {
				Log.v(TAG, "DiscoveryPendingOperation cancel - send interrupt...");
				//Is this interrupt needed??? - copied from messaging
				t.interrupt();
			}
		}
	}
}
