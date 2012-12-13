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

#ifndef OBLIGATION_H_
#define OBLIGATION_H_

#include "TriggersSet.h"
#include "IPolicyBase.h"

static const string triggersSetTag = "TriggersSet";
static const string actionDeleteTag = "ActionDeletePersonalData";
static const string actionAnonymizeTag = "ActionAnonymizePersonalData";
static const string actionNotifyTag = "ActionNotifyDataSubject";
static const string actionLogTag = "ActionLog";
static const string actionSecureLogTag = "ActionSecureLog";
static const string actionIdTag = "actionID";
static const string mediaTag = "Media";
static const string addressTag = "Address";

class Obligation{
	
private:
	TriggersSet*	triggersset;
	map<string, string> action;

public:
	Obligation(TiXmlElement*);
	virtual ~Obligation();

	bool evaluate(Request *);
};

#endif /* OBLIGATION_H_ */

