#include <v8.h>
#include <node.h>
#include "ksImpl.h"

using namespace node;
using namespace v8;


v8::Handle<Value> _get(const Arguments& args)
{
  try {
    HandleScope scope;
    if (args.Length() == 1 && args[0]->IsString()) {
      String::Utf8Value secretKey(args[0]->ToString());
      void * secret = 0;
      const int secretLength = __get(secretKey.operator*(),&secret);
      char * secretStr = static_cast<char *>(secret);
      Local<String> result = String::New(secretStr,secretLength);
      __freeSecretResource(secret);
      return scope.Close(result);
    }
    else {
      return ThrowException(Exception::TypeError(String::New("Secret key must be specified")));
    }
  }
  catch(::KeyStoreException& e) {
    return ThrowException(Exception::TypeError(String::New(e.what())));
  }
  catch(...) {
    return ThrowException(Exception::TypeError(String::New("Unknown exception")));
  }
}

v8::Handle<Value> _put(const Arguments& args)
{
  try {
    HandleScope scope;
    if (args.Length() == 2 && args[0]->IsString() && args[1]->IsString())  {
      String::Utf8Value secretKey(args[0]->ToString());
      String::Utf8Value secret(args[1]->ToString());
      __put(secretKey.operator*(),secret.operator*());
      return scope.Close(True());
    } 
    else {
      return ThrowException( Exception::TypeError(String::New("Secret key and secret must be specified")));
    } 
  }
  catch(::KeyStoreException& e) {
    return ThrowException(Exception::TypeError(String::New(e.what())));
  }
  catch(...) {
    return ThrowException(Exception::TypeError(String::New("Unknown exception")));
  }
}

v8::Handle<Value> _delete(const Arguments& args)
{
  try {
    HandleScope scope;
    if (args.Length() == 1 && args[0]->IsString())  {
      String::Utf8Value secretKey(args[0]->ToString());
      __delete(secretKey.operator*());
      return scope.Close(True());
    } 
    else {
      return ThrowException( Exception::TypeError(String::New("Secret key must be specified")));
    } 
  }
  catch(::KeyStoreException& e) {
    return ThrowException(Exception::TypeError(String::New(e.what())));
  }
  catch(...) {
    return ThrowException(Exception::TypeError(String::New("Unknown exception")));
  }
}

extern "C" {
  static void init(v8::Handle<Object> target)
  {
    NODE_SET_METHOD(target,"get",_get);
    NODE_SET_METHOD(target,"put",_put);
    NODE_SET_METHOD(target,"delete",_delete);
  }
  NODE_MODULE(keystore,init);
}
