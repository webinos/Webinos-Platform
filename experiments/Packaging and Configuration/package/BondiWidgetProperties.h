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
#include <map>
#include "BondiWidgetFeature.h"
#include "BondiWidgetPreference.h"

class Iw3cConfig;

// CBondiWidgetProperties
class ATL_NO_VTABLE CBondiWidgetProperties :
	public CComObjectRootEx<CComMultiThreadModel>,
	public CComCoClass<CBondiWidgetProperties, &CLSID_BondiWidgetProperties>,
	public ISupportErrorInfo,
	public IDispatchImpl<IBondiWidgetProperties, &IID_IBondiWidgetProperties, &LIBID_packageLib, /*wMajor =*/ 1, /*wMinor =*/ 0>,
	public IObjectSafetyImpl<CBondiWidgetProperties, INTERFACESAFE_FOR_UNTRUSTED_CALLER | INTERFACESAFE_FOR_UNTRUSTED_DATA>
{
private:
	/**
	* Configuration members.
	*/
	Iw3cConfig* m_config;

	// Signatures.
	CComPtr<IBondiWidgetSignature> m_distributorSignature;
	CComPtr<IBondiWidgetSignature> m_authorSignature;
	_bstr_t m_installURI;


public:
	CBondiWidgetProperties() : m_config(NULL)
	{
	}

	// Non-interface methods.
	void Load(Iw3cConfig* config);
	STDMETHOD(put_InstallURI)(BSTR newVal);
	STDMETHOD(put_DistributorDigSig)(IBondiWidgetSignature*);
	STDMETHOD(put_AuthorDigSig)(IBondiWidgetSignature*);

#ifndef _CE_DCOM
DECLARE_REGISTRY_RESOURCEID(IDR_BONDIWIDGETPROPERTIES)
#endif


BEGIN_COM_MAP(CBondiWidgetProperties)
	COM_INTERFACE_ENTRY(IBondiWidgetProperties)
	COM_INTERFACE_ENTRY(IDispatch)
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

	void FinalRelease()
	{
	}

public:
	STDMETHOD(get_Id)(BSTR* pVal);
	STDMETHOD(get_Name)(BSTR* pVal);
	STDMETHOD(get_StartFile)(BSTR* pVal);
	STDMETHOD(get_AuthorName)(BSTR* pVal);
	STDMETHOD(get_AuthorEmail)(BSTR* pVal);
	STDMETHOD(get_AuthorURL)(BSTR* pVal);
	STDMETHOD(get_Description)(BSTR* pVal);
	STDMETHOD(get_License)(BSTR* pVal);
	STDMETHOD(get_Version)(BSTR* pVal);
	STDMETHOD(get_IconCount)(USHORT* pVal);
	STDMETHOD(get_Width)(ULONG* pVal);
	STDMETHOD(get_Height)(ULONG* pVal);
	STDMETHOD(get_ViewModes)(BSTR* pVal);
	STDMETHOD(get_FeatureCount)(ULONG* pVal);
	STDMETHOD(get_Feature)(ULONG idx, IBondiWidgetFeature** pVal);
	STDMETHOD(get_InstallURI)(BSTR* pVal);
	STDMETHOD(get_DistributorCommonName)(BSTR* pVal);
	STDMETHOD(get_DistributorRootCommonName)(BSTR* pVal);
	STDMETHOD(get_DistributorFingerprint)(BSTR* pVal);
	STDMETHOD(get_DistributorRootFingerprint)(BSTR* pVal);
	STDMETHOD(get_AuthorCommonName)(BSTR* pVal);
	STDMETHOD(get_AuthorRootCommonName)(BSTR* pVal);
	STDMETHOD(get_AuthorFingerprint)(BSTR* pVal);
	STDMETHOD(get_AuthorRootFingerprint)(BSTR* pVal);
	STDMETHOD(get_PreferenceCount)(ULONG* pVal);
	STDMETHOD(get_Preference)(ULONG idx, IBondiWidgetPreference** pVal);
	STDMETHOD(get_ShortName)(BSTR* pVal);
	STDMETHOD(get_StartFileEncoding)(BSTR* pVal);
	STDMETHOD(get_StartFileContentType)(BSTR* pVal);
	STDMETHOD(get_LicenseHref)(BSTR* pVal);
	STDMETHOD(get_LicenseFile)(BSTR* pVal);
	STDMETHOD(GetIcon)(ULONG idx, BSTR* path, ULONG* width, ULONG* height);
};

OBJECT_ENTRY_AUTO(__uuidof(BondiWidgetProperties), CBondiWidgetProperties)
