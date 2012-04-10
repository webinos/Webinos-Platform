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

class CBondiWidgetProperties;
class CBondiWidgetAppConfig;
class CPnC;
class CPackageResource;

/**
* Encapsulate widget configuration details along with installation
* settings.
* @see CBondiWidgetConfig
*/
class ATL_NO_VTABLE CBondiWidget :
	public CComObjectRootEx<CComMultiThreadModel>,
	public CComCoClass<CBondiWidget, &CLSID_BondiWidget>,
	public ISupportErrorInfo,
	public IBondiWidget,
	public IObjectSafetyImpl<CBondiWidget, INTERFACESAFE_FOR_UNTRUSTED_CALLER | INTERFACESAFE_FOR_UNTRUSTED_DATA>
{
	typedef std::vector<CComPtr<IBondiWidgetSignature> > SIG_VEC;

private:
	CPnC* m_package;
		
	CComObject<CBondiWidgetProperties>* m_config;
	CComObject<CBondiWidgetAppConfig>* m_appSettings;
	CComPtr<IBondiWidgetSignature> m_distributorSignature;
	CComPtr<IBondiWidgetSignature> m_authorSignature;
	_bstr_t m_installedRoot;

	void LoadPackage(BSTR path,BSTR localeList,BOOL requireChain=TRUE);
	ULONG FixupLoaders(BSTR resourcePath);
	BOOL ProcessSignatures(CPackageResource* resource,BOOL requireChain=TRUE);
	void GetSignatures(CPackageResource* resource, std::vector<CString>& distributor, std::vector<CString>& author);
	IBondiWidgetSignature* ChooseSignature(SIG_VEC&);
	bool ValidateLanguageCode(std::wstring& langCode);
	std::wstring GetFolderLocale(std::wstring& findPath);

public:
	CBondiWidget() : m_installedRoot(""), m_config(NULL), m_appSettings(NULL), m_package(NULL)
	{
	}

	~CBondiWidget()
	{
	}

	static const CString sigBaseDistributor;
	static const CString sigBaseAuthor;

	static int IsSignatureFile(CString sigBase,CString& path);
	void InitialiseAppSettings();

#ifndef _CE_DCOM
DECLARE_REGISTRY_RESOURCEID(IDR_BONDIWIDGET)
#endif

BEGIN_COM_MAP(CBondiWidget)
	COM_INTERFACE_ENTRY(IBondiWidget)
	COM_INTERFACE_ENTRY(ISupportErrorInfo)
	COM_INTERFACE_ENTRY(IObjectSafety)
END_COM_MAP()

// ISupportsErrorInfo
	STDMETHOD(InterfaceSupportsErrorInfo)(REFIID riid);


	DECLARE_PROTECT_FINAL_CONSTRUCT()

	HRESULT FinalConstruct()
	{
		return S_OK;
	}

	void FinalRelease();
	static	void AddBondiLoaders(const TCHAR* sPath, const TCHAR* root=NULL);

public:
	STDMETHOD(get_Configuration)(IBondiWidgetProperties** pVal);
	STDMETHOD(get_InstalledRoot)(BSTR* pVal);
	STDMETHOD(put_InstalledRoot)(BSTR newVal);
	STDMETHOD(Load)(BSTR path, BSTR localeList,VARIANT_BOOL requireChain,BSTR* msg);
	STDMETHOD(Install)(BSTR archiveFilePath,BSTR localeList,VARIANT_BOOL overwrite,VARIANT_BOOL silent);
	STDMETHOD(get_RuntimeId)(LONG* pVal);
	STDMETHOD(put_RuntimeId)(LONG newVal);
	STDMETHOD(get_AppSettings)(IBondiWidgetAppConfig** pVal);
	STDMETHOD(get_DistributorDigitalSignature)(IBondiWidgetSignature** pVal);
	STDMETHOD(get_AuthorDigitalSignature)(IBondiWidgetSignature** pVal);
};

OBJECT_ENTRY_AUTO(__uuidof(BondiWidget), CBondiWidget)
