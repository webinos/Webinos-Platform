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
  private int server_port = 4321; //randomly choose server port
  private boolean adverton = false; //watch advertServices status
  private boolean findon = false; //watch findServices status
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
    if(serviceType == null) {
      Log.e(TAG, "DiscoveryMdnsImpl: Please specify a serviceType");
      return null;
    }
    else{
      if(serviceType.api == null){
        Log.e(TAG, "DiscoveryMdnsImpl: Please specify serviceType.api");
        return null;
      }
      else
      {
        ptl_type = serviceType.api;
        if(D) Log.v(TAG, "Mdns findServices - service type "+ptl_type);
      }  
    }
      
    // new thread 	
    dnsFindService = new DNSFindService(serviceType, findCallback, options, filter);	
    dnsFindService.start();
    
    if(D)	Log.v(TAG, "Mdns findServices - thread started with id "+(int)dnsFindService.getId());
    return new DiscoveryPendingOperation(dnsFindService, dnsFindService);
	}
	
	public void advertServices(String serviceType){
		
    //clean up before start
    if(!adverton && !findon)
      cleanup();

    //start advertisement
    if(D) Log.v(TAG, "Mdns advertServices "+serviceType);
    String hostname = System.getString(androidContext.getContentResolver(),System.ANDROID_ID);

    InetAddress addr = getselfAddress();
    if(D) Log.d(TAG, String.format("own address: addr=%s", addr.toString()));


    //Replace "." with "_"
    String tmp = addr.toString();
    String mIp = tmp.replace(".", "_");
    String mNameIp = hostname + mIp;

    mServiceInfo = ServiceInfo.create(serviceType, mNameIp, server_port, "Create new service type in android");

    try {
      if(mZeroconf == null)
        mZeroconf = JmDNS.create(addr);
      mZeroconf.registerService(mServiceInfo);
      adverton = true;
    } catch (IOException e) {
      e.printStackTrace();
    }  
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
			if(D) Log.v(TAG, "DiscoveryMdnsImpl: Enable WiFi");
			mWiFiManager.setWifiEnabled(true);  
		}
		return this;
	}
	
	@Override
	public void stopModule() {
		/*
		 * perform any module shutdown here ...
		 */
		if(D) Log.v(TAG, "DiscoveryMdnsImpl: stopModule");
	}
	
	/*****************************
	 * Helpers
	 *****************************/
  
  public InetAddress getselfAddress (){

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
    
    if(D) Log.d(TAG, String.format("found intaddr=%d, addr=%s", intaddr, addr.toString()));
    return addr;
  }
  
  public void cleanup(){
    if(mZeroconf != null)
    {	
      if(D) Log.v(TAG, "clean up");
      if(mListener != null){
        if(ptl_type != null)
        {
          mZeroconf.removeServiceListener(ptl_type, mListener);
          mListener = null;
        } 
      }
      mZeroconf.unregisterAllServices();
      try {
        mZeroconf.close();
      } catch (IOException e) {
        if(D) Log.d(TAG, String.format("ZeroConf Error: %s", e.getMessage()));
        e.printStackTrace();
      }
      mZeroconf = null;
    } 
    //release lock
    if (mLock != null) 
      mLock.release(); 
  }
  
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
		  
      InetAddress addr = getselfAddress();

      if(D) Log.d(TAG, String.format("own address: addr=%s", addr.toString()));
      String hostname = System.getString(androidContext.getContentResolver(),System.ANDROID_ID);
      if(!adverton && !findon)
        cleanup();

      // Setup DNS
      mLock = mWiFiManager.createMulticastLock("MdnsLock");
      mLock.setReferenceCounted(true);
      mLock.acquire();

      //TODO: replacing the arrays with HashTable    
      String[] Addresses = {null, null , null, null, null, null};
      srv.deviceAddresses = Addresses;
            
      String[] Devicenames = {null, null , null, null, null, null};
      srv.deviceNames = Devicenames;
	        
      try {
        if(D) Log.d(TAG, "Listener handling\n");
        if(mZeroconf == null)
          mZeroconf = JmDNS.create(addr);
        
        findon = true;
                
        if(D) Log.d(TAG, "ptl_typ = " + ptl_type);
        mZeroconf.addServiceListener(ptl_type, mListener = new ServiceListener() {
          @Override
          public void serviceResolved(ServiceEvent ev) {
            if(D) Log.d(TAG, "Service resolved: " + ev.getInfo().getQualifiedName());
            if(D) Log.d(TAG, " port:\n" + ev.getInfo().getPort() + "\nIP Address:\n" + ev.getInfo().getHostAddresses()[0]
                + "\nserver name:\n" + ev.getInfo().getServer() + "\nprotocol:\n"  + ev.getInfo().getProtocol()
                + "\ntype:\n" + ev.getType());
											
						//start passing data
						String[] hostAdresses = ev.getInfo().getHostAddresses();
		
						int i = 0;
						for (String ha : hostAdresses) {
							int intaddr = mInfo.getIpAddress();
							byte[] byteaddr = new byte[] { 
								(byte) (intaddr & 0xff), (byte) (intaddr >> 8 & 0xff), (byte) (intaddr >> 16 & 0xff), (byte) (intaddr >> 24 & 0xff)
							};
							InetAddress mHostaddr = null;
							try {
								mHostaddr = InetAddress.getByAddress(byteaddr);
              } catch (UnknownHostException e1) {
								e1.printStackTrace();
							}
							
							String hostaddr = mHostaddr.toString();
							hostaddr = hostaddr.substring(1); //remove "/"
												
							String devicename = System.getString(androidContext.getContentResolver(),System.ANDROID_ID);
							//filter out itself
							if ((!(hostAdresses[i].equals(hostaddr))) && (!(devicename.equals(ev.getName()))))
							{	
								srv.deviceAddresses[i] = hostAdresses[i];
								if(D) Log.d(TAG, "Service IP addresses: " + srv.deviceAddresses[i]);
								srv.deviceNames[i] = ev.getName();
								if(D) Log.d(TAG, "Hostnames:" + srv.deviceNames[i]);
								i++;
							}
						}
						findCallback.onFound(srv); 
					}

					@Override
					public void serviceRemoved(ServiceEvent ev) {
						if(D) Log.d(TAG, "Service removed: " + ev.getName());
					}
					@Override
					public void serviceAdded(ServiceEvent ev) {
						// Required to force serviceResolved to be called again (after the first search)
						if(D) Log.d(TAG, "serviceAdded" );
						mZeroconf.requestServiceInfo(ev.getType(), ev.getName(), 1);
					}
				});
	    } catch (IOException e) {
				e.printStackTrace();
			}
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
			if(D) Log.d(TAG, "DiscoveryPendingOperation cancel");
			if(t!=null) {
				if(D) Log.v(TAG, "DiscoveryPendingOperation cancel - send interrupt...");
				t.interrupt();
			}
		}
	}
}
