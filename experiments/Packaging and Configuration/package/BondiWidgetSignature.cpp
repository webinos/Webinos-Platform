/**
 * Licensed to OMTP Ltd. (OMTP) under one or more contributor license agreements. 
 * See the NOTICE file distributed with this work for additional information regarding 
 * copyright ownership. 
 * 
 * The Reference Implementation (save for such parts of the reference implementation made 
 * available under separate terms and conditions) is made available under the terms of the 
 * Apache License, version 2.0, subject to the condition that any "Works" and "Derivative 
 * Works" used or distributed for commercial purposes must be and remain compliant with the
 * BONDI specification as promulgated by OMTP in each release. Your implementation of the 
 * Reference Implementation (whether object or source) must maintain these conditions, and 
 * you must notify any recipient of this condition in a conspicuous way.
 * 
 * You may not use this BONDI Reference Implementation except in compliance with the License. 
 * 
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 or at 
 * http://bondi.omtp.org/BONDI LICENSE-2.0 
 * 
 */

#include "stdafx.h"
#include "BondiWidgetSignature.h"
#include "common\WidgetErrorCodes.h"
#include "common\WidgetUtils.h"
#include "common\WidgetConstants.h"
#include "packageResource.h"
#include "diskResource.h"
#include <atlenc.h>
#include "BondiWidget.h"
#include "BondiWidgetProperties.h"

// Un-comment this line to include support for special w3c test feature.
//#define SUPPORT_TEST_FEATURE

//#include <libxml/c14n.h>

//int cb(void* user_data,xmlNodePtr node,xmlNodePtr parent)
//{
//	return 1;
//}

	//xmlOutputBufferPtr buf;
	//xmlDocPtr doc;
	//xmlC14NExecute(doc,cb,NULL,0,NULL,0,buf);

#define BUFSIZE 8192

STDMETHODIMP CBondiWidgetSignature::InterfaceSupportsErrorInfo(REFIID riid)
{
	static const IID* arr[] = 
	{
		&IID_IBondiWidgetSignature
	};

	for (int i=0; i < sizeof(arr) / sizeof(arr[0]); i++)
	{
		if (InlineIsEqualGUID(*arr[i],riid))
			return S_OK;
	}
	return S_FALSE;
}

/**
* Creates a signature.xml for the files found in the given path.
* Signing is currently not working.
*/
STDMETHODIMP CBondiWidgetSignature::Create(BSTR path,BSTR certFile,BSTR keyFile)
{
	HRESULT hRes = S_OK;

	try
	{
		// Get handle to the crypto provider
		HCRYPTPROV hProv;
		if (!CryptAcquireContext(&hProv,NULL,NULL,PROV_RSA_AES,CRYPT_MACHINE_KEYSET | CRYPT_VERIFYCONTEXT))
		{
			BONDI_RAISE_ERROR(E_BONDI_CRYPT,_T("CryptAcquireContext failed"));
		}

		CPackageResource* resource = new CDiskResource((LPCTSTR)path);

		// Build the signedInfo xml fragment for the given path.	
		CString objectElement = GetSignatureProperties(_T("BondiDistributorSig"));

		_bstr_t signedInfoSig = CreateSignedInfoFragment(hProv,resource,objectElement);

		// Load the private key from file (TODO: find certificate and use private key).
		HCRYPTKEY hKey = LoadKey(hProv,keyFile);

		// Get the signed digest for the signedInfo xml fragment.
		CString signatureValue = CreateSignature(hProv,signedInfoSig,hKey);

		// Build the full signature xml.
		_bstr_t xml = _T("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Signature xmlns:ds='http://www.w3.org/2000/09/xmldsig#' xmlns:dsp='http://www.w3.org/2009/xmldsig-properties' Id=\"BondiDistributorSig\">");
		xml += (LPCTSTR)signedInfoSig;

		// Format the SignatureValue and KeyInfo fragments.
		TCHAR sigTemplate[] = _T("<ds:SignatureValue>%s</ds:SignatureValue><ds:KeyInfo><ds:X509Data><ds:X509Certificate>%s</ds:X509Certificate></ds:X509Data></ds:KeyInfo><ds:Object Id=\"prop\">%s</ds:Object></Signature>");
		TCHAR buff[BUFSIZE];

		// Load into _bstr_t so we can get the string value (as opposed to a byte array).
		_bstr_t encodedCert = LoadCertificate(certFile);
		_stprintf(buff,sigTemplate,(LPCTSTR)signatureValue,(LPCTSTR)encodedCert,(LPCTSTR)objectElement);

		xml += buff;

		// Write the signature.xml file.
		CString sigPath = CString(path) + _T("\\signature1.xml");
		HANDLE hFile = ::CreateFile(sigPath,GENERIC_WRITE,0,NULL,CREATE_ALWAYS,FILE_ATTRIBUTE_NORMAL,NULL);
		if (hFile == INVALID_HANDLE_VALUE)
			BONDI_RAISE_ERROR(E_BONDI_FILE_NOT_FOUND,_T("CBondiWidgetSignature::Create - Can't create file ") + CString(sigPath));

		_bstr_t writeXML(xml);
		DWORD read;
		::WriteFile(hFile,(const char*)writeXML,writeXML.length(),&read,NULL);

		::CloseHandle(hFile);

		CryptReleaseContext(hProv, 0);

	}
	catch (_com_error& err)
	{
		hRes = BONDI_SET_ERROR(err,"CBondiWidget::Load - COM exception");
	}
	catch (...)
	{
		hRes = BONDI_SET_ERROR(E_FAIL,"CBondiWidget::Load - C++ exception");
	}

	return hRes;
}

