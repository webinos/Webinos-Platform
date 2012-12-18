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
 * Copyright 2012 Torsec -Computer and network security group-
 * Politecnico di Torino
 * 
 ******************************************************************************/

#include "AuthorizationsSet.h"
#include "../../debug.h"


AuthorizationsSet::AuthorizationsSet(TiXmlElement* authorizationsset){

	// AuthzUseForPurpose Tag
	if (authorizationsset->FirstChild(authzTag)) {
		LOGD("AuthorizationsSet constructor, AuthzUseForPurpose found");
		TiXmlElement * child = static_cast<TiXmlElement*>(authorizationsset->FirstChild(authzTag));
		for(child = static_cast<TiXmlElement*>(child->FirstChild(purposeTag)); child; 
				child = static_cast<TiXmlElement*>(child->NextSibling(purposeTag))) {
			if (child->GetText()) {
				LOGD("Purpose %s found", child->GetText());
				authzuseforpurpose.push_back(child->GetText());
			}
			else {
				LOGD("Empty purpose tag, all purposes allowed");
				authzuseforpurpose.clear();
				for (unsigned int i = 0; i < arraysize(ontology_vector); i++) {
					authzuseforpurpose.push_back(ontology_vector[i]);
				}
				break;
			}
		}
	}
	else{
		LOGD("AuthorizationsSet constructor, AuthzUseForPurpose not found");
	}
}

AuthorizationsSet::~AuthorizationsSet(){
}

bool AuthorizationsSet::evaluate(Request * req){
	LOGD("Evaluating AuthorizationsSet");

	vector<bool> purpose_satisfied(arraysize(ontology_vector), false);
	vector<bool> purpose = req->getPurposeAttrs();
	unsigned int i = 0;

	// invalid purposes vector
	if (purpose.size() != arraysize(ontology_vector)) {
		LOGD("AuthorizationsSet: invalid purposes vector");
		return false;
	}

	for(vector<bool>::const_iterator it = purpose.begin(); it!= purpose.end(); it++){
		// Purpose requested
		if (*it == true){
			purpose_satisfied[i] = false;
			LOGD("AuthorizationsSet: purpose %d is true", i);
			for(unsigned int j=0; j<authzuseforpurpose.size(); j++){
				LOGD("AuthorizationsSet: checking authzuseforpurpose %d, %s", j, authzuseforpurpose[j].c_str());
				if (ontology_vector[i].compare(authzuseforpurpose[j]) == 0){
					// Purpose requested and satisfied
					purpose_satisfied[i] = true;
					break;
				}
			}
		}
		// Purpose not requested
		else {
			LOGD("AuthorizationsSet: purpose %d is false", i);
			purpose_satisfied[i] = true;
		}
		i++;
	}

	for (i=0; i < arraysize(ontology_vector); i++){
		if (purpose_satisfied[i] == false)
			// A purpose is not satisfied
			return false;
	}
	// All purposes are satisfied
	return true;
}
