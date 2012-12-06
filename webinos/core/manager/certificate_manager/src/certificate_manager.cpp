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
* Copyright 2011 University of Oxford
* Copyright 2011 Habib Virji, Samsung Electronics (UK) Ltd
*******************************************************************************/

#include <v8.h>
#include <node.h>
#include <stdio.h>
#include <stdlib.h>
#include "openssl_wrapper.h"
#include <string.h>

using namespace node;
using namespace v8;

const static int BUFFER_SIZE = 4096;

void prettyPrintArray(char* pem, int len) {
  printf("\n%s",pem);
  printf("\n");
  for (int i=0; i<len; i++) {
    if (pem[i]<10) {
      printf("  %d", pem[i]);
    } else if (pem[i] < 100) {
      printf(" %d", pem[i]);
    } else {
      printf("%d", pem[i]);
    }
    if (((i+1) % 20) == 0) {
      printf("\n");
    } else if (i<(len-1)) {
      printf(",");
    }
  }
  printf("\n\n");
}

v8::Handle<Value> _genRsaKey(const Arguments& args)
{
  HandleScope scope;
  if (args.Length() == 1 && args[0]->IsNumber()) {
    //extract the integer
    int keyLen = args[0]->Int32Value();
    //check that the size is sane: less than 4096 and bigger than 128
    if (keyLen > BUFFER_SIZE || keyLen < 128) {
      return ThrowException(Exception::TypeError(String::New("Key length must be between 128 and 4096")));
    }
    //call the wrapper & check for errors
    char *pem=(char *)calloc(keyLen+1, sizeof(char)); /* Null-terminate */
    int res = 0;
    res = ::genRsaKey(keyLen, pem);
  if (res != 0) {

        return ThrowException(Exception::TypeError(String::New("**Error creating private key**")));
    }
    
    //create composite remote object 
    Local<String> result = String::New(pem);
    free(pem);
    return scope.Close(result);
  }
  else {
    return ThrowException(Exception::TypeError(String::New("Exactly one argument expected")));
  }
}

v8::Handle<Value> _createCertificateRequest(const Arguments& args)
{
  HandleScope scope;
  
  if (args.Length() == 8 && args[0]->IsString() && args[1]->IsString()
    && args[6]->IsString() && args[7]->IsString()  ) {
  //extract the strings
    String::Utf8Value key(args[0]->ToString());
    String::Utf8Value country(args[1]->ToString());
    String::Utf8Value state(args[2]->ToString());
    String::Utf8Value loc(args[3]->ToString());
    String::Utf8Value organisation(args[4]->ToString());
    String::Utf8Value organisationUnit(args[5]->ToString());
    String::Utf8Value cname(args[6]->ToString());
    String::Utf8Value email(args[7]->ToString());

    //call the wrapper & check for errors
    char *pem=(char *)calloc(BUFFER_SIZE+1, sizeof(char)); /* Null-terminate */
    int res = 0;

    res = ::createCertificateRequest(pem, key.operator*(),
      country.operator*(), state.operator*(), loc.operator*(),
      organisation.operator*(), organisationUnit.operator*(), cname.operator*(), email.operator*());    
    if (res != 0) {
      return ThrowException(Exception::TypeError(String::New("Error creating certificate request")));
    }

    //create composite remote object
    Local<String> result = String::New(pem);
    free(pem);
    return scope.Close(result);
  }
  else {
    return ThrowException(Exception::TypeError(String::New("8 arguments expected: all strings.")));
  }
}

v8::Handle<Value> _selfSignRequest(const Arguments& args)
{
  HandleScope scope;
  if (args.Length() == 5 && args[0]->IsString() && args[1]->IsNumber()
    && args[2]->IsString() && args[3]->IsNumber()) {
    //extract the strings and ints

    String::Utf8Value pemRequest(args[0]->ToString());
    int days = args[1]->Int32Value();
    String::Utf8Value pemCAKey(args[2]->ToString());
    int certType = args[3]->Int32Value();
    String::Utf8Value url(args[4]->ToString());
    
    //call the wrapper & check for errors
    char *pem=(char *)calloc(BUFFER_SIZE+1, sizeof(char)); /* Null-terminate */
    int res = 0;
    res = ::selfSignRequest(pemRequest.operator*(),days,pemCAKey.operator*(),certType,url.operator*(),pem);
    if (res != 0) {
      return ThrowException(Exception::TypeError(String::New("Error creating self-signed certificate")));
    }
    //create composite remote object 
    Local<String> result = String::New(pem);
    free(pem);
    return scope.Close(result);
  }
  else {
    return ThrowException(Exception::TypeError(String::New("5 arguments expected: string int string int string")));
  }
}

