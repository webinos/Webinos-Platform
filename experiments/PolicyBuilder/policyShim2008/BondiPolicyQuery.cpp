// BondiPolicyQuery.cpp : Implementation of CBondiPolicyQuery

#include "stdafx.h"
#include "BondiPolicyQuery.h"
#include "Query.h"
#include "BondiPolicyDoc.h"

// CBondiPolicyQuery


void CBondiPolicyQuery::FinalRelease()
{
	delete m_query;
}

STDMETHODIMP CBondiPolicyQuery::LoadXML(BSTR query)
{
	_bstr_t xml(query);
	m_query = new CQuery((LPCSTR)xml);

	return S_OK;
}

STDMETHODIMP CBondiPolicyQuery::GetDecision(IDispatch* policyDoc, BSTR* result)
{
	CComQIPtr<IBondiPolicyDoc> qi((IUnknown*)policyDoc);
	CComObject<CBondiPolicyDoc>* pDoc = static_cast<CComObject<CBondiPolicyDoc>*>(qi.p);

	CPolicyDoc* pPolicyDoc = pDoc->GetDocument();
	decisionResult decision = m_query->GetDecision(*pPolicyDoc);

    _bstr_t res = "";
	    
    switch (decision)
    {
        case permit:
            res = "permit";
            break;
        case deny:
            res = "deny";
            break;
        case promptOneShot:
            res = "prompt-oneshot";
            break;
        case promptSession:
            res = "prompt-session";
            break;
        case promptBlanket:
            res = "prompt-blanket";
            break;
        case undetermined:
            res = "undetermined";
            break;
        case inapplicable:
            res = "inapplicable";
            break;
    }
    
    *result = res.Detach();

	return S_OK;
}
