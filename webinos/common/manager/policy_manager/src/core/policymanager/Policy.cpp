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

#include "Policy.h"

Policy::Policy(TiXmlElement* policy) : IPolicyBase(policy){
	iType = POLICY;
	ruleCombiningAlgorithm = (policy->Attribute("combine")!=NULL) ? policy->Attribute("combine") : deny_overrides_algorithm;
	//init subjects
	TiXmlNode * target = policy->FirstChild("target");
	if(target){
		for(TiXmlElement * child = (TiXmlElement*)target->FirstChild("subject"); child;
				child = (TiXmlElement*)child->NextSibling() ) {
			subjects.push_back(new Subject(child));
		}
	}
		
	
	// init rules
	for(TiXmlElement * child = (TiXmlElement*)policy->FirstChild("rule"); child;
			child = (TiXmlElement*)child->NextSibling("rule")) {
		rules.push_back(new Rule(child));
	}
	
	LOGD("[Policy]  : subjects size : %d",subjects.size());
	LOGD("[Policy]  : rules size : %d",rules.size());
}

Policy::~Policy()
	{
	// TODO Auto-generated destructor stub
	}

//virtual
PolicyType Policy::get_iType(){
	return POLICY;
}

//virtual
bool Policy::matchSubject(Request* req){
	LOGD("[Policy] try match subject for %s",description.data());
	if(subjects.size() == 0){
		return true;		// Policy is valid for all widget
	}
	else
		for(int i=0; i<subjects.size(); i++){
			if(subjects[i]->match(req)){
				return true;
			}
		}
	return false;
}

//virtual
Effect Policy::evaluate(Request* req){
/*	
	if(req->getResourceAttrs().find("api-feature") != req->getResourceAttrs().end())
		LOGD("[Policy::evaluate] api-feature size : %d",req->getResourceAttrs()["api-feature"]->size());
	if(req->getResourceAttrs().find("device-cap") != req->getResourceAttrs().end())
		LOGD("[Policy::evaluate] device-cap size : %d",req->getResourceAttrs()["device-cap"]->size());
*/	
	LOGD("[Policy::evaluate] XXXXXXXXXXXXXXXXXXXXXXXXXXX valuto la policy %s",description.data());
	if(matchSubject(req)){
		if (req->getResourceAttrs().size() == 0)
			return PERMIT;
		
		LOGD("RULE COMBINING ALG : %s",ruleCombiningAlgorithm.data());
		
		if(ruleCombiningAlgorithm == deny_overrides_algorithm){
			LOGD("[Policy::evaluate] deny_overrides algorithm");
			int effects_result[] = {0,0,0,0,0,0,0};
			for(int i=0; i<rules.size(); i++){
				int tmp = rules[i]->evaluate(req);
				LOGD("eval : %d",tmp);
				effects_result[tmp]++;
				if(effects_result[DENY] > 0)
					return DENY;
			}
			LOGD("[Policy::evaluate] (0) PERMIT %d",effects_result[0]);
			LOGD("[Policy::evaluate] (1) DENY %d",effects_result[1]);
			LOGD("[Policy::evaluate] (2) ONESHOT %d",effects_result[2]);
			LOGD("[Policy::evaluate] (3) SESSION %d",effects_result[3]);
			LOGD("[Policy::evaluate] (4) BLANKET %d",effects_result[4]);
			LOGD("[Policy::evaluate] (5) UNDETERMINED %d",effects_result[5]);
			
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
		else if(ruleCombiningAlgorithm == permit_overrides_algorithm){
			LOGD("[Policy::evaluate] permit_overrides algorithm");
			int effects_result[] = {0,0,0,0,0,0,0};
			for(int i=0; i<rules.size(); i++){
				effects_result[rules[i]->evaluate(req)]++;
				if(effects_result[PERMIT] > 0)
					return PERMIT;
			}
			
			LOGD("[Policy::evaluate] (0) PERMIT %d",effects_result[0]);
			LOGD("[Policy::evaluate] (1) DENY %d",effects_result[1]);
			LOGD("[Policy::evaluate] (2) ONESHOT %d",effects_result[2]);
			LOGD("[Policy::evaluate] (3) SESSION %d",effects_result[3]);
			LOGD("[Policy::evaluate] (4) BLANKET %d",effects_result[4]);
			LOGD("[Policy::evaluate] (5) UNDETERMINED %d",effects_result[5]);
			
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
		else if(ruleCombiningAlgorithm == first_applicable_algorithm){
			LOGD("[Policy] first_applicable algorithm");
			Effect tmp_effect;
			for(int i=0; i<rules.size(); i++){
				tmp_effect = rules[i]->evaluate(req);
				if(tmp_effect != UNDETERMINED && tmp_effect != INAPPLICABLE)
					return tmp_effect;
				else if(tmp_effect == UNDETERMINED)
					return UNDETERMINED;
				else if(tmp_effect ==  INAPPLICABLE)
					continue;
			}
			return INAPPLICABLE;
		}
	}
	else
		return INAPPLICABLE;
}
/*
string Policy::modFunction(const string& func, const string& val){
	// func = {scheme, host, authority, scheme-authority, path}
	int pos = val.find(":");
	int pos1 = val.find_last_of("/",pos+2);
	int pos2 = val.find("/",pos1+1);
	
	if(func == "scheme"){
		if(pos != string::npos)
			return val.substr(0,pos);
	}
	else if(func == "authority" || func == "host"){	
		string authority = val.substr(pos1+1, pos2-pos1-1);
		if(func == "authority")
			return authority;
		else{
			int pos_at = authority.find("@")+1;
			int pos3 = authority.find(":");
			if(pos_at == string::npos)
				pos_at = 0;
			if(pos3 == string::npos)
				pos3 = authority.length();
			return authority.substr(pos_at, pos3-pos_at);
		}
	}
	else if(func == "scheme-authority"){
		if(pos2-pos1 == 1)
			return "";
		return val.substr(0, pos2);
	}
	else if(func == "path"){
		int pos4 = val.find("?");
		if(pos4 == string::npos)
			pos4 = val.length();
		return val.substr(pos2, pos4-pos2);
	}
	return "";
}
*/
