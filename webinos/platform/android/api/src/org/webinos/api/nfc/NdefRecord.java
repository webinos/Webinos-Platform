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

package org.webinos.api.nfc;

import org.meshpoint.anode.idl.Dictionary;
import org.w3c.dom.ByteArray;

public class NdefRecord implements Dictionary {
  public static final int TNF_EMPTY = 0x00;
  public static final int TNF_WELL_KNOWN = 0x01;
  public static final int TNF_MIME_MEDIA = 0x02;
  public static final int TNF_ABSOLUTE_URI = 0x03;
  public static final int TNF_EXTERNAL_TYPE = 0x04;
  public static final int TNF_UNKNOWN = 0x05;
  public static final int TNF_UNCHANGED = 0x06;
  public static final int TNF_RESERVED = 0x07;

  public static final byte[] RTD_TEXT = { 0x54 }; // "T"
  public static final byte[] RTD_URI = { 0x55 }; // "U"
  public static final byte[] RTD_SMART_POSTER = { 0x53, 0x70 }; // "Sp"
  public static final byte[] RTD_ALTERNATIVE_CARRIER = { 0x61, 0x63 }; // "ac"
  public static final byte[] RTD_HANDOVER_CARRIER = { 0x48, 0x63 }; // "Hc"
  public static final byte[] RTD_HANDOVER_REQUEST = { 0x48, 0x72 }; // "Hr"
  public static final byte[] RTD_HANDOVER_SELECT = { 0x48, 0x73 }; // "Hs"

  public int TNF;
  public String type;
  public String id;
  public ByteArray payload;
  public String info;
}
