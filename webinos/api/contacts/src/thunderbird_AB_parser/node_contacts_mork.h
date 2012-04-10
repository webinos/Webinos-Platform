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
* Copyright 2011 Istituto Superiore Mario Boella (ISMB)
******************************************************************************/

#ifndef NODE_CONTACTS_MORK_H
#define NODE_CONTACTS_MORK_H
/**
  TODO put copyright headers here
*/
#include <v8.h>
#include <node.h>
#include <string>

#include "MorkAddressBook.h"

/**
  @brief This class is a native C++ Node.js extension for reading mork addressbook (Thunderbird)
  It is a v8/node wrapper around MorkAddressBook class;
*/
class CLocalContacts : node::ObjectWrap {
  private:
    ///The address book
    MorkAddressBook *mab;
    
    ///True if current address book is already open
    bool is_open;

  public:
    ///class constructor
    CLocalContacts();

    ///class destructor
    ~CLocalContacts();

    // Holds our constructor function
    static v8::Persistent<v8::FunctionTemplate> persistent_function_template;

    // @Node.js calls Init() when you load the extension through require()
    // Init() defines our constructor function and prototype methods
    // It then binds our constructor function as a property of the target object
    // Target is the "target" onto which an extension is loaded. For example:
    // var notify = require("<path>/localAddressBook.node"); will bind our constructor function to notify.Notification
    // so that we can call "new notify.Notification();"
    static void Init(v8::Handle<v8::Object> target) ;

    // new CLocalContacts();
    // This is our constructor function. It instantiate a C++ MorkAddressBook object and returns a Javascript handle to this object.
    static v8::Handle<v8::Value> New(const v8::Arguments& args);

    //localcontacts.open();
    // This is a method part of the constructor function's prototype
    static v8::Handle<v8::Value> _Open(const v8::Arguments& args) ;
    
    //localcontacts.isOpen();
    // This is a method part of the constructor function's prototype
    static v8::Handle<v8::Value> _isOpen(const v8::Arguments& args) ;
    
    //localcontacts.getAB();
    // This is a method part of the constructor function's prototype
    static v8::Handle<v8::Value> _getAB(const v8::Arguments& args) ;
    
    // localcontacts.length
    //static v8::Handle<Value> GetLength(v8::Local<v8::String> property, const v8::AccessorInfo& info) ;

    // localcontacts.contacts
    //static v8::Handle<Value> GetContacts(v8::Local<v8::String> property, const v8::AccessorInfo& info) ;


//    // notification.send();
//    // This is a method part of the constructor function's prototype
//    static v8::Handle<Value> Send(const Arguments& args) ;
//    
//    // notification.title
//    static v8::Handle<Value> GetTitle(v8::Local<v8::String> property, const v8::AccessorInfo& info) ;
//    
//    // notification.title=
//    static void SetTitle(Local<String> property, Local<Value> value, const AccessorInfo& info);
//    
//    // notification.icon
//    static v8::Handle<Value> GetIcon(v8::Local<v8::String> property, const v8::AccessorInfo& info) ;
//    
//    // notification.icon=
//    static void SetIcon(Local<String> property, Local<Value> value, const AccessorInfo& info) ;

};

#endif //NODE_CONTACTS_MORK_H
