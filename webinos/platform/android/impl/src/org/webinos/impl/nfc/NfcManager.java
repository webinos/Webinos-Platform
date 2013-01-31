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

import org.webinos.impl.nfc.NfcManager.NfcDiscoveryFilter.FilterType;

final class NfcManager {

  private static NfcManager mInstance;

  synchronized static NfcManager getInstance() {
    if (mInstance == null) {
      mInstance = new NfcManager();
    }
    return mInstance;
  }

  private NfcManager() {
    super();
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

  static final class NfcDiscoveryFilter {

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

  private List<NfcDiscoveryFilter> mFilters = new ArrayList<NfcDiscoveryFilter>();
  private Object mFilterLock = new Object();

  NfcDiscoveryFilter[] getFilters() {
    synchronized (mFilterLock) {
      List<NfcDiscoveryFilter> filters = new ArrayList<NfcDiscoveryFilter>();
      for (NfcDiscoveryFilter filter : mFilters) {
        if (!filters.contains(filter)) {
          filters.add(filter);
        }
      }
      return filters.toArray(new NfcDiscoveryFilter[filters.size()]);
    }
  }

  public void addTextTypeFilter() {
    synchronized (mFilterLock) {
      mFilters.add(new NfcDiscoveryFilter(FilterType.TEXT));
    }
    triggerFilterMonitor();
  }

  public void addUriTypeFilter(String scheme) {
    synchronized (mFilterLock) {
      mFilters.add(new NfcDiscoveryFilter(FilterType.URI, scheme));
    }
    triggerFilterMonitor();
  }

  public void addMimeTypeFilter(String mimeType) {
    synchronized (mFilterLock) {
      mFilters.add(new NfcDiscoveryFilter(FilterType.MIME, mimeType));
    }
    triggerFilterMonitor();
  }

  public void removeTextTypeFilter() {
    synchronized (mFilterLock) {
      mFilters.remove(new NfcDiscoveryFilter(FilterType.TEXT));
    }
    triggerFilterMonitor();
  }

  public void removeUriTypeFilter(String scheme) {
    synchronized (mFilterLock) {
      mFilters.remove(new NfcDiscoveryFilter(FilterType.URI, scheme));
    }
    triggerFilterMonitor();
  }

  public void removeMimeTypeFilter(String mimeType) {
    synchronized (mFilterLock) {
      mFilters.remove(new NfcDiscoveryFilter(FilterType.MIME, mimeType));
    }
    triggerFilterMonitor();
  }
  
  private Object mSharedTag;
  private Object mSharedTagLock = new Object();
  
  public void setSharedTag(Object sharedTag) {
    synchronized (mSharedTagLock) {
      mSharedTag = sharedTag;
      triggerFilterMonitor();
    }
  }
  
  public Object getSharedTag() {
    synchronized (mSharedTagLock) {
      return mSharedTag;
    }
  }

  static interface FilterMonitor {
    void onListenersUpdated();
  }

  private FilterMonitor mFilterMonitor;
  private Object mFilterMonitorLock = new Object();

  void setFilterMonitor(FilterMonitor filterMonitor) {
    synchronized (mFilterMonitorLock) {
      mFilterMonitor = filterMonitor;
      triggerFilterMonitor();
    }
  }

  private void triggerFilterMonitor() {
    synchronized (mFilterMonitorLock) {
      if (mFilterMonitor != null) {
        mFilterMonitor.onListenersUpdated();
      }
    }
  }

  void dispatchNfcEvent(Object discoveredTag) {
    synchronized (mListenerLock) {
      for (NfcDiscoveryListener listener : mListeners) {
        listener.onTagDiscovered(discoveredTag);
      }
    }
  }
}
