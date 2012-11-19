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

import org.webinos.api.ErrorCallback;
import org.webinos.api.PendingOperation;
import org.webinos.api.SuccessCallback;
import org.webinos.api.nfc.NFCTagTechnologyNdef;
import org.webinos.api.nfc.NdefMessage;
import org.webinos.api.nfc.NdefSuccessCallback;
import org.webinos.api.nfc.NfcError;

public class NdefImpl extends NFCTagTechnologyNdef {

	@Override
	public PendingOperation makeReadOnly(SuccessCallback successCallback,
			ErrorCallback errorCallback) throws NfcError {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public NdefMessage readCachedNdefMessage() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public PendingOperation readNdefMessage(
			NdefSuccessCallback successCallback, ErrorCallback errorCallback)
			throws NfcError {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public PendingOperation writeNdefMessage(SuccessCallback successCallback,
			ErrorCallback errorCallback, NdefMessage message) throws NfcError {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public NdefMessage createNdefMessage() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void connect() {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void close() {
		// TODO Auto-generated method stub
		
	}

}