/**
* Verifies a signature.xml for the given resource.
*
*/
BOOL CBondiWidgetSignature::Verify(CPackageResource* path,BSTR signatureFile,VARIANT_BOOL requireChain)
{
	BOOL verified = FALSE;

	try
	{
		_bstr_t conv(path->Path().c_str());
		WidgetRuntimeLog(_T("Processing signature: ") + CString((LPCTSTR)conv) + _T("\\") + signatureFile);

		std::wstring sigXMLStr;
		conv = signatureFile;
		path->GetFile((LPCTSTR)conv,sigXMLStr);
		_bstr_t sigXML;

		// Load the signature xml into a DOM.
		MSXML2::IXMLDOMDocument2Ptr doc;
		BONDI_CHECK_ERROR(doc.CreateInstance(__uuidof(MSXML2::DOMDocument)),doc);
		doc->loadXML(sigXML);

		doc->setProperty("SelectionNamespaces","xmlns:ds='http://www.w3.org/2000/09/xmldsig#' xmlns:dsp='http://www.w3.org/2009/xmldsig-properties'");

		// Find the signature value (the signed digest).
		MSXML2::IXMLDOMNodePtr node = doc->selectSingleNode("Signature/ds:SignatureValue");
		if (node == NULL)
			BONDI_RAISE_ERROR(E_BONDI_SIGNATURE,_T("CBondiWidgetSignature::Verify - Missing SignatureValue element"));
		_bstr_t signedDigest = node->text;

		// Find the certificate used for signing.
		node = doc->selectSingleNode("Signature/ds:KeyInfo/ds:X509Data/ds:X509Certificate");
		if (node == NULL)
			BONDI_RAISE_ERROR(E_BONDI_SIGNATURE,_T("CBondiWidgetSignature::Verify - Missing X509Certificate element"));
		_bstr_t certificate = node->text;

		// Get handle to the crypto provider
		HCRYPTPROV hProv;
		if (!CryptAcquireContext(&hProv,NULL,NULL,PROV_RSA_AES,CRYPT_MACHINE_KEYSET | CRYPT_VERIFYCONTEXT))
		{
			BONDI_RAISE_ERROR(E_BONDI_CRYPT,_T("CryptAcquireContext failed"));
		}

		std::vector<SigResource*> resources;

		MSXML2::IXMLDOMNodeListPtr lst = doc->selectNodes("Signature/ds:SignedInfo/ds:Reference");
		for (int refIdx = 0; refIdx < lst->length; refIdx++)
		{
			MSXML2::IXMLDOMNodePtr ref = lst->item[refIdx];

			MSXML2::IXMLDOMNodePtr attrib = ref->attributes->getNamedItem("URI");
			if (attrib != NULL)
			{
				CString findPath = attrib->text;

				SigResource* res = NULL;

				if (findPath[0] == '#')
				{
					// This is a reference to a local object element.
					ref = doc->selectSingleNode(_bstr_t("Signature/ds:Object[@Id=\"") + _bstr_t(findPath.Mid(1)) + _T("\"]"));
					CString data = (LPCTSTR)ref->firstChild->xml;
					res = GetStringDigest(hProv,findPath,data);
				}
				else
				{
					res = GetFileDigest(hProv,path,findPath);
				}

				resources.push_back(res);
			}
		}

		// Build the signedInfo xml fragment for the given path.
		_bstr_t signedInfoSig = GetSignedInfoXML(resources);

		// Verify the signed info against the given signed digest.
		verified = VerifySignature(hProv,signedInfoSig,signedDigest,certificate,requireChain != VARIANT_FALSE);

		CryptReleaseContext(hProv, 0);
	}
	catch (_com_error& err)
	{
		BONDI_SET_ERROR(err,"CBondiWidgetSignature::Verify - COM exception");
		verified = FALSE;
	}
	catch (...)
	{
		BONDI_SET_ERROR(E_FAIL,"CBondiWidgetSignature::Verify - C++ exception");
		verified = FALSE;
	}

	return verified;
}

