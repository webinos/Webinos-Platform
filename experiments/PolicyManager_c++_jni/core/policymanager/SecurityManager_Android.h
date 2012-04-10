/*******************************************************************************
 * Copyright 2010 Telecom Italia SpA
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
 ******************************************************************************/

#ifndef SECURITYMANAGER_ANDROID_H_
#define SECURITYMANAGER_ANDROID_H_
#include <stdlib.h>
#include "SecurityManager.h"
#include "crypto/CryptoManager_Android.h"

class SecurityManager_Android : public SecurityManager
	{
private:
	void setCryptoManagerInstance();

public:
	SecurityManager_Android(const string &);
	virtual ~SecurityManager_Android();
	Action promptToUser(Effect,map<string, vector<string>*>&);	
	
	Effect check_INSTALL(Request*);
	Effect check_LOAD(Request*);
	Effect check_INVOKE(Request*);

	string handleEffect(Effect effect, Request* req) ;
};

#endif /* SECURITYMANAGER_ANDROID_H_ */
