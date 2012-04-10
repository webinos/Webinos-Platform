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

#include "SecurityManager.h"

SecurityManager::SecurityManager(CryptoManager * cm){
	cryptoManager = cm;
}

SecurityManager::SecurityManager(){
	SecurityManager(string(POLICY_FILE_PREFIX) +"/"+POLICY_FILE);
}

SecurityManager::SecurityManager(const string& policy_path){
	policyManager = new PolicyManager(policy_path);
	widgetInfo = new WidgetInfo(false);	
	bool default_value = true;

}

string SecurityManager::getPolicyName(){
	return policyManager->getPolicyName();
}

SecurityManager::~SecurityManager(){
	LOG("[SecurityManager] : Calling SecurityManager destructor");
	delete policyManager;
	delete widgetInfo;
	delete cryptoManager;
}


bool SecurityManager::validateAllSignatures(const vector<string> & signatures){
	return cryptoManager->validateAllSignatures(signatures);
}

void SecurityManager::saveValidatedInfo(const string widgetRootPath){
	vector<pair<string,string>* > tmp = cryptoManager->getResourcesInfo();
	widgetInfo->setResources(widgetRootPath,tmp);
	tmp = cryptoManager->getSubjectInfo();
	widgetInfo->setSubjectsInfo(widgetRootPath, tmp);	
	saveWidgetInfo();
}


bool SecurityManager::verifyWidgetInfo(){
	return cryptoManager->verifyOnLoad(string(WIDGETINFO_FILE_PREFIX)+"/"+WIDGETINFO_FILE);
}

bool SecurityManager::validateAllReferences(const string widgetRootPath){
	vector<pair<string,string>* > resourceInfo = widgetInfo->getResources(widgetRootPath);	
	return cryptoManager->validateAllReferences(widgetRootPath, resourceInfo);
}

void SecurityManager::updateWidgetInfo(const string& widgetPath, const string& referenceName){
	string referencePath = widgetPath + "/" + referenceName;
	char digest_b64[45];
	cryptoManager->calculateSHA256(referencePath.data(), digest_b64);
	widgetInfo->addResource(widgetPath,referenceName,digest_b64);
}

bool SecurityManager::removeFromWidgetInfo(const string & widgetPath){
	return widgetInfo->removeWidget(widgetPath);
}

void SecurityManager::saveWidgetInfo(){
	if(cryptoManager->verifyOnSave(string(WIDGETINFO_FILE_PREFIX)+"/"+WIDGETINFO_FILE))
		if (widgetInfo->save())
			cryptoManager->sign(string(WIDGETINFO_FILE_PREFIX)+"/"+WIDGETINFO_FILE);
}

bool SecurityManager::handleAction(Action action,const char* digest_str, const char* param_digest_str){
	bool allow;
//	LOGD("[SecurityManager] Action : %d",action);
//	LOGD("[SecurityManager] digest : %s",digest_str);
//	LOGD("[SecurityManager] param_digest : %s",param_digest_str);
	
	switch(action){
		case DENY_ALWAYS:
			decision_map[digest_str] = DENY_ALWAYS;
			if (param_digest_str)
				param_map[param_digest_str] = DENY_ALWAYS;
			allow = false;
			break;
		case DENY_THIS_TIME:
			allow = false;
			break;
		case ALLOW_THIS_TIME:
			allow = true;
			break;
		case DENY_THIS_SESSION:
			decision_map[digest_str] = DENY_THIS_SESSION;
			if (param_digest_str)
				param_map[param_digest_str] = DENY_THIS_SESSION;
			allow = false;
			break;
		case ALLOW_THIS_SESSION:
			decision_map[digest_str] = ALLOW_THIS_SESSION;
			if (param_digest_str)
				param_map[param_digest_str] = ALLOW_THIS_SESSION;
			allow = true;
			break;
		case ALLOW_ALWAYS:
			decision_map[digest_str] = ALLOW_ALWAYS;
			if (param_digest_str)
				param_map[param_digest_str] = ALLOW_ALWAYS; 
			allow = true;
			break;
		default:
			allow = false;
	}
	LOG("[SecurityManager] : return "<<allow);
	return allow;	
}
