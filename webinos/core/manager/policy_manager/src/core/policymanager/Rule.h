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
 * Copyright 2011 Telecom Italia SpA
 * 
 ******************************************************************************/

#ifndef RULE_H_
#define RULE_H_

#include "Condition.h"
#include "IPolicyBase.h"
#include "DataHandlingPreferences.h"
#include "ProvisionalActions.h"

static const string dhPrefTag = "DataHandlingPreferences";
static const string provisionalActionsTag = "ProvisionalActions";

class Rule
	{
	
private:
	Effect 		effect;
	Condition* 	condition;
	DHPrefs*			datahandlingpreferences;
	vector<ProvisionalActions*>		provisionalactions;
	
public:
	Rule(TiXmlElement*, DHPrefs*);
	virtual ~Rule();
	
	Effect evaluate(Request*, pair<string, bool>*);
	static Effect string2effect(const string &);
	
	};

#endif /* RULE_H_ */
