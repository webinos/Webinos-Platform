package org.webinos.impl.nfc;

import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

import org.meshpoint.anode.java.ByteArray;
import org.webinos.api.nfc.NdefRecord;
import org.webinos.api.nfc.NfcEventListener;
import org.webinos.api.nfc.NfcTag;
import org.webinos.api.nfc.NfcTagTechnologyNdef;

final class NfcManager {

  private static NfcManager mInstance;  
  
  private static String[] uriPrefixes = { "", "http://www.", "https://www.",
      "http://", "https://", "tel:", "mailto:", "ftp://anonymous:anonymous@",
      "ftp://ftp.", "ftps://", "sftp://", "smb://", "nfs://", "ftp://",
      "dav://", "news:", "telnet://", "imap:", "rtsp://", "urn:", "pop:",
      "sip:", "sips:", "tftp:", "btspp://", "btl2cap://", "btgoep://",
      "tcpobex://", "irdaobex://", "file://", "urn:epc:id:", "urn:epc:tag:",
      "urn:epc:pat:", "urn:epc:raw:", "urn:epc:", "urn:nfc:" };
  
  synchronized static NfcManager getInstance() {
    if (mInstance == null) {
      mInstance = new NfcManager();
    }
    return mInstance;
  }

  private NfcManager() {
    super(); 
  }

  enum ListenerType {
    UNKNOWN, TEXT, URI, MIME
  }

  static final class ListenerKey {
    private ListenerType mType;
    private String mExtra;
    
    public ListenerKey(ListenerType type, String extra) {
      this.mType = type;
      this.mExtra = extra;
    }
    
    public ListenerKey(ListenerType type) {
      this(type, null);
    }
    
    public ListenerType getType() {
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
      ListenerKey other = (ListenerKey) obj;
      if (mExtra == null) {
        if (other.mExtra != null)
          return false;
      } else if (!mExtra.equals(other.mExtra))
        return false;
      if (mType != other.mType)
        return false;
      return true;
    }
  }
  
  private static final class ListenerWrapper {
    
    private ListenerKey mKey;
    private NfcEventListener mListener;

    public ListenerWrapper(ListenerKey key, NfcEventListener listener) {
      this.mKey = key;
      this.mListener = listener;
    }

    public ListenerKey getKey() {
      return mKey;
    }
    
    public NfcEventListener getListener() {
      return mListener;
    }

    @Override
    public int hashCode() {
      return mListener == null ? 0 : mListener.hashCode();
    }

    @Override
    public boolean equals(Object obj) {
      if (this == obj)
        return true;
      if (obj == null)
        return false;
      if (getClass() != obj.getClass())
        return false;
      ListenerWrapper other = (ListenerWrapper) obj;
      if (mListener == null) {
        if (other.mListener != null)
          return false;
      } else if (!mListener.equals(other.mListener))
        return false;
      return true;
    }
  }

  private List<ListenerWrapper> mListeners = new ArrayList<ListenerWrapper>();
  private Object mListenerLock = new Object();

  static interface ListenerMonitor {
    void onListenersUpdated();
  }

  private ListenerMonitor mListenerMonitor;
  private Object mListenerMonitorLock = new Object();

  void setListenerMonitor(ListenerMonitor listenerMonitor) {
    mListenerMonitor = listenerMonitor;
    triggerMonitorListener();
  }
  
  private void triggerMonitorListener() {
    synchronized (mListenerMonitorLock) {
      if (mListenerMonitor != null) {
        mListenerMonitor.onListenersUpdated();
      }
    }
  }

  ListenerKey[] getListeners() {
    synchronized (mListenerLock) {
      ListenerKey[] listeners = new ListenerKey[mListeners.size()];
      int i = 0;
      for (ListenerWrapper listener : mListeners) {
        listeners[i++] = listener.mKey;
      }
      return listeners;
    }
  }

