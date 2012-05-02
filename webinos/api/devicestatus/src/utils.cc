#include "utils.h"

#ifdef OS_WIN	

string Utils::WmiParam(LPCWSTR prop, string query)
{
	HRESULT hres;
	
	hres =  CoInitializeEx(0, COINIT_MULTITHREADED);
	if (FAILED(hres))
		return "Failed to initialize COM library.";

	hres =  CoInitializeSecurity(
		NULL, 
		-1,								// COM authentication
		NULL,							// Authentication services
		NULL,							// Reserved
		RPC_C_AUTHN_LEVEL_DEFAULT,  	// Default authentication
		RPC_C_IMP_LEVEL_IMPERSONATE,	// Default Impersonation
		NULL,							// Authentication info
		EOAC_NONE,						// Additional capabilities
		NULL							// Reserved
	);


	if (FAILED(hres))
	{
		CoUninitialize();
		return "Failed to initialize security.";
    }
    
    IWbemLocator *pLoc = NULL;

    hres = CoCreateInstance(
		CLSID_WbemLocator,
		0,
		CLSCTX_INPROC_SERVER,
		IID_IWbemLocator,
		(LPVOID *) &pLoc
	);
 
    if (FAILED(hres))
    {
		CoUninitialize();
		return "Failed to create IWbemLocator object.";
    }

    IWbemServices *pSvc = NULL;
	
    hres = pLoc->ConnectServer(
		_bstr_t(L"ROOT\\CIMV2"),		// Object path of WMI namespace
		NULL,							// User name. NULL = current user
		NULL,							// User password. NULL = current
		0,								// Locale. NULL indicates current
		NULL,							// Security flags.
		0,								// Authority (e.g. Kerberos)
		0,								// Context object 
		&pSvc							// pointer to IWbemServices proxy
	);
    
    if (FAILED(hres))
    {
		pLoc->Release();
		CoUninitialize();
		return "Could not connect.";
    }

	hres = CoSetProxyBlanket(
		pSvc,                        // Indicates the proxy to set
		RPC_C_AUTHN_WINNT,           // RPC_C_AUTHN_xxx
		RPC_C_AUTHZ_NONE,            // RPC_C_AUTHZ_xxx
		NULL,                        // Server principal name 
		RPC_C_AUTHN_LEVEL_CALL,      // RPC_C_AUTHN_LEVEL_xxx 
		RPC_C_IMP_LEVEL_IMPERSONATE, // RPC_C_IMP_LEVEL_xxx
		NULL,                        // client identity
		EOAC_NONE                    // proxy capabilities 
	);

	if (FAILED(hres))
	{
		pSvc->Release();
		pLoc->Release();     
		CoUninitialize();
		return "Could not set proxy blanket.";
	}

	IEnumWbemClassObject* pEnumerator = NULL;
	hres = pSvc->ExecQuery(
		bstr_t("WQL"),
		bstr_t(query.c_str()),
		WBEM_FLAG_FORWARD_ONLY | WBEM_FLAG_RETURN_IMMEDIATELY, 
		NULL,
		&pEnumerator
	);

	if (FAILED(hres))
		return "Query failed.";

    IWbemClassObject *pclsObj;
    ULONG uReturn = 0;

	string propValue = "";
		
    while (pEnumerator)
    {
		char* res = new char[100];
		HRESULT hr = pEnumerator->Next(WBEM_INFINITE, 1, &pclsObj, &uReturn);

		if(0 == uReturn)
			break;
		
		VARIANT vtProp;
		
		hr = pclsObj->Get(prop, 0, &vtProp, 0, 0);
		if (vtProp.vt == 1 || vtProp.vt == 3)
		{
			char buffer[33];
			propValue += ltoa(vtProp.lVal, buffer, 10);
		}
		else
			propValue += (_bstr_t) vtProp.bstrVal;

		propValue += "\n";

		VariantClear(&vtProp);

		pclsObj->Release();
	}
	pEnumerator->Release();	
   
    pSvc->Release();
    pLoc->Release();  

    CoUninitialize();
	
    return propValue.substr(0, propValue.length() -1);
}

#else

string Utils::exec(string cmd)
{
    FILE* pipe = popen(cmd.c_str(), "r");
    
    if (!pipe) return "ERROR";
    
    char buffer[128];
    string result = "";

    while(!feof(pipe))
    {
        if(fgets(buffer, 128, pipe) != NULL)
                result += buffer;
    }
    pclose(pipe);
    return result;
}
#endif
