#include <cstring>
#include <string>
#include <v8.h>
#include <node.h>
#include "aspects.h"

using namespace v8;
using namespace node;

namespace nativedevicestatus_v8 {

/*
	const char* toCString(const v8::String::Utf8Value& value) {
		return *value ? *value : "<string conversion failed>";
	}

	map<string, string>* UnwrapMap(Handle<Object> obj) {
		Handle<External> field = Handle<External>::Cast(obj->GetInternalField(0));
		void* ptr = field->Value();
		return static_cast<map<string, string>*>(ptr);
	}
 
	string ObjectToString(Local<Value> value) {
		String::Utf8Value utf8_value(value);
		return string(*utf8_value);
	}
*/

	Handle<Value> getComponents( const Arguments &args )
	{
		HandleScope handle_scope;
		Handle<Array> array = Array::New(3);
	
		if (array.IsEmpty())
			return Handle<Array>();
	
		if (args.Length() > 0) {
			String::Utf8Value aspectName(args[0]);
			string cAspectName = string(*aspectName);

			Aspect * aspect = Aspects::get(cAspectName);
			
			if (aspect == 0)
				return Handle<Array>();

			vector<string> components = aspect->getComponents();
			
			for (int i=0; i < components.size(); i++) {
				array->Set(i, String::New(components[i].c_str(), components[i].length()));
			}

			return handle_scope.Close(array);
		}
		else 
			printf("getComponents has not arguments");
		
		fflush(stdout);
		return Handle<Array>();
	}

	Handle<Value> isSupported( const Arguments &args )
	{
		if (args.Length() > 0) {
			HandleScope handle_scope;
			String::Utf8Value aspectName(args[0]);
			string cAspectName = (*aspectName);

			Aspect * aspect = Aspects::get(cAspectName);
			
			if (aspect == 0)
				return Boolean::New(false);

			if (args.Length() > 1) {
				String::Utf8Value propertyName(args[1]);
				string cPropertyName = string(*propertyName);

				return Boolean::New(aspect->isSupported(&cPropertyName));
			}
			else
				return Boolean::New(aspect->isSupported());
		}

		printf("isSupported has not arguments => return false");
		
		fflush(stdout);
		return Boolean::New(false);
	}

	Handle<Value> getPropertyValue( const Arguments &args )
	{
		string propertyValue;

		if (args.Length() > 1) {
			HandleScope handle_scope;
			String::Utf8Value aspectName(args[0]);
			string cAspectName = string(*aspectName);
			String::Utf8Value propertyName(args[1]);
			string cPropertyName = string(*propertyName);

			Aspect * aspect = Aspects::get(cAspectName);
			
			if (aspect == 0)
				return Undefined();

			if (args.Length() > 2) {
				String::Utf8Value componentName(args[2]);
				string cComponentName = string(*componentName);

				propertyValue = aspect->getPropertyValue(&cPropertyName, &cComponentName);
			}
			else
				propertyValue = aspect->getPropertyValue(&cPropertyName);

			return String::New(propertyValue.c_str(), propertyValue.length());
		}
		else 
			printf("getPropertyValue has not arguments");

		fflush(stdout);
		return Undefined();
	}

	Handle<Value> watchPropertyChange( const Arguments &args )
	{
		string res = "watchPropertyChange";
		return String::New(res.c_str(), res.length());
	}
}

extern "C"
{
	static void init( Handle<Object> target )
	{
		Local<FunctionTemplate> ft1 = FunctionTemplate::New(nativedevicestatus_v8::getComponents);
		Local<FunctionTemplate> ft2 = FunctionTemplate::New(nativedevicestatus_v8::isSupported);
		Local<FunctionTemplate> ft3 = FunctionTemplate::New(nativedevicestatus_v8::getPropertyValue);
		Local<FunctionTemplate> ft4 = FunctionTemplate::New(nativedevicestatus_v8::watchPropertyChange);
	
		target->Set( String::NewSymbol( "getComponents" ), ft1->GetFunction() );
		target->Set( String::NewSymbol( "isSupported" ), ft2->GetFunction() );
		target->Set( String::NewSymbol( "getPropertyValue" ), ft3->GetFunction() );
		target->Set( String::NewSymbol( "watchPropertyChange" ), ft4->GetFunction() );
	}

	NODE_MODULE(nativedevicestatus, init);
}
