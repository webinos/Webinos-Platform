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

#include "ObligationsSet.h"
#include "../../debug.h"

ObligationsSet::ObligationsSet(TiXmlElement* obligationsset){

	// Obligation Tags
	for(TiXmlElement * child = static_cast<TiXmlElement*>(obligationsset->FirstChild(obligationTag)); child;
			child = static_cast<TiXmlElement*>(child->NextSibling(obligationTag))) {
		obligation.push_back(new Obligation(child));
	}
}

ObligationsSet::~ObligationsSet(){
	for (vector<Obligation*>::iterator it=obligation.begin(); it != obligation.end(); it++) {
		delete *it;
	}
}

bool ObligationsSet::evaluate(Request * req){

	for(unsigned int i = 0; i<obligation.size(); i++){
		LOGD("ObligationsSet: evalutaing obligation %d", i);
		if (obligation[i]->evaluate(req) == false)
			return false;
	}
	return true;
}
