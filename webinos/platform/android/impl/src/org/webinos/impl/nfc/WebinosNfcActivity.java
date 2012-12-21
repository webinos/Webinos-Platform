package org.webinos.impl.nfc;

import java.util.ArrayList;
import java.util.List;

import org.webinos.app.R;
import org.webinos.impl.nfc.NfcManager.FilterMonitor;
import org.webinos.impl.nfc.NfcManager.NfcDiscoveryFilter;
import org.webinos.impl.nfc.NfcManager.NfcDiscoveryFilter.FilterType;

import android.app.Activity;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.IntentFilter.MalformedMimeTypeException;
import android.nfc.NfcAdapter;
import android.nfc.Tag;
import android.os.Bundle;
import android.view.Menu;

public class WebinosNfcActivity extends Activity implements FilterMonitor {

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
    nfcMgr.setFilterMonitor(this);

    setContentView(R.layout.activity_webinos_nfc);
  }

  private void updateFilter() {
    mFilters = null;
    List<IntentFilter> filters = new ArrayList<IntentFilter>();
    NfcManager nfcMgr = NfcManager.getInstance();
    if (nfcMgr != null) {
      try {
        for (NfcDiscoveryFilter filter : nfcMgr.getFilters()) {
          IntentFilter intentFilter = new IntentFilter(
              NfcAdapter.ACTION_NDEF_DISCOVERED);
          if (filter.getType().equals(FilterType.TEXT)) {
            intentFilter.addDataType("text/plain");
          } else if (filter.getType().equals(FilterType.URI)) {
            String scheme = filter.getExtra();
            intentFilter.addDataScheme(scheme);
          } else if (filter.getType().equals(FilterType.MIME)) {
            intentFilter.addDataType(filter.getExtra() != null ? filter
                .getExtra() : "*/*");
          }
          filters.add(intentFilter);
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
      nfcMgr.dispatchNfcEvent(tagFromIntent);
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
