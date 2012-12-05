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

#ifndef DHPREFERENCES_H_
#define DHPREFERENCES_H_

#include "AuthorizationsSet.h"
#include "ObligationsSet.h"
#include "Request.h"

static const string authzSetTag = "AuthorizationsSet";
static const string oblSetTag = "ObligationsSet";
static const string policyIdTag = "PolicyId";

class DataHandlingPreferences{
	
private:
	string			policyId;
	AuthorizationsSet*	authorizationsset;
	ObligationsSet*		obligationsset;
	
public:
	DataHandlingPreferences(TiXmlElement*);
	virtual ~DataHandlingPreferences();

	string GetId();
	bool evaluate(Request *);
};

typedef map<string, DataHandlingPreferences*> DHPrefs;

#endif /* DHPREFERENCES_H_ */