/**
* Iterates over all files in the given path (and sub-paths) and creates
* a signedInfo fragment containing reference elements and their respective
* digest value.
*/
CString CBondiWidgetSignature::CreateSignedInfoFragment(HCRYPTPROV hProv,CPackageResource* path, CString& objectElement)
{
	std::vector<SigResource*> resources;

	// Process all files in the resource.
	ProcessResource(hProv,resources,path);

	SigResource* objectRef = GetStringDigest(hProv,_T("#prop"),objectElement);
	resources.push_back(objectRef);

	return GetSignedInfoXML(resources);
}

CString CBondiWidgetSignature::GetSignatureProperties(CString sigId)
{
	TCHAR objectTemplate[] = _T("<ds:SignatureProperties xmlns=\"http://www.w3.org/2000/09/xmldsig#\" xmlns:dsp=\"http://www.w3.org/2009/xmldsig-properties\">\
	   <ds:SignatureProperty Id=\"profile\" Target=\"#%s\">\
		<dsp:Profile URI=\"http://www.w3.org/ns/widgets-digsig#profile\"/>\
	   </ds:SignatureProperty>\
	   <ds:SignatureProperty Id=\"role\" Target=\"#%s\">\
		<dsp:Role URI=\"http://www.w3.org/ns/widgets-digsig#role-distributor\"/>\
	   </ds:SignatureProperty>\
	   <ds:SignatureProperty Id=\"identifier\" Target=\"#%s\">\
		<dsp:Identifier>%s</dsp:Identifier>\
	   </ds:SignatureProperty>\
	  </ds:SignatureProperties>");

	TCHAR buff[BUFSIZE];

#ifdef UNDER_CE

#else
	// Create a unique ID for this sig.
	TCHAR* guidStr;
	
	GUID *pguid = new GUID; 
	CoCreateGuid(pguid); 

	// Convert the GUID to a string
	UuidToString(pguid, (RPC_WSTR*)&guidStr);

	delete pguid;

	_stprintf(buff,objectTemplate,(LPCTSTR)sigId,(LPCTSTR)sigId,(LPCTSTR)sigId,(LPCTSTR)guidStr);

	RpcStringFree((RPC_WSTR*)&guidStr);
#endif

	return buff;
}

CString CBondiWidgetSignature::GetSignedInfoXML(std::vector<SigResource*>& resources)
{
	// This is a template for the reference element (using sha256).
	CString signedInfo = _T("<ds:SignedInfo Id=\"sigId\"><ds:CanonicalizationMethod Algorithm=\"http://www.w3.org/2001/10/xml-exc-c14n#\"/><ds:SignatureMethod Algorithm=\"http://www.w3.org/2001/04/xmldsig-more#rsa-sha256\" />");
	TCHAR refTemplate[] = _T("<ds:Reference URI=\"%s\"><ds:DigestMethod Algorithm=\"http://www.w3.org/2001/04/xmlenc#sha256\" /><ds:DigestValue>%s</ds:DigestValue></ds:Reference>");
	TCHAR buff[BUFSIZE];
	
	// Build xml fragment for each reference.
	for (std::vector<SigResource*>::iterator it = resources.begin(); it != resources.end(); it++)
	{
		SigResource* res = *it;

		_stprintf(buff,refTemplate,(LPCTSTR)res->m_path,(LPCTSTR)res->m_digest);

		signedInfo += buff;

		delete res;
	}
	
	// Change all Windows path separators (backslash) with forward slashes.
	signedInfo.Replace(_T("\\"),_T("/"));

	signedInfo += "</ds:SignedInfo>";

	return signedInfo;
}

