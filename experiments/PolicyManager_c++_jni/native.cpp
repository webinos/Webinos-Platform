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

#include <jni.h>
#include <string.h>
#include <stdio.h>

#include <map>
#include <vector>
#include <string>
using namespace std;

#include "debug.h"
#include "core/policymanager/PolicyManager.h"
#include "core/policymanager/Request.h"
#include "core/policymanager/SecurityManager_Android.h"
#include "crypto/CryptoManager_Android.h"

SecurityManager_Android * securityManager;

Request* jobject2Request(JNIEnv* env, jobject req);
extern "C" {
	
	void Java_it_unict_diit_pm_SecurityManager_nativeInitSecurityManager( JNIEnv*  env, jobject  thiz,jstring policy_path);
	jint Java_it_unict_diit_pm_SecurityManager_nativeCheckINSTALL( JNIEnv*  env, jobject  thiz, jobject req);
	jint Java_it_unict_diit_pm_SecurityManager_nativeCheckLOAD( JNIEnv*  env, jobject  thiz, jobject req);
	jint Java_it_unict_diit_pm_SecurityManager_nativeCheckINVOKE( JNIEnv*  env, jobject  thiz, jobject req);
	void Java_it_unict_diit_pm_SecurityManager_nativeSaveValidatedInfo(JNIEnv*  env, jobject  thiz,jstring s);
	jstring Java_it_unict_diit_pm_SecurityManager_nativeHandleEffect(JNIEnv*  env, jobject  thiz,jint effect,jobject req);
	jstring Java_it_unict_diit_pm_SecurityManager_nativeGetPolicyName(JNIEnv*  env, jobject  thiz);
	jboolean Java_it_unict_diit_pm_SecurityManager_nativeHandleAction(JNIEnv*  env, jobject  thiz,jint action,jstring dgst, jstring param_dgst);
	jboolean Java_it_unict_diit_pm_SecurityManager_nativeValidateAllSignatures(JNIEnv*  env, jobject  thiz,jobjectArray array);
	jboolean Java_it_unict_diit_pm_SecurityManager_nativeVerifyWidgetInfo(JNIEnv*  env, jobject  thiz);
	jboolean Java_it_unict_diit_pm_SecurityManager_nativeRemoveFromWidgetInfo(JNIEnv*  env, jobject  thiz, jstring s);
	void Java_it_unict_diit_pm_SecurityManager_nativeUpdateWidgetInfo(JNIEnv*  env, jobject  thiz,jstring s1, jstring s2);
	void Java_it_unict_diit_pm_SecurityManager_nativeSaveWidgetInfo(JNIEnv*  env, jobject  thiz);
	jboolean Java_it_unict_diit_pm_SecurityManager_nativeValidateAllReferences(JNIEnv*  env, jobject  thiz,jstring s);
}


Request* jobject2Request(JNIEnv* env, jobject req){
	Request * tmpReq;
	map<string, vector<string>*> * resource_attrs = new map<string, vector<string>*>();
	
	jclass requestClass = env->FindClass("it/unict/diit/pm/Request");
	jmethodID Request_getWidgetRootPath = env->GetMethodID(requestClass, "getWidgetRootPath", "()Ljava/lang/String;");
	jstring widgetRootPath =(jstring) env->CallObjectMethod(req, Request_getWidgetRootPath);
//	LOGD("native %s",jstring2chars(env,widgetRootPath));
	
	jmethodID Request_getRoaming = env->GetMethodID(requestClass, "getRoaming", "()Ljava/lang/String;");
	jstring roaming = (jstring) env->CallObjectMethod(req, Request_getRoaming);
	LOGD("ROAMING = %s", jstring2chars(env, roaming));
	jmethodID Request_getResourceAttrs = env->GetMethodID(requestClass, "getResourceAttrs", "()Ljava/util/HashMap;");
	jobject jresources_hashmap = env->CallObjectMethod(req, Request_getResourceAttrs);
	
	jclass hashmapClass = env->FindClass("java/util/HashMap");
	jmethodID HashMap_keySet = env->GetMethodID(hashmapClass, "keySet", "()Ljava/util/Set;");
	jobject jkeys_set = env->CallObjectMethod(jresources_hashmap, HashMap_keySet);
	jmethodID HashMap_get = env->GetMethodID(hashmapClass, "get", "(Ljava/lang/Object;)Ljava/lang/Object;");
	
	jclass setClass = env->FindClass("java/util/Set");
	jmethodID Set_toArray = env->GetMethodID(setClass, "toArray", "()[Ljava/lang/Object;");
	jobjectArray jkey_array = (jobjectArray) env->CallObjectMethod(jkeys_set, Set_toArray);

	jclass vectorClass = env->FindClass("java/util/Vector");
	jmethodID Vector_size = env->GetMethodID(vectorClass, "size", "()I");	
	jmethodID Vector_elementAt = env->GetMethodID(vectorClass, "elementAt", "(I)Ljava/lang/Object;");

	jsize keys_length = env->GetArrayLength(jkey_array);
//	LOGD("key size : %d",keys_length);
	jstring tmp_key,tmp_s;
	for(int i=0; i<keys_length; i++){
		tmp_key = (jstring) env->GetObjectArrayElement(jkey_array, i);
//		LOGD("KEY %d = %s", i, jstring2chars(env, tmp_key));
		vector<string> * tmp_vet = new vector<string>();
		jobject jvet = env->CallObjectMethod(jresources_hashmap, HashMap_get, tmp_key);
		int size = env->CallIntMethod(jvet, Vector_size);
		
		for(int i=0; i<size; i++){
			tmp_s = (jstring) env->CallObjectMethod(jvet, Vector_elementAt, i);
			tmp_vet->push_back(jstring2chars(env, tmp_s));
			LOGD("Add Elem : %s",jstring2chars(env,tmp_s));
		}
		char * char_key = jstring2chars(env, tmp_key);
		(*resource_attrs)[char_key] = tmp_vet;
		env->ReleaseStringUTFChars(tmp_key, char_key);
	}
	
		if(resource_attrs->find("api-feature") == resource_attrs->end())
			(*resource_attrs)["api-feature"] = new vector<string>();
		if(resource_attrs->find("device-cap") == resource_attrs->end())
			(*resource_attrs)["device-cap"] = new vector<string>(); 
	//************************************************************************************************************************************************************************************************************
		
	char * char_widgetRootPath = jstring2chars(env,widgetRootPath);
	char * char_roaming = jstring2chars(env,roaming);
		
	map<string,string>* environment = new map<string,string>();
	(*environment)["roaming"] = char_roaming;
	tmpReq = new Request(char_widgetRootPath, *resource_attrs,*environment);
		
	env->ReleaseStringUTFChars(widgetRootPath, char_widgetRootPath);
	env->ReleaseStringUTFChars(roaming, char_roaming);
	return tmpReq;
}


