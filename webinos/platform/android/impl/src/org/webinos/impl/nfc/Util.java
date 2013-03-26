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
