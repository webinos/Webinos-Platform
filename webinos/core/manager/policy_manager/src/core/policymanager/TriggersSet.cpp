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

#include "TriggersSet.h"
#include "AuthorizationsSet.h"
#include "../../debug.h"

TriggersSet::TriggersSet(TiXmlElement* triggersset){

	string purposes;
	while (purposes.size() < arraysize(ontology_vector))
		purposes.append("0");

	// Trigger Tag

	// TriggerAtTime
	if(triggersset->FirstChild(triggerAtTimeTag)){
		for(TiXmlElement * child = static_cast<TiXmlElement*>(triggersset->FirstChild(triggerAtTimeTag)); child;
				child = static_cast<TiXmlElement*>(child->NextSibling(triggerAtTimeTag)) ) {
			trigger[triggerIdTag] = triggerAtTimeTag;

			// read Start parameter
			TiXmlElement * start = static_cast<TiXmlElement*>(child->FirstChild(startTag));
			if (static_cast<TiXmlElement*>(start->FirstChild(startNowTag)))
				trigger[startTag]=startNowTag;
			if (static_cast<TiXmlElement*>(start->FirstChild(dateAndTimeTag)))
				trigger[startTag]=(static_cast<TiXmlElement*>(start->FirstChild(dateAndTimeTag)))->GetText();

			// read MaxDelay parameter
			TiXmlElement * maxdelay = static_cast<TiXmlElement*>(child->FirstChild(maxDelayTag));
			trigger[maxDelayTag]=(static_cast<TiXmlElement*>(maxdelay->FirstChild(durationTag)))->GetText();
			
			triggers.push_back(trigger);
			trigger.clear();
		}
	}

	// TriggerPersonalDataAccessedForPurpose
	if(triggersset->FirstChild(triggerPersonalDataAccessedTag)){
		for(TiXmlElement * child = static_cast<TiXmlElement*>(triggersset->FirstChild(triggerPersonalDataAccessedTag)); child;
				child = static_cast<TiXmlElement*>(child->NextSibling(triggerPersonalDataAccessedTag)) ) {
			trigger[triggerIdTag] = triggerPersonalDataAccessedTag;

			// read Purpose parameters
			for(TiXmlElement * purpose = static_cast<TiXmlElement*>(child->FirstChild(purposeTag)); purpose;
					purpose = static_cast<TiXmlElement*>(child->NextSibling(purposeTag)) ) {
				string p = (static_cast<TiXmlElement*>(child->FirstChild(purposeTag)))->GetText();
				for(unsigned int i = 0; i<arraysize(ontology_vector); i++) {
					if (p.compare(ontology_vector[i]) == 0)
						purposes[i]='1';
				}
			}
			trigger[purposeTag]=purposes;
			for(unsigned int i=0; i<arraysize(ontology_vector); i++)
				purposes[i]='0';

			// read MaxDelay parameter
			TiXmlElement * maxdelay = static_cast<TiXmlElement*>(child->FirstChild(maxDelayTag));
			trigger[maxDelayTag]=(static_cast<TiXmlElement*>(maxdelay->FirstChild(durationTag)))->GetText();
			
			triggers.push_back(trigger);
			trigger.clear();
		}
	}

	// TriggerPersonalDataDeleted
	if(triggersset->FirstChild(triggerPersonalDataDeletedTag)){
		for(TiXmlElement * child = static_cast<TiXmlElement*>(triggersset->FirstChild(triggerPersonalDataDeletedTag)); child;
				child = static_cast<TiXmlElement*>(child->NextSibling(triggerPersonalDataDeletedTag)) ) {
			trigger[triggerIdTag] = triggerPersonalDataDeletedTag;

			// read MaxDelay parameter
			TiXmlElement * maxdelay = static_cast<TiXmlElement*>(child->FirstChild(maxDelayTag));
			trigger[maxDelayTag]=(static_cast<TiXmlElement*>(maxdelay->FirstChild(durationTag)))->GetText();
			
			triggers.push_back(trigger);
			trigger.clear();
		}
	}

	// TriggerDataSubjectAccess
	if(triggersset->FirstChild(triggerDataSubjectAccessTag)){
		for(TiXmlElement * child = static_cast<TiXmlElement*>(triggersset->FirstChild(triggerDataSubjectAccessTag)); child;
				child = static_cast<TiXmlElement*>(child->NextSibling(triggerDataSubjectAccessTag)) ) {
			trigger[triggerIdTag] = triggerDataSubjectAccessTag;

			// read url parameter
			trigger[uriTag] = (static_cast<TiXmlElement*>(child->FirstChild(uriTag)))->GetText();
			
			triggers.push_back(trigger);
			trigger.clear();
		}
	}

}

TriggersSet::~TriggersSet(){
}

