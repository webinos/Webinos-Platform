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

Obligation::Obligation(TiXmlElement* obligation)
	:triggersset(0)	
{

	// TriggerSet Tag
	if(obligation->FirstChild(triggersSetTag)){
		triggersset = new TriggersSet(static_cast<TiXmlElement*>(obligation->FirstChild(triggersSetTag)));
	}

	// Action Tag
	if(obligation->FirstChild(actionDeleteTag)){
		action[actionIdTag] = actionDeleteTag;
	}
	else if(obligation->FirstChild(actionAnonymizeTag)){
		action[actionIdTag] = actionAnonymizeTag;
	}
	else if (TiXmlElement* child = static_cast<TiXmlElement*>(obligation->FirstChild(actionNotifyTag))) {
		action[actionIdTag] = actionNotifyTag;
		action[mediaTag] = (static_cast<TiXmlElement*>(child->FirstChild(mediaTag)))->GetText();
		action[addressTag] = (static_cast<TiXmlElement*>(child->FirstChild(addressTag)))->GetText();
	}
	else if(obligation->FirstChild(actionLogTag)){
		action[actionIdTag] = actionLogTag;
	}
	else if(obligation->FirstChild(actionSecureLogTag)){
		action[actionIdTag] = actionSecureLogTag;
	}
}

Obligation::~Obligation(){
	if (triggersset != NULL)
		delete triggersset;
}

bool Obligation::evaluate(Request * req){

	if (action.empty() == true)
		return true;
	else {
		obligations ob = req->getObligationsAttrs();
		for (obligations::iterator oit=ob.begin(); oit!=ob.end(); oit++){
			// ActionDeletePersonalData, ActionAnonymizePersonalData and ActionSecureLog evaluation
			// subset of ActionLog evaluation (exact match only)
			if (action[actionIdTag] == actionDeleteTag || action[actionIdTag] == actionAnonymizeTag || 
					action[actionIdTag] == actionLogTag || action[actionIdTag] == actionSecureLogTag) {
				if ((*oit).action[actionIdTag].compare(action[actionIdTag]) == 0){
					if (triggersset->evaluate((*oit).triggers) == true)
						return true;
				}
			}
			// ActionNotifyDataSubject evaluation
			else {
				// ActionNotifyDataSubject parameters are the same
				if ((*oit).action[actionIdTag].compare(actionNotifyTag) == 0 && 
						(*oit).action[mediaTag].compare(action[mediaTag]) == 0 &&
						 (*oit).action[addressTag].compare(action[addressTag]) == 0){
					if (triggersset->evaluate((*oit).triggers) == true)
						return true;
				}
			}
			// subset of ActionLog evaluation (ActionLog is satisfied by ActionSecureLog too)
			if ((*oit).action[actionIdTag].compare(actionSecureLogTag) == 0 &&
					action[actionIdTag].compare(actionLogTag) == 0){
				if (triggersset->evaluate((*oit).triggers) == true)
					return true;
			}
		}
	}

	return false;
}
