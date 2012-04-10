// BondiPolicyQuery.h : Declaration of the CBondiPolicyQuery

#pragma once
#include "resource.h"       // main symbols

#include "policyShim_i.h"


#if defined(_WIN32_WCE) && !defined(_CE_DCOM) && !defined(_CE_ALLOW_SINGLE_THREADED_OBJECTS_IN_MTA)
#error "Single-threaded COM objects are not properly supported on Windows CE platform, such as the Windows Mobile platforms that do not include full DCOM support. Define _CE_ALLOW_SINGLE_THREADED_OBJECTS_IN_MTA to force ATL to support creating single-thread COM object's and allow use of it's single-threaded COM object implementations. The threading model in your rgs file was set to 'Free' as that is the only threading model supported in non DCOM Windows CE platforms."
#endif

class CQuery;

// CBondiPolicyQuery

class ATL_NO_VTABLE CBondiPolicyQuery :
	public CComObjectRootEx<CComMultiThreadModel>,
	public CComCoClass<CBondiPolicyQuery, &CLSID_BondiPolicyQuery>,
	public IDispatchImpl<IBondiPolicyQuery, &IID_IBondiPolicyQuery, &LIBID_policyShimLib, /*wMajor =*/ 1, /*wMinor =*/ 0>
{
private:
	CQuery* m_query;

public:
	CBondiPolicyQuery() : m_query(NULL)
	{
	}

DECLARE_REGISTRY_RESOURCEID(IDR_BONDIPOLICYQUERY)


BEGIN_COM_MAP(CBondiPolicyQuery)
	COM_INTERFACE_ENTRY(IBondiPolicyQuery)
	COM_INTERFACE_ENTRY(IDispatch)
END_COM_MAP()



	DECLARE_PROTECT_FINAL_CONSTRUCT()

	HRESULT FinalConstruct()
	{
		return S_OK;
	}

	void FinalRelease();

public:

	STDMETHOD(LoadXML)(BSTR queryXML);
	STDMETHOD(GetDecision)(IDispatch* policyDoc, BSTR* decision);
};

OBJECT_ENTRY_AUTO(__uuidof(BondiPolicyQuery), CBondiPolicyQuery)
