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

PolicyManager::PolicyManager()
	:dhp(0)
{}

PolicyManager::PolicyManager(const string & policyFileName)
	:dhp(0)
{

	TiXmlDocument doc(policyFileName);
	LOGD("Policy manager file : %s",policyFileName.data());

	if (doc.LoadFile())
	{
		dhp = new DHPrefs();
		LOGD("Policy manager file load ok");
		validPolicyFile = true;
		TiXmlElement * element = (TiXmlElement *)doc.RootElement();
		if(element->ValueStr() == "policy"){
			policyDocument = new PolicySet(new Policy(element, dhp));
			LOGD("DHPref number after Policy element creation: %d", (*dhp).size());
		}
		else if(element->ValueStr() == "policy-set"){
			policyDocument = new PolicySet(element, dhp);
			LOGD("DHPref number after PolicySet element creation: %d", (*dhp).size());
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

PolicyManager::~PolicyManager() {
	for (map<string, DataHandlingPreferences*>::iterator it = dhp->begin(); it != dhp->end(); it++)
		delete (*it).second;
}

string PolicyManager::getPolicyName(){
	return policyName;
}

Effect PolicyManager::checkRequest(Request * req){
	Effect xacml_eff;
	bool dhp_eff = false;
	int features = 0;
	vector<bool> purpose = req->getPurposeAttrs();

	LOGD("Policy manager start check");
	if(validPolicyFile) {
		selectedDHPref.first.clear();
		selectedDHPref.second = false;
		xacml_eff = policyDocument->evaluate(req, &selectedDHPref);
		LOGD("XACML response: %d", xacml_eff);

		// valid purposes vector
		if (purpose.size() == arraysize(ontology_vector)) {
			LOGD("PolicyManager: valid purposes vector");

			// in ProvisionalAction tags a single resouce requires a single DHPref
			// no more than one resouce must be used in non installation enforceRequest call
			if ((req->getResourceAttrs()).count(API_FEATURE) == 1) {
				features = (req->getResourceAttrs())[API_FEATURE]->size();
			}
			if (features == 1){
				LOGD("One feature requested, DHPref evaluation started");
				if (selectedDHPref.first.empty() == false) {
					LOGD("Selected DHPref: %s", selectedDHPref.first.c_str());
					DHPrefs::iterator it;
					it=(*dhp).find(selectedDHPref.first);
					if (it == (*dhp).end()){
						LOGD("DHPref: %s not found", selectedDHPref.first.c_str());
					}
					else {	
						LOGD("DHPref: %s found", selectedDHPref.first.c_str());
						dhp_eff = (*dhp)[selectedDHPref.first]->evaluate(req);
					}
				}
			}
			// in installation enforceRequest call more resource parameters can be used
			// the result of Data handling preferences evaluation is set to true because
			// the XACML response only is significant
			else {
				LOGD("%d features requested, DHPref evaluation skipped", features);
				dhp_eff = true;
			}
		}
		// invalid purposes vector
		else {
			LOGD("PolicyManager: invalid purposes vector");
		}

		if (dhp_eff == true){
			LOGD("DHP response: true");
		}
		else
			LOGD("DHP response: false");

		if (xacml_eff == PERMIT && dhp_eff == false){
			LOGD("XACML-DHPref combined response: %d", PROMPT_BLANKET);
			return PROMPT_BLANKET;
		}
		else {
			LOGD("XACML-DHPref combined response: %d", xacml_eff);
			return xacml_eff;
		}
	}
	else
		return INAPPLICABLE;
}
