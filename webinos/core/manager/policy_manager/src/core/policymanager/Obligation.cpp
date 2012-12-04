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

#include "Obligation.h"

Obligation::Obligation(TiXmlElement* obligation){

	TiXmlElement* child;

	// TriggerSet Tag
	if(obligation->FirstChild("TriggersSet")){
		triggersset = new TriggersSet((TiXmlElement*)obligation->FirstChild("TriggersSet"));
	}
	else
		triggersset = NULL;

	// Action Tag
	if(obligation->FirstChild("ActionDeletePersonalData")){
		action["actionID"] = "ActionDeletePersonalData";
	}
	else if(obligation->FirstChild("ActionAnonymizePersonalData")){
		action["actionID"] = "ActionAnonymizePersonalData";
	}
	else if ((child = (TiXmlElement*)obligation->FirstChild("ActionNotifyDataSubject"))) {
		action["actionID"] = "ActionNotifyDataSubject";
		action["Media"] = ((TiXmlElement*)child->FirstChild("Media"))->GetText();
		action["Address"] = ((TiXmlElement*)child->FirstChild("Address"))->GetText();
	}
	else if(obligation->FirstChild("ActionLog")){
		action["actionID"] = "ActionLog";
	}
	else if(obligation->FirstChild("ActionSecureLog")){
		action["actionID"] = "ActionSecureLog";
	}
}

Obligation::~Obligation(){
}

bool Obligation::evaluate(Request * req){

	if (action.empty() == true)
		return true;
	else {
		obligations ob = req->getObligationsAttrs();
		for (obligations::iterator oit=ob.begin(); oit!=ob.end(); oit++){
			// ActionDeletePersonalData, ActionAnonymizePersonalData and ActionSecureLog evaluation
			// subset of ActionLog evaluation (exact match only)
			if (action["actionID"] == "ActionDeletePersonalData" || 
					action["actionID"] == "ActionAnonymizePersonalData" || 
					action["actionID"] == "ActionLog" || 
					action["actionID"] == "ActionSecureLog"){
				if ((*oit).action["actionID"].compare(action["actionID"]) == 0){
					if (triggersset->evaluate((*oit).triggers) == true)
						return true;
				}
			}
			// ActionNotifyDataSubject evaluation
			else {
				// ActionNotifyDataSubject parameters are the same
				if ((*oit).action["actionID"].compare("ActionNotifyDataSubject") == 0 && 
						(*oit).action["Media"].compare(action["Media"]) == 0 &&
						 (*oit).action["Address"].compare(action["Address"]) == 0){
					if (triggersset->evaluate((*oit).triggers) == true)
						return true;
				}
			}
			// subset of ActionLog evaluation (ActionLog is satisfied by ActionSecureLog too)
			if ((*oit).action["actionID"].compare("ActionSecureLog") == 0 &&
					action["actionID"].compare("ActionLog") == 0){
				if (triggersset->evaluate((*oit).triggers) == true)
					return true;
			}
		}
	}

	return false;
}
