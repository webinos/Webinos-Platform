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

#include "Rule.h"
#include "../../debug.h"

Rule::Rule(TiXmlElement* rule, DHPrefs* dhp){
	datahandlingpreferences = dhp;
	effect = (rule->Attribute("effect") != NULL) ? string2effect(rule->Attribute("effect")) : UNDETERMINED;
	if(rule->FirstChild("condition")){
		condition = new Condition((TiXmlElement*)rule->FirstChild("condition"));
	}
	else
		condition = NULL;
		
	//init datahandlingpreferences
	for(TiXmlElement * child = (TiXmlElement*)rule->FirstChild("DataHandlingPreferences"); child;
			child = (TiXmlElement*)child->NextSibling("DataHandlingPreferences") ) {
		LOGD("Rule: DHPref %s found", child->Attribute("PolicyId"));
		(*dhp)[child->Attribute("PolicyId")]=new DataHandlingPreferences(child);
	}
	LOGD("Rule DHPref number: %d", (*dhp).size());

	//init ProvisionalActions
	for(TiXmlElement * child = (TiXmlElement*)rule->FirstChild("ProvisionalActions"); child;
			child = (TiXmlElement*)child->NextSibling("ProvisionalActions") ) {
		LOGD("Rule: ProvisionalActions found");
		provisionalactions.push_back(new ProvisionalActions(child));
	}
}

Rule::~Rule()
	{
	// TODO Auto-generated destructor stub
	}


Effect Rule::string2effect(const string & effect_str){
	if(effect_str == "permit")
		return PERMIT;
	else if(effect_str == "deny")
		return DENY;
	else if(effect_str == "prompt-oneshot")
		return PROMPT_ONESHOT;
	else if(effect_str == "prompt-session")
		return PROMPT_SESSION;
	else if(effect_str == "prompt-blanket")
		return PROMPT_BLANKET;
	else
		return UNDETERMINED;
}

Effect Rule::evaluate(Request* req, string* selectedDHPref){

	string preferenceid;
	ConditionResponse cr;

	if (condition) {
		cr = condition->evaluate(req);
//		LOGD("[RULE EVAL] %d",cr); 
	}
	// there is no condition tag, or there is condition tag and request resource is matching policy resource
	if (!condition || cr == MATCH) {
		if((*selectedDHPref).empty() == true){
			// search for a provisional action with a resource matching the request
			LOGD("Rule: looking for DHPref in %d ProvisionalActions",provisionalactions.size());
			for(unsigned int i=0; i<provisionalactions.size(); i++){
				LOGD("Rule: ProvisionalActions %d evaluation", i);
				preferenceid = provisionalactions[i]->evaluate(req);
				LOGD("Rule: ProvisionalActions %d evaluation response: %s", i, preferenceid.c_str());
				// search for a dh preference with an id matching the string returned by
				// the previous provisional action
				if (preferenceid.empty() == false)
					if ((*datahandlingpreferences).count(preferenceid) == 1){
						*selectedDHPref = preferenceid;
						break;
					}
			}
		}
		return effect;
	}
	// there is condition tag and request resource is not matching policy resource
	if (cr==NO_MATCH)
		return INAPPLICABLE;
	else
		return UNDETERMINED;
}
