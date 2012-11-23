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

#include "IPolicyBase.h"
#define PURPOSES_NUMBER	35

enum purpose_ontology {

	// P3P ontology
	// http://www.w3.org/TR/P3P11/#PURPOSE
	CURRENT,
	ADMIN,
	DEVELOP,
	TAILORING,
	PSEUDO_ANALYSIS,
	PSEUDO_DECISION,
	INDIVIDUAL_ANALYSIS,
	INDIVIDUAL_DECISION,
	CONTACT,
	HISTORICAL,
	TELEMARKETING,
	ACCOUNT,
	ARTS,
	BROWSING,
	CHARITY,
	COMMUNICATE,
	CUSTOM,
	DELIVERY,
	DOWNLOADS,
	EDUCATION,
	FEEDBACK,
	FINMGT,
	GAMBLING,
	GAMING,
	GOVERNMENT,
	HEALTH,
	LOGIN,
	MARKETING,
	NEWS,
	PAYMENT,
	SALES,
	SEARCH,
	STATE,
	SURVEYS,

	// PrimeLife extension
	// http://primelife.ercim.eu/results/documents/153-534d
	UNSPECIFIED
};

extern string ontology_vector[PURPOSES_NUMBER];

class AuthorizationsSet{
	
private:
	vector<string>	authzuseforpurpose;
	bool		purpose_array[PURPOSES_NUMBER];

public:
	AuthorizationsSet(TiXmlElement*);
	virtual ~AuthorizationsSet();

	bool evaluate(Request *);
};

#endif /* AUTHORIZATIONSSET_H_ */