/**
* 
*/
HCRYPTKEY CBondiWidgetSignature::LoadKey(HCRYPTPROV hProv,BSTR filename)
{
	HANDLE hFile = ::CreateFile(filename,GENERIC_READ,0,NULL,OPEN_ALWAYS,FILE_ATTRIBUTE_NORMAL,NULL);
	if (hFile == INVALID_HANDLE_VALUE)
		BONDI_RAISE_ERROR(E_BONDI_FILE_NOT_FOUND,_T("CBondiWidgetSignature::LoadKey - Can't open file ") + CString(filename));

	BYTE* buff = new BYTE[BUFSIZE];
	DWORD read = BUFSIZE;

	::ReadFile(hFile,buff,read,&read,NULL);

	::CloseHandle(hFile);

	HCRYPTKEY privateKey = NULL;

	// The first 24 bytes of the data is a header (see http://www.drh-consultancy.demon.co.uk/pvk.html).
	BOOL keyOK = CryptImportKey(hProv,buff+24,read-24,NULL,0,&privateKey);
	DWORD err = ::GetLastError();

	delete[] buff;

	return privateKey;
}

/**
* 
*/
_bstr_t CBondiWidgetSignature::LoadCertificate(BSTR filename)
{
	HANDLE hFile = ::CreateFile(filename,GENERIC_READ,0,NULL,OPEN_ALWAYS,FILE_ATTRIBUTE_NORMAL,NULL);
	if (hFile == INVALID_HANDLE_VALUE)
		BONDI_RAISE_ERROR(E_BONDI_FILE_NOT_FOUND,_T("CBondiWidgetSignature::LoadCertificate - Can't open file ") + CString(filename));

	DWORD fsize = ::GetFileSize(hFile,NULL);
	BYTE* buff = new BYTE[fsize+1];
	DWORD read = fsize;

	::ReadFile(hFile,buff,read,&read,NULL);
	::CloseHandle(hFile);

	buff[read] = 0;

	int encLen = Base64EncodeGetRequiredLength(read);
	CHAR* enc = new CHAR[encLen+1];
	Base64Encode(buff,read,enc,&encLen);
	enc[encLen] = 0;

	return enc;
}

_bstr_t CBondiWidgetSignature::GetFingerprint(PCCERT_CONTEXT ctx)
{
	// Get the certificate fingerprint.
	DWORD fprintCount = 0;
	CertGetCertificateContextProperty(ctx, CERT_HASH_PROP_ID, NULL, &fprintCount);

	BYTE* fprint = new BYTE[fprintCount+1];
	CertGetCertificateContextProperty(ctx, CERT_HASH_PROP_ID, fprint, &fprintCount);

	CString str;
	TCHAR tmp[3];
	for (DWORD idx = 0; idx < fprintCount; idx++)
	{
		_stprintf(tmp, _T("%02x "), fprint[idx]);
		str += tmp;
	}

	delete[] fprint;

	return (LPCTSTR)str;
}

