#include "ksImpl.h"
#include <CoreFoundation/CFString.h>
#include <Security/Security.h>
#include <string>
#include <string.h>
#include <iostream>
#include <exception>
#include <unistd.h>
#include <sys/types.h>
#include <pwd.h>

#define PWDBUFLEN 200
#define ERRBUFLEN 200

void throwPSError(OSStatus err) throw(::KeyStoreException)
{
    CFStringRef str = SecCopyErrorMessageString(err,NULL);
    try {
      const char * ptr = CFStringGetCStringPtr(str, kCFStringEncodingMacRoman);
      ::KeyStoreException e(ptr);
      CFRelease(str);
      throw e;
    }
    catch(std::exception& e) {
      CFRelease(str);
      ::KeyStoreException kse(e.what());
      throw kse;
    }
}

std::string userName() throw(::KeyStoreException)
{
  struct passwd pd;
  struct passwd * pwdptr = &pd;
  struct passwd * tmpPwdPtr = 0;
  char buf[PWDBUFLEN];

  int status = ::getpwuid_r(::getuid(),pwdptr,buf,PWDBUFLEN,&tmpPwdPtr);
  if (status != 0) {
    char errBuf[ERRBUFLEN];
    ::strerror_r(status,errBuf,ERRBUFLEN);
    throw ::KeyStoreException(errBuf);
  }
  else {
    return std::string(pd.pw_name);
  }
}

SecKeychainItemRef findItem(const char * svc, const std::string& account,void ** secret, UInt32 * secretLength) throw(KeyStoreException)
{
  SecKeychainItemRef itemRef = nil;
  OSStatus fStatus = ::SecKeychainFindGenericPassword(NULL, ::strlen(svc), svc, account.size(), account.c_str(), secretLength, secret, &itemRef);    
  if (fStatus != noErr) {
    throwPSError(fStatus);
  }
  return itemRef;
}

void update(const char * svc, const std::string& account, void * secret) throw(KeyStoreException)
{
  UInt32 oldSecretLength = 0;
  void * oldSecret = 0; 
  SecKeychainItemRef itemRef = findItem(svc,account,&oldSecret,&oldSecretLength);

  OSStatus cStatus = ::SecKeychainItemModifyAttributesAndData(itemRef,NULL,::strlen(static_cast<char *>(secret)), secret);
  if (cStatus != noErr) {
    throwPSError(cStatus);
  }
  OSStatus rStatus = ::SecKeychainItemFreeContent(NULL,oldSecret);
  if (rStatus != noErr) {
    throwPSError(rStatus);
  }
}

int __get(const char * svc, void ** secret) throw(KeyStoreException)
{
  UInt32 secretLength = 0;
  std::string account(userName());
  findItem(svc,account,secret,&secretLength);
  return secretLength;
}

void __put(const char * svc, void * secret) throw(KeyStoreException)
{
    std::string account(userName());
    UInt32 secretLength = ::strlen(static_cast<char *>(secret));
    OSStatus status = ::SecKeychainAddGenericPassword(NULL, ::strlen(svc), svc, account.size(), account.c_str(), secretLength, secret, NULL);
    if (status == errSecDuplicateItem) {        
      update(svc,account,secret);    
    }
    else if (status != noErr) {
      throwPSError(status);
    }
}

void __freeSecretResource(void * secret) throw(::KeyStoreException)
{
  OSStatus rStatus = ::SecKeychainItemFreeContent(NULL,secret);
  if (rStatus != noErr) {
    throwPSError(rStatus);
  }
}

void __delete(const char * svc) throw(::KeyStoreException)
{
  UInt32 secretLength = 0;
  void * secret = 0;
  std::string account(userName());
  SecKeychainItemRef itemRef = findItem(svc,account,&secret,&secretLength);
  OSStatus dStatus = ::SecKeychainItemDelete(itemRef);
  if (dStatus != noErr) {
    throwPSError(dStatus);
  }
  __freeSecretResource(secret);
}

