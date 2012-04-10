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

#pragma once
#ifdef STANDARDSHELL_UI_MODEL
#include "resource.h"
#endif
#ifdef POCKETPC2003_UI_MODEL
#include "resourceppc.h"
#endif
#ifdef SMARTPHONE2003_UI_MODEL
#include "resourcesp.h"
#endif
#ifdef AYGSHELL_UI_MODEL
#include "resourceayg.h"
#endif

#include "package.h"
#include <vector>
#include <wincrypt.h>

class CPackageResource;

class SigResource
{
public:
	CString m_path;
//	CString m_file;
	CString m_digest;
	CString m_xml;

public:
	SigResource() {};
};


// CBondiWidgetSignature
class ATL_NO_VTABLE CBondiWidgetSignature :
	public CComObjectRootEx<CComMultiThreadModel>,
	public CComCoClass<CBondiWidgetSignature, &CLSID_BondiWidgetSignature>,
	public ISupportErrorInfo,
	public IDispatchImpl<IBondiWidgetSignature, &IID_IBondiWidgetSignature, &LIBID_packageLib, /*wMajor =*/ 1, /*wMinor =*/ 0>
{
private:
	_bstr_t m_keyCN;
	_bstr_t m_keyRootCN;
	_bstr_t m_keyFingerprint;
	_bstr_t m_keyRootFingerprint;

public:
	CString CreateSignature(HCRYPTPROV hProv,_bstr_t signedInfo,HCRYPTKEY hKey);
	BOOL VerifySignature(HCRYPTPROV hProv,_bstr_t signedInfo,_bstr_t signature,_bstr_t certificate,BOOL requireChain);

	CString CreateSignedInfoFragment(HCRYPTPROV hProv,CPackageResource* path,CString& objectE);
	void ProcessResource(HCRYPTPROV hProv,std::vector<SigResource*>& resources,CPackageResource* path);
	HCRYPTKEY LoadKey(HCRYPTPROV hProv,BSTR filename);
	_bstr_t LoadCertificate(BSTR filename);
	HCRYPTKEY GetCertificateKey(HCRYPTPROV hProv,_bstr_t encodedCert,BOOL requireChain);
	CString GetSignedInfoXML(std::vector<SigResource*>& resources);
	SigResource* GetFileDigest(HCRYPTPROV hProv,CPackageResource* resource,CString& findPath);
	_bstr_t GetFingerprint(PCCERT_CONTEXT ctx);
	SigResource* GetStringDigest(HCRYPTPROV hProv,CString uri,CString& data);
	CString GetSignatureProperties(CString sigId);
	CString Canonicalise(CString& in);

	BOOL Verify(CPackageResource* package,BSTR signatureFile,VARIANT_BOOL requireChain=VARIANT_TRUE);

public:
	CBondiWidgetSignature()
	{
	}

#ifndef _CE_DCOM
DECLARE_REGISTRY_RESOURCEID(IDR_BONDIWIDGETSIGNATURE)
#endif


BEGIN_COM_MAP(CBondiWidgetSignature)
	COM_INTERFACE_ENTRY(IDispatch)
	COM_INTERFACE_ENTRY(IBondiWidgetSignature)
	COM_INTERFACE_ENTRY(ISupportErrorInfo)
END_COM_MAP()

// ISupportsErrorInfo
	STDMETHOD(InterfaceSupportsErrorInfo)(REFIID riid);


	DECLARE_PROTECT_FINAL_CONSTRUCT()

	HRESULT FinalConstruct()
	{
		return S_OK;
	}

	void FinalRelease()
	{
	}

public:
	STDMETHOD(Create)(BSTR path,BSTR certFile,BSTR keyFile);
	STDMETHOD(get_CommonName)(BSTR* pVal);
	STDMETHOD(get_RootCommonName)(BSTR* pVal);
	STDMETHOD(get_Fingerprint)(BSTR* pVal);
	STDMETHOD(get_RootFingerprint)(BSTR* pVal);
};

OBJECT_ENTRY_AUTO(__uuidof(BondiWidgetSignature), CBondiWidgetSignature)
