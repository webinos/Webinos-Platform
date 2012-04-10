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

typedef std::vector<CComPtr<IBondiFeatureParam> > PARAM_VEC;

// CBondiWidgetFeature
class ATL_NO_VTABLE CBondiWidgetFeature :
	public CComObjectRootEx<CComMultiThreadModel>,
	public CComCoClass<CBondiWidgetFeature, &CLSID_BondiWidgetFeature>,
	public ISupportErrorInfo,
	public IDispatchImpl<IBondiWidgetFeature, &IID_IBondiWidgetFeature, &LIBID_packageLib, /*wMajor =*/ 1, /*wMinor =*/ 0>
{
private:
	PARAM_VEC m_params;
	_bstr_t m_name;
	BOOL m_required;

public:
	CBondiWidgetFeature() : m_required(TRUE)
	{
	}

#ifndef _CE_DCOM
DECLARE_REGISTRY_RESOURCEID(IDR_BONDIWIDGETFEATURE)
#endif


BEGIN_COM_MAP(CBondiWidgetFeature)
	COM_INTERFACE_ENTRY(IDispatch)
	COM_INTERFACE_ENTRY(IBondiWidgetFeature)
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

	// Non-interface methods.
	void parse(MSXML2::IXMLDOMNodePtr doc);
	void AddParam(_bstr_t name, _bstr_t val);

	STDMETHOD(put_Param)(ULONG idx, IBondiFeatureParam* newVal);
	STDMETHOD(put_Name)(BSTR newVal);
	STDMETHOD(put_Required)(VARIANT_BOOL newVal);

public:

	STDMETHOD(get_ParamCount)(ULONG* pVal);
	STDMETHOD(get_Param)(ULONG idx, IBondiFeatureParam** pVal);
	STDMETHOD(get_Name)(BSTR* pVal);
	STDMETHOD(get_Required)(VARIANT_BOOL* pVal);
};

OBJECT_ENTRY_AUTO(__uuidof(BondiWidgetFeature), CBondiWidgetFeature)
