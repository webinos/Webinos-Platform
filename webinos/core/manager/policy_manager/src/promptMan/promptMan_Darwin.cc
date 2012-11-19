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
 * Copyright 2012 Telecom Italia SpA
 * 
 ******************************************************************************/

#include <v8.h>
#include <node.h>

#include <stdlib.h>
#include <string>
#include <iostream>
#include <sstream>

#include "../debug.h"

using namespace node;
using namespace v8;


class PromptManInt: ObjectWrap{

private:  
	int m_count;
	
public:
	static Persistent<FunctionTemplate> s_ct;
  
	static void Init(Handle<Object> target)  {
		LOGD("Init");
		HandleScope scope;
		Local<FunctionTemplate> t = FunctionTemplate::New(New);
		s_ct = Persistent<FunctionTemplate>::New(t);
		s_ct->InstanceTemplate()->SetInternalFieldCount(1);
		s_ct->SetClassName(String::NewSymbol("PromptManInt"));
		NODE_SET_PROTOTYPE_METHOD(s_ct, "display", Display);
		target->Set(String::NewSymbol("PromptManInt"), s_ct->GetFunction());
	}

	PromptManInt() :    m_count(0)  {
	}
	
	~PromptManInt()  {  }

	static Handle<Value> New(const Arguments& args)  {
		LOGD("New");
		HandleScope scope;
		PromptManInt* pmtmp = new PromptManInt();

		pmtmp->Wrap(args.This());
		return args.This();
	}

	static Handle<Value> Display(const Arguments& args)  {
		LOGD("display");
		HandleScope scope;

		PromptManInt* pmtmp = ObjectWrap::Unwrap<PromptManInt>(args.This());
		pmtmp->m_count++;

		if (args.Length() < 2) {
			return ThrowException(Exception::TypeError(String::New("Argument(s) missing")));
		}

		if (!args[0]->IsString()) {
			return ThrowException(Exception::TypeError(String::New("Bad type argument")));
		}

		if (!args[1]->IsArray()) {
			return ThrowException(Exception::TypeError(String::New("Bad type argument")));
		}

		v8::String::AsciiValue message(args[0]->ToString());

		Handle<Array> choiceArray = Handle<Array>::Cast(args[1]);

		//Prepare Xmessage cmdline
                std::stringstream cmdstream(std::stringstream::out);
                cmdstream << "/usr/X11/bin/xmessage -buttons ";
                bool firstElement = true;
                for(unsigned int i=0; i<choiceArray->Length(); i++) {
                        v8::Local<v8::Value> choiceTmp = choiceArray->Get(i);
                        v8::String::AsciiValue choice(choiceTmp->ToString());
                        //LOGD("Choice %d is %s", i, *choice);
			LOGD("FirstElement %d", firstElement);
                        if(firstElement) {
                                firstElement = false;
			}
			else {
                                cmdstream << ",";
                        }
                        cmdstream << "\"" << *choice << "\"" << ":" << i;
                }

                cmdstream << " -center \"" << *message << "\"";
		std::string cmdline = cmdstream.str();

		LOGD("cmdline is %s", cmdline.data());
		int res=(system(cmdline.data()))>>8;
		LOGD("Answer is %d", res);


		//Local<Integer> result = Integer::New(-3);
		Handle<Integer> result = Integer::New(res);
		
		return scope.Close(result);
	}

	
};

Persistent<FunctionTemplate> PromptManInt::s_ct;

extern "C" {
	static void init (Handle<Object> target)  {
		PromptManInt::Init(target);  
	}
	NODE_MODULE(promptMan, init);
} 

