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

package org.webinos.api.mediacapture;

import org.meshpoint.anode.idl.Dictionary;

public class CaptureError implements Dictionary {
	public static final int CAPTURE_INTERNAL_ERR = 0;
	public static final int CAPTURE_APPLICATION_BUSY = 1;
	public static final int CAPTURE_INVALID_ARGUMENT = 2;
	public static final int CAPTURE_NO_MEDIA_FILES = 3;

	public int code;
}
