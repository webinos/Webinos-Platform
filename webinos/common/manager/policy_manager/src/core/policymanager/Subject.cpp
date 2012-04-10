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

#include "Subject.h"
#include "Policy.h"


Subject::Subject(TiXmlElement* subject){
	for(TiXmlElement * child = (TiXmlElement*)subject->FirstChild("subject-match"); child;
			child = (TiXmlElement*)child->NextSibling() ) {
		
		string tmp = (child->Attribute("match")!=NULL) ? child->Attribute ("match") : "";
		if (tmp.length() == 0)
			tmp = (child->GetText() != NULL) ? child->GetText() : "";
		
		int nextPos, pos = 0;
		while(pos < tmp.length())
		{
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
				info[key].push_back(tmp_info);
			}
			pos = nextPos+1;
		}
	}
	LOGD("[Subject]  : subjects-match size : %d",info.size());
}

Subject::~Subject()
	{
	// TODO Auto-generated destructor stub
	}

bool Subject::match(Request* req){
	bool foundInBag = false;
	for(map<string,vector<match_info_str*> >::iterator it_policy=info.begin(); it_policy != info.end(); it_policy++){
		 
		// For Debug
		LOGD("[Subject] cerco in %s ",it_policy->first.data());
		for(map<string,vector<string>* >::iterator it=req->getSubjectAttrs().begin(); it != req->getSubjectAttrs().end(); it++)
			LOGD("[Subject] req %s",it->first.data());
		
		
		if(req->getSubjectAttrs().find(it_policy->first) != req->getSubjectAttrs().end()){
			vector<string>* req_vet = req->getSubjectAttrs()[it_policy->first];
			vector<match_info_str*> info_vet = it_policy->second;		
			for(int j=0;j<info_vet.size(); j++){ //iteration on all policy's elements
				foundInBag = false;
				for(int i=0; !foundInBag && i<req_vet->size(); i++){ //iteration on request's elements. 
					string mod_function = info_vet[j]->mod_func;
					string s = (mod_function != "") 
						? modFunction(mod_function, req_vet->at(i))
						: req_vet->at(i);
					LOGD("[Subject] Confronto %s con %s ",s.data(),info_vet[j]->value.data());
					if(equals(s, info_vet[j]->value, string2strcmp_mode(info_vet[j]->equal_func))){
						foundInBag = true;
						LOGD("[Subject] Found subject-match for %s ",s.data());
					}
				}
				if(!foundInBag)
					return false;
			}
		}
		else
			return false;
	}
	return true;
}
