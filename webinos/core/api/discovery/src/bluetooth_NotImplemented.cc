// TODO: Implement bluetooth on windows
#include <v8.h>
#include <node.h>

using namespace node;
using namespace v8;


class BTDiscovery: ObjectWrap
{
  public:

  static Persistent<FunctionTemplate> s_ct;

  static void Init(Handle<Object> target)
  {
    HandleScope scope;

    Local<FunctionTemplate> t = FunctionTemplate::New(New);

    s_ct = Persistent<FunctionTemplate>::New(t);
    s_ct->InstanceTemplate()->SetInternalFieldCount(1);
    s_ct->SetClassName(String::NewSymbol("BT"));

    NODE_SET_PROTOTYPE_METHOD(s_ct, "scan_device", Scan_device);

    NODE_SET_PROTOTYPE_METHOD(s_ct, "file_transfer", File_transfer);
    
    target->Set(String::NewSymbol("bluetooth"), s_ct->GetFunction());
  }

  BTDiscovery()
  {
  }

  ~BTDiscovery()
  {
  }

  static Handle<Value> New(const Arguments& args)
  {
    HandleScope scope;
    BTDiscovery* bd = new BTDiscovery();
    bd->Wrap(args.This());
    return args.This();
  }

  static Handle<Value> Scan_device(const Arguments& args)
  {
	throw "Not implemented yet";
  }

  static Handle<Value> File_transfer(const Arguments& args)
  {
    throw "Not implemented yet";
  }
};
Persistent<FunctionTemplate> BTDiscovery::s_ct;

extern "C" {
  static void init (Handle<Object> target)
  {
	  BTDiscovery::Init(target);
  }

  NODE_MODULE(bluetooth, init);
}
