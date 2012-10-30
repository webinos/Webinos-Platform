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

#ifndef CONDITION_H_
#define CONDITION_H_

//#include "Policy.h"
#include "Globals.h"
#include "../../core/common.h"
#include "Subject.h"
#include <vector>
#include <map>
using namespace std;



class Condition
	{
	
private:
	Combine									combine;
	vector<Condition*>						conditions;
	map<string, vector<match_info_str*> >	resource_attrs;
	map<string, vector<match_info_str*> >	subject_attrs;
	map<string, vector<match_info_str*> >	environment_attrs;
	
	ConditionResponse evaluateFeatures(Request*);
	ConditionResponse evaluateCapabilities(Request*);
	ConditionResponse evaluateEnvironment(Request*);
	
public:
	Condition(TiXmlElement*);
	virtual ~Condition();
	ConditionResponse evaluate(Request *);
	
	};

#endif /* CONDITION_H_ */
