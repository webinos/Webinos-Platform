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

#ifndef _WIDGET_ERROR_CODES_H
#define _WIDGET_ERROR_CODES_H

#include <comdef.h>

/**
* Custom HRESULTS defined here.
*/
#define E_BONDI_WIDGET_CONFIG_BADLY_FORMED MAKE_HRESULT(SEVERITY_ERROR,FACILITY_ITF,0x0501)
#define E_BONDI_WIDGET_CONFIG_INVALID_ROOT MAKE_HRESULT(SEVERITY_ERROR,FACILITY_ITF,0x0502)
#define E_BONDI_WIDGET_NO_INTERNET MAKE_HRESULT(SEVERITY_ERROR,FACILITY_ITF,0x0503)
#define E_BONDI_WIDGET_URL_OPEN_FAILED MAKE_HRESULT(SEVERITY_ERROR,FACILITY_ITF,0x0504)
#define E_BONDI_FILE_ACCESS MAKE_HRESULT(SEVERITY_ERROR,FACILITY_ITF,0x0505)
#define E_BONDI_FILE_NOT_FOUND MAKE_HRESULT(SEVERITY_ERROR,FACILITY_ITF,0x0506)
#define E_BONDI_WIDGET_STARTFILE_NOT_FOUND MAKE_HRESULT(SEVERITY_ERROR,FACILITY_ITF,0x0507)
#define E_BONDI_WIDGET_INVALID_ARCHIVE MAKE_HRESULT(SEVERITY_ERROR,FACILITY_ITF,0x0508)			///< W3C 'Invalid Archive' catch-all.
#define E_BONDI_WIDGET_BAD_ARCHIVE MAKE_HRESULT(SEVERITY_ERROR,FACILITY_ITF,0x0509)				///< Unable to open archive.
#define E_BONDI_APP_DATA_ACCESS MAKE_HRESULT(SEVERITY_ERROR,FACILITY_ITF,0x050a)				///< Failed to access user application data folder.
#define E_BONDI_WIDGET_FEATURE_NAME MAKE_HRESULT(SEVERITY_ERROR,FACILITY_ITF,0x050b)			///< Name missing on feature element.
#define E_BONDI_WIDGET_BOOTSCRIPT_MISSING MAKE_HRESULT(SEVERITY_ERROR,FACILITY_ITF,0x050c)		///< File bootstrapHeader.js is missing.
#define E_BONDI_MENU_ID_RANGE MAKE_HRESULT(SEVERITY_ERROR,FACILITY_ITF,0x050d)					///< Menu ID not in range 0-999.
#define E_BONDI_MENU_MODIFY_FAILURE MAKE_HRESULT(SEVERITY_ERROR,FACILITY_ITF,0x050e)			///< Error modifying Windows menu.
#define E_BONDI_CRYPT MAKE_HRESULT(SEVERITY_ERROR,FACILITY_ITF,0x050f)							///< Error from WinCrypt API.
#define E_BONDI_SIGNATURE MAKE_HRESULT(SEVERITY_ERROR,FACILITY_ITF,0x0510)						///< Digital signature.
#define E_BONDI_WIDGET_MENUID_IN_USE MAKE_HRESULT(SEVERITY_ERROR,FACILITY_ITF,0x0511)			///< Duplicate menu id.
#define E_BONDI_APP_CONFIG MAKE_HRESULT(SEVERITY_ERROR,FACILITY_ITF,0x0512)						///< Error in App Config file.
#define E_BONDI_CONFIG MAKE_HRESULT(SEVERITY_ERROR,FACILITY_ITF,0x0513)							///< General error in config.xml.

/**
* Some helpers to deal with COM exceptions.
*/

/// Use to execute the function and throw a _com_error on failure.
/// This uses _com_issue_errorex, which will check that the object supports ISupportErrorInfo
/// and then build a _com_error object using ::GetLastError() and throw it.
#define BONDI_CHECK_ERROR(func,iface) \
do { \
    HRESULT hr = (func); \
    if (FAILED(hr)) _com_issue_errorex(hr,iface,__uuidof(iface)); \
} while (0)

// Use in catch() handlers to set the IErrorInfo for the current thread (see hRes = BONDI_SET_ERROR() below).
#define BONDI_SET_ERROR_EX(err,message,clsid) bondi_set_error(err,_T(message),clsid)

