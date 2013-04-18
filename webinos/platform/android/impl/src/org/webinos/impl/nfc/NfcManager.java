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

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import org.webinos.impl.nfc.NfcManager.NfcDiscoveryFilter.FilterType;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Parcelable;

final class NfcManager extends BroadcastReceiver {

  private static NfcManager mInstance;
  
  public static String ACTION_DISPATCH_NFC = "org.webinos.impl.nfc.dispatchNfc";
  public static String EXTRA_TAG = "org.webinos.impl.nfc.tag";
  
  private Context ctx;

  synchronized static NfcManager getInstance(Context ctx) {
    if (mInstance == null) {
      mInstance = new NfcManager(ctx);
    }
    return mInstance;
  }

  private NfcManager(Context ctx) {
    super();
    this.ctx = ctx;
    ctx.registerReceiver(this, new IntentFilter(ACTION_DISPATCH_NFC));
  }

  static interface NfcDiscoveryListener {
    void onTagDiscovered(Object tag);
  }

  private List<NfcDiscoveryListener> mListeners = new ArrayList<NfcDiscoveryListener>();
  private Object mListenerLock = new Object();

  public void addListener(NfcDiscoveryListener listener) {
    synchronized (mListenerLock) {
      if (!mListeners.contains(listener)) {
        mListeners.add(listener);
      }
    }
  }

  public void removeListener(NfcDiscoveryListener listener) {
    synchronized (mListenerLock) {
      mListeners.remove(listener);
    }
  }

  static final class NfcDiscoveryFilter implements Serializable {

    private static final long serialVersionUID = 1L;

    enum FilterType {
      UNKNOWN, TEXT, URI, MIME
    }

    private FilterType mType;
    private String mExtra;

    public NfcDiscoveryFilter(FilterType type, String extra) {
      this.mType = type;
      this.mExtra = extra;
    }

    public NfcDiscoveryFilter(FilterType type) {
      this(type, null);
    }

    public FilterType getType() {
      return mType;
    }

    public String getExtra() {
      return mExtra;
    }

    @Override
    public int hashCode() {
      final int prime = 31;
      int result = 1;
      result = prime * result + ((mExtra == null) ? 0 : mExtra.hashCode());
      result = prime * result + ((mType == null) ? 0 : mType.hashCode());
      return result;
    }

    @Override
    public boolean equals(Object obj) {
      if (this == obj)
        return true;
      if (obj == null)
        return false;
      if (getClass() != obj.getClass())
        return false;
      NfcDiscoveryFilter other = (NfcDiscoveryFilter) obj;
      if (mType != other.mType)
        return false;
      if (mExtra == null) {
        if (other.mExtra != null)
          return false;
      } else if (!mExtra.equals(other.mExtra))
        return false;
      return true;
    }
  }

  private ArrayList<NfcDiscoveryFilter> mFilters = new ArrayList<NfcDiscoveryFilter>();
  private Object mFilterLock = new Object();

  public void addTextTypeFilter() {
    synchronized (mFilterLock) {
      mFilters.add(new NfcDiscoveryFilter(FilterType.TEXT));
    }
    updateScanningActivity();
  }

  public void addUriTypeFilter(String scheme) {
    synchronized (mFilterLock) {
      mFilters.add(new NfcDiscoveryFilter(FilterType.URI, scheme));
    }
    updateScanningActivity();
  }

  public void addMimeTypeFilter(String mimeType) {
    synchronized (mFilterLock) {
      mFilters.add(new NfcDiscoveryFilter(FilterType.MIME, mimeType));
    }
    updateScanningActivity();
  }

  public void removeTextTypeFilter() {
    synchronized (mFilterLock) {
      mFilters.remove(new NfcDiscoveryFilter(FilterType.TEXT));
    }
    updateScanningActivity();
  }

  public void removeUriTypeFilter(String scheme) {
    synchronized (mFilterLock) {
      mFilters.remove(new NfcDiscoveryFilter(FilterType.URI, scheme));
    }
    updateScanningActivity();
  }

  public void removeMimeTypeFilter(String mimeType) {
    synchronized (mFilterLock) {
      mFilters.remove(new NfcDiscoveryFilter(FilterType.MIME, mimeType));
    }
    updateScanningActivity();
  }
  
  private Parcelable mSharedTag;
  private Object mSharedTagLock = new Object();
  
  public void setSharedTag(Parcelable sharedTag) {
    synchronized (mSharedTagLock) {
      mSharedTag = sharedTag;
      updateScanningActivity();
    }
  }
  
  private Intent createScanningActivityIntent() {
    Intent scanningIntent = new Intent(ctx, WebinosNfcActivity.class);
    scanningIntent.putExtra(WebinosNfcActivity.EXTRA_SHAREDTAG, mSharedTag);
    scanningIntent.putExtra(WebinosNfcActivity.EXTRA_LISTENERS, mFilters);
    return scanningIntent;
  }
  
  private void updateScanningActivity() {
    Intent launchIntent = createScanningActivityIntent();
    launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    launchIntent.putExtra(WebinosNfcActivity.EXTRA_UPDATE, true);
    ctx.startActivity(launchIntent);
  }
  
  void launchScanningActivity(boolean autoDismiss) {
    Intent launchIntent = createScanningActivityIntent();
    launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    launchIntent.putExtra(WebinosNfcActivity.EXTRA_AUTODISMISS, autoDismiss);
    launchIntent.putExtra(WebinosNfcActivity.EXTRA_UPDATE, false);
    ctx.startActivity(launchIntent);
  }

  private void dispatchNfcEvent(Object discoveredTag) {
    synchronized (mListenerLock) {
      for (NfcDiscoveryListener listener : mListeners) {
        listener.onTagDiscovered(discoveredTag);
      }
    }
  }

  @Override
  public void onReceive(Context context, Intent intent) {
    dispatchNfcEvent(intent.getParcelableExtra(EXTRA_TAG));
  }
}