v8::Handle<Value> _signRequest(const Arguments& args)
{
  HandleScope scope;
  if (args.Length() == 6 && args[0]->IsString() && args[1]->IsNumber()
    && args[2]->IsString() && args[3]->IsString()  && args[4]->IsNumber()  && args[5]->IsString()) {
    //extract the strings and ints
    String::Utf8Value pemRequest(args[0]->ToString());
    int days = args[1]->Int32Value();
    String::Utf8Value pemCAKey(args[2]->ToString());
    String::Utf8Value pemCACert(args[3]->ToString());
    int certType(args[4]->Int32Value());
    String::Utf8Value uri(args[5]->ToString());

    //call the wrapper & check for errors
    char *pem=(char *)calloc(BUFFER_SIZE+1, sizeof(char)); /* Null-terminate */
    int res = 0;
    res = ::signRequest(pemRequest.operator*(),days,pemCAKey.operator*(),pemCACert.operator*(),certType,uri.operator*(),pem);
    if (res != 0) {
      return ThrowException(Exception::Error(String::New("Failed to sign a certificate")));
    }

    //create composite remote object
    Local<String> result = String::New(pem);
    free(pem);
    return scope.Close(result);
  }
  else {
    return ThrowException(Exception::TypeError(String::New("6 arguments expected: string int string string int string")));
  }
}

//char* pemSigningKey, char* pemCaCert, int crldays, int crlhours, char* result
v8::Handle<Value> _createEmptyCRL(const Arguments& args)
{
  HandleScope scope;
  if (args.Length() == 4 && args[0]->IsString() && args[1]->IsString() 
      && args[2]->IsNumber() && args[3]->IsNumber() ) {
    //extract the strings and ints
    
    String::Utf8Value pemKey(args[0]->ToString());
    String::Utf8Value pemCert(args[1]->ToString());
    int days = args[2]->Int32Value();
    int hours = args[3]->Int32Value();
    
    
          
    //call the wrapper & check for errors
    char *pem=(char *)calloc(BUFFER_SIZE+1, sizeof(char)); /* Null-terminate */
    int res = 0;
    res = ::createEmptyCRL(pemKey.operator*(), pemCert.operator*(), days,hours,pem);
  if (res != 0) {
        return ThrowException(Exception::TypeError(String::New("Failed to create empty CRL")));
    }
    
    //create composite remote object 
    Local<String> result = String::New(pem);
    free(pem);
    return scope.Close(result);
  }
  else {
    return ThrowException(Exception::TypeError(String::New("4 arguments expected: string string int int")));
  }
}

//void addToCRL(char* pemSigningKey, char* pemOldCrl, char* pemRevokedCert, char* result) 
v8::Handle<Value> _addToCRL(const Arguments& args)
{
  HandleScope scope;
  if (args.Length() == 3 && args[0]->IsString() && args[1]->IsString() 
      && args[2]->IsString() ) {
    //extract the strings
    
    String::Utf8Value pemKey(args[0]->ToString());
    String::Utf8Value pemOldCRL(args[1]->ToString());
    String::Utf8Value pemRevokedCert(args[2]->ToString());
    
          
    //call the wrapper & check for errors
    char *pem=(char *)calloc(BUFFER_SIZE+1, sizeof(char)); /* Null-terminate */
    int res = 0;
    res = ::addToCRL(pemKey.operator*(), pemOldCRL.operator*(), pemRevokedCert.operator*(),pem);
  if (res != 0) {

        return ThrowException(Exception::TypeError(String::New("Failed to add a certificate to the CRL")));
    }
    
    //create composite remote object 
    Local<String> result = String::New(pem);
    free(pem);
    return scope.Close(result);
  }
  else {
    return ThrowException(Exception::TypeError(String::New("3 arguments expected: all PEM strings")));
  }
}

v8::Handle<Value> _getHash(const Arguments& args)
{
  HandleScope scope;
  if (args.Length() == 1 && args[0]->IsString()) {
    //extract the strings
    String::Utf8Value keyFile(args[0]->ToString());
    
    int res = 0;
    res = ::getHash(keyFile.operator*());
    if (res != 0) {
      return ThrowException(Exception::TypeError(String::New("Failed to read hash")));
    }

   // Local<String> result = String::New(res);
   
    //return scope.Close(result);
  }
  else {
    return ThrowException(Exception::TypeError(String::New("filepath expected")));
  }
}

extern "C" {
  static void init(v8::Handle<Object> target)
  {
    NODE_SET_METHOD(target,"genRsaKey",_genRsaKey);
    NODE_SET_METHOD(target,"createCertificateRequest",_createCertificateRequest);
    NODE_SET_METHOD(target,"selfSignRequest",_selfSignRequest);
    NODE_SET_METHOD(target,"signRequest",_signRequest);
    NODE_SET_METHOD(target,"createEmptyCRL",_createEmptyCRL);
    NODE_SET_METHOD(target,"addToCRL",_addToCRL);
    NODE_SET_METHOD(target,"getHash",_getHash);
  }
  NODE_MODULE(certificate_manager,init);
}
