/* ====================================================================
 * Copyright (c) 2000 The OpenSSL Project.  All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer. 
 *
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in
 *    the documentation and/or other materials provided with the
 *    distribution.
 *
 * 3. All advertising materials mentioning features or use of this
 *    software must display the following acknowledgment:
 *    "This product includes software developed by the OpenSSL Project
 *    for use in the OpenSSL Toolkit. (http://www.OpenSSL.org/)"
 *
 * 4. The names "OpenSSL Toolkit" and "OpenSSL Project" must not be used to
 *    endorse or promote products derived from this software without
 *    prior written permission. For written permission, please contact
 *    licensing@OpenSSL.org.
 *
 * 5. Products derived from this software may not be called "OpenSSL"
 *    nor may "OpenSSL" appear in their names without prior written
 *    permission of the OpenSSL Project.
 *
 * 6. Redistributions of any form whatsoever must retain the following
 *    acknowledgment:
 *    "This product includes software developed by the OpenSSL Project
 *    for use in the OpenSSL Toolkit (http://www.OpenSSL.org/)"
 *
 * THIS SOFTWARE IS PROVIDED BY THE OpenSSL PROJECT ``AS IS'' AND ANY
 * EXPRESSED OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE OpenSSL PROJECT OR
 * ITS CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 * NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 * ====================================================================
 *
 * This product includes cryptographic software written by Eric Young
 * (eay@cryptsoft.com).  This product includes software written by Tim
 * Hudson (tjh@cryptsoft.com).
 * This product includes software written by Dr Stephen N Henson 
 * (steve@openssl.org) for the OpenSSLproject 2000.
 */


/*
 * 	If XXXXXlen is <=0 then XXXXX is the file that contains the resource (eg. a certificate), 
 *  else XXXXX is directly the resource (eg. the certificate)
 */

#include "crypto.h"
#include "debug.h"

string hex2str(unsigned long hexnum)
{
	string hexstr = "";
	int index;
	
	char conv[] = {'0','1','2','3','4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'};
	
	while (hexnum)
	{
		index = hexnum & 0xF;
		hexnum = hexnum >> 4;
		hexstr = conv[index] + hexstr;
	}
	return hexstr;
}

bool compareHashes(const char* paddedhash, int paddedhashlen, const char* hash, int hashlen)
{
	return !memcmp((paddedhash + paddedhashlen - hashlen), hash, hashlen);
}

int X509_PEM_decorator(const char * cert, int certlen, char* output)
{
	char* tmp = output;
	memcpy(tmp, "-----BEGIN CERTIFICATE-----\x0d\x0a", 29);
	tmp+=29;
	memcpy(tmp, cert, certlen);
	tmp+=certlen;		
	memcpy(tmp, "\x0d\x0a-----END CERTIFICATE-----",27);
	return certlen + 56;
}


string getCertField(string str)
{
       int index;

       if ( (index = str.find("/CN")) != string::npos )
       {
               int start = index + 4;
               int findpos = str.find("/", start);
               int len = findpos != string::npos ? findpos - start: str.length() - start;
               return str.substr(start, len);
       }
       else
               return "";
}


//int X509_info(char *cert, int certlen)
vector<string> X509_info(char *cert, int certlen)
{
	vector<string> certInfo;
	
	X509 *x;
	X509_NAME *	subjectname;
	X509_NAME *	issuername;
	BIO *certificate = NULL;
	if (certlen > 0)
	{
		certificate = BIO_new(BIO_s_mem());
		BIO_write(certificate, (unsigned char *)cert, certlen);
	}
	else
	{
		certificate = BIO_new(BIO_s_file());
		BIO_read_filename(certificate, cert);
	}	
	
	x = PEM_read_bio_X509_AUX(certificate, NULL, NULL, NULL);
	
	if(x) 
	{
		subjectname = X509_get_subject_name(x);
		issuername = X509_get_issuer_name(x);

		int index,start,findpos,len;
		string tmp;
		tmp = X509_NAME_oneline(subjectname, 0, 0);
		LOG("Crypto : " << tmp.data());
		if ( (index = tmp.find("/CN")) != string::npos )
		{
			   start = index + 4;
			   findpos = tmp.find("/", start);
			   len = findpos != string::npos ? findpos - start: tmp.length() - start;
			   certInfo.push_back(tmp.substr(start, len));
		}
		else
			certInfo.push_back("empty_cn1");
		
		certInfo.push_back(hex2str(X509_subject_name_hash(x)));
		
		tmp = X509_NAME_oneline(issuername, 0, 0);
		if ( (index = tmp.find("/CN")) != string::npos )
		{
			   start = index + 4;
			   findpos = tmp.find("/", start);
			   len = findpos != string::npos ? findpos - start: tmp.length() - start;
			   certInfo.push_back(tmp.substr(start, len));
		}
		else
			certInfo.push_back("empty_cn2");
		
		certInfo.push_back(hex2str(X509_issuer_name_hash(x)));		// Issuer fingerprint
	}
	
	return certInfo;
}

