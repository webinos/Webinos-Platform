// TestPolicy.cpp : Implementation of CTestPolicy

#include "stdafx.h"
#include "TestPolicy.h"

#include "Query.h"
#include "PolicyDoc.h"
#include "RequestContext.h"

// CTestPolicy


STDMETHODIMP CTestPolicy::Test(BSTR policyXML, BSTR requestXML, BSTR* result)
{
    HRESULT hRes = S_OK;
    
    try
    {
	    // Load policy
	    _bstr_t request(requestXML);
	    CQuery q((LPCSTR)request);

	    _bstr_t policy = _bstr_t(policyXML);
	    CPolicyDoc policyDoc((LPCSTR)policy,false);

	    decisionResult decision = q.GetDecision(policyDoc);
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
    }
    catch (...)
    {
        hRes = S_FALSE;
    }
    
    return hRes;
}
