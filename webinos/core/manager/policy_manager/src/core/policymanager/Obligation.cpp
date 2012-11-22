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

	// TriggerSet Tag
	if(obligation->FirstChild("TriggersSet")){
		triggersset = new TriggersSet((TiXmlElement*)obligation->FirstChild("TriggersSet"));
	}
	else
		triggersset = NULL;

	// Action Tag
	if(obligation->FirstChild("ActionDeletePersonalData")){
		action[DELETE] = true;
	}
	else
		action[DELETE] = false;
	if(obligation->FirstChild("ActionAnonymizePersonalData")){
		action[ANONYMIZE] = true;
	}
	else
		action[ANONYMIZE] = false;
	if(obligation->FirstChild("ActionNotifyDataSubject")){
		action[NOTIFY] = true;
		// TODO read data about media and access
	}
	else
		action[NOTIFY] = false;
	if(obligation->FirstChild("ActionLog")){
		action[LOG] = true;
	}
	else
		action[LOG] = false;
	if(obligation->FirstChild("ActionSecureLog")){
		action[SECURELOG] = true;
	}
	else
		action[SECURELOG] = false;
}

Obligation::~Obligation(){
}

bool Obligation::evaluate(Request * req){

	bool actions_to_evaluate = false;

	for (unsigned int i = 0; i < ACTIONS_NUMBER; i++){
		if (action[i] == true) {
			actions_to_evaluate = true;
			break;
		}
	}
	
	if (actions_to_evaluate == false)
		return true;

	// TODO evaluate if DELETE is satisfied
	// TODO evaluate if ANONYMIZE is satisfied
	// TODO evaluate if NOTIFY is satisfied (check media and address parameters too)
	// TODO evaluate if LOG is satisfied (by LOG or SECURELOG)
	// TODO evaluate if SECURELOG is satisfied

	// TODO if not satisfied return false

	return triggersset->evaluate(req);
}