bool TriggersSet::evaluate(vector< map<string, string> > trig){
	bool purpose_satisfied, trigger_satisfied;
	struct tm start1, start2, delay1, delay2;
	time_t t_start1, t_start2, t_delay1, t_delay2;
	char sign;
	int millisec, off_hour1, off_min1, off_hour2, off_min2;

	// loop among user triggers
	for(vector< map<string, string> >::iterator triggers_it=triggers.begin() ; triggers_it!=triggers.end() ; triggers_it++){
		trigger_satisfied = false;
		// loop among application triggers
		for(vector< map<string, string> >::iterator it=trig.begin() ; it!=trig.end() ; it++){

			// TriggerAtTime evaluation
			if((*triggers_it)[triggerIdTag] == (*it)[triggerIdTag] && (*triggers_it)[triggerIdTag] == triggerAtTimeTag){
				LOGD("TriggerAtTime evaluation");

				// Start is StartNow or is the same time
				// MaxDelay from DHPref is greter or equal of application MaxDelay
				if ((*triggers_it)[startTag] == (*it)[startTag] && (*triggers_it)[maxDelayTag] >= (*it)[maxDelayTag]){
					LOGD("TriggerAtTime evaluation: Start is StartNow or is the same time");
					trigger_satisfied = true;
					break;
				}

				// Dafault case
				// Application time interval must be inside DHPref time interval
				if ((*triggers_it)[startTag] != (*it)[startTag]){
					LOGD("TriggerAtTime evaluation: default case");

					// user start time
					if ((*triggers_it)[startTag] == startNowTag) {
						LOGD("TriggerAtTime evaluation: user current start time");
						if (time(&t_start1) == -1) {
							LOGD("Error on user Start");
							trigger_satisfied = false;
							break;
						}
						start1 = *gmtime(&t_start1);
					}
					else {
						LOGD("TriggerAtTime evaluation: user policy start time");
						if (sscanf((*triggers_it)[startTag].c_str(),"%d-%d-%dT%d:%d:%d.%d%c%d:%d",
								&start1.tm_year, &start1.tm_mon, &start1.tm_mday, &start1.tm_hour,
								&start1.tm_min, &start1.tm_sec, &millisec, &sign, &off_hour1, &off_min1) != EOF) {
						
							// years since 1900
							start1.tm_year -= 1900;

							// months range 0-11
							start1.tm_mon -= 1;

							// ignore dst because we are managing time offset
							start1.tm_isdst=0;

							if (sign == '+') {
								start1.tm_hour -= off_hour1;
								start1.tm_min -= off_min1;
							}
							else if (sign == '-') {
								start1.tm_hour += off_hour1;
								start1.tm_min += off_min1;
							}
							else {
								LOGD("Error on user Start");
								trigger_satisfied = false;
								break;
							}

							if ((t_start1 = mktime(&start1)) == -1) {
								LOGD("Error on user Start");
								trigger_satisfied = false;
								break;
							}
						}
						else {
							LOGD("Error on user Start");
							trigger_satisfied = false;
							break;
						}
					}
					LOGD("user start time: year %d, month %d, day %d, hours %d, minutes %d, seconds %d, UTC +00:00",
							start1.tm_year+1900, start1.tm_mon+1, start1.tm_mday, start1.tm_hour, start1.tm_min, start1.tm_sec);

					// user MaxDelay
					if (sscanf((*triggers_it)[maxDelayTag].c_str(),"P%dY%dM%dDT%dH%dM%dS",
								&delay1.tm_year, &delay1.tm_mon, &delay1.tm_mday, &delay1.tm_hour,
								&delay1.tm_min, &delay1.tm_sec) != EOF) {

						LOGD("user delay time: years %d, months %d, days %d, hours %d, minutes %d, seconds %d",
								delay1.tm_year, delay1.tm_mon, delay1.tm_mday, delay1.tm_hour, delay1.tm_min, delay1.tm_sec);

						delay1.tm_year += start1.tm_year;
						delay1.tm_mon += start1.tm_mon;
						delay1.tm_mday += start1.tm_mday;
						delay1.tm_hour += start1.tm_hour;
						delay1.tm_min += start1.tm_min;
						delay1.tm_sec += start1.tm_sec;

						LOGD("user deadline time: year %d, month %d, day %d, hours %d, minutes %d, seconds %d UTC +00:00",
								delay1.tm_year+1900, delay1.tm_mon+1, delay1.tm_mday, delay1.tm_hour, delay1.tm_min, delay1.tm_sec);

						if ((t_delay1 = mktime(&delay1)) == -1) {
							LOGD("Error on user MaxDelay");
							trigger_satisfied = false;
							break;
						}
					}
					else {
						LOGD("Error on user MaxDelay");
						trigger_satisfied = false;
						break;
					}

					// application start time
					if ((*it)[startTag] == startNowTag) {
						LOGD("TriggerAtTime evaluation: application current start time");
						if (time(&t_start2) == -1) {
							LOGD("Error on user Start");
							trigger_satisfied = false;
							break;
						}
						start2 = *gmtime(&t_start2);
					}
					else {
						LOGD("TriggerAtTime evaluation: applications manifest start time");
						if (sscanf((*it)[startTag].c_str(),"%d-%d-%dT%d:%d:%d.%d%c%d:%d",
								&start2.tm_year, &start2.tm_mon, &start2.tm_mday, &start2.tm_hour,
								&start2.tm_min, &start2.tm_sec, &millisec, &sign, &off_hour2, &off_min2) != EOF) {

							// years since 1900
							start2.tm_year -= 1900;

							// months range 0-11
							start2.tm_mon -= 1;

							// ignore dst because we are managing time offset
							start2.tm_isdst=0;

							if (sign == '+') {
								start2.tm_hour -= off_hour2;
								start2.tm_min -= off_min2;
							}
							else if (sign == '-') {
								start2.tm_hour += off_hour2;
								start2.tm_min += off_min2;
							}
							else {
								LOGD("Error on application Start");
								trigger_satisfied = false;
								break;
							}

							if ((t_start2 = mktime(&start2)) == -1) {
								LOGD("Error on user Start");
								trigger_satisfied = false;
								break;
							}
						}
						else {
							LOGD("Error on application Start");
							trigger_satisfied = false;
							break;
						}
					}
					LOGD("application start time: year %d, month %d, day %d, hours %d, minutes %d, seconds %d, UTC +00:00",
							start2.tm_year+1900, start2.tm_mon+1, start2.tm_mday, start2.tm_hour, start2.tm_min, start2.tm_sec);

					// application MaxDelay
					if (sscanf((*it)[maxDelayTag].c_str(),"P%dY%dM%dDT%dH%dM%dS",
								&delay2.tm_year, &delay2.tm_mon, &delay2.tm_mday, &delay2.tm_hour,
								&delay2.tm_min, &delay2.tm_sec) != EOF) {

						LOGD("application delay time: years %d, months %d, days %d, hours %d, minutes %d, seconds %d",
								delay2.tm_year, delay2.tm_mon, delay2.tm_mday, delay2.tm_hour, delay2.tm_min, delay2.tm_sec);

						delay2.tm_year += start2.tm_year;
						delay2.tm_mon += start2.tm_mon;
						delay2.tm_mday += start2.tm_mday;
						delay2.tm_hour += start2.tm_hour;
						delay2.tm_min += start2.tm_min;
						delay2.tm_sec += start2.tm_sec;

						LOGD("application deadline time: year %d, month %d, day %d, hours %d, minutes %d, seconds %d UTC +00:00",
								delay2.tm_year+1900, delay2.tm_mon+1, delay2.tm_mday, delay2.tm_hour, delay2.tm_min, delay2.tm_sec);

						if ((t_delay2 = mktime(&delay2)) == -1) {
							LOGD("Error on application MaxDelay");
							trigger_satisfied = false;
							break;
						}
					}
					else {
						LOGD("Error on application MaxDelay");
						trigger_satisfied = false;
						break;
					}

					if (t_start1 <= t_start2 && t_delay1 >= t_delay2){
						LOGD("TriggerAtTime satisfied");
						trigger_satisfied = true;
						break;
					}
					else {
						LOGD("TriggerAtTime not satisfied");
						trigger_satisfied = false;
						break;
					}
				}
			}

			// TriggerPersonalDataAccessedForPurpose
			if((*triggers_it)[triggerIdTag] == (*it)[triggerIdTag] && (*triggers_it)[triggerIdTag] == triggerPersonalDataAccessedTag){
				LOGD("TriggerPersonalDataAccessedForPurpose evaluation");
				purpose_satisfied = true;
				for(unsigned int i = 0; i<arraysize(ontology_vector); i++){
					LOGD("Trigger purpose %d is %c for the user and %c for the applications", i, (*triggers_it)[purposeTag][i], (*it)[purposeTag][i]);
					if ((*triggers_it)[purposeTag][i] > (*it)[purposeTag][i]){
						purpose_satisfied = false;
						break;
					}
				}
				if ((*triggers_it)[maxDelayTag] >= (*it)[maxDelayTag] && purpose_satisfied == true){
					trigger_satisfied = true;
					break;
				}
			}
			
			// TriggerPersonalDataDeleted evaluation
			if((*triggers_it)[triggerIdTag] == (*it)[triggerIdTag] && (*triggers_it)[triggerIdTag] == triggerPersonalDataDeletedTag){
				LOGD("TriggerPersonalDataDeleted evaluation");
				// MaxDelay from DHPreference is greter or equal of application MaxDelay
				if ((*triggers_it)[maxDelayTag] >= (*it)[maxDelayTag]){
					trigger_satisfied = true;
					break;
				}
			}

			// TriggerDataSubjectAccess evaluation
			if((*triggers_it)[triggerIdTag] == (*it)[triggerIdTag] && (*triggers_it)[triggerIdTag] == triggerDataSubjectAccessTag){
				LOGD("TriggerDataSubjectAccess evaluation");
				if ((*triggers_it)[uriTag] == (*it)[uriTag]){
					trigger_satisfied = true;
					break;
				}
			}
		}
		if (trigger_satisfied == false)
			return false;
	}
	return true;
}
