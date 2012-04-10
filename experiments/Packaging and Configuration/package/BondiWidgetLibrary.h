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


class ATL_NO_VTABLE CBondiWidgetLibrary :
	public CComObjectRootEx<CComMultiThreadModel>,
	public CComCoClass<CBondiWidgetLibrary, &CLSID_BondiWidgetLibrary>,
	public ISupportErrorInfo,
	public IBondiWidgetLibrary
{
public:
	CBondiWidgetLibrary()
	{
	}

#ifndef _CE_DCOM
DECLARE_REGISTRY_RESOURCEID(IDR_BONDIWIDGETLIBRARY)
#endif


BEGIN_COM_MAP(CBondiWidgetLibrary)
	COM_INTERFACE_ENTRY(IBondiWidgetLibrary)
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

	HANDLE ConnectToNetwork(int timeoutsecs);
	void LoadWidgetVersions(_bstr_t& root,std::vector<CComPtr<IBondiWidget> >& lst);

public:
	/**
	* Install widget from a url-based package file.
	*/
	STDMETHOD(RemoteInstall)(BSTR url, IBondiWidget** widget);

	/**
	* Install widget from a local package file.
	*/
	STDMETHOD(LocalInstall)(BSTR path, VARIANT_BOOL overwrite,VARIANT_BOOL silent,IBondiWidget** widget);

	/**
	* Get all installed widgets.
	*/
	STDMETHOD(GetInstalled)(LONG* count, IBondiWidget** widgets[]);

	/**
	* Un-install widget.
	*/
	STDMETHOD(Uninstall)(BSTR name);
};

OBJECT_ENTRY_AUTO(__uuidof(BondiWidgetLibrary), CBondiWidgetLibrary)
