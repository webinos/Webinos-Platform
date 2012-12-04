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

#include "IPolicyBase.h"
/*
string IPolicyBase::first_matching_target_algorithm = "first-matching-target";
string IPolicyBase::deny_overrides_algorithm	= "deny-overrides";
string IPolicyBase::permit_overrides_algorithm	= "permit-overrides";
string IPolicyBase::first_applicable_algorithm  = "first-applicable";
*/
IPolicyBase::IPolicyBase(TiXmlElement* elem)
	{
	description = (elem->Attribute("description")!=NULL) ? elem->Attribute("description") : "no_value";
	// TODO Auto-generated constructor stub

	}

IPolicyBase::IPolicyBase(IPolicyBase* base)
	{
	// TODO Auto-generated constructor stub

	}

IPolicyBase::~IPolicyBase()
	{
	// TODO Auto-generated destructor stub
	}

bool IPolicyBase::matchSubject(Request*){
	return false;
}

Effect IPolicyBase::evaluate(Request*, pair<string, bool>*){
	return DENY;
}

PolicyType IPolicyBase::get_iType(){
	return POLICY_SET;
}

