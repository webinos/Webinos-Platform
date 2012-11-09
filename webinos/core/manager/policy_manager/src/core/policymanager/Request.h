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

#ifndef REQUEST_H_
#define REQUEST_H_

#include <vector>
#include <map>
#include "../../../contrib/xmltools/tinyxml.h"
#include "../../core/Environment.h"
using namespace std;


class Request
	{	
private:
    string widgetRootPath;
	map<string, vector<string>*>	subject_attrs;
	map<string, vector<string>*>	resource_attrs;
	map<string, string>				environment_attrs;
	string request_subject_text;
	string request_resource_text;
	string request_environment_text;
	
	TiXmlElement* getXmlSubjectTag();
	TiXmlElement* getXmlResourcesTag();
	TiXmlElement* getXmlEnvironmentTag();
	
public:
	Request(const string& widgetRootPath, map<string, vector<string>*>& resources);
	Request(const string& widgetRootPath, map<string, vector<string>*>& resources, map<string,string>&environment);
	Request(map<string, vector<string>*>&, map<string, vector<string>*>&);
	virtual ~Request();
	
	TiXmlDocument* getXmlDocument();
	void saveXmlFile(const string&);
	
	map<string, vector<string>*>&	getSubjectAttrs();
	map<string, vector<string>*>&	getResourceAttrs();
	map<string, string>&			getEnvironmentAttrs();
	string getWidgetRootPath();
	string getRequestText();
	string getRequestSubjectText();
	void setSubjectAttrs(map<string, vector<string>*>&);
	void setResourceAttrs(map<string, vector<string>*>&);
};

#endif /* REQUEST_H_ */

