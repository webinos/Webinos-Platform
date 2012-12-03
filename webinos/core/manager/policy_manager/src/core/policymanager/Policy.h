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

#ifndef POLICY_H_
#define POLICY_H_

#include "IPolicyBase.h"
#include "Rule.h"
#include "Subject.h"
#include "../../debug.h"
#include "DataHandlingPreferences.h"
#include "ProvisionalActions.h"

class Policy : public IPolicyBase
	{
	
private:
	string 				ruleCombiningAlgorithm;
	vector<Subject*> 	subjects;
	vector<Rule*>		rules;
	DHPrefs*			datahandlingpreferences;
	vector<ProvisionalActions*>		provisionalactions;
	void selectDHPref(Request*, pair<string, bool>*);
	
	
public:
	Policy(TiXmlElement*, DHPrefs*);
	virtual ~Policy();
	
	bool matchSubject(Request*);
	Effect evaluate(Request*, pair<string, bool>*);
	PolicyType get_iType();
//	static string modFunction(const string&, const string&);
	
};

#endif /* POLICY_H_ */