HCRYPTKEY CBondiWidgetSignature::GetCertificateKey(HCRYPTPROV hProv,_bstr_t encodedCert,BOOL requireChain)
{
	int encodedLen = encodedCert.length();
	
	// Create a certificate context from the encoded form.
	BYTE* decoded = new BYTE[encodedLen];
	Base64Decode((LPCSTR)encodedCert,encodedLen,decoded,&encodedLen);
	PCCERT_CONTEXT ctx = CertCreateCertificateContext(PKCS_7_ASN_ENCODING | X509_ASN_ENCODING,decoded,encodedLen);
	delete[] decoded;

	HCRYPTKEY hPubKey = NULL;

	if (ctx != NULL)
	{
		TCHAR buff[BUFSIZE];

		// Store the certificate subject common name.
		CertNameToStr(X509_ASN_ENCODING, &ctx->pCertInfo->Subject, CERT_SIMPLE_NAME_STR, buff, BUFSIZE);
		m_keyCN = buff;

		m_keyFingerprint = GetFingerprint(ctx);

		// Get the public key from the certificate
		if (!CryptImportPublicKeyInfoEx(hProv, X509_ASN_ENCODING, &ctx->pCertInfo->SubjectPublicKeyInfo, CALG_RSA_KEYX, 0, NULL, &hPubKey))
		{
			DWORD err = ::GetLastError();
			BONDI_RAISE_ERROR(E_BONDI_CRYPT,_T("CryptImportPublicKeyInfoEx failed to import public key"));
		}

		// Use CryptoAPI to verify the certificate.
		CERT_CHAIN_ENGINE_CONFIG chainConfig;
		PCCERT_CHAIN_CONTEXT pChainContext;
		CERT_CHAIN_PARA chainPara;

		// Use the default chain engine. [HCCE_CURRENT_USER]
		HCERTCHAINENGINE hChainEngine = NULL;  
	 
		// Initialize chainPara:
		chainPara.cbSize = sizeof(CERT_CHAIN_PARA);
		chainPara.RequestedUsage.dwType = USAGE_MATCH_TYPE_AND;
		chainPara.RequestedUsage.Usage.cUsageIdentifier = 0;
		chainPara.RequestedUsage.Usage.rgpszUsageIdentifier = NULL;
	 
		// Initialize chainConfig:
		chainConfig.cbSize = sizeof(CERT_CHAIN_ENGINE_CONFIG);
		chainConfig.hRestrictedRoot = NULL;
		chainConfig.hRestrictedTrust = NULL;
		chainConfig.hRestrictedOther = NULL;
		chainConfig.cAdditionalStore = 0;
		chainConfig.rghAdditionalStore = NULL;
		chainConfig.dwFlags = CERT_CHAIN_CACHE_END_CERT;
		chainConfig.dwUrlRetrievalTimeout = 0 ;
		chainConfig.MaximumCachedCertificates = 0 ;
		chainConfig.CycleDetectionModulus = 0;
	 
		// Creates a certificate chain engine to build a certificate trust chain.
		if (!CertCreateCertificateChainEngine(&chainConfig, &hChainEngine))
		{
			throw _T("CertCreateCertificateChainEngine failed");
		}

		// Build a certificate chain from the chain engine.
		if (!CertGetCertificateChain(hChainEngine,          // chain engine handle
									 ctx,                   // Pointer to the end certificate.
									 NULL,                  // Use the default time.
									 NULL,                  // Search no additional stores.
									 &chainPara,            // Use AND logic, and enhanced key usage as indicated in the ChainPara data structure.
									 CERT_CHAIN_REVOCATION_CHECK_END_CERT,
									 NULL,                  // Currently reserved.
									 &pChainContext))       // Return a pointer to the chain created.       
		{
			throw _T("CertGetCertificateChain failed to get certificate chain");
		}

		PCERT_SIMPLE_CHAIN pSimpleChain = pChainContext->rgpChain[0];
 
		DWORD dwTrustErrorMask = ~(CERT_TRUST_IS_NOT_TIME_NESTED|CERT_TRUST_REVOCATION_STATUS_UNKNOWN);
		dwTrustErrorMask &= pSimpleChain->TrustStatus.dwErrorStatus;

		CertFreeCertificateChainEngine(hChainEngine);
		CertFreeCertificateContext(ctx);
		
		DWORD dwErr = SEC_E_CERT_UNKNOWN;

		if (dwTrustErrorMask)
		{
			if (dwTrustErrorMask & (CERT_TRUST_IS_PARTIAL_CHAIN | CERT_TRUST_IS_UNTRUSTED_ROOT))
			{
				dwErr = SEC_E_UNTRUSTED_ROOT;
				WidgetRuntimeLog(_T("Certificate does not chain to a trusted root (SEC_E_UNTRUSTED_ROOT)."));
				if (requireChain)
				{
					BONDI_RAISE_ERROR(E_BONDI_CRYPT,_T("Certificate does not chain to a trusted root"));
				}
				else
					m_keyRootCN = _T("!! Certificate does not chain to a trusted root !!");
			}
			else if (dwTrustErrorMask & (CERT_TRUST_IS_NOT_TIME_VALID))
			{
				dwErr = SEC_E_CERT_EXPIRED;
				WidgetRuntimeLog(_T("Certificate has expired (SEC_E_CERT_EXPIRED)."));
				if (requireChain)
				{
					BONDI_RAISE_ERROR(E_BONDI_CRYPT,_T("Certificate has expired"));
				}
				else
					m_keyRootCN = _T("!! Certificate has expired !!");
			}
			else
			{
				dwErr = SEC_E_CERT_UNKNOWN;
				WidgetRuntimeLog(_T("Certificate does not chain to a trusted root (SEC_E_CERT_UNKNOWN)."));
				if (requireChain)
				{
					BONDI_RAISE_ERROR(E_BONDI_CRYPT,_T("Certificate does not chain to a trusted root"));
				}
				else
					m_keyRootCN = _T("!! Certificate does not chain to a trusted root !!");
			}
		}
		else
		{
			// Store the root cert common name.
			CertNameToStr(X509_ASN_ENCODING, &pSimpleChain->rgpElement[pSimpleChain->cElement-1]->pCertContext->pCertInfo->Subject, CERT_SIMPLE_NAME_STR, buff, BUFSIZE);
			m_keyRootCN = buff;

			m_keyRootFingerprint = GetFingerprint(pSimpleChain->rgpElement[pSimpleChain->cElement-1]->pCertContext);

			WidgetRuntimeLog(_T("Certificate chains to a trusted root: ") + CString(buff));
		}

		CertFreeCertificateChain(pChainContext);
	}
	else
	{
		DWORD err = ::GetLastError();
		BONDI_RAISE_ERROR(E_BONDI_CRYPT,_T("CertCreateCertificateContext failed using supplied certificate"));
	}

	return hPubKey;
}

