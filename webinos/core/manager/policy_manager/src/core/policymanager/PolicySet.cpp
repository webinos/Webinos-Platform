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

#include "PolicySet.h"
#include "../../debug.h"

PolicySet::PolicySet(TiXmlElement* set, DHPrefs* dhp)
	: IPolicyBase(set), datahandlingpreferences(dhp)
{
	iType = POLICY_SET;
	policyCombiningAlgorithm = (set->Attribute("combine")!=NULL) ? set->Attribute("combine") : deny_overrides_algorithm;
	
	//init subjects
	TiXmlNode * target = set->FirstChild("target");
	if(target){
		for(TiXmlElement * child = (TiXmlElement*)target->FirstChild("subject"); child;
				child = (TiXmlElement*)child->NextSibling() ) {
			subjects.push_back(new Subject(child));
		}
	}

	//init datahandlingpreferences
	for(TiXmlElement * child = static_cast<TiXmlElement*>(set->FirstChild(dhPrefTag)); child;
			child = static_cast<TiXmlElement*>(child->NextSibling(dhPrefTag)) ) {
		LOGD("PolicySet: DHPref %s found", child->Attribute(policyIdTag.c_str()));
		(*dhp)[child->Attribute(policyIdTag.c_str())]=new DataHandlingPreferences(child);
	}
	LOGD("PolicySet DHPref number: %d", (*dhp).size());

	//init ProvisionalActions
	for(TiXmlElement * child = static_cast<TiXmlElement*>(set->FirstChild(provisionalActionsTag)); child;
			child = static_cast<TiXmlElement*>(child->NextSibling(provisionalActionsTag)) ) {
		LOGD("PolicySet: ProvisionalActions found");
		provisionalactions.push_back(new ProvisionalActions(child));
	}

	for(TiXmlNode * node = (TiXmlNode*)set->FirstChild(); node;
			node = (TiXmlNode*)node->NextSibling() ) {
		
		TiXmlElement * child = (TiXmlElement*)(node);//dynamic_cast<TiXmlElement*>(node);
		if(child == NULL)
			continue;
	
		if(child->ValueStr() == "policy-set"){
			PolicySet * set = new PolicySet(child, dhp);
			policysets.push_back(set);
			sortArray.push_back(set);
		}
		else if(child->ValueStr() == "policy"){
			Policy * policy = new Policy(child, dhp);
			policies.push_back(policy);
			sortArray.push_back(policy);
		}
	}

//	LOGD("[PolicySet]  : subjects size : %d",subjects.size());
//	LOGD("[PolicySet]  : policies size : %d",policies.size());
//	LOGD("[PolicySet]  : policysets size : %d",policysets.size());
}

PolicySet::PolicySet(IPolicyBase* policy) : IPolicyBase(policy){
	iType = POLICY_SET;
	policyCombiningAlgorithm = deny_overrides_algorithm;
	policies.push_back((Policy*)policy);
	sortArray.push_back(policy);
	this->description = policy->description;
}

PolicySet::~PolicySet() {
	for (vector<ProvisionalActions*>::iterator it = provisionalactions.begin(); it != provisionalactions.end(); it++)
		delete *it;
}


bool PolicySet::matchSubject(Request* req){
	
	if(subjects.size() == 0)
		return true;
	else
		for(unsigned int i=0; i<subjects.size(); i++){
			if(subjects[i]->match(req))
				return true;
		}
	return false;
}

