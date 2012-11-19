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

#include "node_contacts_mork.h"

#if defined(_WIN32) || defined(_WIN64)
  //Windows don't have uint defined
  #define uint unsigned int
#endif

CLocalContacts::CLocalContacts() :
        is_open(false)
{
    mab = new MorkAddressBook();
}
;

CLocalContacts::~CLocalContacts()
{
    if (mab)
        delete mab;
}
;

// @Node.js calls Init() when you load the extension through require()
// Init() defines our constructor function and prototype methods
// It then binds our constructor function as a property of the target object
// Target is the "target" onto which an extension is loaded. For example:
// var notify = require("../build/default/localcontacts.node"); will bind our constructor function to notify.Notification
// so that we can call "new localcontacts.Contacts();"
void CLocalContacts::Init(v8::Handle<v8::Object> target) 
{
  // We need to declare a V8 scope so that our local handles are eligible for garbage collection.
  // once the Init() returns.
  v8::HandleScope scope;
  // Wrap our New() method so that it's accessible from Javascript
  v8::Local<v8::FunctionTemplate> local_function_template = v8::FunctionTemplate::New(New);
  
  // Make it persistent and assign it to our object's persistent_function_template attribute
  CLocalContacts::persistent_function_template = v8::Persistent<v8::FunctionTemplate>::New(local_function_template);
  
  // Each JavaScript object keeps a reference to the C++ object for which it is a wrapper with an internal field.
  CLocalContacts::persistent_function_template->InstanceTemplate()->SetInternalFieldCount(1); // 1 since this is a constructor function
  
  // Set a class name for objects created with our constructor - i.e. the type returned from typeof()
  CLocalContacts::persistent_function_template->SetClassName(v8::String::NewSymbol("LocalContacts"));
  
  // Set property ACCESSORS (i.e. for using JS = operator)
  //CLocalContacts::persistent_function_template->InstanceTemplate()->SetAccessor(String::New("title"), GetTitle, SetTitle);
  //CLocalContacts::persistent_function_template->InstanceTemplate()->SetAccessor(String::New("icon"), GetIcon, SetIcon);
  
  // @Node.js macro to help bind C++ METHODS to Javascript methods (see https://github.com/joyent/node/blob/v0.2.0/src/node.h#L34)
  // Arguments: our constructor function, Javascript method name, C++ method name
  NODE_SET_PROTOTYPE_METHOD(CLocalContacts::persistent_function_template, "open", _Open);
  NODE_SET_PROTOTYPE_METHOD(CLocalContacts::persistent_function_template, "isOpen", _isOpen);
  NODE_SET_PROTOTYPE_METHOD(CLocalContacts::persistent_function_template, "getAB", _getAB);
  
  // Set the "contacts" property to the target and assign it to our constructor function
  target->Set(v8::String::NewSymbol("contacts"), CLocalContacts::persistent_function_template->GetFunction());
}

// new LocalContacts();
// This is our constructor function. It instantiate a C++ CLocalContacts object and returns a Javascript handle to this object.
 v8::Handle<v8::Value> CLocalContacts::New(const v8::Arguments& args) {
  v8::HandleScope scope;
  CLocalContacts* localContacts_instance = new CLocalContacts();
  // Set some default values
//  localContacts_instance->title = "Node.js";
//  localContacts_instance->icon = "terminal";
  
  // Wrap our C++ object as a Javascript object
  localContacts_instance->Wrap(args.This());
  
  
  // Our constructor function returns a Javascript object which is a wrapper for our C++ object, 
  // This is the expected behavior when calling a constructor function with the new operator in Javascript.
  return args.This();
}


// localcontacts.open(addressbook);
// This is a method part of the constructor function's prototype
v8::Handle<v8::Value> CLocalContacts::_Open(const v8::Arguments& args)
{
  v8::HandleScope scope;

  if (args.Length()==0) //TODO raise exception - user must supply an addres book name
    return v8::Boolean::New(false);
  else
  {
    // Extract C++ object reference from "this" aka args.This() argument
    CLocalContacts* localContacts_instance = node::ObjectWrap::Unwrap<CLocalContacts>(args.This());

    // Convert first argument to V8 String
    v8::String::Utf8Value addresBookPath(args[0]);

    //TODO raise exception if no arguments

    localContacts_instance->is_open = localContacts_instance->mab->openAddressBook(*addresBookPath);

    // Return value
    return v8::Boolean::New(localContacts_instance->is_open);
  }
}