/**
* This is really crappy...
*/
CString CBondiWidgetSignature::Canonicalise(CString& in)
{
	//TCHAR* cpy = new TCHAR[in.GetLength() + 1];

	//bool eatSpace = true;
	//int idx = 0;
	//int cpyIdx = 0;
	//while (idx < in.GetLength())
	//{
	//	TCHAR ch = in[idx++];

	//	if (ch == '>')
	//	{
	//		eatSpace = true;
	//		cpy[cpyIdx++] = ch;
	//	}
	//	else if (CBondiWidgetProperties::IsSpace(ch))
	//	{
	//		if (!eatSpace)
	//		{
	//			cpy[cpyIdx++] = ch;
	//		}
	//		else
	//		{
	//			// Ignore it.
	//		}
	//	}
	//	else
	//	{
	//		eatSpace = false;
	//		cpy[cpyIdx++] = ch;
	//	}
	//}

	//cpy[cpyIdx] = 0;

	//_bstr_t ret = cpy;
	//delete[] cpy;

	//return ret;

	return _T("");
}

/**
* Create digest of the signedInfo XML and sign it.
* 
*/
CString CBondiWidgetSignature::CreateSignature(HCRYPTPROV hProv,_bstr_t signedInfo,HCRYPTKEY hKey)
{
	// Create the initial hash.
	HCRYPTHASH hHash;
	if (!CryptCreateHash(hProv, CALG_SHA_256, 0, 0, &hHash))
	{
		BONDI_RAISE_ERROR(E_BONDI_CRYPT,_T("CryptCreateHash failed"));
	}

	// Add the signedInfo xml to the hash.
	if (!CryptHashData(hHash, (BYTE*)(LPCTSTR)signedInfo, signedInfo.length(), 0))
	{
		BONDI_RAISE_ERROR(E_BONDI_CRYPT,_T("CryptHashData failed"));
	}

	CString sigVal;

	// Now encrypt the hash using the private key.
	BYTE* pSig = new BYTE[BUFSIZE];
	DWORD sigLen = BUFSIZE;
	if (!CryptSignHash(hHash,AT_SIGNATURE,NULL,0,pSig,&sigLen))
	{
		DWORD err = GetLastError();
		BONDI_RAISE_ERROR(E_BONDI_CRYPT,_T("CryptSignHash failed"));
	}
	else
	{
		// Digest signed - encode to base64.
		int encLen = Base64EncodeGetRequiredLength(sigLen);
		CHAR* enc = new CHAR[encLen+1];
		Base64Encode(pSig,sigLen,enc,&encLen);
		enc[encLen] = 0;
		sigVal = enc;
		delete[] enc;		
	}

	delete[] pSig;

	CryptDestroyHash(hHash);

	return sigVal;
}

