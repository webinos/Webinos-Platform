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

#ifndef SUBJECT_H_
#define SUBJECT_H_

#include "../../core/policymanager/Request.h"
#include "../../core/common.h"
#include <map>
#include <string>
#include <vector>
#include <algorithm>


using namespace std;

typedef struct {
	string equal_func;
//	string match;
	string value;
	string mod_func;
} match_info_str;


class Subject
	{
	
private:
	map<string,vector<match_info_str*> > info;
	
public:
	Subject(TiXmlElement*);
	virtual ~Subject();
	
	bool match(Request*);
	};

#endif /* SUBJECT_H_ */
