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

package org.webinos.app.wrt.channel;

public class ProtocolConstants {
	/* Message types between client and server */
	public static final int MSG_REGISTER   = 0;
	public static final int MSG_UNREGISTER = 1;
	public static final int MSG_CONNECT    = 2;
	public static final int MSG_DISCONNECT = 3;
	public static final int MSG_DATA       = 4;

    /* Conversions to put both message type and client Id in the what field */
	public static int toWhat(int msg, int id) { return msg + (id << 16); }
	public static int whatToMsg(int what) { return what & 0xffff; }
	public static int whatToId(int what) { return what >> 16; }
}