/**
* Create digest of the signedInfo XML and verify it.
* 
*/
BOOL CBondiWidgetSignature::VerifySignature(HCRYPTPROV hProv,_bstr_t signedInfo,_bstr_t signatureB64,_bstr_t certificate,BOOL requireChain)
{
	DWORD signedInfoLen = signedInfo.length();
	BOOL verified = FALSE;

	// Create the hash.
	HCRYPTHASH hHash;
	if (!CryptCreateHash(hProv, CALG_SHA_256, 0, 0, &hHash))
	{
		BONDI_RAISE_ERROR(E_BONDI_CRYPT,_T("CBondiWidgetSignature::VerifySignature - CryptCreateHash failed"));
	}

	// Add the signedInfo xml to the hash.
	if (!CryptHashData(hHash, (BYTE*)(LPCTSTR)signedInfo, signedInfoLen, 0))
	{
		BONDI_RAISE_ERROR(E_BONDI_CRYPT,_T("CBondiWidgetSignature::VerifySignature - CryptHashData failed"));
	}

	// Get the public key of the certificate that was used to sign the widget.
	HCRYPTKEY hKey = GetCertificateKey(hProv,certificate,requireChain);

	// Decode the b64 signature value.
	LPCSTR sigB64 = signatureB64;
	int sigLen = signatureB64.length();
	BYTE* sig = new BYTE[Base64DecodeGetRequiredLength(sigLen)];
	Base64Decode(sigB64,sigLen,sig,&sigLen);

	if (!CryptVerifySignature(hHash,sig,sigLen,hKey,NULL,0))
	{
		if(GetLastError() == NTE_BAD_SIGNATURE) 
		{
			verified = FALSE;
		}
		else 
		{
			BONDI_RAISE_ERROR(E_BONDI_CRYPT,_T("CBondiWidgetSignature::VerifySignature - CryptVerifySignature failed"));
		}
	}
	else
		verified = TRUE;

	CryptDestroyHash(hHash);

	return verified;
}

/**
* Recursively processes directory structure, creating a digest for each file found.
*/
void CBondiWidgetSignature::ProcessResource(HCRYPTPROV hProv,std::vector<SigResource*>& resources,CPackageResource* resource)
{
	for (DWORD count = 0; count < resource->GetFileCount(); count++)
	{
		std::wstring findPathStr = resource->GetFilePath(count);
		_bstr_t conv(findPathStr.c_str());
		CString findPath((LPCTSTR)conv);
		
		// Don't include signature files in the signing process.
		if (CBondiWidget::IsSignatureFile(CBondiWidget::sigBaseDistributor,findPath) < 0 && CBondiWidget::IsSignatureFile(CBondiWidget::sigBaseAuthor,findPath) < 0)
		{
			// Process the file.
			SigResource* res = GetFileDigest(hProv,resource,findPath);
			resources.push_back(res);
		}
	}
}

SigResource* CBondiWidgetSignature::GetStringDigest(HCRYPTPROV hProv,CString uri,CString& data)
{
	SigResource* res = new SigResource;
	res->m_path = uri;

	// Create the initial hash.
	HCRYPTHASH hHash;
	if (!CryptCreateHash(hProv, CALG_SHA_256, 0, 0, &hHash))
	{
		BONDI_RAISE_ERROR(E_BONDI_CRYPT,_T("CryptCreateHash failed"));
	}

	// Read file contents.
	_bstr_t convert((LPCTSTR)Canonicalise(data));
	BYTE* rgbFile = (BYTE*)(LPCTSTR)convert;
	DWORD cbRead = convert.length();

	// Add new chunk to the hash.
	if (!CryptHashData(hHash, rgbFile, cbRead, 0))
	{
		BONDI_RAISE_ERROR(E_BONDI_CRYPT,_T("CryptHashData failed"));
	}

	// Determine the length of the digest.
	DWORD cbHash = 0;
	DWORD lenlen = sizeof(DWORD);
	if (!CryptGetHashParam(hHash,HP_HASHSIZE,(BYTE*)&cbHash,&lenlen,0))
	{
		BONDI_RAISE_ERROR(E_BONDI_CRYPT,_T("CryptGetHashParam failed getting size"));
	}

	BYTE* rgbHash = new BYTE[cbHash];
	if (CryptGetHashParam(hHash, HP_HASHVAL, rgbHash, &cbHash, 0))
	{
		// Encode.
		int encLen = Base64EncodeGetRequiredLength(cbHash);
		CHAR* enc = new CHAR[encLen+1];
		Base64Encode(rgbHash,cbHash,enc,&encLen);
		enc[encLen] = 0;
		res->m_digest = enc;
		delete[] enc;					
	}
	else
	{
		BONDI_RAISE_ERROR(E_BONDI_CRYPT,_T("CryptGetHashParam failed getting value"));
	}

	delete[] rgbHash;

	CryptDestroyHash(hHash);

	return res;
}

