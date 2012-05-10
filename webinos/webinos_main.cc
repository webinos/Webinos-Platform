#include <node.h>
#include <iostream>
#include <string.h>
#include <v8.h>

using namespace node;
using namespace v8;

int main(int argc, char *argv[]) {
//   Persistent<Object> binding_cache;
//   if (binding_cache.IsEmpty()) {
//     binding_cache = Persistent<Object>::New(Object::New());
//   }
//   Local<String> module = "certificate_manager"//args[0]->ToString();

//   for (int i = 0; node::node_module_list[i] != NULL; i++) {
//     std::cerr<< "buf" << node::node_module_list[i]->modname << std::endl;
// 
//   }
//   String::Utf8Value module_v(module);
  Start(argc, argv);
//   Local<Object> exports = Object::New();
//   
//   modp->register_func(exports);
  
}

// node_module_struct *get_module(const char* name) {
// 	
// }
// 
// 
// 
// node_module_struct* get_builtin_module(const char *name)
// {
//   char buf[128];
//   node_module_struct *cur = NULL;
//   snprintf(buf, sizeof(buf), "node_%s", name);
//   /* TODO: you could look these up in a hash, but there are only
//    * a few, and once loaded they are cached. */
//   for (int i = 0; node_module_list[i] != NULL; i++) {
//     cur = node_module_list[i];
//     std::cerr<< "buf" << cur->modname << std::endl;
//     if (strcmp(cur->modname, buf) == 0) {
//       return cur;
//     }
//   }
// 
//   return NULL;
// }