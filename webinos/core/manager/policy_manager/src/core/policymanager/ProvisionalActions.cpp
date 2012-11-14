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

#include "ProvisionalActions.h"

ProvisionalActions::ProvisionalActions(TiXmlElement* provisionalactions){

	// ProvisionalAction Tags
	for(TiXmlElement * child = (TiXmlElement*)provisionalactions->FirstChild("ProvisionalAction"); child;
			child = (TiXmlElement*)child->NextSibling("ProvisionalAction")) {
		provisionalaction.push_back(new ProvisionalAction(child));
	}
}

ProvisionalActions::~ProvisionalActions(){
}

string ProvisionalActions::evaluate(Request * req){

	string preferenceid;

	// search for a provisional action with a resource matching the request
	for(unsigned int i=0; i<provisionalaction.size(); i++){
		preferenceid = provisionalaction[i]->evaluate(req);
		if (preferenceid.compare(NULL) != 0)
			return preferenceid;
	}
	return NULL;
}
