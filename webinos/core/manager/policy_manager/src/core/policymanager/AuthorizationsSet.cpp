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

AuthorizationsSet::AuthorizationsSet(TiXmlElement* authorizationsset){

	unsigned int i=0;

	// AuthzUseForPurpose Tags
	for(TiXmlElement * child = (TiXmlElement*)authorizationsset->FirstChild("AuthzUseForPurpose"); child;
			child = (TiXmlElement*)child->NextSibling("AuthzUseForPurpose")) {
		authzuseforpurpose[i] = ((TiXmlElement*)child->FirstChild("Purpose"))->GetText();
		i++;
	}
}

AuthorizationsSet::~AuthorizationsSet(){
}

bool AuthorizationsSet::evaluate(Request * req){
	for(unsigned int i=0; i<authzuseforpurpose.size(); i++){
		// test authzuseforpurpose[i] and requested purpose
	}
}
