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
 * Copyright 2011-2012 Paddy Byers
 *
 ******************************************************************************/

package org.webinos.impl.nfc;

@SuppressWarnings("serial")
public class NfcException extends Exception {
  public static final int UNKNOWN_ERR = 0;
  public static final int UNSUPPORTED_ERR = 1;
  public static final int IO_ERR = 2;

  public int code;

  public NfcException(int code, String message) {
    super(message);
    this.code = code;
  }

  public NfcException(String message) {
    super(message);
  }
}
