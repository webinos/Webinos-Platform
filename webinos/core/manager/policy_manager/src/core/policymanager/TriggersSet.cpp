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
		// TODO read data about start and delay
	}
	if(triggersset->FirstChild("riggerPersonalDataAccessedForPurpose")){
		// TODO read data about purpose and delay
	}
	if(triggersset->FirstChild("TriggerPersonalDataDeleted")){
		// TODO read data about delay
	}
	if(triggersset->FirstChild("TriggerDataSubjectAccess")){
		// TODO read data about endpoint?
	}

}

TriggersSet::~TriggersSet(){
}

bool TriggersSet::evaluate(Request * req){
	// TODO evaluate triggers
}
