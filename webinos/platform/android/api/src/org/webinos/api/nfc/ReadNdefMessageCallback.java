package org.webinos.api.nfc;

public interface ReadNdefMessageCallback {
  void onMessage(NdefRecord[] ndefMessage);
}
