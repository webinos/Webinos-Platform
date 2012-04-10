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
* Copyright 2012 Samsung Electronics(UK) Ltd
*
******************************************************************************/

package org.webinos.api.discovery;

import org.meshpoint.anode.idl.Dictionary;

@SuppressWarnings("serial")

public class DiscoveryError extends RuntimeException implements Dictionary {
	public static final int INVALID_ARGUMENT_ERROR = 101;
    public static final int FIND_SERVICE_CANCELED = 101;
    public static final int FIND_SERVICE_TIMEOUT = 102;
    public static final int PERMISSION_DENIED_ERROR  = 103;
    public int code; 
    public String message;
}