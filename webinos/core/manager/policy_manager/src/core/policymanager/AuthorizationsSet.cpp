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

string ontology_vector[PURPOSES_NUMBER] = {
	"http://www.w3.org/2002/01/P3Pv1/current",
	"http://www.w3.org/2002/01/P3Pv1/admin",
	"http://www.w3.org/2002/01/P3Pv1/develop",
	"http://www.w3.org/2002/01/P3Pv1/tailoring",
	"http://www.w3.org/2002/01/P3Pv1/pseudo-analysis",
	"http://www.w3.org/2002/01/P3Pv1/pseudo-decision",
	"http://www.w3.org/2002/01/P3Pv1/individual-analysis",
	"http://www.w3.org/2002/01/P3Pv1/individual-decision",
	"http://www.w3.org/2002/01/P3Pv1/contact",
	"http://www.w3.org/2002/01/P3Pv1/historical",
	"http://www.w3.org/2002/01/P3Pv1/telemarketing",
	"http://www.w3.org/2002/01/P3Pv11/account",
	"http://www.w3.org/2002/01/P3Pv11/arts",
	"http://www.w3.org/2002/01/P3Pv11/browsing",
	"http://www.w3.org/2002/01/P3Pv11/charity",
	"http://www.w3.org/2002/01/P3Pv11/communicate",
	"http://www.w3.org/2002/01/P3Pv11/custom",
	"http://www.w3.org/2002/01/P3Pv11/delivery",
	"http://www.w3.org/2002/01/P3Pv11/downloads",
	"http://www.w3.org/2002/01/P3Pv11/education",
	"http://www.w3.org/2002/01/P3Pv11/feedback",
	"http://www.w3.org/2002/01/P3Pv11/finmgt",
	"http://www.w3.org/2002/01/P3Pv11/gambling",
	"http://www.w3.org/2002/01/P3Pv11/gaming",
	"http://www.w3.org/2002/01/P3Pv11/government",
	"http://www.w3.org/2002/01/P3Pv11/health",
	"http://www.w3.org/2002/01/P3Pv11/login",
	"http://www.w3.org/2002/01/P3Pv11/marketing",
	"http://www.w3.org/2002/01/P3Pv11/news",
	"http://www.w3.org/2002/01/P3Pv11/payment",
	"http://www.w3.org/2002/01/P3Pv11/sales",
	"http://www.w3.org/2002/01/P3Pv11/search",
	"http://www.w3.org/2002/01/P3Pv11/state",
	"http://www.w3.org/2002/01/P3Pv11/surveys",
	"http://www.primelife.eu/purposes/unspecified"
};

AuthorizationsSet::AuthorizationsSet(TiXmlElement* authorizationsset){

	TiXmlElement * child;

	// AuthzUseForPurpose Tag
	if (authorizationsset->FirstChild("AuthzUseForPurpose")) {
		LOGD("AuthorizationsSet constructor, AuthzUseForPurpose found");
		child = (TiXmlElement*)authorizationsset->FirstChild("AuthzUseForPurpose");
		for(child = (TiXmlElement*)child->FirstChild("Purpose"); child; 
				child = (TiXmlElement*)child->NextSibling("Purpose")) {
			LOGD("Purpose %s found", child->GetText());
			authzuseforpurpose.push_back(child->GetText());
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

	bool purpose_satisfied[PURPOSES_NUMBER];
	vector<bool> purpose = req->getPurposeAttrs();
	unsigned int i = 0;

	// invalid purposes vector
	if (purpose.size() != PURPOSES_NUMBER) {
		LOGD("AuthorizationsSet: invalid purposes vector");
		return false;
	}

	for(vector<bool>::iterator it = purpose.begin(); it!= purpose.end(); it++){
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

	for (i=0; i < PURPOSES_NUMBER; i++){
		if (purpose_satisfied[i] == false)
			// A purpose is not satisfied
			return false;
	}
	// All purposes are satisfied
	return true;
}
