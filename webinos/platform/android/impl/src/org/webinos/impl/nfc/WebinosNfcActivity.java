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
 * Copyright 2013 Sony Mobile Communications
 * 
 ******************************************************************************/

package org.webinos.impl.nfc;

import java.util.ArrayList;
import java.util.List;

import org.webinos.app.R;
import org.webinos.impl.nfc.NfcManager.NfcDiscoveryFilter;
import org.webinos.impl.nfc.NfcManager.NfcDiscoveryFilter.FilterType;

import android.app.Activity;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.IntentFilter.MalformedMimeTypeException;
import android.nfc.NdefMessage;
import android.nfc.NfcAdapter;
import android.nfc.Tag;
import android.os.Bundle;
import android.view.Menu;

public class WebinosNfcActivity extends Activity {

  private boolean autoDismiss;
  
  private boolean isResumed;

  private NfcAdapter mNfcAdapter;

  private PendingIntent mPendingIntent;
  private IntentFilter[] mFilters;
  private NdefMessage mSharedTag;
  
  public static String EXTRA_LISTENERS = "org.webinos.impl.nfc.listeners";
  public static String EXTRA_SHAREDTAG = "org.webinos.impl.nfc.sharedTag";
  public static String EXTRA_AUTODISMISS = "org.webinos.impl.nfc.autoDismiss";
  public static String EXTRA_UPDATE = "org.webinos.impl.nfc.update";

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    
    Intent launchIntent = getIntent();
    if (launchIntent == null
        || launchIntent.getBooleanExtra(EXTRA_UPDATE, false)) {
      finish();
      return;
    }

    mNfcAdapter = NfcAdapter.getDefaultAdapter(this);

    mPendingIntent = PendingIntent.getActivity(this, 0, new Intent(this,
        getClass()).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP), 0);
    
    onNfcManagerIntent(launchIntent);

    setContentView(R.layout.activity_webinos_nfc);
  }

  private void updateFilter(ArrayList<NfcDiscoveryFilter> nfcFilters) {
    mFilters = null;
    List<IntentFilter> filters = new ArrayList<IntentFilter>();
    if (nfcFilters != null) {
      try {
        for (NfcDiscoveryFilter filter : nfcFilters) {
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
      if (mSharedTag != null) {
        mNfcAdapter.enableForegroundNdefPush(this, mSharedTag);
      } else {
        mNfcAdapter.disableForegroundNdefPush(this);
      }
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
      mNfcAdapter.disableForegroundNdefPush(this);
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
    if (tagFromIntent != null) {
      if (autoDismiss) {
        finish();
      }
      Intent dispatchTagIntent = new Intent(NfcManager.ACTION_DISPATCH_NFC);
      dispatchTagIntent.putExtra(NfcManager.EXTRA_TAG, tagFromIntent);
      this.sendBroadcast(dispatchTagIntent);
    } else {
      onNfcManagerIntent(intent);
      if (intent.getBooleanExtra(EXTRA_UPDATE, false) && !isResumed) {
        moveTaskToBack(true);
      }
    }
  }

  public void onNfcManagerIntent(Intent intent) {
    autoDismiss = intent.getBooleanExtra(EXTRA_AUTODISMISS, autoDismiss);
    updateFilter((ArrayList<NfcDiscoveryFilter>)intent.getSerializableExtra(EXTRA_LISTENERS));
    Object sharedTag = intent.getParcelableExtra(EXTRA_SHAREDTAG);
    if (sharedTag instanceof NdefMessage) {
      mSharedTag = (NdefMessage)sharedTag;
    } else {
      mSharedTag = null;
    }
    if (isResumed) {
      createAndSetFilter();
    }
  }
}
