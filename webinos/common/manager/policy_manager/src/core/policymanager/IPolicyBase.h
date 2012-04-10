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

#ifndef IPOLICYBASE_H_
#define IPOLICYBASE_H_


#include "Request.h"

#include <string>
using namespace std;

#include "Globals.h"
/*
enum PolicyType {POLICY_SET, POLICY};
enum Effect {PERMIT, DENY, PROMPT_ONESHOT, PROMPT_SESSION, PROMPT_BLANKET, UNDETERMINED, INAPPLICABLE};
enum Combine {AND, OR};
enum ConditionResponse {NOT_DETERMINED=-1, NO_MATCH=0, MATCH=1};
*/
class IPolicyBase
	{
public:
	string description;
	IPolicyBase(TiXmlElement*);
	IPolicyBase(IPolicyBase*);
	virtual ~IPolicyBase();
	
	virtual bool matchSubject(Request* req);
	virtual Effect evaluate(Request * req);
	virtual PolicyType get_iType();
	
protected:
	PolicyType iType;
/*	static string 		first_matching_target_algorithm;
	static string 		deny_overrides_algorithm;
	static string 		permit_overrides_algorithm;
	static string 		first_applicable_algorithm;
*/
	};

#endif /* IPOLICYBASE_H_ */
