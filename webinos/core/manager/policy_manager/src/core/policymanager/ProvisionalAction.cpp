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

#include "ProvisionalAction.h"
#include "../../debug.h"

ProvisionalAction::ProvisionalAction(TiXmlElement* provisionalaction){

	// AttributeValue Tags
	TiXmlElement * child = static_cast<TiXmlElement*>(provisionalaction->FirstChild(attributeValueTag));
	if (child) {
		value1 = child->GetText();
	}
	child = static_cast<TiXmlElement*>(child->NextSibling(attributeValueTag));
	if (child) {
		value2 = child->GetText();
	}
	if (value1.empty() == false && value2.empty() == false) {
		LOGD("ProvisionalAction constructor, attribute values: %s, %s", value1.c_str(), value2.c_str());
	}
	else {
		LOGD("Invalid ProvisionalAction");
	}
}

ProvisionalAction::~ProvisionalAction(){
}

pair<string, bool> ProvisionalAction::evaluate(Request * req){

	int features = 0;
	string req_feature;
	map<string, vector<string>* > resource_attrs = req->getResourceAttrs();

	if (resource_attrs.count(API_FEATURE) == 1) {
		features = (req->getResourceAttrs())[API_FEATURE]->size();
		req_feature = (req->getResourceAttrs())[API_FEATURE]->at(0);
	}
	
	// Provisional actions link together a single DHPref and a single feature,
	// more than a feature in a request should not be allowed
	// this is already tested in PolicyManager.cpp, but it is tested again here to be careful
	if (features == 1 && value1.empty() == false && value2.empty() == false) {
		LOGD("ProvisionalAction: values %s and %s to compare with %s", value1.c_str(), value2.c_str(), req_feature.c_str());
		if (value1.compare(req_feature) == 0) {
			LOGD("ProvisionalAction: %s and %s exact match", value1.c_str(), req_feature.c_str());
			return pair<string, bool>(value2, true);
		}
		if (value2.compare(req_feature) == 0) {
			LOGD("ProvisionalAction: %s and %s exact match", value2.c_str(), req_feature.c_str());
			return pair<string, bool>(value1, true);
		}
		if (equals(req_feature, value1, string2strcmp_mode("glob"))) {
			LOGD("ProvisionalAction: %s and %s partial match", value1.c_str(), req_feature.c_str());
			return pair<string, bool>(value2, false);
		}
		if (equals(req_feature, value2, string2strcmp_mode("glob"))) {
			LOGD("ProvisionalAction: %s and %s partial match", value2.c_str(), req_feature.c_str());
			return pair<string, bool>(value1, false);
		}
	}
	return pair<string, bool>("", false);
}
