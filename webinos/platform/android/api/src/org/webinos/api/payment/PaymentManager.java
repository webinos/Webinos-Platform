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
* Copyright 2011-2012 Toby Ealden
*
******************************************************************************/

package org.webinos.api.payment;

import org.meshpoint.anode.bridge.Env;
import org.meshpoint.anode.java.Base;

public abstract class PaymentManager extends Base {
	private static short classId = Env.getInterfaceId(PaymentManager.class);
	protected PaymentManager() { super(classId); }

	public abstract void pay(PaymentSuccessCB successCallback, PaymentErrorCB errorCallback, PaymentChallengeCB challengeCallback, ShoppingItem [] itemList, ShoppingItem bill, String customerID, String sellerID);
}
