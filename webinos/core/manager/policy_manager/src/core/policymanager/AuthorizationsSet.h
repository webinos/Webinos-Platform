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

#ifndef AUTHORIZATIONSSET_H_
#define AUTHORIZATIONSSET_H_

using namespace std;

#include <string>
#include <vector>
#include "../../../contrib/xmltools/tinyxml.h"
#include "Request.h"

static const string authzTag = "AuthzUseForPurpose";
static const string purposeTag = "Purpose";

static const string ontology_vector[] = {

	// P3P ontology
	// http://www.w3.org/TR/P3P11/#PURPOSE
	"http://www.w3.org/2002/01/P3Pv1/current",
	"http://www.w3.org/2002/01/P3Pv1/admin",
	"http://www.w3.org/2002/01/P3Pv1/develop",
	"http://www.w3.org/2002/01/P3Pv1/tailoring",
	"http://www.w3.org/2002/01/P3Pv1/pseudo-analysis",
	"http://www.w3.org/2002/01/P3Pv1/pseudo-decision",
	"http://www.w3.org/2002/01/P3Pv1/individual-analysis",
	"http://www.w3.org/2002/01/P3Pv1/individual-decision",
	"http://www.w3.org/2002/01/P3Pv1/contact",
	"http://www.w3.org/2002/01/P3Pv1/historical",
	"http://www.w3.org/2002/01/P3Pv1/telemarketing",
	"http://www.w3.org/2002/01/P3Pv11/account",
	"http://www.w3.org/2002/01/P3Pv11/arts",
	"http://www.w3.org/2002/01/P3Pv11/browsing",
	"http://www.w3.org/2002/01/P3Pv11/charity",
	"http://www.w3.org/2002/01/P3Pv11/communicate",
	"http://www.w3.org/2002/01/P3Pv11/custom",
	"http://www.w3.org/2002/01/P3Pv11/delivery",
	"http://www.w3.org/2002/01/P3Pv11/downloads",
	"http://www.w3.org/2002/01/P3Pv11/education",
	"http://www.w3.org/2002/01/P3Pv11/feedback",
	"http://www.w3.org/2002/01/P3Pv11/finmgt",
	"http://www.w3.org/2002/01/P3Pv11/gambling",
	"http://www.w3.org/2002/01/P3Pv11/gaming",
	"http://www.w3.org/2002/01/P3Pv11/government",
	"http://www.w3.org/2002/01/P3Pv11/health",
	"http://www.w3.org/2002/01/P3Pv11/login",
	"http://www.w3.org/2002/01/P3Pv11/marketing",
	"http://www.w3.org/2002/01/P3Pv11/news",
	"http://www.w3.org/2002/01/P3Pv11/payment",
	"http://www.w3.org/2002/01/P3Pv11/sales",
	"http://www.w3.org/2002/01/P3Pv11/search",
	"http://www.w3.org/2002/01/P3Pv11/state",
	"http://www.w3.org/2002/01/P3Pv11/surveys",

	// PrimeLife extension
	// http://primelife.ercim.eu/results/documents/153-534d
	"http://www.primelife.eu/purposes/unspecified"
};

template <typename T,unsigned S>
unsigned arraysize(const T (&v)[S]) { return S; }

class AuthorizationsSet{
	
private:
	vector<string>	authzuseforpurpose;

public:
	AuthorizationsSet(TiXmlElement*);
	virtual ~AuthorizationsSet();

	bool evaluate(Request *);
};

#endif /* AUTHORIZATIONSSET_H_ */

