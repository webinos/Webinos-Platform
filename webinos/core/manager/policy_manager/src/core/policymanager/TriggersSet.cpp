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

TriggersSet::TriggersSet(TiXmlElement* triggersset){

	string purposes;
	for(unsigned int i=0; i<arraysize(ontology_vector); i++)
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
	tm start1, start2, delay1, delay2;
	time_t t_start1, t_start2, t_delay1, t_delay2;
	char sign;
	int millisec, off_hours, off_min;

	for(vector< map<string, string> >::iterator triggers_it=triggers.begin() ; triggers_it!=triggers.end() ; triggers_it++){
		trigger_satisfied = false;
		for(vector< map<string, string> >::iterator it=trig.begin() ; it!=trig.end() ; it++){

			// TriggerAtTime evaluation
			if((*triggers_it)[triggerIdTag] == (*it)[triggerIdTag] && (*triggers_it)[triggerIdTag] == triggerAtTimeTag){

				// Start is StartNow or is the same time
				// MaxDelay from DHPref is greter or equal of application MaxDelay
				if ((*triggers_it)[startTag] == (*it)[startTag] && (*triggers_it)[maxDelayTag] >= (*it)[maxDelayTag]){
					trigger_satisfied = true;
					break;
				}

				// Dafault case
				// Application time interval bust be inside DHPref time interval
				if ((*triggers_it)[startTag] != (*it)[startTag]){
					if((*triggers_it)[startTag] == startNowTag){ 

						t_start1 = mktime(gmtime(NULL));
						sscanf((*triggers_it)[maxDelayTag].c_str(),"P%dY%dM%dDT%dH%dM%dS",
								&delay1.tm_year, &delay1.tm_mon, &delay1.tm_mday, &delay1.tm_hour, &delay1.tm_min, &delay1.tm_sec);
						t_delay1 = mktime(&delay1);
						
						sscanf((*it)[startTag].c_str(),"%d-%d-%dT%d:%d:%d.%d%c%d:%d",
								&start2.tm_year, &start2.tm_mon, &start2.tm_mday, &start2.tm_hour, &start2.tm_min, &start2.tm_sec, &millisec, &sign, &off_hours, &off_min);
						t_start2 = mktime(&start2);
						sscanf((*it)[maxDelayTag].c_str(),"P%dY%dM%dDT%dH%dM%dS",
								&delay2.tm_year, &delay2.tm_mon, &delay2.tm_mday, &delay2.tm_hour, &delay2.tm_min, &delay2.tm_sec);
						t_delay2 = mktime(&delay2);
						if (sign == '+')
							t_delay2 += 60*off_hours+off_min;
						else
							t_delay2 -= (60*off_hours+off_min);

						if (t_start1 > t_start2 && (t_start1+t_delay1 < t_start2+t_delay2)){
							trigger_satisfied = true;
							break;
						}
					}
					if((*triggers_it)[startTag] != startNowTag && (*it)[startTag] != startNowTag){ 
						sscanf((*triggers_it)[startTag].c_str(),"%d-%d-%dT%d:%d:%d.%d%c%d:%d",
								&start1.tm_year, &start1.tm_mon, &start1.tm_mday, &start1.tm_hour, &start1.tm_min, &start1.tm_sec, &millisec, &sign, &off_hours, &off_min);
						t_start1 = mktime(&start1);
						sscanf((*triggers_it)[maxDelayTag].c_str(),"P%dY%dM%dDT%dH%dM%dS",
								&delay1.tm_year, &delay1.tm_mon, &delay1.tm_mday, &delay1.tm_hour, &delay1.tm_min, &delay1.tm_sec);
						t_delay1 = mktime(&delay1);
						if (sign == '+')
							t_delay1 += 60*off_hours+off_min;
						else
							t_delay1 -= (60*off_hours+off_min);
						
						sscanf((*it)[startTag].c_str(),"%d-%d-%dT%d:%d:%d.%d%c%d:%d",
								&start2.tm_year, &start2.tm_mon, &start2.tm_mday, &start2.tm_hour, &start2.tm_min, &start2.tm_sec, &millisec, &sign, &off_hours, &off_min);
						t_start2 = mktime(&start2);
						sscanf((*it)[maxDelayTag].c_str(),"P%dY%dM%dDT%dH%dM%dS",
								&delay2.tm_year, &delay2.tm_mon, &delay2.tm_mday, &delay2.tm_hour, &delay2.tm_min, &delay2.tm_sec);
						t_delay2 = mktime(&delay2);
						if (sign == '+')
							t_delay2 += 60*off_hours+off_min;
						else
							t_delay2 -= (60*off_hours+off_min);

						if (t_start1 > t_start2 && (t_start1+t_delay1 < t_start2+t_delay2)){
							trigger_satisfied = true;
							break;
						}
					}
				}
			}

			// TriggerPersonalDataAccessedForPurpose
			if((*triggers_it)[triggerIdTag] == (*it)[triggerIdTag] && (*triggers_it)[triggerIdTag] == triggerPersonalDataAccessedTag){
				purpose_satisfied = true;
				for(unsigned int i = 0; i<arraysize(ontology_vector); i++){
					if ((*triggers_it)[purposeTag][i] >= (*it)[purposeTag][i]){
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
				// MaxDelay from DHPreference is greter or equal of application MaxDelay
				if ((*triggers_it)[maxDelayTag] >= (*it)[maxDelayTag]){
					trigger_satisfied = true;
					break;
				}
			}

			// TriggerDataSubjectAccess evaluation
			if((*triggers_it)[triggerIdTag] == (*it)[triggerIdTag] && (*triggers_it)[triggerIdTag] == triggerDataSubjectAccessTag){
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
