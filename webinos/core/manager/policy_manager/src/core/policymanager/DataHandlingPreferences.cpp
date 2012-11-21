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

DataHandlingPreferences::DataHandlingPreferences(TiXmlElement* dhpreferences){

	// PolicyId attribute
	PolicyId = dhpreferences->Attribute("PolicyId");

	// AuthorizationsSet Tag
	if(dhpreferences->FirstChild("AuthorizationsSet")){
		authorizationsset = new AuthorizationsSet((TiXmlElement*)dhpreferences->FirstChild("AuthorizationsSet"));
	}
	else
		authorizationsset = NULL;

	// ObligationsSet Tag
	if(dhpreferences->FirstChild("ObligationsSet")){
		obligationsset = new ObligationsSet((TiXmlElement*)dhpreferences->FirstChild("ObligationsSet"));
	}
	else
		obligationsset = NULL;
}

DataHandlingPreferences::~DataHandlingPreferences(){
}

string DataHandlingPreferences::GetId(){
	return PolicyId;
}

bool DataHandlingPreferences::evaluate(Request * req){
	return authorizationsset->evaluate(req);
}