int sha1(const char *in, int len, char *dgst)
{
	static const int sha1_len = 20;
	unsigned char out[sha1_len];
//	static const char *hex_digits = "0123456789abcdef"; // hex value
//	int i; // hex value

	SHA_CTX ctx;
	SHA1_Init(&ctx);
	
	if (len <= 0)
	{
		len = 0;		
		int fd = open(in,O_RDONLY);
		char buf[BUFLEN];
		while ((len = read(fd,buf,BUFLEN)) > 0)
		{
			SHA1_Update(&ctx, (unsigned char*)buf, len);
		}
		close(fd);
	} else
		SHA1_Update(&ctx, (unsigned char*)in, len);
		
	SHA1_Final(&(out[0]),&ctx); //bytes
/* hex value 
	for (i = 0; i < sha1_len; i++) 
	{
		buf[2*i] = hex_digits[(out[i] & 0xf0) >> 4];
		buf[2*i+1] = hex_digits[out[i] & 0x0f];
	}
//*/
	
	memcpy(dgst, out, sha1_len);
	return sha1_len;
}

int sha256(const char *in, int len, char *dgst)
{
	static const int sha256_len = 32;
	unsigned char out[sha256_len];
		
	SHA256_CTX ctx256;
	SHA256_Init(&ctx256);
	
	if (len <= 0)
	{
		len = 0;
		int fd = open(in,O_RDONLY);
		char buf[BUFLEN];		
		while ((len = read(fd,buf,BUFLEN)) > 0) 
		{
			SHA256_Update(&ctx256, (unsigned char*)buf, len);
		}
		close(fd);
	} else
		SHA256_Update(&ctx256, (unsigned char*)in, len);
			
	SHA256_Final(&(out[0]),&ctx256); // bytes
//	SHA256_End(&ctx256,buf); // hex value
	
	memcpy(dgst, out, sha256_len);
	return sha256_len;
}

