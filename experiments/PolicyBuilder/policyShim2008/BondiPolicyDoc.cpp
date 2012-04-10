// BondiPolicyDoc.cpp : Implementation of CBondiPolicyDoc

#include "stdafx.h"
#include "BondiPolicyDoc.h"
#include "PolicyDoc.h"
#include "Query.h"

// CBondiPolicyDoc

void CBondiPolicyDoc::FinalRelease()
{
	delete m_policy;
}

STDMETHODIMP CBondiPolicyDoc::Load(BSTR path)
{
	delete m_policy;

	_bstr_t filePath(path);
	m_policy = new CPolicyDoc((LPCSTR)filePath,true);

	return S_OK;
}

STDMETHODIMP CBondiPolicyDoc::LoadXML(BSTR policy)
{
	HRESULT hRes = S_OK;

	try
	{
		delete m_policy;

		_bstr_t policyXML(policy);
		m_policy = new CPolicyDoc((LPCSTR)policyXML,false);
	}
	catch (...)
	{
		hRes = E_FAIL;
	}

	return hRes;
}

STDMETHODIMP CBondiPolicyDoc::GetDecision(BSTR query, BSTR* result)
{
	_bstr_t queryXML(query);

	CQuery q((LPCSTR)queryXML);
	decisionResult decision = q.GetDecision(*m_policy);

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
