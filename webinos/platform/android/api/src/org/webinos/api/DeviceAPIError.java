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

package org.webinos.api;

import java.util.HashMap;

@SuppressWarnings("serial")
public class DeviceAPIError extends RuntimeException {
	public static final int UNKNOWN_ERR                 = 0;
	public static final int INDEX_SIZE_ERR              = 1;
	public static final int DOMSTRING_SIZE_ERR          = 2;
	public static final int HIERARCHY_REQUEST_ERR       = 3;
	public static final int WRONG_DOCUMENT_ERR          = 4;
	public static final int INVALID_CHARACTER_ERR       = 5;
	public static final int NO_DATA_ALLOWED_ERR         = 6;
	public static final int NO_MODIFICATION_ALLOWED_ERR = 7;
	public static final int NOT_FOUND_ERR               = 8;
	public static final int NOT_SUPPORTED_ERR           = 9;
	public static final int INUSE_ATTRIBUTE_ERR         = 10;
	public static final int INVALID_STATE_ERR           = 11;
	public static final int SYNTAX_ERR                  = 12;
	public static final int INVALID_MODIFICATION_ERR    = 13;
	public static final int NAMESPACE_ERR               = 14;
	public static final int INVALID_ACCESS_ERR          = 15;
	public static final int VALIDATION_ERR              = 16;
	public static final int TYPE_MISMATCH_ERR           = 17;
	public static final int SECURITY_ERR                = 18;
	public static final int NETWORK_ERR                 = 19;
	public static final int ABORT_ERR                   = 20;
	public static final int TIMEOUT_ERR                 = 21;
	public static final int INVALID_VALUES_ERR          = 22;
	public static final int INVALID_ERROR               = 23;
	public static final int IO_ERR                      = 100;
	public static final int NOT_AVAILABLE_ERR           = 101;

	public int code;
	public String message;
	
	private static HashMap<String, String> defaultMsg = new HashMap<String, String>();
	
	static {
		defaultMsg.put("0",   "UNKNOWN_ERR");
		defaultMsg.put("1",   "INDEX_SIZE_ERR");
		defaultMsg.put("2",   "DOMSTRING_SIZE_ERR");
		defaultMsg.put("3",   "HIERARCHY_REQUEST_ERR");
		defaultMsg.put("4",   "WRONG_DOCUMENT_ERR");
		defaultMsg.put("5",   "INVALID_CHARACTER_ERR");
		defaultMsg.put("6",   "NO_DATA_ALLOWED_ERR");
		defaultMsg.put("7",   "NO_MODIFICATION_ALLOWED_ERR");
		defaultMsg.put("8",   "NOT_FOUND_ERR");
		defaultMsg.put("9",   "NOT_SUPPORTED_ERR");
		defaultMsg.put("10",  "INUSE_ATTRIBUTE_ERR");
		defaultMsg.put("11",  "INVALID_STATE_ERR");
		defaultMsg.put("12",  "SYNTAX_ERR");
		defaultMsg.put("13",  "INVALID_MODIFICATION_ERR");
		defaultMsg.put("14",  "NAMESPACE_ERR");
		defaultMsg.put("15",  "INVALID_ACCESS_ERR");
		defaultMsg.put("16",  "VALIDATION_ERR");
		defaultMsg.put("17",  "TYPE_MISMATCH_ERR");
		defaultMsg.put("18",  "SECURITY_ERR");
		defaultMsg.put("19",  "NETWORK_ERR");
		defaultMsg.put("20",  "ABORT_ERR");
		defaultMsg.put("21",  "TIMEOUT_ERR");
		defaultMsg.put("22",  "INVALID_VALUES_ERR");
		defaultMsg.put("23",  "INVALID_ERROR");
		defaultMsg.put("100", "IO_ERR");
		defaultMsg.put("101", "NOT_AVAILABLE_ERR");
	}

	public DeviceAPIError(int code) {
		this.code = code;
		this.message = defaultMsg.get(String.valueOf(code).intern());
	}

	public DeviceAPIError(int code, String message) {
		this.code = code;
		this.message = message;
	}

	@Override
	public String getMessage() {
		return message;
	}
}
