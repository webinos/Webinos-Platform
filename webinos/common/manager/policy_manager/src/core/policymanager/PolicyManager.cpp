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

#include "PolicyManager.h"
#include "../../debug.h"

PolicyManager::PolicyManager() {}

PolicyManager::PolicyManager(const string & policyFileName){
	
	TiXmlDocument doc(policyFileName);
	LOGD("Policy manager file : %s",policyFileName.data());

	if (doc.LoadFile())
	{
		LOGD("Policy manager file load ok");
		validPolicyFile = true;
		TiXmlElement * element = (TiXmlElement *)doc.RootElement();
		if(element->ValueStr() == "policy"){
			policyDocument = new PolicySet(new Policy(element));
		}
		else if(element->ValueStr() == "policy-set"){
			policyDocument = new PolicySet(element);
		}
		policyName = policyDocument->description;
	}
	else{
		validPolicyFile = false;
		LOGD("[PolicyManager] Policy file not found");
		policyName = "no_name";
	}
/*	
	if(policyDocument){
		policyName = policyDocument->description;
	}
	else{
		policyName = "no_name";
	}
*/
	LOGD("Policy manager ctor finish");
}

PolicyManager::~PolicyManager() {}

string PolicyManager::getPolicyName(){
	return policyName;
}

Effect PolicyManager::checkRequest(Request * req){
	LOGD("Policy manager start check");
	if(validPolicyFile)
		return policyDocument->evaluate(req);
	else
		return INAPPLICABLE;
}
