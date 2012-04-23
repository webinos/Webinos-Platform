#include <node.h>

// #undef NODE_EXT_LIST_START
// #undef NODE_EXT_LIST_ITEM
// #undef NODE_EXT_LIST_END
// 
// #define NODE_EXT_LIST_START
// #define NODE_EXT_LIST_ITEM NODE_MODULE_DECL
// #define NODE_EXT_LIST_END
// 
// #include <node_extensions.h>
// 
// #undef NODE_EXT_LIST_START
// #undef NODE_EXT_LIST_ITEM
// #undef NODE_EXT_LIST_END
// 
// #define NODE_EXT_STRING(x) &x ## _module,
// #define NODE_EXT_LIST_START node::node_module_struct *node_module_list[] = {
// #define NODE_EXT_LIST_ITEM NODE_EXT_STRING
// #define NODE_EXT_LIST_END NULL};
// 
// #include <node_extensions.h>
// 
#include <iostream>

int main(int argc, char *argv[]) {
  node::Start(argc, argv);
  node::get_builtin_module("certificate_manager");
}