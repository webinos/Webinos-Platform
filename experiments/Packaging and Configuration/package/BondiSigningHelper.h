// BondiSigningHelper.h : Declaration of the CBondiSigningHelper

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
#include "zip.h"

#if defined(_WIN32_WCE) && !defined(_CE_DCOM) && !defined(_CE_ALLOW_SINGLE_THREADED_OBJECTS_IN_MTA)
#error "Single-threaded COM objects are not properly supported on Windows CE platform, such as the Windows Mobile platforms that do not include full DCOM support. Define _CE_ALLOW_SINGLE_THREADED_OBJECTS_IN_MTA to force ATL to support creating single-thread COM object's and allow use of it's single-threaded COM object implementations. The threading model in your rgs file was set to 'Free' as that is the only threading model supported in non DCOM Windows CE platforms."
#endif



// CBondiSigningHelper

class ATL_NO_VTABLE CBondiSigningHelper :
	public CComObjectRootEx<CComMultiThreadModel>,
	public CComCoClass<CBondiSigningHelper, &CLSID_BondiSigningHelper>,
	public ISupportErrorInfo,
	public IDispatchImpl<IBondiSigningHelper, &IID_IBondiSigningHelper, &LIBID_packageLib, /*wMajor =*/ 1, /*wMinor =*/ 0>
{
private:
	BOOL ZipDirectory(HZIP hz,const TCHAR* sPath, const TCHAR* sSubs, const TCHAR* targetFile);

public:
	CBondiSigningHelper()
	{
	}

#ifndef _CE_DCOM
DECLARE_REGISTRY_RESOURCEID(IDR_BONDISIGNINGHELPER)
#endif


BEGIN_COM_MAP(CBondiSigningHelper)
	COM_INTERFACE_ENTRY(IBondiSigningHelper)
	COM_INTERFACE_ENTRY(IDispatch)
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

	STDMETHOD(Sign)(BSTR sourceDir, BSTR targetFile, BSTR certPath, BSTR certKeyPath);
};

OBJECT_ENTRY_AUTO(__uuidof(BondiSigningHelper), CBondiSigningHelper)
