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

#include "Condition.h"
#include "../../debug.h"

Condition::Condition(TiXmlElement* condition){
	if(condition->Attribute("combine") != NULL)
		combine = (strcmp(condition->Attribute("combine"),"or")==0) ? OR : AND;
	else
		combine = AND;
	int iii=0;
	int num_match = 0;
	for(TiXmlNode * node = (TiXmlNode*)condition->FirstChild(); node;
			node = (TiXmlNode*)node->NextSibling() ) {
		
		//TiXmlElement * child = dynamic_cast<TiXmlElement*>(node);
		TiXmlElement * child = (TiXmlElement*)(node);
		if(child == NULL)
			continue;
		if(child->ValueStr() == "condition"){
//			LOGD("Condition : add sub condition");
			conditions.push_back(new Condition(child));
		}
		else{
			num_match++;
			string tmp = (child->Attribute("match")!=NULL) ? child->Attribute ("match") : "";
			if (tmp.length() == 0)
				tmp = (child->GetText() != NULL) ? child->GetText() : "";
			int nextPos, pos = 0;
		
			//LOG("[Policy]  : match value: id"<<++iii);	
			while(pos < tmp.length())
			{
			//LOG("[Policy]  : match value: id"<<iii);	
					
				nextPos = tmp.find(" ",pos);
				if (nextPos == string::npos)
					nextPos = tmp.length();			
				if(pos != nextPos){
					string attr = child->Attribute("attr");
					int dot_pos = attr.find(".");
					string key = (dot_pos != string::npos) ? attr.substr(0, dot_pos) : attr;
					
					match_info_str * tmp_info = new match_info_str();
					tmp_info->equal_func = (child->Attribute("func")!=NULL) ? child->Attribute("func") : "glob";	
					tmp_info->value = tmp.substr(pos, nextPos-pos);
					tmp_info->mod_func = (dot_pos != string::npos) ? attr.substr(dot_pos+1) : "";
					
//					LOGD("Adding %s",tmp_info->value.data());
					
					//FIXME 
//					resource_attrs[key].push_back(tmp_info);
					
					if(child->ValueStr() == "resource-match")
						resource_attrs[key].push_back(tmp_info);
					else if(child->ValueStr() == "subject-match")
						subject_attrs[key].push_back(tmp_info);
					else if(child->ValueStr() == "environment-match")
						environment_attrs[key].push_back(tmp_info);

				}
				pos = nextPos+1;
			}
		}
	}
//	LOGD("[Condition] : there are %d match elements",num_match);
}

Condition::~Condition()
	{
	// TODO Auto-generated destructor stub
	}

ConditionResponse Condition::evaluate(Request * req){
	LOGD("[COND EVALUATE] combine : %d size : %d",combine,conditions.size());
	ConditionResponse tmpCR;
	bool anyUndetermined = false;
	
	if (combine==AND)
	{
		for (int i=0; i<conditions.size(); i++)
		{
			tmpCR = conditions[i]->evaluate(req);
			LOGD("[SUB-COND EVAL AND] %d ",tmpCR);
				
			if (tmpCR == NO_MATCH)
				return NO_MATCH;
			else if (tmpCR == NOT_DETERMINED)
				anyUndetermined = true;
		}
		
		tmpCR = evaluateFeatures(req);
		LOGD("[FEAT EVAL AND] %d, anyundeterm : %d",tmpCR,anyUndetermined);
		if (tmpCR == NO_MATCH)
			return NO_MATCH;
		else if (tmpCR == NOT_DETERMINED)
			anyUndetermined = true;
		
		
		tmpCR = evaluateCapabilities(req);
		LOGD("[CAP EVAL AND]  %d, anyundeterm : %d",tmpCR,anyUndetermined);
		if (tmpCR == NO_MATCH)
			return NO_MATCH;
		else if (tmpCR == NOT_DETERMINED)
			anyUndetermined = true;
		
		
		tmpCR = evaluateEnvironment(req);
		LOGD("[ENV EVAL AND] %d, anyundeterm : %d",tmpCR,anyUndetermined);
		if (tmpCR == NO_MATCH)
			return NO_MATCH;
		
		if (anyUndetermined)
			return NOT_DETERMINED;
		else
			return MATCH;
				
	}
	else if (combine==OR)
	{
		for (int i=0; i<conditions.size(); i++)
		{
			tmpCR = conditions[i]->evaluate(req);
			LOGD("[COND EVAL OR] %d", tmpCR);
			if (tmpCR == MATCH)
				return MATCH;
			else if (tmpCR == NOT_DETERMINED)
				anyUndetermined = true;
		}
		tmpCR = evaluateFeatures(req);
		LOGD("[FEAT EVAL OR] %d", tmpCR);
		if (tmpCR == MATCH)
			return MATCH;
		else if (tmpCR == NOT_DETERMINED)
			anyUndetermined = true;
		tmpCR = evaluateCapabilities(req);
		LOGD("[CAP EVAL OR] %d",tmpCR);
		if (tmpCR == MATCH)
			return MATCH;
		else if (tmpCR == NOT_DETERMINED)
			anyUndetermined = true;
		
		if (anyUndetermined)
			return NOT_DETERMINED;
		else
			return NO_MATCH;
	}	
}

