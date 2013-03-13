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

#ifndef TRIGGERSSET_H_
#define TRIGGERSSET_H_

#include <ctime>
#include "IPolicyBase.h"

static const string triggerAtTimeTag = "TriggerAtTime";
static const string triggerPersonalDataAccessedTag = "TriggerPersonalDataAccessedForPurpose";
static const string triggerPersonalDataDeletedTag = "TriggerPersonalDataDeleted";
static const string triggerDataSubjectAccessTag = "TriggerDataSubjectAccess";
static const string triggerIdTag = "triggerID";
static const string startTag = "StartTime";
static const string startNowTag = "StartNow";
static const string dateAndTimeTag = "DateAndTime";
static const string maxDelayTag = "MaxDelay";
static const string durationTag = "Duration";
static const string uriTag = "AccessURI";

class TriggersSet{
	
private:
	map<string,string> trigger;
	vector< map<string,string> > triggers;

public:
	TriggersSet(TiXmlElement*);
	virtual ~TriggersSet();

	bool evaluate(vector< map<string, string> >);
};

#endif /* TRIGGERSSET_H_ */

