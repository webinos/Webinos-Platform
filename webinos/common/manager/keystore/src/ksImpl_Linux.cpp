#include "ksImpl.h"
#include <string.h>
#include <stdio.h>
#include <gnome-keyring.h>
#include <gnome-keyring-result.h>
#include <gnome-keyring-memory.h>
#include <unistd.h>
#include <sys/types.h>
#include <pwd.h>
#include <iostream>

#define PWDBUFLEN 200
#define ERRBUFLEN 200
#define MAXSECLEN 2056

GnomeKeyringPasswordSchema SecretSchema =
{
	GNOME_KEYRING_ITEM_GENERIC_SECRET,
	{
		{ "user", GNOME_KEYRING_ATTRIBUTE_TYPE_STRING },
		{ "service", GNOME_KEYRING_ATTRIBUTE_TYPE_STRING },
		{ NULL }
	}
};

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
	} else {
		return std::string(pd.pw_name);
	}
}

int __get(const char * svc, void ** secret) throw(::KeyStoreException)
{
	std::string account(userName());
	gchar * secretMem = static_cast<gchar *>(::gnome_keyring_memory_alloc(MAXSECLEN));
	::memset(secretMem,0,MAXSECLEN);

	GnomeKeyringResult res = ::gnome_keyring_find_password_sync(&SecretSchema, &secretMem, "user", account.c_str(), "service", svc,  NULL);
	if (res != GNOME_KEYRING_RESULT_OK) {
		throw ::KeyStoreException(::gnome_keyring_result_to_message(res));
	}
	*secret = secretMem;
	return ::strlen(secretMem);
}

void __put(const char * svc, void * secret) throw(::KeyStoreException)
{
	std::string account(userName());
	gchar * secretStr = static_cast<gchar *>(secret);
	int secretLength = ::strlen(secretStr);
	if (secretLength > MAXSECLEN) {
		char errBuf[ERRBUFLEN];
		::sprintf(errBuf,"Secret is %d bytes, but the maximum secret length is %d",secretLength,MAXSECLEN);
		throw ::KeyStoreException(errBuf);
	}
	GnomeKeyringResult res = ::gnome_keyring_store_password_sync(&SecretSchema, GNOME_KEYRING_DEFAULT, svc, secretStr, "user", account.c_str(),  "service", svc, NULL);
	if (res != GNOME_KEYRING_RESULT_OK) {
		throw ::KeyStoreException(::gnome_keyring_result_to_message(res));
	}
}

void __freeSecretResource(void * secret) throw(::KeyStoreException)
{
	gchar * secretMem = static_cast<gchar *>(secret);
	::gnome_keyring_free_password(secretMem);
}

void __delete(const char * svc) throw(::KeyStoreException)
{
	std::string account(userName());
	GnomeKeyringResult r = ::gnome_keyring_delete_password_sync(GNOME_KEYRING_NETWORK_PASSWORD,"user",account.c_str(),"server",svc,NULL);
	if (r != GNOME_KEYRING_RESULT_OK) {
		throw ::KeyStoreException(::gnome_keyring_result_to_message(r));
	}
}

