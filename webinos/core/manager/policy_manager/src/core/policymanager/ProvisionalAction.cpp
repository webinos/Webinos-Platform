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
	for(TiXmlElement * child = (TiXmlElement*)provisionalaction->FirstChild("AttributeValue"); child;
			child = (TiXmlElement*)child->NextSibling("AttributeValue")) {
		// TODO use attribute values
		//string value = child->GetText();
	}

	// DeveloperProvidedDescription Tags
	for(TiXmlElement * child = (TiXmlElement*)provisionalaction->FirstChild("DeveloperProvidedDescription"); child;
			child = (TiXmlElement*)child->NextSibling("DeveloperProvidedDescription")) {
		// TODO use description values
		//string language = child->Attribute("language");
		//string value = child->GetText();
	}
}

ProvisionalAction::~ProvisionalAction(){
}