int toBase64 (unsigned char* input, int inputlen, char* output)
{
	static const char table[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";	

	int i,j=0;
	for (i=0; i<inputlen; i+=3)
	{
		output[j++] =  table[ input[i] >> 2 ];
		output[j++] =  table[((input[i] & 3)<< 4) + (input[i+1] >> 4)];
		output[j++] =  table[((input[i+1] & 15) << 2) + (input[i+2] >> 6)];
		output[j++] =  table[ input[i+2] & 63];
	}	
	if(inputlen%3 > 0) 
	{
		output[j-1] = '=';
		output[j-2] =  table[((input[i-2] & 15) << 2)];
	}
	if(inputlen%3 == 1) 
	{
		output[j-2] = '=';
		output[j++] =  table[((input[i-3] & 3)<< 4)];
	}
	
	return j;
}

unsigned char b64conv(char chr)
{
		if (chr == 43)
			return 62;
		else if (chr == 47)
			return 63;
		else if (chr >= 97)
			return chr - 71;
		else if (chr >= 65)
			return chr - 65;
		else
			return chr + 4;
}

int fromBase64 (unsigned char* input, int inputlen, char* output)
{
	const int outputlen = BUFLEN;
	unsigned char in0, in1, in2, in3;
	
	int i,j=0;
	for (i=0; i<inputlen; i+=4)
	{
		in0 = b64conv(input[i]);
		in1 = b64conv(input[i+1]);
		in2 = b64conv(input[i+2]);
		in3 = b64conv(input[i+3]);
		output[j++] =  (in0 << 2) + (in1 >> 4);
		output[j++] =  ((in1 & 15) << 4) + (in2 >> 2);
		output[j++] =  ((in2 & 3) << 6) + in3;
	}
	
	if (input[i-2] == '=')
		return j-2;
	else if (input[i-1] == '=')
		return j-1;
	else
		return j;
}

EVP_PKEY * load_key(const char* inkey, int keylen, char keytype)
{
	BIO * key;
	X509 * x509;
	EVP_PKEY * pkey = NULL;
	
	if (keylen > 0)
	{
		key = BIO_new(BIO_s_mem());
		BIO_write(key, (unsigned char *)inkey, keylen);
	}
	else
	{
		key = BIO_new(BIO_s_file());
		if(BIO_read_filename(key, inkey) <= 0) 
			return NULL;
	}
	
	switch(keytype)
	{
		case KEY_PUBKEY: 	pkey = PEM_read_bio_PUBKEY(key,NULL,NULL, NULL);
							break;

		case KEY_PRIVKEY:	pkey = PEM_read_bio_PrivateKey(key,NULL,NULL, NULL);
							break;
							
		case KEY_CERT:		x509 = PEM_read_bio_X509_AUX(key, NULL, NULL, NULL);					
							if(x509) 
							{
								pkey = X509_get_pubkey(x509);
								X509_free(x509);
							}
							else
								return NULL;
							break;
	}
	
	return pkey;
}

int dsa_sign(const char* inkey, int keylen, char keytype, const char* data, int datalen, char* signature, const char* signaturefile)
{
	int err;
	unsigned int sig_len = 0;
	unsigned char sig_buf [BUFLEN];
	int inputdatalen = datalen;
	char * inputdata[BUFLEN];
	const EVP_MD * md = EVP_dss1();
	EVP_MD_CTX md_ctx;
	EVP_PKEY * pkey = load_key(inkey, keylen, keytype);

	if (!pkey) return -1;

	EVP_SignInit(&md_ctx, md);
		
	if (inputdatalen == 0)
	{
		int fd = open(data, O_RDONLY);
		inputdatalen = read(fd, inputdata, BUFLEN);
		EVP_SignUpdate (&md_ctx, inputdata, inputdatalen);
	}
	else
		EVP_SignUpdate (&md_ctx, data, datalen);
	
	sig_len = sizeof(sig_buf);
	err = EVP_SignFinal (&md_ctx, sig_buf, &sig_len, pkey);

	EVP_PKEY_free (pkey);

	if (err != 1) return -2;
	
	if (signaturefile)
	{
		BIO *out;
		
		if(!(out = BIO_new_file(signaturefile, "wb")))
			return -3;
		
		BIO_write(out, sig_buf, sig_len);
		BIO_free_all(out);
	}
	
	if (signature)
		memcpy(signature, sig_buf, sig_len);

	return sig_len;
}

int dsa_verify(const char* inkey, int keylen, char keytype, const char* signature, int signaturelen, const char* data, int datalen)
{
	int err;
	int inputdatalen = datalen;
	char * inputdata[BUFLEN];
	int signaturedatalen = signaturelen;
	char * signaturedata[BUFLEN];
	const EVP_MD * md = EVP_dss1();
	EVP_MD_CTX md_ctx;
	EVP_PKEY * pkey = load_key(inkey, keylen, keytype);
		
	if (!pkey) return -1;
	
	EVP_VerifyInit (&md_ctx, md);
	
	if (inputdatalen == 0)
	{
		int fd = open(data,O_RDONLY);
		inputdatalen = read(fd, inputdata, BUFLEN);
		EVP_VerifyUpdate (&md_ctx, inputdata, inputdatalen);
	}
	else
		EVP_VerifyUpdate (&md_ctx, data, datalen);

	if (signaturedatalen == 0)
	{
		int fd = open(signature,O_RDONLY);
		signaturedatalen = read(fd, signaturedata, BUFLEN);
		err = EVP_VerifyFinal (&md_ctx, (unsigned char*)signaturedata, signaturedatalen, pkey);
	}
	else
		err = EVP_VerifyFinal (&md_ctx, (unsigned char*)signature, signaturelen, pkey);

	EVP_PKEY_free (pkey);

	if (err != 1) return -2;
	
	return 0;
}

int rsa_sign(const char* inkey, int keylen, char keytype, const char* data, int datalen, char* signature, const char* signaturefile)
{
	BIO *in = NULL;
	BIO *out = NULL; // line requested for the "write to file" feature
	EVP_PKEY * pkey = load_key(inkey, keylen, keytype);
	RSA *rsa = NULL;
	
	unsigned char *rsa_in = NULL, *rsa_out = NULL, pad = RSA_PKCS1_PADDING;//RSA_NO_PADDING;
	int rsa_inlen, rsa_outlen = 0;
	int keysize;
	
	ERR_load_crypto_strings();
	OpenSSL_add_all_algorithms();

	if (!pkey) return -1;
	
	rsa = EVP_PKEY_get1_RSA(pkey);
	EVP_PKEY_free(pkey);
	
	if(!rsa) return -2;

	if (datalen > 0)
	{
		in = BIO_new(BIO_s_mem());
		BIO_write(in, (unsigned char *)data, datalen);
	}
	else
	{
		if(!(in = BIO_new_file(data, "rb")))
			return -3;
	}
	
	//* // line requested for the "write to file" feature
	if (signaturefile)
		if(!(out = BIO_new_file(signaturefile, "wb")))
			return -4;
	//*/
	keysize = RSA_size(rsa);

	rsa_in = (unsigned char*)OPENSSL_malloc(keysize * 2);
	rsa_out = (unsigned char*)OPENSSL_malloc(keysize);

	rsa_inlen = BIO_read(in, rsa_in, keysize * 2);
	
	if(rsa_inlen <= 0)
		return -5;
	
	rsa_outlen  = RSA_private_encrypt(rsa_inlen, rsa_in, rsa_out, rsa, pad);
	
	if(rsa_outlen <= 0) 
		return -6;
	
	if (signaturefile)
		BIO_write(out, rsa_out, rsa_outlen); // line requested for the "write to file" feature
	if (signature)
		memcpy(signature, rsa_out, rsa_outlen);
	
	RSA_free(rsa);
	BIO_free(in);
	BIO_free_all(out); // line requested for the "write to file" feature
	
	if(rsa_in)
		OPENSSL_free(rsa_in);
	if(rsa_out)
		OPENSSL_free(rsa_out);
	
	return rsa_outlen;
}

int rsa_verify(const char* inkey, int keylen, char keytype, const char* signature, int signaturelen, const char* data, int datalen)
{
	BIO *in = NULL;
	EVP_PKEY * pkey = load_key(inkey, keylen, keytype);
	RSA *rsa = NULL;
	
	unsigned char *rsa_in = NULL, *rsa_out = NULL, pad = RSA_PKCS1_PADDING;//RSA_NO_PADDING;
	int rsa_inlen, rsa_outlen = 0;
	int keysize;
	
	ERR_load_crypto_strings();
	OpenSSL_add_all_algorithms();

	if (!pkey) return -1;
	
	rsa = EVP_PKEY_get1_RSA(pkey);
	EVP_PKEY_free(pkey);
	
	if(!rsa) return -2;

	if (signaturelen > 0)
	{
		in = BIO_new(BIO_s_mem());
		BIO_write(in, (unsigned char *)signature, signaturelen);
	}
	else
	{
		if(!(in = BIO_new_file(signature, "rb")))
			return -3;
	}
	keysize = RSA_size(rsa);

	rsa_in = (unsigned char*)OPENSSL_malloc(keysize * 2);
	rsa_out = (unsigned char*)OPENSSL_malloc(keysize);

	rsa_inlen = BIO_read(in, rsa_in, keysize * 2);
	
	if(rsa_inlen <= 0)
		return -5;
	
	rsa_outlen = RSA_public_decrypt(rsa_inlen, rsa_in, rsa_out, rsa, pad);
	
	if(rsa_outlen <= 0) 
		return -6;
	
	RSA_free(rsa);
	BIO_free(in);
	
	if(rsa_in)
		OPENSSL_free(rsa_in);
	
	if (rsa_outlen > 0)
		return (compareHashes((char *)rsa_out, rsa_outlen, data, datalen) ? 0 :-7);
	
	return -8;
}