ConditionResponse Condition::evaluateEnvironment(Request* req){	
	vector<match_info_str*> my_environment_params;
	map<string, string> requestEnvironment_attrs = req->getEnvironmentAttrs();
	bool found;
	ConditionResponse tmp;
	
	map<string,vector<match_info_str*> >::iterator it;
	match_info_str * my_roaming = (it = environment_attrs.find("roaming"))!=environment_attrs.end() 
		? it->second.at(0) 
		: NULL;
	
	vector<match_info_str *> my_bearer_vet = (it = environment_attrs.find("bearer-type"))!=environment_attrs.end() 
		? it->second 
		: vector<match_info_str*>();
	
	if(combine == OR){
		LOGD("[ENVIRONMENT] dentro OR");
		if(my_roaming != NULL){
			string req_roaming = requestEnvironment_attrs["roaming"];
			LOGD("[ENVIRONMENT] req_roaming : %s",req_roaming.data());
			if(equals(req_roaming, my_roaming->value, string2strcmp_mode(my_roaming->equal_func)))
				return MATCH;
		}
		else
			LOGD("[ENVIRONMENT] my_roaming null");
		
		string req_bearer = requestEnvironment_attrs["bearer-type"];
		for(int j=0; j<my_bearer_vet.size(); j++){
			if(equals(req_bearer, my_bearer_vet[j]->value, string2strcmp_mode(my_bearer_vet[j]->equal_func)))
				return MATCH;
		}
		return NO_MATCH;
	}
	else{ //combine == AND
		// find any No Match
		LOGD("[ENVIRONMENT] dentro AND");
		if(my_roaming != NULL){
			string req_roaming = requestEnvironment_attrs["roaming"];
			LOGD("[ENVIRONMENT] confronto : %s con %s",req_roaming.data(),my_roaming->value.data());
			if(!equals(req_roaming, my_roaming->value, string2strcmp_mode(my_roaming->equal_func)))
				return NO_MATCH;
		}
		else
			LOGD("[ENVIRONMENT] my_roaming null");
		
		string req_bearer = requestEnvironment_attrs["bearer-type"];
		for(int j=0; j<my_bearer_vet.size(); j++){
			if(!equals(req_bearer, my_bearer_vet[j]->value, string2strcmp_mode(my_bearer_vet[j]->equal_func)))
				return NO_MATCH;
		}
		return MATCH;
	}
}

ConditionResponse Condition::evaluateFeatures(Request* req){
	LOGD("[COND EVALUATE FEAT] 1 : %d",resource_attrs.size());
	map<string,vector<match_info_str*> >::iterator it;
	vector<match_info_str*> my_features = (it = resource_attrs.find(API_FEATURE))!=resource_attrs.end() 
			? it->second 
			: vector<match_info_str*>();
	
	map<string, vector<string>* > requestResource_attrs = req->getResourceAttrs();
	map<string, vector<string>* >::iterator rraIT = requestResource_attrs.find(API_FEATURE);
	vector<string>* req_features = (rraIT != requestResource_attrs.end())
			? rraIT->second
			: NULL;
	
	bool found;	
	bool anyUndetermined = resource_attrs.find(API_FEATURE)!= resource_attrs.end() 
			&& requestResource_attrs.find(API_FEATURE) == requestResource_attrs.end();	

	if(combine == AND){
		// find any No Match
		for(int j=0; req_features && j<my_features.size(); j++){
			found = false;
			for(int i=0; i<req_features->size(); i++){
				string mod_function = my_features[j]->mod_func;
				string s = (mod_function != "") 
							? modFunction(mod_function, req_features->at(i))
							: req_features->at(i);
				if(equals(s,my_features[j]->value, string2strcmp_mode(my_features[j]->equal_func)))
				{
					found = true;
					break;
				}
			}
			if (found == false)
				return NO_MATCH;
		}
		if (anyUndetermined)
			return NOT_DETERMINED;
		else
			return MATCH;
	}
	else if(combine == OR){
		// find any Match
		for(int j=0; req_features && j<my_features.size(); j++){
			for(int i=0; i<req_features->size(); i++){
				string mod_function = my_features[j]->mod_func;
				string s = (mod_function != "") 
							? modFunction(mod_function, req_features->at(i))
							: req_features->at(i);
				if(equals(s,my_features[j]->value, string2strcmp_mode(my_features[j]->equal_func)))
					return MATCH;
			}
		}
		if (anyUndetermined)
			return NOT_DETERMINED;
		else
			return NO_MATCH;
	}
}

