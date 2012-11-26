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

#include "ProvisionalAction.h"

ProvisionalAction::ProvisionalAction(TiXmlElement* provisionalaction){

	// AttributeValue Tags
	TiXmlElement * child = (TiXmlElement*)provisionalaction->FirstChild("AttributeValue");
	value1 = child->GetText();
	child = (TiXmlElement*)child->NextSibling("AttributeValue");
	value2 = child->GetText();
}

ProvisionalAction::~ProvisionalAction(){
}

string ProvisionalAction::evaluate(Request * req){

	map<string, vector<string>* > resource_attrs = req->getResourceAttrs();

	for(map<string, vector<string>* >::iterator it = resource_attrs.begin(); it!= resource_attrs.end(); it++){
		if (value1.compare(it->first.data()) == 0)
			return value2;
		if (value2.compare(it->first.data()) == 0)
			return value1;
	}
	return "";
}
