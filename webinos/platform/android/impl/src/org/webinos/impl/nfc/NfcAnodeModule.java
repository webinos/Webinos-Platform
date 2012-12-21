package org.webinos.impl.nfc;

import java.util.ArrayList;
import java.util.List;

import org.meshpoint.anode.AndroidContext;
import org.meshpoint.anode.module.IModule;
import org.meshpoint.anode.module.IModuleContext;
import org.webinos.api.nfc.NfcTag;
import org.webinos.api.nfc.NfcTagTechnology;
import org.webinos.api.nfc.NfcTagTechnologyNdef;

import android.content.Context;
import android.nfc.NfcAdapter;
import android.nfc.Tag;
import android.nfc.tech.Ndef;
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
    this.androidContext = ((AndroidContext) ctx).getAndroidContext();

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

  @Override
  public void onTagDiscovered(Object tag) {
    if (tag instanceof Tag) {
      Tag androidTag = (Tag) tag;
      NfcTag event = new NfcTag();
      event.tagId = androidTag.getId();
      List<NfcTagTechnology> techList = new ArrayList<NfcTagTechnology>();
      for (String tech : androidTag.getTechList()) {
        if (tech.equals(Ndef.class.getName())) {
          android.nfc.tech.Ndef ndefTech = android.nfc.tech.Ndef
              .get(androidTag);
          techList.add(new NfcTagTechnologyNdefImpl(this.env, ndefTech));
        }
      }
      // event.techList = new NfcTagTechnology[techList.size()];
      // techList.toArray(event.techList);
      if (techList.size() > 0) {
        event.tech = (NfcTagTechnologyNdef) techList.get(0);
      }
      if (mNfcEventListener != null) {
        mNfcEventListener.handleEvent(event);
      }
    }
  }
}
