#include "ksImpl.h"

//TODO: Implement keystore


int __get(const char * svc, void ** secret) throw(::KeyStoreException)
{
	throw ::KeyStoreException("Key store is not yet implemented");
}

void __put(const char * svc, void * secret) throw(::KeyStoreException)
{
	throw ::KeyStoreException("Key store is not yet implemented");
}

void __freeSecretResource(void * secret) throw(::KeyStoreException)
{
	throw ::KeyStoreException("Key store is not yet implemented");
}

void __delete(const char * svc) throw(::KeyStoreException)
{
	throw ::KeyStoreException("Key store is not yet implemented");
}