void Java_it_unict_diit_pm_SecurityManager_nativeInitSecurityManager( JNIEnv*  env, jobject  thiz,jstring policy_path){
	string path = string(env->GetStringUTFChars(policy_path, 0));
	securityManager = new SecurityManager_Android(path);
}

jint Java_it_unict_diit_pm_SecurityManager_nativeCheckINSTALL( JNIEnv*  env, jobject  thiz, jobject req){
	Request * tmpReq = jobject2Request(env, req);
	return securityManager->check_INSTALL(tmpReq);
}

jint Java_it_unict_diit_pm_SecurityManager_nativeCheckLOAD( JNIEnv*  env, jobject  thiz, jobject req){
	Request * tmpReq = jobject2Request(env, req);
	return (jint) securityManager->check_LOAD(tmpReq);
}

jint Java_it_unict_diit_pm_SecurityManager_nativeCheckINVOKE( JNIEnv*  env, jobject  thiz, jobject req){
	Request * tmpReq = jobject2Request(env, req);
	return securityManager->check_INVOKE(tmpReq);
}

jboolean Java_it_unict_diit_pm_SecurityManager_nativeValidateAllSignatures(JNIEnv*  env, jobject  thiz,jobjectArray array){
	vector<string> * vet_paths = new vector<string>();
	for(int i=0; i<env->GetArrayLength(array); i++){
		vet_paths->push_back(jstring2chars(env, (jstring) env->GetObjectArrayElement(array, i)));
	}	
	return securityManager->validateAllSignatures(*vet_paths);
}
	
void Java_it_unict_diit_pm_SecurityManager_nativeSaveValidatedInfo(JNIEnv*  env, jobject  thiz,jstring s){
	string widgetRootPath = jstring2chars(env,s);
	securityManager->saveValidatedInfo(widgetRootPath);
}

jstring Java_it_unict_diit_pm_SecurityManager_nativeHandleEffect(JNIEnv*  env, jobject  thiz,jint effect,jobject req){
	Request * tmpReq = jobject2Request(env, req);
	string resp = securityManager->handleEffect((Effect)effect,tmpReq);
	return env->NewStringUTF(resp.c_str());
}

jstring Java_it_unict_diit_pm_SecurityManager_nativeGetPolicyName(JNIEnv*  env, jobject  thiz){
	return env->NewStringUTF(securityManager->getPolicyName().data());
}

jboolean Java_it_unict_diit_pm_SecurityManager_nativeVerifyWidgetInfo(JNIEnv*  env, jobject  thiz){
	return securityManager->verifyWidgetInfo();
}

jboolean Java_it_unict_diit_pm_SecurityManager_nativeValidateAllReferences(JNIEnv*  env, jobject  thiz,jstring s){
	string widgetRootPath = jstring2chars(env,s);
	return securityManager->validateAllReferences(widgetRootPath);
}

void Java_it_unict_diit_pm_SecurityManager_nativeUpdateWidgetInfo(JNIEnv*  env, jobject  thiz,jstring s1, jstring s2){
	string widgetRootPath = jstring2chars(env,s1);
	string widgetName = jstring2chars(env,s2);
	securityManager->updateWidgetInfo(widgetRootPath,widgetName);
}

void Java_it_unict_diit_pm_SecurityManager_nativeSaveWidgetInfo(JNIEnv*  env, jobject  thiz){
	securityManager->saveWidgetInfo();
}

jboolean Java_it_unict_diit_pm_SecurityManager_nativeRemoveFromWidgetInfo(JNIEnv*  env, jobject  thiz, jstring s){
	string widgetRootPath = jstring2chars(env,s);
	return securityManager->removeFromWidgetInfo(widgetRootPath);
}

jboolean Java_it_unict_diit_pm_SecurityManager_nativeHandleAction(JNIEnv*  env, jobject  thiz,jint action,jstring dgst, jstring param_dgst){
	const char* dgst_c = NULL;
	const char* param_dgst_c = NULL;
	if(dgst){
		dgst_c = env->GetStringUTFChars(dgst, 0);
//		LOGD("dgst_c is : %s",dgst_c);
		if(param_dgst){
			param_dgst_c = env->GetStringUTFChars(param_dgst, 0);
//			LOGD("param_dgst_c is : %s",param_dgst_c);
		}
		
		jboolean resp = securityManager->handleAction((Action) action, dgst_c, param_dgst_c);
		LOGD("native resp from handleAction is : %d",resp);
		env->ReleaseStringUTFChars(dgst, dgst_c);
		if(param_dgst)
			env->ReleaseStringUTFChars(param_dgst, param_dgst_c);
		return resp;
	}
	return false;
}