  public void addTextTypeListener(NfcEventListener listener) {
    synchronized (mListenerLock) {
      mListeners.add(new ListenerWrapper(new ListenerKey(ListenerType.TEXT), listener));
    }
    triggerMonitorListener();
  }

  public void addUriTypeListener(String scheme, NfcEventListener listener) {
    synchronized (mListenerLock) {
      mListeners.add(new ListenerWrapper(new ListenerKey(ListenerType.URI, scheme), listener));
    }
    triggerMonitorListener();
  }

  public void addMimeTypeListener(String mimeType, NfcEventListener listener) {
    synchronized (mListenerLock) {
      mListeners.add(new ListenerWrapper(new ListenerKey(ListenerType.MIME,
          mimeType), listener));
    }
    triggerMonitorListener();
  }

  public void removeListener(NfcEventListener listener) {
    boolean changed = false;
    synchronized (mListenerLock) {
      for (ListenerWrapper listenerWrapper : mListeners) {
        if (listenerWrapper.getListener().equals(listener)) {
          mListeners.remove(listenerWrapper);
          changed = true;
        }
      }
    }
    if (changed) {
      triggerMonitorListener();
    }
  }
  
  public static NdefRecord createTextNdefRecord(String lang, String text) {
    try {
      byte[] textBytes  = text.getBytes();
      byte[] langBytes  = lang.getBytes("US-ASCII");
      byte[] payload    = new byte[1 + langBytes.length + textBytes.length];
      
      // set status byte (see NDEF spec for actual bits)
      payload[0] = (byte) langBytes.length;

      System.arraycopy(langBytes, 0, payload, 1, langBytes.length);
      System.arraycopy(textBytes, 0, payload, 1 + langBytes.length, textBytes.length);
      
      NdefRecord result = new NdefRecord();
      result.id = new String(new byte[0]);
      result.TNF = NdefRecord.TNF_WELL_KNOWN;
      result.type = new String(NdefRecord.RTD_TEXT);
      result.payload = new ByteArray(payload);
      result.info = text;
      return result;
    } catch (UnsupportedEncodingException e) {
      return null;
    }
  }

  public static NdefRecord createMimeNdefRecord(String mimeType, byte[] mimeData) {
    NdefRecord result = new NdefRecord();
    result.id = new String(new byte[0]);
    result.TNF = NdefRecord.TNF_MIME_MEDIA;
    result.type = mimeType;
    result.payload = new ByteArray(mimeData);
    result.info = new String(mimeData);
    return result;
  }

  public static NdefRecord createUriNdefRecord(String uri) {
    byte[] uriBytes  = uri.getBytes();
    byte[] payload = new byte[1 + uriBytes.length];
    
    payload[0] = uriCodeFromUri(uri);

    System.arraycopy(uriBytes, 0, payload, 1, uriBytes.length);
    
    NdefRecord result = new NdefRecord();
    result.id = new String(new byte[0]);
    result.TNF = NdefRecord.TNF_WELL_KNOWN;
    result.type = new String(NdefRecord.RTD_URI);
    result.payload = new ByteArray(payload);
    result.info = uri;
    return result;
  }
  
  static NdefRecord createNdefRecord(String id, int TNF, String type,
      byte[] payload) {
    NdefRecord result = new NdefRecord();
    result.id = id;
    result.TNF = TNF;
    result.type = type;
    result.payload = new ByteArray(payload);
    if (typeOfNdef(TNF, type).equals(ListenerType.TEXT)) {
      int langBytesLength = (payload[0] & 0x3F);
      byte[] textBytes = new byte[payload.length - (1 + langBytesLength)];
      System.arraycopy(payload, 1 + langBytesLength, textBytes, 0, textBytes.length);
      result.info = new String(textBytes);
    } else if (typeOfNdef(TNF, type).equals(ListenerType.URI)) {
      byte uriIdentifierCode = payload[0];
      byte[] uriBytes = new byte[payload.length - 1];
      System.arraycopy(payload, 1, uriBytes, 0, uriBytes.length);
      result.info = uriPrefixFromCode(uriIdentifierCode) + new String(uriBytes);
    } else if (typeOfNdef(TNF, type).equals(ListenerType.MIME)) {
      result.info = new String(payload);
    }

    return result;
  }
  
