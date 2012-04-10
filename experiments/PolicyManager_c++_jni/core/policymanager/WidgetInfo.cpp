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

#include "WidgetInfo.h"
#include "debug.h"

WidgetInfo::WidgetInfo(bool isEmpty)
{  
	widgetInfoDocument = new TiXmlDocument();
	if(isEmpty || !widgetInfoDocument->LoadFile(string(WIDGETINFO_FILE_PREFIX) + "/" + WIDGETINFO_FILE))
		widgetInfoDocument->LinkEndChild(new TiXmlElement("widgets"));
}

WidgetInfo::~WidgetInfo()
{
	// TODO Auto-generated destructor stub
}

void WidgetInfo::addResource(const string & widgetName, const string & resourceURI, const string & resourceDigest)
{
	TiXmlElement * widget = getWidget(widgetName);
	TiXmlElement * resourcesElem = widget->FirstChildElement("resources");
	TiXmlElement * resourceElem = NULL;
	
	if (!resourcesElem)
		resourcesElem = widget->LinkEndChild(new TiXmlElement("resources"))->ToElement();
	else
	{
		resourceElem = resourcesElem->FirstChildElement();
		for (resourceElem; resourceElem; resourceElem=resourceElem->NextSiblingElement())
		{
			if (!strcmp(resourceElem->Attribute("URI"), resourceURI.c_str()))
			{
				resourcesElem->RemoveChild(resourceElem);
				break;
			}
		}
	}
	resourceElem = new TiXmlElement("resource");
	resourceElem->SetAttribute("URI", resourceURI);
	resourceElem->SetAttribute("digest-value", resourceDigest);
	
	resourcesElem->LinkEndChild(resourceElem);
}
/*
string WidgetInfo::getWidgetInfoFilename()
{
	return string(WIDGETINFO_FILE);
}*/

void WidgetInfo::setResources(const string & widgetName, vector<pair<string, string>* > & infoVector)
{
	TiXmlElement * widget = getWidget(widgetName);
	TiXmlElement * resourcesElem = widget->FirstChildElement("resources");

	if (resourcesElem)
		widget->RemoveChild(resourcesElem);
	
	resourcesElem = widget->LinkEndChild(new TiXmlElement("resources"))->ToElement();

	for (int i=0; i<infoVector.size(); i++)
	{
		TiXmlElement * resourceElem = new TiXmlElement("resource");
		resourceElem->SetAttribute("URI", infoVector[i]->first);
		resourceElem->SetAttribute("digest-value", infoVector[i]->second);
		
		resourcesElem->LinkEndChild(resourceElem);
	}
}

void WidgetInfo::setSubjectsInfo(const string & widgetName, vector<pair<string, string>* > & infoVector)
{
	TiXmlElement * widget = getWidget(widgetName);
	TiXmlElement * subjectsInfoElem = widget->FirstChildElement("subjectsInfo");

	if (subjectsInfoElem)
		widget->RemoveChild(subjectsInfoElem);

	subjectsInfoElem = widget->LinkEndChild(new TiXmlElement("subjectsInfo"))->ToElement();

	for (int i=0; i<infoVector.size() + 1; i++)
	{
		TiXmlElement * subjectInfoElem = new TiXmlElement("subjectInfo");
		if(i == infoVector.size()){
			subjectInfoElem->SetAttribute("key", "class");
			subjectInfoElem->SetAttribute("value", "widget");
		}
		else{			
			subjectInfoElem->SetAttribute("key", infoVector[i]->first);
			subjectInfoElem->SetAttribute("value", infoVector[i]->second);
		}
		subjectsInfoElem->LinkEndChild(subjectInfoElem);
	}
	
}

vector<pair<string, string>*> & WidgetInfo::getResources(const string & widgetName)
{
	vector<pair<string, string>*> * resources = new vector<pair<string, string>*>();
	TiXmlElement * widget = getWidget(widgetName);
	TiXmlElement * resourcesElem = widget->FirstChildElement("resources");

	if (!resourcesElem)
		return *resources;
	
	TiXmlElement * resourceElem = resourcesElem->FirstChildElement();

	for (resourceElem; resourceElem; resourceElem=resourceElem->NextSiblingElement())
	{
		(*resources).push_back(new pair<string, string>(resourceElem->Attribute("URI"), resourceElem->Attribute("digest-value")));
	}
	
	return *resources;
}

map<string, vector<string>*>& WidgetInfo::getSubjectInfo(const string & widgetName)
{
	map<string, vector<string>*> * subjectInfo = new map<string, vector<string>*>(); 
	
	TiXmlElement * widget = getWidget(widgetName);
	TiXmlElement * subjectsInfoElem = widget->FirstChildElement("subjectsInfo");

	if (!subjectsInfoElem)
		return *subjectInfo;
	
	TiXmlElement * subjectInfoElem = subjectsInfoElem->FirstChildElement();

	for (subjectInfoElem; subjectInfoElem; subjectInfoElem=subjectInfoElem->NextSiblingElement())
	{
//		subjectsInfo.push_back(new pair<string, string>(subjectInfoElem->Attribute("key"), subjectInfoElem->Attribute("value")));
		if(subjectInfo->find(subjectInfoElem->Attribute("key")) == subjectInfo->end())
			(*subjectInfo)[subjectInfoElem->Attribute("key")] = new vector<string>();
		(*subjectInfo)[subjectInfoElem->Attribute("key")]->push_back(subjectInfoElem->Attribute("value"));
		
	}
	return *subjectInfo;
}

bool WidgetInfo::removeWidget(const string & widgetName)
{	
	TiXmlElement* widgetInfo = widgetInfoDocument->RootElement()->FirstChildElement();
	for (widgetInfo; widgetInfo; widgetInfo=widgetInfo->NextSiblingElement())
	{
		if (!strcmp(widgetInfo->Attribute("name"), widgetName.c_str()))
			return widgetInfoDocument->RootElement()->RemoveChild(widgetInfo);
	}
	return false;
}

bool WidgetInfo::save()
{
	return widgetInfoDocument->SaveFile(string(WIDGETINFO_FILE_PREFIX)+"/"+WIDGETINFO_FILE);
}

/*
 * if there is the specified widget return it else create the widget and then return it
 */
TiXmlElement* WidgetInfo::getWidget(const string & widgetName)
{
	TiXmlElement* widgetInfo = widgetInfoDocument->RootElement()->FirstChildElement();
	for (widgetInfo; widgetInfo; widgetInfo=widgetInfo->NextSiblingElement())
	{
		if (!strcmp(widgetInfo->Attribute("name"), widgetName.c_str()))
			return widgetInfo;
	}
	
	TiXmlElement* widget = widgetInfoDocument->RootElement()->LinkEndChild(new TiXmlElement("widget"))->ToElement();
	widget->SetAttribute("name",widgetName);
	
	return widget;
}

/*
string WidgetInfo::getCurrentPath()
{
	char currentDir[FILENAME_MAX];
	getCurrentDir(currentDir, sizeof(currentDir));
	
	return (string)currentDir + "/widgetInfo.xml";
}
*/
