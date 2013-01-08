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

#include "DataHandlingPreferences.h"
#include "../../debug.h"

DataHandlingPreferences::DataHandlingPreferences(TiXmlElement* dhpreferences)
	: authorizationsset(0),obligationsset(0)
{
	// PolicyId attribute
	policyId = dhpreferences->Attribute(policyIdTag.c_str());
	LOGD("Construction of %s DHPref", policyId.c_str());

	// AuthorizationsSet Tag
	if(dhpreferences->FirstChild(authzSetTag)){
		LOGD("DHPref constructor, AuthorizationsSet found");
		authorizationsset = new AuthorizationsSet((TiXmlElement*)dhpreferences->FirstChild(authzSetTag));
	}
	else{
		LOGD("DHPref constructor, AuthorizationsSet not found");
	}

	// ObligationsSet Tag
	if(dhpreferences->FirstChild(oblSetTag)){
		LOGD("DHPref constructor, ObligationsSet found");
		obligationsset = new ObligationsSet((TiXmlElement*)dhpreferences->FirstChild(oblSetTag));
	}
	else{
		LOGD("DHPref constructor, ObligationsSet not found");
	}
}

DataHandlingPreferences::~DataHandlingPreferences(){
	if (authorizationsset != NULL)
		delete authorizationsset;
	if (obligationsset != NULL)
		delete obligationsset;
}

string DataHandlingPreferences::GetId(){
	return policyId;
}

bool DataHandlingPreferences::evaluate(Request * req){
	LOGD("Evalutaing %s DHPref", policyId.c_str());
	if (authorizationsset != NULL) {
		LOGD("AuthorizationsSet found");
		if (authorizationsset->evaluate(req) == true) {
			if (obligationsset != NULL) {
				LOGD("ObligationsSet found");
				return obligationsset->evaluate(req);
			}
			LOGD("No ObligationsSet found");
			return true;
		}
		else
			return false;
	}
	else {
		LOGD("No AuthorizationsSet found");
		return false;
	}
}