ConditionResponse Condition::evaluateCapabilities(Request* req){
	LOGD("condition: device-cap size %d",req->getResourceAttrs()["device-cap"]->size());
	vector<match_info_str*> my_capabilities_params;
	vector<string>* req_capabilities_params = new vector<string>();
	map<string, vector<string>* > requestResource_attrs = req->getResourceAttrs();
	bool anyUndetermined = false;
	bool found;
	
	for(map<string, vector<match_info_str*> >::iterator it = resource_attrs.begin(); it!= resource_attrs.end(); it++)
	{
		if (it->first != API_FEATURE)

		{
			if(requestResource_attrs.find(it->first) == requestResource_attrs.end())
			{
				LOGD("Capabilities %s undetermined ",it->first.data());		
				anyUndetermined = true;
			}
			else
			{
				LOGD("Capabilities %s determined ",it->first.data());	
				my_capabilities_params.insert(my_capabilities_params.end(), it->second.begin(), it->second.end());
			}
		}
	}
	LOGD("[ANY CAP] %d", anyUndetermined);

	for(map<string, vector<string>* >::iterator itr = requestResource_attrs.begin(); itr!= requestResource_attrs.end(); itr++)
	{
		if (itr->first != API_FEATURE)
		{
//			LOGD("REQ Capabilities %s", itr->first.data());
//			LOGD("REQ Capabilities size %d", itr->second->size());
			req_capabilities_params->insert(req_capabilities_params->end(), itr->second->begin(), itr->second->end());
		}
	}
	
	if(combine == AND){
		// find any No Match
		LOGD("my_capabilities_params.size() %d",my_capabilities_params.size());
		for(int j=0; j<my_capabilities_params.size(); j++){
			found = false;
			LOGD("req_capabilities_params->size() %d",req_capabilities_params->size());
			for(int i=0; i<req_capabilities_params->size(); i++){
				string mod_function = my_capabilities_params[j]->mod_func;
				string s = (mod_function != "") 
							? modFunction(mod_function, req_capabilities_params->at(i))
							: req_capabilities_params->at(i);
				
				LOGD("Confronto %s con %s",s.data(),my_capabilities_params[j]->value.data());
				if(equals(s.data(),my_capabilities_params[j]->value.data(), string2strcmp_mode(my_capabilities_params[j]->equal_func)))
//				if(equals(req_capabilities_params->at(i).data(),my_capabilities_params[j]->value.data(), string2strcmp_mode(my_capabilities_params[j]->equal_func)))
				{
					LOGD("UGUALI");
					found = true;
					break;
				}
				else
					LOGD("DIVERSI");
			}
			if (found == false)
				return NO_MATCH;
		}
		if (anyUndetermined)
			return NOT_DETERMINED;
		else
			return MATCH;
	}
	else if(combine == OR){
	// find any Match
		for(int j=0; j<my_capabilities_params.size(); j++){
			for(int i=0; i<req_capabilities_params->size(); i++){
				string mod_function = my_capabilities_params[j]->mod_func;
				string s = (mod_function != "") 
							? modFunction(mod_function, req_capabilities_params->at(i))
							: req_capabilities_params->at(i);
				
				LOGD("Compare %s with %s",s.data(),my_capabilities_params[j]->value.data());
//				LOGD("Compare %s with %s",req_capabilities_params->at(i).data(),my_capabilities_params[j]->value.data());
				if(equals(s.data(),my_capabilities_params[j]->value.data(), string2strcmp_mode(my_capabilities_params[j]->equal_func))){
//				if(equals(req_capabilities_params->at(i),my_capabilities_params[j]->value, string2strcmp_mode(my_capabilities_params[j]->equal_func)))
					return MATCH;
				}
			}
		}
		if (anyUndetermined)
			return NOT_DETERMINED;
		else
			return NO_MATCH;
	}
}
