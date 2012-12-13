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
 * Copyright 2011 Telecom Italia SpA
 * 
 ******************************************************************************/

#ifndef POLICYMANAGER_H_
#define POLICYMANAGER_H_

#include "Request.h"
#include "PolicySet.h"
#include "DataHandlingPreferences.h"
//#include "debug.h"

class PolicyManager{ 

private:
	PolicySet * policyDocument;
	bool validPolicyFile;
	string policyName;

public:
	pair<string, bool> selectedDHPref;
	DHPrefs* dhp;
	PolicyManager();
	PolicyManager(const string &);
	virtual ~PolicyManager();
	Effect checkRequest(Request *);
	void init(const string &);
	string getPolicyName();
};

#endif /* POLICYMANAGER_H_ */
