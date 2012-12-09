package org.webinos.impl.nfc;

import org.meshpoint.anode.AndroidContext;
import org.meshpoint.anode.module.IModule;
import org.meshpoint.anode.module.IModuleContext;

import android.content.Context;
import android.nfc.NfcAdapter;
import android.util.Log;

public class NfcAnodeModule extends NfcModuleBase implements IModule {

  private static String TAG = NfcAnodeModule.class.getName();
  
  private IModuleContext moduleContext;
  private Context androidContext;
  
  private NfcAdapter mNfcAdapter;
  
  @Override
  public Object startModule(IModuleContext ctx) {
    Log.v(TAG, "startModule");
    this.moduleContext = ctx;
    this.androidContext = ((AndroidContext)ctx).getAndroidContext();
    
    mNfcAdapter = NfcAdapter.getDefaultAdapter(androidContext);
    
    return this;
  }

  @Override
  public void stopModule() {
    Log.v(TAG, "stopModule");
  }
  
  @Override
  public boolean isNfcAvailable() {
    return (mNfcAdapter != null);
  }
  
  @Override
  public void log(String message) {
    Log.v(TAG, message);
  }
}
