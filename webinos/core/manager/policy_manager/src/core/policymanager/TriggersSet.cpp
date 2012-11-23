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
#include "AuthorizationsSet.h"

TriggersSet::TriggersSet(TiXmlElement* triggersset){

	string p, purposes;
	for(unsigned int i=0; i<PURPOSES_NUMBER; i++)
		purposes.append("0");

	// Trigger Tag
	if(triggersset->FirstChild("TriggerAtTime")){
		for(TiXmlElement * child = (TiXmlElement*)triggersset->FirstChild("TriggerAtTime"); child;
				child = (TiXmlElement*)child->NextSibling("TriggerAtTime") ) {
			trigger["triggerID"] = "TriggerAtTime";

			// read start parameter
			TiXmlElement * start = (TiXmlElement*)child->FirstChild("Start");
			if ((TiXmlElement*)start->FirstChild("StartNow"))
				trigger["Start"]="StartNow";
			if ((TiXmlElement*)start->FirstChild("DateAndTime"))
				trigger["Start"]=((TiXmlElement*)start->FirstChild("DateAndTime"))->GetText();

			// read MaxDelay parameter
			TiXmlElement * maxdelay = (TiXmlElement*)child->FirstChild("MaxDelay");
			trigger["MaxDelay"]=((TiXmlElement*)maxdelay->FirstChild("Duration"))->GetText();
			
			triggers.push_back(trigger);
			trigger.clear();
		}
	}
	if(triggersset->FirstChild("TriggerPersonalDataAccessedForPurpose")){
		for(TiXmlElement * child = (TiXmlElement*)triggersset->FirstChild("TriggerPersonalDataAccessedForPurpose"); child;
				child = (TiXmlElement*)child->NextSibling("TriggerPersonalDataAccessedForPurpose") ) {
			trigger["triggerID"] = "TriggerPersonalDataAccessedForPurpose";

			// read Purpose parameters
			for(TiXmlElement * purpose = (TiXmlElement*)child->FirstChild("Purpose"); purpose;
					purpose = (TiXmlElement*)child->NextSibling("Purpose") ) {
				p = ((TiXmlElement*)child->FirstChild("Purpose"))->GetText();
				for(unsigned int i = 0; i<PURPOSES_NUMBER; i++){
					if (p.compare(ontology_vector[i]) == 0)
						purposes[i]='1';
				}
			}
			trigger["Purpose"]=purposes;
			for(unsigned int i=0; i<PURPOSES_NUMBER; i++)
				purposes[i]='0';

			// read MaxDelay parameter
			TiXmlElement * maxdelay = (TiXmlElement*)child->FirstChild("MaxDelay");
			trigger["MaxDelay"]=((TiXmlElement*)maxdelay->FirstChild("Duration"))->GetText();
			
			triggers.push_back(trigger);
			trigger.clear();
		}
	}
	if(triggersset->FirstChild("TriggerPersonalDataDeleted")){
		for(TiXmlElement * child = (TiXmlElement*)triggersset->FirstChild("TriggerPersonalDataDeleted"); child;
				child = (TiXmlElement*)child->NextSibling("TriggerPersonalDataDeleted") ) {
			trigger["triggerID"] = "TriggerPersonalDataDeleted";

			// read MaxDelay parameter
			TiXmlElement * maxdelay = (TiXmlElement*)child->FirstChild("MaxDelay");
			trigger["MaxDelay"]=((TiXmlElement*)maxdelay->FirstChild("Duration"))->GetText();
			
			triggers.push_back(trigger);
			trigger.clear();
		}
	}
	if(triggersset->FirstChild("TriggerDataSubjectAccess")){
		for(TiXmlElement * child = (TiXmlElement*)triggersset->FirstChild("TriggerDataSubjectAccess"); child;
				child = (TiXmlElement*)child->NextSibling("TriggerDataSubjectAccess") ) {
			trigger["triggerID"] = "TriggerDataSubjectAccess";

			// read url parameter
			trigger["url"] = ((TiXmlElement*)child->FirstChild("url"))->GetText();
			
			triggers.push_back(trigger);
			trigger.clear();
		}
	}

}

TriggersSet::~TriggersSet(){
}

bool TriggersSet::evaluate(vector< map<string, string> > triggers){
}