  private static ListenerType typeOfNdef(int TNF, String type) {
    if (TNF == NdefRecord.TNF_WELL_KNOWN
        && Arrays.equals(type.getBytes(), NdefRecord.RTD_TEXT)) {
      return ListenerType.TEXT;
    } else if (TNF == NdefRecord.TNF_WELL_KNOWN
        && Arrays.equals(type.getBytes(), NdefRecord.RTD_URI)) {
      return ListenerType.URI;
    } else if (TNF == NdefRecord.TNF_MIME_MEDIA) {
      return ListenerType.MIME;
    }
    return ListenerType.UNKNOWN;
  }
  
  private static String uriPrefixFromCode(byte uriIdentifierCode) {
    if (uriIdentifierCode < uriPrefixes.length) {
      return uriPrefixes[uriIdentifierCode];
    }
    return "";
  }
  
  private static byte uriCodeFromUri(String uri) {
    int i = 1;
    for (String prefix : uriPrefixes) {
      if (uri.startsWith(prefix)) {
        return (byte)i;
      }
      i++;
    }
    return 0;
  }

  void dispatchNfcEvent(NfcTag discoveredTag) {
    List<ListenerKey> listenersToTrigger = new ArrayList<ListenerKey>();
    //NfcTagTechnologyNdef webinosNdefTech = discoveredTag.tech;
    //NdefRecord[] ndefMsg = webinosNdefTech.readCachedNdefMessage();
    if (discoveredTag.ndefMessage != null) {
      for (NdefRecord ndefRecord : discoveredTag.ndefMessage) {
        if (typeOfNdef(ndefRecord.TNF, ndefRecord.type).equals(
            ListenerType.TEXT)) {
          listenersToTrigger.add(new ListenerKey(ListenerType.TEXT, null));
        } else if (typeOfNdef(ndefRecord.TNF, ndefRecord.type).equals(
            ListenerType.URI)) {
          try {
            listenersToTrigger.add(new ListenerKey(ListenerType.URI, new URI(
                ndefRecord.info).getScheme()));
          } catch (URISyntaxException e) {
          }
        } else if (typeOfNdef(ndefRecord.TNF, ndefRecord.type).equals(
            ListenerType.MIME)) {
          listenersToTrigger.add(new ListenerKey(ListenerType.MIME,
              ndefRecord.type));
        }
      }
    }
    triggerListeners(listenersToTrigger, discoveredTag);
  }
  
  private void triggerListeners(List<ListenerKey> listenersToTrigger, NfcTag event) {
    for (ListenerKey listenerToTrigger : listenersToTrigger) {
    for (ListenerWrapper listener : mListeners) {
      if (listener.getKey().getType().equals(listenerToTrigger.getType())) {
        if (listenerToTrigger.getExtra() != null) {
          if (listenerToTrigger.getType().equals(ListenerType.MIME)) {
            if (mimeTypeMatches(listenerToTrigger.getExtra(), listener.getKey().getExtra())) {
              listener.getListener().handleEvent(event);
            }
          } else {
            if (listenerToTrigger.getExtra().equals(listener.getKey().getExtra())) {
              listener.getListener().handleEvent(event);
            }
          }
        } else {
          listener.getListener().handleEvent(event);
        }
      }
    }
    }
  }

  private boolean mimeTypeMatches(String mimeType, String matchAgainst) {
    Pattern p = Pattern.compile(matchAgainst.replaceAll("\\*", "\\.\\*"),
        Pattern.CASE_INSENSITIVE);
    return p.matcher(mimeType).matches();
  }

}
