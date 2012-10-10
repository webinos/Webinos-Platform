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

#include <v8.h>
#include <node.h>

#include "core/policymanager/PolicyManager.h"
#include "debug.h"

using namespace node;
using namespace v8;

#ifdef ANDROID
	string policyFileName = "/sdcard/webinos/policy/policy.xml";
#else
	string policyFileName = "./policy.xml";
#endif

class PolicyManagerInt: ObjectWrap{

private:  
	int m_count;
	
public:
	PolicyManager* pminst;
	static Persistent<FunctionTemplate> s_ct;
  
	static void Init(Handle<Object> target)  {
		HandleScope scope;
		Local<FunctionTemplate> t = FunctionTemplate::New(New);
		s_ct = Persistent<FunctionTemplate>::New(t);
		s_ct->InstanceTemplate()->SetInternalFieldCount(1);
		s_ct->SetClassName(String::NewSymbol("PolicyManagerInt"));
		NODE_SET_PROTOTYPE_METHOD(s_ct, "enforceRequest", EnforceRequest);
		NODE_SET_PROTOTYPE_METHOD(s_ct, "reloadPolicy", ReloadPolicy);
		target->Set(String::NewSymbol("PolicyManagerInt"),
		s_ct->GetFunction());
	}

	PolicyManagerInt() :    m_count(0)  {
	}
	
	~PolicyManagerInt()  {  }

	static Handle<Value> New(const Arguments& args)  {
		HandleScope scope;
		PolicyManagerInt* pmtmp = new PolicyManagerInt();

		if (args.Length() > 0) {
			if (!args[0]->IsString()) {
				LOGD("Wrong parameter type");
				return ThrowException(Exception::TypeError(String::New("Bad type argument")));
			}
			v8::String::AsciiValue tmpFileName(args[0]->ToString());
			LOGD("Parameter file: %s", *tmpFileName);
			policyFileName = *tmpFileName;
		}

		pmtmp->pminst = new PolicyManager(policyFileName);
		pmtmp->Wrap(args.This());
		return args.This();
	}

