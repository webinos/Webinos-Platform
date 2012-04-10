/*******************************************************************************
 * Copyright 2010 Telecom Italia SpA
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
 ******************************************************************************/

#ifndef WIDGETINFO_H_
#define WIDGETINFO_H_

#include <string>
#include <vector>
#include <map>
#include <xmltools/tinyxml.h>
#include "core/Environment.h"
#include "core/BondiDebug.h"

/*
#ifdef WINDOWS
    #include <direct.h>
    #define getCurrentDir _getcwd
#else
    #include <unistd.h>
    #define getCurrentDir getcwd
 #endif
*/
using namespace std;

class WidgetInfo
{
private:
	TiXmlDocument *widgetInfoDocument;
//	static string widgetInfoFilename;
//	static string getCurrentPath();
	
	TiXmlElement* getWidget(const string &);
	
public:
	WidgetInfo(bool);
	void addResource(const string &, const string &, const string &);
//	static string getWidgetInfoFilename();
	void setResources(const string &, vector<pair<string, string>* >&);
	void setSubjectsInfo(const string & , vector<pair<string, string>* >&);
	
	vector<pair<string, string>*>& getResources(const string &);
	map<string, vector<string>*>& getSubjectInfo(const string &);
	bool removeWidget(const string &);
	bool save();
	virtual ~WidgetInfo();
};

#endif /* WIDGETINFO_H_ */