Effect PolicySet::evaluatePolicies(Request* req, pair<string, bool>* selectedDHPref){

	Effect eff;
	
	for(unsigned int i=0; i<policies.size(); i++){
		LOGD("policies[%d] = %s",i,policies[i]->description.data());
	}
	
 	if(req->getResourceAttrs().size() == 0){
		return PERMIT;
	}

	if(policyCombiningAlgorithm == deny_overrides_algorithm){
		LOGD("[PolicySet] deny_overrides algorithm");
		int effects_result[] = {0,0,0,0,0,0,0};
		for(unsigned int i=0; i<sortArray.size(); i++){
			effects_result[sortArray[i]->evaluate(req, selectedDHPref)]++;

			selectDHPref(req, selectedDHPref);

			if(effects_result[DENY] > 0)
				return DENY;
		}
/*		
		for(int i=0; i<policies.size(); i++){
			effects_result[policies[i]->evaluate(req)]++;
			if(effects_result[DENY] > 0)
				return DENY;
		}

//		PolicySets evaluation		
		for(int i=0; i<policysets.size(); i++){
			effects_result[policysets[i]->evaluate(req)]++;
			if(effects_result[DENY] > 0)
				return DENY;
		}
*/
/*		
		LOG("[PolicySet] (0) PERMIT "<<effects_result[0]);
		LOG("[PolicySet] (1) DENY "<<effects_result[1]);
		LOG("[PolicySet] (2) ONESHOT "<<effects_result[2]);
		LOG("[PolicySet] (3) SESSION "<<effects_result[3]);
		LOG("[PolicySet] (4) BLANKET "<<effects_result[4]);
		LOG("[PolicySet] (5) UNDETERMINED "<<effects_result[5]);
*/		
		if(effects_result[UNDETERMINED])
			return UNDETERMINED;
		if(effects_result[PROMPT_ONESHOT])
			return PROMPT_ONESHOT;
		if(effects_result[PROMPT_SESSION])
			return PROMPT_SESSION;
		if(effects_result[PROMPT_BLANKET])
			return PROMPT_BLANKET;
		if(effects_result[PERMIT])
			return PERMIT;
		return INAPPLICABLE;		
	}
	else if(policyCombiningAlgorithm == permit_overrides_algorithm){
		LOGD("[PolicySet] permit_overrides algorithm");
		int effects_result[] = {0,0,0,0,0,0,0};
		
		for(unsigned int i=0; i<sortArray.size(); i++){
			effects_result[sortArray[i]->evaluate(req, selectedDHPref)]++;

			selectDHPref(req, selectedDHPref);

			if(effects_result[PERMIT] > 0)
				return PERMIT;
		}
/*		
		for(int i=0; i<policies.size(); i++){
			effects_result[policies[i]->evaluate(req)]++;
			if(effects_result[PERMIT] > 0)
				return PERMIT;
		}
		
//		PolicySets evaluation		
		for(int i=0; i<policysets.size(); i++){
			effects_result[policysets[i]->evaluate(req)]++;
			if(effects_result[PERMIT] > 0)
				return PERMIT;
		}
*/		
		if(effects_result[UNDETERMINED])
			return UNDETERMINED;
		if(effects_result[PROMPT_BLANKET])
			return PROMPT_BLANKET;
		if(effects_result[PROMPT_SESSION])
			return PROMPT_SESSION;
		if(effects_result[PROMPT_ONESHOT])
			return PROMPT_ONESHOT;
		if(effects_result[DENY])
			return DENY;
		return INAPPLICABLE;
	}
	else if(policyCombiningAlgorithm == first_matching_target_algorithm){
		LOGD("[PolicySet] first_matching_target algorithm");
		for(unsigned int i=0; i<sortArray.size(); i++){
			LOGD("[PolicySet] try eval %s",sortArray[i]->description.data());
			if(sortArray[i]->matchSubject(req)){
				LOGD("[PolicySet] eval %s",sortArray[i]->description.data());
				eff = sortArray[i]->evaluate(req, selectedDHPref);

				selectDHPref(req, selectedDHPref);

				return eff;
			}
		}
		return INAPPLICABLE;
        }
	return INAPPLICABLE;
}

Effect PolicySet::evaluate(Request * req, pair<string, bool>* selectedDHPref){
	if(matchSubject(req)){
		if(policies.size()==	0 && policysets.size()==0){
			return PERMIT;
		}
		else{
			return evaluatePolicies(req, selectedDHPref);	
		}
	}
	else
		return INAPPLICABLE;	
}

void PolicySet::selectDHPref(Request* req, pair<string, bool>* selectedDHPref){
	pair<string, bool> preferenceid;

	if((*selectedDHPref).second == false) {
		// search for a provisional action with a resource matching the request
		LOGD("PolicySet: looking for DHPref in %d ProvisionalActions",provisionalactions.size());
		for(unsigned int i=0; i<provisionalactions.size(); i++){
			LOGD("PolicySet: ProvisionalActions %d evaluation", i);
			preferenceid = provisionalactions[i]->evaluate(req);
			LOGD("PolicySet: ProvisionalActions %d evaluation response: %s", i, preferenceid.first.c_str());
			
			// search for a dh preference with an id matching the string returned by
			// the previous provisional action
			if (preferenceid.first.empty() == false) {
				// exact match (preferenceid.second == true): select this DHPref
				// partial match (preferenceid.second == false): select this DHPref only if another partial match is not selected
				if (preferenceid.second == true || (preferenceid.second == false && (*selectedDHPref).first.empty() == true) ) {
					// test if DHPref exists
					if ((*datahandlingpreferences).count(preferenceid.first) == 1) {
						(*selectedDHPref) = preferenceid;
						LOGD("PolicySet: DHPref found: %s", (*selectedDHPref).first.c_str());
						break;
					}
				}
			}
		}
	}
}
