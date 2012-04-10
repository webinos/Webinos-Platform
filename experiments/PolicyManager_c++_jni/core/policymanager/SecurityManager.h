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

#ifndef SECURITYMANAGER_H_
#define SECURITYMANAGER_H_


#include "Globals.h"
#include "core/Environment.h"
#ifdef QT
	#include "crypto/CryptoManager_Qt.h"
#endif

#ifdef JNI
	#include "crypto/CryptoManager_Android.h"
#endif

#include "core/policymanager/PolicyManager.h"
#include "core/policymanager/Request.h"
#include "core/policymanager/WidgetInfo.h"


#include <string>
#include <map>
#include <vector>
using namespace std;

#ifdef QT
#include "core/BondiDebug.h"
#include <QObject>
	class SecurityManager : public QObject {
#endif
#ifdef JNI
#include "debug.h"
	class SecurityManager {
#endif

protected:
	PolicyManager						* policyManager;
	WidgetInfo 						* widgetInfo;
	CryptoManager						* cryptoManager;
//	map<string,vector<string>*> 			ht_API_feature_set;
//	map<string,bool> 					ht_API_feature;
//	map<string,vector<string>* > 			ht_dev_cap;
	map<string, Action> decision_map;
	map<string, Action> param_map;

//	vector<string>* getCapabilityFromFeature(vector<string>*);
	
public:	
	SecurityManager();
	SecurityManager(const string &);
	SecurityManager(CryptoManager*);
	virtual ~SecurityManager();
	bool validateAllSignatures(const vector<string> &);
	bool validateAllReferences(const string widgetRootPath);
	void saveValidatedInfo(const string widgetRootPath);
	bool handleAction(Action, const char*, const char* param_digest_str = NULL);
	string getPolicyName();

	void updateWidgetInfo(const string&, const string&);
	bool removeFromWidgetInfo(const string &);
	void saveWidgetInfo();
	bool verifyWidgetInfo();
//	string getParent(const string&);
//	bool isImplemented(const string& feature);
};

#endif /* SECURITYMANAGER_H_ */
