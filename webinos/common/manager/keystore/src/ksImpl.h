#ifndef KSIMPL_H
#define KSIMPL_H

#include "KeyStoreException.h"

int __get(const char * svc, void ** secret) throw(::KeyStoreException);
void __put(const char * svc, void * secret) throw(::KeyStoreException);
void __freeSecretResource(void * secret) throw(::KeyStoreException);
void __delete(const char * svc) throw(::KeyStoreException);

#endif
