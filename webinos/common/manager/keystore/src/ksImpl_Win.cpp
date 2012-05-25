#include "ksImpl.h"

//TODO: Implement keystore on windows


int __get(const char * svc, void ** secret) throw(::KeyStoreException)
{
	throw ::KeyStoreException("Key store is not yet implemented on windows");
}

void __put(const char * svc, void * secret) throw(::KeyStoreException)
{
	throw ::KeyStoreException("Key store is not yet implemented on windows");
}

void __freeSecretResource(void * secret) throw(::KeyStoreException)
{
	throw ::KeyStoreException("Key store is not yet implemented on windows");
}

void __delete(const char * svc) throw(::KeyStoreException)
{
	throw ::KeyStoreException("Key store is not yet implemented on windows");
}

