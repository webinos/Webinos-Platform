package org.webinos.impl.nfc;

import java.util.ArrayList;
import java.util.List;

import org.webinos.api.nfc.NdefRecord;
import org.webinos.api.nfc.NfcEventListener;
import org.webinos.api.nfc.NfcTag;
import org.webinos.api.nfc.NfcTagTechnology;
import org.webinos.api.nfc.NfcTagTechnologyNdef;
import org.webinos.app.R;
import org.webinos.impl.nfc.NfcManager.ListenerKey;
import org.webinos.impl.nfc.NfcManager.ListenerMonitor;
import org.webinos.impl.nfc.NfcManager.ListenerType;

import android.app.Activity;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.IntentFilter.MalformedMimeTypeException;
import android.nfc.NfcAdapter;
import android.nfc.Tag;
import android.nfc.tech.Ndef;
import android.os.Bundle;
import android.view.Menu;

public class WebinosNfcActivity extends Activity implements ListenerMonitor {

  private boolean isResumed;

  private NfcAdapter mNfcAdapter;
  
  private PendingIntent mPendingIntent;
  private IntentFilter[] mFilters;

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    mNfcAdapter = NfcAdapter.getDefaultAdapter(this);
    
    mPendingIntent = PendingIntent.getActivity(this, 0, new Intent(this,
        getClass()).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP), 0);

    NfcManager nfcMgr = NfcManager.getInstance();
    nfcMgr.setListenerMonitor(this);

    setContentView(R.layout.activity_webinos_nfc);
  }

  private void updateFilter() {
    mFilters = null;
    List<IntentFilter> filters = new ArrayList<IntentFilter>();
    NfcManager nfcMgr = NfcManager.getInstance();
    if (nfcMgr != null) {
      try {
        for (ListenerKey listener : nfcMgr.getListeners()) {
          IntentFilter filter = new IntentFilter(
              NfcAdapter.ACTION_NDEF_DISCOVERED);
          if (listener.getType().equals(ListenerType.TEXT)) {
            filter.addDataType("text/plain");
          } else if (listener.getType().equals(ListenerType.URI)) {
            String scheme = listener.getExtra();
            filter.addDataScheme(scheme);
          } else if (listener.getType().equals(ListenerType.MIME)) {
            filter.addDataType(listener.getExtra() != null ? listener
                .getExtra() : "*/*");
          }
          filters.add(filter);
        }
      } catch (MalformedMimeTypeException e) {
      }
    }
    if (filters.size() > 0) {
      mFilters = new IntentFilter[filters.size()];
      filters.toArray(mFilters);
    }
  }

  public void createAndSetFilter() {
    if (mNfcAdapter != null) {
      if (mFilters != null) {
        mNfcAdapter.enableForegroundDispatch(this, mPendingIntent, mFilters,
            null);
      } else {
        mNfcAdapter.disableForegroundDispatch(this);
      }
    }
  }

  @Override
  public boolean onCreateOptionsMenu(Menu menu) {
    return true;
  }

  @Override
  public void onPause() {
    super.onPause();
    if (mNfcAdapter != null) {
      mNfcAdapter.disableForegroundDispatch(this);
    }
    isResumed = false;
  }

  @Override
  public void onResume() {
    super.onResume();
    createAndSetFilter();
    isResumed = true;
  }

  @Override
  public void onNewIntent(Intent intent) {
    Tag tagFromIntent = intent.getParcelableExtra(NfcAdapter.EXTRA_TAG);
    NfcManager nfcMgr = NfcManager.getInstance();
    if (nfcMgr != null) {
      NfcTag event = new NfcTag();
      event.tagId = tagFromIntent.getId();
      //List<NfcTagTechnology> techList = new ArrayList<NfcTagTechnology>();
      for (String tech : tagFromIntent.getTechList()) {
        if (tech.equals(Ndef.class.getName())) {
          android.nfc.tech.Ndef ndefTech = android.nfc.tech.Ndef
              .get(tagFromIntent);
          event.ndefMessage = NfcTagTechnologyNdefImpl.createNdefMessage(ndefTech.getCachedNdefMessage());
          //techList.add(new NfcTagTechnologyNdefImpl(ndefTech));
        }
      }
      //event.techList = new NfcTagTechnology[techList.size()];
      //techList.toArray(event.techList);
      nfcMgr.dispatchNfcEvent(event);
    }
  }

  @Override
  public void onListenersUpdated() {
    updateFilter();
    if (isResumed) {
      createAndSetFilter();
    }
  }
}