// Use in catch() handlers to set the IErrorInfo for the current thread - for use in CComCoClass-derived classes (see hRes = BONDI_SET_ERROR() below).
#define BONDI_SET_ERROR(err,message) bondi_set_error(err,_T(message),GetObjectCLSID())

// Use to initialise an IErrorInfo object and throw it as a _com_error - for use in CComCoClass-derived classes (see bondi_create_error() below).
#define BONDI_RAISE_ERROR(hr,desc) { WidgetRuntimeLog(CString("Raised: ") + desc); throw _com_error(hr,bondi_create_error(hr,desc,GetObjectCLSID()),false); }

// Use to initialise an IErrorInfo object and throw it as a _com_error (see bondi_create_error() below).
#define BONDI_RAISE_ERROR_EX(hr,desc,clsid) { WidgetRuntimeLog(CString("Raised: ") + desc); throw _com_error(hr,bondi_create_error(hr,desc,clsid),false); }

inline IErrorInfo* bondi_create_error(HRESULT hr, CString pszDescription, const CLSID& clsid)
//
// Create an IErrorInfo object using the given HRESULT and description. The CLSID given is converted
// to a ProgID and used as the Source for the resulting IErrorInfo.
//
{ 
    ICreateErrorInfoPtr pICEI; 
    if (FAILED(CreateErrorInfo(&pICEI))) 
        _com_raise_error(hr); 
    pICEI->SetDescription((LPOLESTR)(LPCTSTR)pszDescription);   
	LPOLESTR lpsz;
	ProgIDFromCLSID(clsid, &lpsz);
	if (lpsz != NULL)
		pICEI->SetSource(lpsz);
	CoTaskMemFree(lpsz);
    pICEI->SetGUID(IID_NULL);   
    IErrorInfoPtr pIEI = pICEI;
    return pIEI.Detach();
}

inline HRESULT bondi_set_error(_com_error err, CString message, const CLSID& clsid)
//
// Uses the given _com_error to initialise the IErrorInfo object for the current thread.
// If there is no IErrorInfo present in the _com_error object a new one is created.
//
{
    CComPtr<IErrorInfo> pErrorInfo(err.ErrorInfo()); 

    if (pErrorInfo != NULL) 
    { 
        CLSID clsid; 
        CLSIDFromProgID(err.Source(),&clsid);

#if PROPAGATE_ERRORINFO
        //
        // Define PROPAGATE_ERRORINFO if you want to receive full error info right up the call chain (i.e. the call stack).
        //
        CString currentDescription = CString((BSTR)err.Description()) + CString("\r\n") + message;
        AtlSetErrorInfo(clsid,currentDescription, err.HelpContext(), err.HelpFile(),err.GUID(), err.Error(), NULL); 
#else
        AtlSetErrorInfo(clsid,err.Description(), err.HelpContext(), err.HelpFile(),err.GUID(), err.Error(), NULL); 
#endif
    } 
    else 
        SetErrorInfo(0,bondi_create_error(err.Error(),message,clsid)); 

    return err.Error();
}

inline void WidgetRuntimeLog(CString msg)
{
	HANDLE hLog = ::CreateFile(_T("\\Temp\\Bondi.log"),GENERIC_WRITE,FILE_SHARE_READ,NULL,OPEN_ALWAYS,FILE_ATTRIBUTE_NORMAL,NULL);
	if (hLog != INVALID_HANDLE_VALUE)
	{
		::SetFilePointer(hLog,0,NULL,FILE_END);

		SYSTEMTIME st;
		GetLocalTime(&st);

		TCHAR buff[4096];
		_stprintf(buff,_T("%.02d:%.02d:%.02d:%.03d %.02d-%.02d-%d (0x%x) - %s\r\n"),st.wHour,st.wMinute,st.wSecond,st.wMilliseconds,st.wDay,st.wMonth,st.wYear,GetCurrentProcessId(),(LPCTSTR)msg);

		DWORD count = _tcslen(buff) * sizeof(TCHAR);
		::WriteFile(hLog,buff,count,&count,NULL);

		::CloseHandle(hLog);
	}
}

#endif