// localcontacts.isOpen();
// This is a method part of the constructor function's prototype
v8::Handle<v8::Value> CLocalContacts::_isOpen(const v8::Arguments& args)
{
  v8::HandleScope scope;

    // Extract C++ object reference from "this" aka args.This() argument
    CLocalContacts* localContacts_instance = node::ObjectWrap::Unwrap<CLocalContacts>(args.This());

    // Return value
    return v8::Boolean::New(localContacts_instance->is_open);
}

// localcontacts.getAB();
// This is a method part of the constructor function's prototype
v8::Handle<v8::Value> CLocalContacts::_getAB(const v8::Arguments& args)
{
    v8::HandleScope scope;
    // Extract C++ object reference from "this" aka args.This() argument
    CLocalContacts* localContacts_instance = node::ObjectWrap::Unwrap < CLocalContacts > (args.This());

    //Read contacts from instance
    W3CContacts contactVec = localContacts_instance->mab->getAB();
    //Store number of contacts
    uint num_of_cont = contactVec.size();

    v8::Local < v8::Array > contacts_array = v8::Array::New(num_of_cont);
    uint i = 0;
    //Iterate through the map and set new array entries
    W3CContacts::iterator v_iter;
    for (v_iter = contactVec.begin(); v_iter != contactVec.end(); v_iter++)
    {
        v8::Local < v8::Object > _entry = v8::Object::New();

        //id
        _entry->Set(v8::String::New("id"), v8::String::New(v_iter->id.c_str()));

        //displayName
        _entry->Set(v8::String::New("displayName"), v8::String::New(v_iter->displayName.c_str()));

        //name
        v8::Local < v8::Object > _name = v8::Object::New();
        //Iteration through ContactName map
        std::map<std::string, std::string>::iterator name_it;
        for (name_it = v_iter->name.begin(); name_it != v_iter->name.end(); name_it++)
        {
            _name->Set(v8::String::New(name_it->first.c_str()), v8::String::New(name_it->second.c_str()));
        }
        _entry->Set(v8::String::New("name"), _name);

        //nickname
        _entry->Set(v8::String::New("nickname"), v8::String::New(v_iter->nickname.c_str()));

        //phoneNumbers
        v8::Local < v8::Array > _phoneNumbers_array = v8::Array::New(v_iter->phoneNumbers.size());
        std::vector<std::map<std::string, std::string> >::iterator _pN_it;
        uint j = 0;
        for (_pN_it = v_iter->phoneNumbers.begin(); _pN_it != v_iter->phoneNumbers.end(); _pN_it++)
        {
            v8::Local < v8::Object > _phone = v8::Object::New();
            std::map<std::string, std::string>::iterator phone_it;
            for (phone_it = _pN_it->begin(); phone_it != _pN_it->end(); phone_it++)
            {
                _phone->Set(v8::String::New(phone_it->first.c_str()), v8::String::New(phone_it->second.c_str()));
            }
            _phoneNumbers_array->Set(j++, _phone);
        }
        _entry->Set(v8::String::New("phoneNumbers"), _phoneNumbers_array);

        //emails
        v8::Local < v8::Array > _emails_array = v8::Array::New(v_iter->emails.size());
        std::vector<std::map<std::string, std::string> >::iterator _eM_it;
        j = 0;
        for (_eM_it = v_iter->emails.begin(); _eM_it != v_iter->emails.end(); _eM_it++)
        {
            v8::Local < v8::Object > _email = v8::Object::New();
            std::map<std::string, std::string>::iterator email_it;
            for (email_it = _eM_it->begin(); email_it != _eM_it->end(); email_it++)
            {
                _email->Set(v8::String::New(email_it->first.c_str()), v8::String::New(email_it->second.c_str()));
            }
            _emails_array->Set(j++, _email);
        }
        _entry->Set(v8::String::New("emails"), _emails_array);

        //addresses
        v8::Local < v8::Array > _addresses_array = v8::Array::New(v_iter->addresses.size());
        std::vector<std::map<std::string, std::string> >::iterator _adD_it;
        j = 0;
        for (_adD_it = v_iter->addresses.begin(); _adD_it != v_iter->addresses.end(); _adD_it++)
        {
            v8::Local < v8::Object > _address = v8::Object::New();
            std::map<std::string, std::string>::iterator address_it;
            for (address_it = _adD_it->begin(); address_it != _adD_it->end(); address_it++)
            {
                _address->Set(v8::String::New(address_it->first.c_str()), v8::String::New(address_it->second.c_str()));
            }
            _addresses_array->Set(j++, _address);
        }
        _entry->Set(v8::String::New("addresses"), _addresses_array);

        //ims
        v8::Local < v8::Array > _ims_array = v8::Array::New(v_iter->ims.size());
        std::vector<std::map<std::string, std::string> >::iterator _imS_it;
        j = 0;
        for (_imS_it = v_iter->ims.begin(); _imS_it != v_iter->ims.end(); _imS_it++)
        {
            v8::Local < v8::Object > _im = v8::Object::New();
            std::map<std::string, std::string>::iterator im_it;
            for (im_it = _imS_it->begin(); im_it != _imS_it->end(); im_it++)
            {
                _im->Set(v8::String::New(im_it->first.c_str()), v8::String::New(im_it->second.c_str()));
            }
            _ims_array->Set(j++, _im);
        }
        _entry->Set(v8::String::New("ims"), _ims_array);

        //organizations
        v8::Local < v8::Array > _organizations_array = v8::Array::New(v_iter->organizations.size());
        std::vector<std::map<std::string, std::string> >::iterator _organizationS_it;
        j = 0;
        for (_organizationS_it = v_iter->organizations.begin(); _organizationS_it != v_iter->organizations.end(); _organizationS_it++)
        {
            v8::Local < v8::Object > _organization = v8::Object::New();
            std::map<std::string, std::string>::iterator organization_it;
            for (organization_it = _organizationS_it->begin(); organization_it != _organizationS_it->end(); organization_it++)
            {
                _organization->Set(v8::String::New(organization_it->first.c_str()), v8::String::New(organization_it->second.c_str()));
            }
            _organizations_array->Set(j++, _organization);
        }
        _entry->Set(v8::String::New("organizations"), _organizations_array);

        //revision
        _entry->Set(v8::String::New("revision"), v8::String::New(v_iter->revision.c_str()));

        //birthday
        _entry->Set(v8::String::New("birthday"), v8::String::New(v_iter->birthday.c_str()));

        //gender
        _entry->Set(v8::String::New("gender"), v8::String::New(""));

        //note
        _entry->Set(v8::String::New("note"), v8::String::New(v_iter->note.c_str()));

        //photos
//        _entry->Set(v8::String::New("photos"), v8::String::New(v_iter->photos.c_str()));
        //urls
        v8::Local < v8::Array > _photos_array = v8::Array::New(v_iter->photos.size());
        std::vector<std::map<std::string, std::string> >::iterator _photoS_it;
        j = 0;
        for (_photoS_it = v_iter->photos.begin(); _photoS_it != v_iter->photos.end(); _photoS_it++)
        {
            v8::Local < v8::Object > _photo = v8::Object::New();
            std::map<std::string, std::string>::iterator photo_it;
            for (photo_it = _photoS_it->begin(); photo_it != _photoS_it->end(); photo_it++)
            {
                _photo->Set(v8::String::New(photo_it->first.c_str()), v8::String::New(photo_it->second.c_str()));
            }
            _photos_array->Set(j++, _photo);
        }
        _entry->Set(v8::String::New("photos"), _photos_array);


        //categories
        _entry->Set(v8::String::New("categories"), v8::Array::New());

        //urls
        v8::Local < v8::Array > _urls_array = v8::Array::New(v_iter->urls.size());
        std::vector<std::map<std::string, std::string> >::iterator _urlS_it;
        j = 0;
        for (_urlS_it = v_iter->urls.begin(); _urlS_it != v_iter->urls.end(); _urlS_it++)
        {
            v8::Local < v8::Object > _url = v8::Object::New();
            std::map<std::string, std::string>::iterator url_it;
            for (url_it = _urlS_it->begin(); url_it != _urlS_it->end(); url_it++)
            {
                _url->Set(v8::String::New(url_it->first.c_str()), v8::String::New(url_it->second.c_str()));
            }
            _urls_array->Set(j++, _url);
        }
        _entry->Set(v8::String::New("urls"), _urls_array);

        //timezone
        _entry->Set(v8::String::New("timezone"), v8::String::New(""));

        //Store Entry to array
        contacts_array->Set(i++, _entry);
    }

    // Return value
    return scope.Close(contacts_array);
}

// What follows is boilerplate code:

/* Thats it for actual interfacing with v8, finally we need to let Node.js know how to dynamically load our code. 
 Because a Node.js extension can be loaded at runtime from a shared object, we need a symbol that the dlsym function can find,
 so we do the following: */
// See https://www.cloudkick.com/blog/2010/aug/23/writing-nodejs-native-extensions/ & http://www.freebsd.org/cgi/man.cgi?query=dlsym
// Cause of name mangling in C++, we use extern C here
v8::Persistent<v8::FunctionTemplate> CLocalContacts::persistent_function_template;
extern "C"
{
static void init(v8::Handle<v8::Object> target)
{
    CLocalContacts::Init(target);
}
// @see http://github.com/ry/node/blob/v0.2.0/src/node.h#L101
NODE_MODULE(localcontacts, init);
}
