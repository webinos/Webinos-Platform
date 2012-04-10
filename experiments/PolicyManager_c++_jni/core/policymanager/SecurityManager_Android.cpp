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

#include "SecurityManager_Android.h"
#include "debug.h"


SecurityManager_Android::SecurityManager_Android(const string & path): SecurityManager(path){
	setCryptoManagerInstance();
}

SecurityManager_Android::~SecurityManager_Android(){}

void SecurityManager_Android::setCryptoManagerInstance(){
	SecurityManager::cryptoManager = new CryptoManager_Android();
}

Effect SecurityManager_Android::check_INSTALL(Request* req){
	vector<pair<string,string>* > infoVector = cryptoManager->getSubjectInfo();
	map<string,vector<string>* >* infoMap = new map<string,vector<string>* >();

	for (int i=0; i<infoVector.size() + 1; i++)
	{
		if(i<infoVector.size()){
			if (infoMap->find(infoVector[i]->first) != infoMap->end())
				(*infoMap)[infoVector[i]->first]->push_back(infoVector[i]->second);
				
			else
				(*infoMap)[infoVector[i]->first] = new vector<string>(1,infoVector[i]->second);
			LOGD("[SM_Android::Check_INSTALL] Push %s into subjectAttrs",infoVector[i]->second.data());
		}
		else
			(*infoMap)["class"] = new vector<string>(1,"widget");
	}
	
	
	req->setSubjectAttrs(*infoMap);
	Effect tmpEffect = policyManager->checkRequest(req);
	LOGD("[SM_Android::Check_INSTALL] effect : %d",tmpEffect);
	return tmpEffect;
}

Effect SecurityManager_Android::check_LOAD(Request* req){
	req->setSubjectAttrs(widgetInfo->getSubjectInfo(req->getWidgetRootPath()));
	Effect tmpEffect = policyManager->checkRequest(req);
	LOGD("[SM_Android::Check_LOAD] effect : %d",tmpEffect);
	return tmpEffect;
}

Effect SecurityManager_Android::check_INVOKE(Request* req){
	req->setSubjectAttrs(widgetInfo->getSubjectInfo(req->getWidgetRootPath()));
	Effect tmpEffect = policyManager->checkRequest(req);
	LOGD("[SM_Android::Check_INVOKE] effect : %d",tmpEffect);
	return tmpEffect;
}

bool up(string & str)
{
       string tmpstr;
       int i = str.rfind("/");
       if (i != string::npos && str.length() > 1)
       {
		tmpstr = str.substr(0,i);
		if (tmpstr.find(ENV_WGT_PREFIX) != string::npos)
               {       str = tmpstr;
                       return true;
               }
       }
	return false;
}
	       
string SecurityManager_Android::handleEffect(Effect effect, Request* req) {
	if(effect == PERMIT)
		return "true";
	if(effect == DENY)
		return "false";
	
	req->getXmlDocument();
	char digest[32];
	int digest_len = cryptoManager->calculateSHA256(req->getRequestText().data(), req->getRequestText().length(), digest);
	char digest_b64[45];
	char * param_digest_b64 = NULL;
	toBase64((unsigned char*)digest, 32, digest_b64);
	digest_b64[44] = '\0';
	map<string, vector<string>* > resource_attrs = req->getResourceAttrs();
	Action decision = NO_ACTION;
	bool decision_found = false;
	
	if(decision_map.find(digest_b64) != decision_map.end())
	{
		decision = decision_map[digest_b64];
		LOGD("A decision for this request was already taken : %d", decision);
	}
	else if (resource_attrs.find("param:name") != resource_attrs.end())
	{		
		vector<string> * resource_attr_list = resource_attrs["param:name"];
		string param_map_key;
		
		for (int i = 0; !decision_found && i < resource_attr_list->size(); i++)
		{
			string path = resource_attr_list->at(i);
			string sdc = "sdcard";
			int found=path.find(sdc);
			if (found != string::npos)
			path.replace(found, sdc.length(), "/sdcard",0,sdc.length()+1);
			param_digest_b64 = new char[45];
			string original_param_map_key = req->getRequestSubjectText() + path;
			do
		       {
				LOGD("Analize path : %s", path.data());
				param_map_key = req->getRequestSubjectText() + path;
				digest_len = cryptoManager->calculateSHA256(param_map_key.data(), param_map_key.length(), digest);
				toBase64((unsigned char*)digest, 32, param_digest_b64);
				param_digest_b64[44] = '\0';
//				LOGD("Check for digest : %s" ,param_digest_b64);
				if(param_map.find(param_digest_b64) != param_map.end())
				{					
					decision = param_map[param_digest_b64];
					decision_found = true;
					LOGD("A decision for this request was already taken :  %d",decision);
					break;
				}
				else
					LOGD("no decision found");
			}while(up(path));			
			delete param_digest_b64;
			
			param_digest_b64 = new char[45];
			param_map_key = req->getRequestSubjectText() + path;
			digest_len = cryptoManager->calculateSHA256(original_param_map_key.data(), original_param_map_key.length(), digest);	
			toBase64((unsigned char*)digest, 32, param_digest_b64);
			param_digest_b64[44] = '\0';
			LOGD("Final digest for %s is %s",path.data(),param_digest_b64);			
			break; 
		}
	}	
	
	if(decision == DENY_THIS_SESSION || decision == DENY_ALWAYS){
		return "false";
	}
	if(decision == ALLOW_THIS_SESSION || decision == ALLOW_ALWAYS){
		return "true";
	}
	if(param_digest_b64)
		return string(digest_b64) + "#" + string(param_digest_b64);
	
	return digest_b64;
}
