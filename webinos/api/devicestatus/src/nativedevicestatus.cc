#include <cstring>
#include <string>
#include <v8.h>
#include <node.h>
#include "battery.h"

using namespace v8;
using namespace node;

namespace nativedevicestatus_v8 {
	Handle<Value> getComponents( const Arguments &args )
	{
		std::string res = "getComponents";
		return String::New(res.c_str(), res.length());
	}

	Handle<Value> isSupported( const Arguments &args )
	{
		return Boolean::New(true);
	}

	Handle<Value> getPropertyValue( const Arguments &args )
	{
		std::string res = "getPropertyValue";
		return String::New(res.c_str(), res.length());
	}

	Handle<Value> watchPropertyChange( const Arguments &args )
	{
		std::string res = "watchPropertyChange";
		return String::New(res.c_str(), res.length());
	}
}

extern "C"
void init( Handle<Object> target )
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