SigResource* CBondiWidgetSignature::GetFileDigest(HCRYPTPROV hProv,CPackageResource* resource,CString& findPath)
{
	SigResource* res = new SigResource;
	res->m_path = findPath;

	// Create the initial hash.
	HCRYPTHASH hHash;
	if (!CryptCreateHash(hProv, CALG_SHA_256, 0, 0, &hHash))
	{
		BONDI_RAISE_ERROR(E_BONDI_CRYPT,_T("CryptCreateHash failed"));
	}

	_bstr_t conv(findPath);
	std::wstring findPathStr((LPCTSTR)conv);

	// Read file contents.
	unsigned char* rgbFile = NULL;
	unsigned long cbRead;
	if (FALSE == resource->GetFile(findPathStr,&rgbFile,&cbRead))
	{
		BONDI_RAISE_ERROR(E_BONDI_CRYPT,_T("Failed to get resource file: ") + findPath);
	}

	// Add new chunk to the hash.
	if (!CryptHashData(hHash, rgbFile, cbRead, 0))
	{
		BONDI_RAISE_ERROR(E_BONDI_CRYPT,_T("CryptHashData failed"));
	}

	delete [] rgbFile;

	// Determine the length of the digest.
	DWORD cbHash = 0;
	DWORD lenlen = sizeof(DWORD);
	if (!CryptGetHashParam(hHash,HP_HASHSIZE,(BYTE*)&cbHash,&lenlen,0))
	{
		BONDI_RAISE_ERROR(E_BONDI_CRYPT,_T("CryptGetHashParam failed getting size"));
	}

	BYTE* rgbHash = new BYTE[cbHash];
	if (CryptGetHashParam(hHash, HP_HASHVAL, rgbHash, &cbHash, 0))
	{
		// Encode.
		int encLen = Base64EncodeGetRequiredLength(cbHash);
		CHAR* enc = new CHAR[encLen+1];
		Base64Encode(rgbHash,cbHash,enc,&encLen);
		enc[encLen] = 0;
		res->m_digest = enc;
		delete[] enc;					
	}
	else
	{
		BONDI_RAISE_ERROR(E_BONDI_CRYPT,_T("CryptGetHashParam failed getting value"));
	}

	delete[] rgbHash;

	CryptDestroyHash(hHash);

	return res;
}

STDMETHODIMP CBondiWidgetSignature::get_CommonName(BSTR* pVal)
{
	HRESULT hRes = S_OK;

	try
	{
		*pVal = m_keyCN.copy();
	}
	catch (_com_error& err)
	{
		hRes = BONDI_SET_ERROR(err,"CBondiWidgetSignature::get_KeyCommonName - COM exception");
	}
	catch (...)
	{
		hRes = BONDI_SET_ERROR(E_FAIL,"CBondiWidgetSignature::get_KeyCommonName - C++ exception");
	}

	return hRes;
}

STDMETHODIMP CBondiWidgetSignature::get_RootCommonName(BSTR* pVal)
{
	HRESULT hRes = S_OK;

	try
	{
		*pVal = m_keyRootCN.copy();
	}
	catch (_com_error& err)
	{
		hRes = BONDI_SET_ERROR(err,"CBondiWidgetSignature::get_KeyRootCommonName - COM exception");
	}
	catch (...)
	{
		hRes = BONDI_SET_ERROR(E_FAIL,"CBondiWidgetSignature::get_KeyRootCommonName - C++ exception");
	}

	return hRes;
}

STDMETHODIMP CBondiWidgetSignature::get_RootFingerprint(BSTR* pVal)
{
	HRESULT hRes = S_OK;

	try
	{
		*pVal = m_keyRootFingerprint.copy();
	}
	catch (_com_error& err)
	{
		hRes = BONDI_SET_ERROR(err,"CBondiWidgetSignature::get_KeyRootTrust - COM exception");
	}
	catch (...)
	{
		hRes = BONDI_SET_ERROR(E_FAIL,"CBondiWidgetSignature::get_KeyRootTrust - C++ exception");
	}

	return hRes;
}

STDMETHODIMP CBondiWidgetSignature::get_Fingerprint(BSTR* pVal)
{
	HRESULT hRes = S_OK;

	try
	{
		*pVal = m_keyFingerprint.copy();
	}
	catch (_com_error& err)
	{
		hRes = BONDI_SET_ERROR(err,"CBondiWidgetSignature::get_SignerId - COM exception");
	}
	catch (...)
	{
		hRes = BONDI_SET_ERROR(E_FAIL,"CBondiWidgetSignature::get_SignerId - C++ exception");
	}

	return hRes;
}
