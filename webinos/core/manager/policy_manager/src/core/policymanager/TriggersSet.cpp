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

#include "TriggersSet.h"

TriggersSet::TriggersSet(TiXmlElement* triggersset){

	// Trigger Tag
	if(triggersset->FirstChild("TriggerAtTime")){
		for(TiXmlElement * child = (TiXmlElement*)triggersset->FirstChild("TriggerAtTime"); child;
				child = (TiXmlElement*)child->NextSibling("TriggerAtTime") ) {
			trigger["triggerID"] = "TriggerAtTime";
			// TODO read data about start and delay
			triggers.push_back(trigger);
			trigger.clear();
		}
	}
	if(triggersset->FirstChild("TriggerPersonalDataAccessedForPurpose")){
		for(TiXmlElement * child = (TiXmlElement*)triggersset->FirstChild("TriggerPersonalDataAccessedForPurpose"); child;
				child = (TiXmlElement*)child->NextSibling("TriggerPersonalDataAccessedForPurpose") ) {
			trigger["triggerID"] = "TriggerPersonalDataAccessedForPurpose";
			// TODO read data about purpose and delay
			triggers.push_back(trigger);
			trigger.clear();
		}
	}
	if(triggersset->FirstChild("TriggerPersonalDataDeleted")){
		for(TiXmlElement * child = (TiXmlElement*)triggersset->FirstChild("TriggerPersonalDataDeleted"); child;
				child = (TiXmlElement*)child->NextSibling("TriggerPersonalDataDeleted") ) {
			trigger["triggerID"] = "TriggerPersonalDataDeleted";
			// TODO read data about delay
			triggers.push_back(trigger);
			trigger.clear();
		}
	}
	if(triggersset->FirstChild("TriggerDataSubjectAccess")){
		for(TiXmlElement * child = (TiXmlElement*)triggersset->FirstChild("TriggerDataSubjectAccess"); child;
				child = (TiXmlElement*)child->NextSibling("TriggerDataSubjectAccess") ) {
			trigger["triggerID"] = "TriggerDataSubjectAccess";
			// TODO read data about endpoint?
			triggers.push_back(trigger);
			trigger.clear();
		}
	}

}

TriggersSet::~TriggersSet(){
}

bool TriggersSet::evaluate(Request * req){
	// TODO evaluate triggers
}