	static Handle<Value> EnforceRequest(const Arguments& args)  {
		HandleScope scope;

		if (args.Length() < 1) {
			return ThrowException(Exception::TypeError(String::New("Argument missing")));
		}

		if (!args[0]->IsObject()) {
			return ThrowException(Exception::TypeError(String::New("Bad type argument")));
		}
		
		PolicyManagerInt* pmtmp = ObjectWrap::Unwrap<PolicyManagerInt>(args.This());
		pmtmp->m_count++;

		map<string, vector<string>*> * subject_attrs = new map<string, vector<string>*>();
		(*subject_attrs)["user-id"] = new vector<string>();
		(*subject_attrs)["user-key-cn"] = new vector<string>();
		(*subject_attrs)["user-key-fingerprint"] = new vector<string>();
		(*subject_attrs)["user-key-root-cn"] = new vector<string>();
		(*subject_attrs)["user-key-root-fingerprint"] = new vector<string>();
		
		(*subject_attrs)["id"] = new vector<string>();
		
		(*subject_attrs)["distributor-key-cn"] = new vector<string>();
		(*subject_attrs)["distributor-key-fingerprint"] = new vector<string>();
		(*subject_attrs)["distributor-key-root-cn"] = new vector<string>();
		(*subject_attrs)["distributor-key-root-fingerprint"] = new vector<string>();

		(*subject_attrs)["author-key-cn"] = new vector<string>();
		(*subject_attrs)["author-key-fingerprint"] = new vector<string>();
		(*subject_attrs)["author-key-root-cn"] = new vector<string>();
		(*subject_attrs)["author-key-root-fingerprint"] = new vector<string>();

		(*subject_attrs)["target-id"] = new vector<string>();
		(*subject_attrs)["target-domain"] = new vector<string>();
		(*subject_attrs)["requestor-id"] = new vector<string>();
		(*subject_attrs)["requestor-domain"] = new vector<string>();
		(*subject_attrs)["webinos-enabled"] = new vector<string>();

		map<string, vector<string>*> * resource_attrs = new map<string, vector<string>*>();
		(*resource_attrs)["api-feature"] = new vector<string>();
		(*resource_attrs)["device-cap"] = new vector<string>();

		if (args[0]->ToObject()->Has(String::New("resourceInfo"))) {
			v8::Local<Value> riTmp = args[0]->ToObject()->Get(String::New("resourceInfo"));
			if (riTmp->ToObject()->Has(String::New("deviceCap"))) {
				v8::String::AsciiValue deviceCap(riTmp->ToObject()->Get(String::New("deviceCap")));
				(*resource_attrs)["device-cap"]->push_back(*deviceCap);
				LOGD("Parameter device-cap : %s", *deviceCap);
			}
			if (riTmp->ToObject()->Has(String::New("apiFeature"))) {
				v8::String::AsciiValue apiFeature(riTmp->ToObject()->Get(String::New("apiFeature")));
				(*resource_attrs)["api-feature"]->push_back(*apiFeature);
				LOGD("Parameter api-feature : %s", *apiFeature);
			}
		}
		
		if (args[0]->ToObject()->Has(String::New("subjectInfo"))) {
			v8::Local<Value> siTmp = args[0]->ToObject()->Get(String::New("subjectInfo"));
			if (siTmp->ToObject()->Has(String::New("userId"))) {
				v8::String::AsciiValue userId(siTmp->ToObject()->Get(String::New("userId")));
				(*subject_attrs)["user-id"]->push_back(*userId);
				LOGD("Parameter user-id : %s", *userId);
			}
			if (siTmp->ToObject()->Has(String::New("userKeyCn"))) {
				v8::String::AsciiValue userKeyCn(siTmp->ToObject()->Get(String::New("userKeyCn")));
				(*subject_attrs)["user-key-cn"]->push_back(*userKeyCn);
				LOGD("Parameter user-key-cn : %s", *userKeyCn);
			}
			if (siTmp->ToObject()->Has(String::New("userKeyFingerprint"))) {
				v8::String::AsciiValue userKeyFingerprint(siTmp->ToObject()->Get(String::New("userKeyFingerprint")));
				(*subject_attrs)["user-key-fingerprint"]->push_back(*userKeyFingerprint);
				LOGD("Parameter user-key-fingerprint : %s", *userKeyFingerprint);
			}
			if (siTmp->ToObject()->Has(String::New("userKeyRootCn"))) {
				v8::String::AsciiValue userKeyRootCn(siTmp->ToObject()->Get(String::New("userKeyRootCn")));
				(*subject_attrs)["user-key-root-cn"]->push_back(*userKeyRootCn);
				LOGD("Parameter user-key-root-cn : %s", *userKeyRootCn);
			}
			if (siTmp->ToObject()->Has(String::New("userKeyRootFingerprint"))) {
				v8::String::AsciiValue userKeyRootFingerprint(siTmp->ToObject()->Get(String::New("userKeyRootFingerprint")));
				(*subject_attrs)["user-key-root-fingerprint"]->push_back(*userKeyRootFingerprint);
				LOGD("Parameter user-key-root-fingerprint : %s", *userKeyRootFingerprint);
			}
		}

		if (args[0]->ToObject()->Has(String::New("widgetInfo"))) {
			v8::Local<Value> wiTmp = args[0]->ToObject()->Get(String::New("widgetInfo"));
			if (wiTmp->ToObject()->Has(String::New("id"))) {
				v8::String::AsciiValue id(wiTmp->ToObject()->Get(String::New("id")));
				(*subject_attrs)["id"]->push_back(*id);
				LOGD("Parameter id : %s", *id);
			}
			if (wiTmp->ToObject()->Has(String::New("distributorKeyCn"))) {
				v8::String::AsciiValue distributorKeyCn(wiTmp->ToObject()->Get(String::New("distributorKeyCn")));
				(*subject_attrs)["distributor-key-cn"]->push_back(*distributorKeyCn);
				LOGD("Parameter distributor-key-cn : %s", *distributorKeyCn);
			}
			if (wiTmp->ToObject()->Has(String::New("distributorKeyFingerprint"))) {
				v8::String::AsciiValue distributorKeyFingerprint(wiTmp->ToObject()->Get(String::New("distributorKeyFingerprint")));
				(*subject_attrs)["distributor-key-fingerprint"]->push_back(*distributorKeyFingerprint);
				LOGD("Parameter distributor-key-fingerprint : %s", *distributorKeyFingerprint);
			}
			if (wiTmp->ToObject()->Has(String::New("distributorKeyRootCn"))) {
				v8::String::AsciiValue distributorKeyRootCn(wiTmp->ToObject()->Get(String::New("distributorKeyRootCn")));
				(*subject_attrs)["distributor-key-root-cn"]->push_back(*distributorKeyRootCn);
				LOGD("Parameter distributor-key-root-cn : %s", *distributorKeyRootCn);
			}
			if (wiTmp->ToObject()->Has(String::New("distributorKeyRootFingerprint"))) {
				v8::String::AsciiValue distributorKeyRootFingerprint(wiTmp->ToObject()->Get(String::New("distributorKeyRootFingerprint")));
				(*subject_attrs)["distributor-key-root-fingerprint"]->push_back(*distributorKeyRootFingerprint);
				LOGD("Parameter distributor-key-root-fingerprint : %s", *distributorKeyRootFingerprint);
			}
			if (wiTmp->ToObject()->Has(String::New("authorKeyCn"))) {
				v8::String::AsciiValue authorKeyCn(wiTmp->ToObject()->Get(String::New("authorKeyCn")));
				(*subject_attrs)["author-key-cn"]->push_back(*authorKeyCn);
				LOGD("Parameter author-key-cn : %s", *authorKeyCn);
			}
			if (wiTmp->ToObject()->Has(String::New("authorKeyFingerprint"))) {
				v8::String::AsciiValue authorKeyFingerprint(wiTmp->ToObject()->Get(String::New("authorKeyFingerprint")));
				(*subject_attrs)["author-key-fingerprint"]->push_back(*authorKeyFingerprint);
				LOGD("Parameter author-key-fingerprint : %s", *authorKeyFingerprint);
			}
			if (wiTmp->ToObject()->Has(String::New("authorKeyRootCn"))) {
				v8::String::AsciiValue authorKeyRootCn(wiTmp->ToObject()->Get(String::New("authorKeyRootCn")));
				(*subject_attrs)["author-key-root-cn"]->push_back(*authorKeyRootCn);
				LOGD("Parameter author-key-root-cn : %s", *authorKeyRootCn);
			}
			if (wiTmp->ToObject()->Has(String::New("authorKeyRootFingerprint"))) {
				v8::String::AsciiValue authorKeyRootFingerprint(wiTmp->ToObject()->Get(String::New("authorKeyRootFingerprint")));
				(*subject_attrs)["author-key-root-fingerprint"]->push_back(*authorKeyRootFingerprint);
				LOGD("Parameter author-key-root-fingerprint : %s", *authorKeyRootFingerprint);
			}
		}

		if (args[0]->ToObject()->Has(String::New("deviceInfo"))) {
			v8::Local<Value> diTmp = args[0]->ToObject()->Get(String::New("deviceInfo"));
			if (diTmp->ToObject()->Has(String::New("targetId"))) {
				v8::String::AsciiValue targetId(diTmp->ToObject()->Get(String::New("targetId")));
				(*subject_attrs)["target-id"]->push_back(*targetId);
				LOGD("Parameter target-id : %s", *targetId);
			}
			if (diTmp->ToObject()->Has(String::New("targetDomain"))) {
				v8::String::AsciiValue targetDomain(diTmp->ToObject()->Get(String::New("targetDomain")));
				(*subject_attrs)["target-domain"]->push_back(*targetDomain);
				LOGD("Parameter target-domain : %s", *targetDomain);
			}
			if (diTmp->ToObject()->Has(String::New("requestorId"))) {
				v8::String::AsciiValue requestorId(diTmp->ToObject()->Get(String::New("requestorId")));
				(*subject_attrs)["requestor-id"]->push_back(*requestorId);
				LOGD("Parameter requestor-id : %s", *requestorId);
			}
			if (diTmp->ToObject()->Has(String::New("requestorDomain"))) {
				v8::String::AsciiValue requestorDomain(diTmp->ToObject()->Get(String::New("requestorDomain")));
				(*subject_attrs)["requestor-domain"]->push_back(*requestorDomain);
				LOGD("Parameter requestor-domain : %s", *requestorDomain);
			}
			if (diTmp->ToObject()->Has(String::New("webinosEnabled"))) {
				v8::String::AsciiValue webinosEnabled(diTmp->ToObject()->Get(String::New("webinosEnabled")));
				(*subject_attrs)["webinos-enabled"]->push_back(*webinosEnabled);
				LOGD("Parameter webinos-enabled : %s", *webinosEnabled);
			}
		}

//		string widPath(".");

//		string roam("N");
//		map<string,string>* environment = new map<string,string>();
//		(*environment)["roaming"] = roam;
		
//		Request* myReq = new Request(widPath, *resource_attrs, *environment);
		Request* myReq = new Request(*subject_attrs, *resource_attrs);
		
		Effect myEff = pmtmp->pminst->checkRequest(myReq);

		//enum Effect {PERMIT, DENY, PROMPT_ONESHOT, PROMPT_SESSION, PROMPT_BLANKET, UNDETERMINED, INAPPLICABLE};

		Local<Integer> result = Integer::New(myEff);
		
		return scope.Close(result);
	}

	
	
	
	static Handle<Value> ReloadPolicy(const Arguments& args)  {
		HandleScope scope;

		PolicyManagerInt* pmtmp = ObjectWrap::Unwrap<PolicyManagerInt>(args.This());

		//TODO: Reload policy file
		delete pmtmp->pminst;
		pmtmp->pminst = new PolicyManager(policyFileName);

		Local<Integer> result = Integer::New(0);
		
		return scope.Close(result);
	}
	
	
	
};

Persistent<FunctionTemplate> PolicyManagerInt::s_ct;

extern "C" {
	static void init (Handle<Object> target)  {
		PolicyManagerInt::Init(target);  
	}
	NODE_MODULE(pm, init);
} 

