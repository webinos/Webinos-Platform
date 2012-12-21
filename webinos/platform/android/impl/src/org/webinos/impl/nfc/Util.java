package org.webinos.impl.nfc;

import java.io.UnsupportedEncodingException;

import org.meshpoint.anode.java.ByteArray;
import org.webinos.api.nfc.NdefRecord;

public class Util {
  private static String[] uriPrefixes = { "", "http://www.", "https://www.",
      "http://", "https://", "tel:", "mailto:", "ftp://anonymous:anonymous@",
      "ftp://ftp.", "ftps://", "sftp://", "smb://", "nfs://", "ftp://",
      "dav://", "news:", "telnet://", "imap:", "rtsp://", "urn:", "pop:",
      "sip:", "sips:", "tftp:", "btspp://", "btl2cap://", "btgoep://",
      "tcpobex://", "irdaobex://", "file://", "urn:epc:id:", "urn:epc:tag:",
      "urn:epc:pat:", "urn:epc:raw:", "urn:epc:", "urn:nfc:" };

  public static NdefRecord createTextNdefRecord(String lang, String text) {
    try {
      byte[] textBytes = text.getBytes();
      byte[] langBytes = lang.getBytes("US-ASCII");
      byte[] payload = new byte[1 + langBytes.length + textBytes.length];

      // set status byte (see NDEF spec for actual bits)
      payload[0] = (byte) langBytes.length;

      System.arraycopy(langBytes, 0, payload, 1, langBytes.length);
      System.arraycopy(textBytes, 0, payload, 1 + langBytes.length,
          textBytes.length);

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
    byte[] uriBytes = uri.getBytes();
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

  public static String uriPrefixFromCode(byte uriIdentifierCode) {
    if (uriIdentifierCode < uriPrefixes.length) {
      return uriPrefixes[uriIdentifierCode];
    }
    return "";
  }

  public static byte uriCodeFromUri(String uri) {
    int i = 1;
    for (String prefix : uriPrefixes) {
      if (uri.startsWith(prefix)) {
        return (byte) i;
      }
      i++;
    }
    return 0;
  }
}
