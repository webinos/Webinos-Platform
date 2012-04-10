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

#include "stdafx.h"
#include "BondiWidgetLibrary.h"
#include "common/WidgetUtils.h"
#include "common/WidgetConstants.h"
#include "wininet.h"
#include "unzip.h"
#include "BondiWidget.h"
#include "wincrypt.h"
#include <initguid.h>

#ifdef UNDER_CE
#include <connmgr.h>
#endif

// CBondiWidgetLibrary
static const TCHAR agentName[] = _T("Bondi");
static const TCHAR tempPrefix[] = _T("bon");

STDMETHODIMP CBondiWidgetLibrary::InterfaceSupportsErrorInfo(REFIID riid)
{
	static const IID* arr[] = 
	{
		&IID_IBondiWidgetLibrary
	};

	for (int i=0; i < sizeof(arr) / sizeof(arr[0]); i++)
	{
		if (InlineIsEqualGUID(*arr[i],riid))
			return S_OK;
	}
	return S_FALSE;
}

/**
* Download and install from a remote location using HTTP.
* @param url the url indicating the location of the widget.
* @param widget receives the constructed widget on success.
*/
STDMETHODIMP CBondiWidgetLibrary::RemoteInstall(BSTR url, IBondiWidget** widget)
{
	HRESULT hRes = S_OK;

	try
	{
		TCHAR appDataPath[MAX_PATH];
		WidgetUtils::GetAppFolder(NULL,appDataPath);

		TCHAR canonicalURL[1024];
		DWORD nSize = 1024;
		InternetCanonicalizeUrl(url, canonicalURL, &nSize, ICU_BROWSER_MODE);

		// Check for an internet connection.
		if (InternetAttemptConnect(0) != ERROR_SUCCESS)
			BONDI_RAISE_ERROR(E_BONDI_WIDGET_NO_INTERNET,_T("no internet connection found"));

		// Open a connection.
		HINTERNET hINet = InternetOpen(agentName,INTERNET_OPEN_TYPE_DIRECT,NULL,NULL,INTERNET_FLAG_NO_CACHE_WRITE);

		if (hINet != 0)
		{
			HANDLE hConnection = ConnectToNetwork(25);
			if (hConnection != NULL)
			{
				// Attempt to access the resource at the url.
				DWORD options = INTERNET_FLAG_NEED_FILE|INTERNET_FLAG_HYPERLINK|INTERNET_FLAG_RESYNCHRONIZE|INTERNET_FLAG_RELOAD;
				HINTERNET hFile = InternetOpenUrl( hINet, canonicalURL, NULL, 0, options, 0 );

				if (hFile != 0)
				{
					// Determine the file name to store the downloaded widget resource.
					TCHAR fName[MAX_PATH];
					_tsplitpath_s(url, NULL, 0, NULL, 0, fName, _MAX_FNAME, NULL, 0); 

					// Create the target local file.
					_bstr_t downloadPath = appDataPath + _bstr_t("\\") + _bstr_t(fName) + _bstr_t(".wgt");			
					HANDLE target = ::CreateFile(downloadPath,GENERIC_WRITE,0,NULL,CREATE_ALWAYS,FILE_ATTRIBUTE_NORMAL,NULL);

					// Read chunks.
					BYTE buffer[1024];
					DWORD dwRead;
					while (::InternetReadFile( hFile, buffer, 1024, &dwRead ) )
					{
						if ( dwRead == 0 )
							break;

						::WriteFile(target,buffer,dwRead,&dwRead,NULL);
					}

					::CloseHandle(target);

					InternetCloseHandle(hFile);

					CComObject<CBondiWidget>* newWidget;
					BONDI_CHECK_ERROR(CComObject<CBondiWidget>::CreateInstance(&newWidget),(IBondiWidgetLibrary*)this);
					newWidget->AddRef();

					// Do the installation.
					_bstr_t locale("en");
					hRes = newWidget->Install(downloadPath,locale,VARIANT_FALSE,VARIANT_FALSE);
					BONDI_CHECK_ERROR(hRes,(IBondiWidget*)newWidget);					

					if (hRes == S_OK)
					{
						// Set the install URL.
						CComPtr<IBondiWidgetAppConfig> appConfig;
						BONDI_CHECK_ERROR(newWidget->get_AppSettings(&appConfig),(IBondiWidget*)newWidget);
						if (appConfig != NULL)
							BONDI_CHECK_ERROR(appConfig->PutBondiSetting(_T("bondi.installUri"),canonicalURL,VARIANT_TRUE),appConfig);

						newWidget->InitialiseAppSettings();

						// We've finished with the temporary downloaded resource.
						::DeleteFile(downloadPath);

						*widget = (IBondiWidget*)newWidget;
					}
					else
					{
						// Didn't install (probably because of an existing widget).
						*widget = NULL;
					}
				}
				else
				{				 
					DWORD err = GetLastError();
					BONDI_RAISE_ERROR(E_BONDI_WIDGET_URL_OPEN_FAILED,_T("couldn't open url: ") + CString(canonicalURL));
				}

#ifdef UNDER_CE
				ConnMgrReleaseConnection(hConnection,1);
				CloseHandle(hConnection);
#endif
			}

			InternetCloseHandle(hINet);
		}
		else
		{
			BONDI_RAISE_ERROR(E_BONDI_WIDGET_NO_INTERNET,_T("error opening internet connection"));
		}
	}
	catch (_com_error& err)
	{
		hRes = BONDI_SET_ERROR(err,"CBondiWidgetLibrary::RemoteInstall - COM exception");
	}
	catch (...)
	{
		hRes = BONDI_SET_ERROR(E_FAIL,"CBondiWidgetLibrary::RemoteInstall - C++ exception");
	}

	return hRes;
}

/**
* Install widget from a local package file.
*/
STDMETHODIMP CBondiWidgetLibrary::LocalInstall(BSTR path,VARIANT_BOOL overwrite,VARIANT_BOOL silent,IBondiWidget** widget)
{
	HRESULT hRes = S_OK;

	try
	{
		CComPtr<IBondiWidget> newWidget;
		BONDI_CHECK_ERROR(newWidget.CoCreateInstance(__uuidof(BondiWidget)),(IBondiWidgetLibrary*)this);

		_bstr_t locale("en");
		hRes = newWidget->Install(path,locale,overwrite,silent);
		BONDI_CHECK_ERROR(hRes,(IBondiWidget*)newWidget);

		*widget = newWidget.Detach();
	}
	catch (_com_error& err)
	{
		hRes = BONDI_SET_ERROR(err,"CBondiWidgetLibrary::LocalInstall - COM exception");
	}
	catch (...)
	{
		hRes = BONDI_SET_ERROR(E_FAIL,"CBondiWidgetLibrary::LoadInstall - C++ exception");
	}

	return hRes;
}

/**
* Gets the list of widgets currently installed.
*/
STDMETHODIMP CBondiWidgetLibrary::GetInstalled(LONG* count, IBondiWidget** widgets[])
{
	HRESULT hRes = S_OK;

	try
	{
		TCHAR appDataPath[MAX_PATH];
		WidgetUtils::GetAppFolder(NULL,appDataPath);

		CString findPath = appDataPath + CString("\\") + WIDGET_INSTALL_FOLDER;

		// Get possible installed candidates.
		WIN32_FIND_DATA fd;	
		HANDLE ff = FindFirstFile(findPath + "\\*",&fd);

		if (ff != INVALID_HANDLE_VALUE)
		{
			std::vector<CComPtr<IBondiWidget> > lst;

			do
			{
				if ((fd.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY) == FILE_ATTRIBUTE_DIRECTORY && fd.cFileName[0] != '.')
				{
					// This is a sub-directory.
					_bstr_t root = findPath + "\\" + fd.cFileName;
					LoadWidgetVersions(root,lst);
				}
			}
			while (FindNextFile(ff,&fd) != 0);

			*count = (LONG)lst.size();
			*widgets = (IBondiWidget**)::CoTaskMemAlloc(sizeof(IBondiWidget*) * (*count)); 

			int idx = 0;
			for (std::vector<CComPtr<IBondiWidget> >::iterator it = lst.begin(); it != lst.end(); it++)
			{
				(*widgets)[idx] = (*it).Detach();
				idx++;
			}
		}
	}
	catch (_com_error& err)
	{
		hRes = BONDI_SET_ERROR(err,"CBondiWidgetLibrary::GetInstalled - COM exception");
	}
	catch (...)
	{
		hRes = BONDI_SET_ERROR(E_FAIL,"CBondiWidgetLibrary::GetInstalled - C++ exception");
	}

	return hRes;
}

void CBondiWidgetLibrary::LoadWidgetVersions(_bstr_t& root,std::vector<CComPtr<IBondiWidget> >& lst)
{
	// Get possible installed candidates.
	WIN32_FIND_DATA fd;	
	HANDLE ff = FindFirstFile(root + "\\*",&fd);

	if (ff != INVALID_HANDLE_VALUE)
	{
		do
		{
			if ((fd.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY) == FILE_ATTRIBUTE_DIRECTORY && fd.cFileName[0] != '.')
			{
				// This is a sub-directory.
				_bstr_t loadPath = root + "\\" + fd.cFileName;

				CComPtr<IBondiWidget> widget;
				widget.CoCreateInstance(__uuidof(BondiWidget));

				// ToDo - parameterise this.
				_bstr_t locales("en");
				_bstr_t loadMsg;
				if (SUCCEEDED(widget->Load(loadPath, locales, VARIANT_TRUE, loadMsg.GetAddress())))
				{
					lst.push_back(widget);
				}
			}
		}
		while (FindNextFile(ff,&fd) != 0);
	}
}

STDMETHODIMP CBondiWidgetLibrary::Uninstall(BSTR name)
{
	// TODO: Add your implementation code here

	return S_OK;
}

HANDLE CBondiWidgetLibrary::ConnectToNetwork(int timeoutsecs)
{
	// handle to connection to start
	HANDLE hConnection = NULL;

#ifdef UNDER_CE
	// stores return value identifying status of connection attempt
	DWORD dwStatus;

	// initialise connection info structure
	CONNMGR_CONNECTIONINFO pConnectionInfo;
	ZeroMemory(&pConnectionInfo, sizeof(CONNMGR_CONNECTIONINFO));

	// set structure size
	pConnectionInfo.cbSize = sizeof(CONNMGR_CONNECTIONINFO);

	// set priority to identify that a user initiated this request
	// and the GUI is waiting on the creation of the connection
	pConnectionInfo.dwPriority = CONNMGR_PRIORITY_USERINTERACTIVE;

	// identify the network to connect to
	pConnectionInfo.dwParams = CONNMGR_PARAM_GUIDDESTNET;
	pConnectionInfo.guidDestNet = IID_DestNetInternet;

	// specify that other applications can use this connection
	pConnectionInfo.bExclusive = FALSE;

	// specify that a connection should be made
	pConnectionInfo.bDisabled = FALSE;

	// request connection
	HRESULT hr = ConnMgrEstablishConnectionSync(&pConnectionInfo,
		&hConnection,
		timeoutsecs * 1000,
		&dwStatus);

	if (hr != S_OK)
	{
#ifdef _DEBUG
		switch (dwStatus)
		{
		case CONNMGR_STATUS_DISCONNECTED:
			MessageBox(NULL,TEXT("The connection has been disconnected"),TEXT("Connection Manager"),MB_ICONERROR);
			break;
		case CONNMGR_STATUS_WAITINGFORPATH:
			MessageBox(NULL,TEXT("A path to the destination exists but is not presently available"),TEXT("Connection Manager"),MB_ICONERROR);
			break;
		case CONNMGR_STATUS_WAITINGFORRESOURCE:
			MessageBox(NULL,TEXT("Another client is using resources that this connection requires"),TEXT("Connection Manager"),MB_ICONERROR);
			break;
		case CONNMGR_STATUS_WAITINGFORPHONE:
			MessageBox(NULL,TEXT("Connection cannot be made while call in progress"),TEXT("Connection Manager"),MB_ICONERROR);
			break;
		case CONNMGR_STATUS_NOPATHTODESTINATION:
			MessageBox(NULL,TEXT("No path to the destination could be found"),TEXT("Connection Manager"),MB_ICONERROR);
			break;
		case CONNMGR_STATUS_CONNECTIONFAILED:
			MessageBox(NULL,TEXT("The connection failed and cannot be reestablished"),TEXT("Connection Manager"),MB_ICONERROR);
			break;
		case CONNMGR_STATUS_CONNECTIONCANCELED:
			MessageBox(NULL,TEXT("The user aborted the connection"),TEXT("Connection Manager"),MB_ICONERROR);
			break;
		case CONNMGR_STATUS_WAITINGCONNECTION:
			MessageBox(NULL,TEXT("The device is attempting to connect"),TEXT("Connection Manager"),MB_ICONERROR);
			break;
		case CONNMGR_STATUS_WAITINGCONNECTIONABORT:
			MessageBox(NULL,TEXT("The device is aborting the connection attempt"),TEXT("Connection Manager"),MB_ICONERROR);
			break;
		case CONNMGR_STATUS_WAITINGDISCONNECTION:
			MessageBox(NULL,TEXT("The connection is being brought down"),TEXT("Connection Manager"),MB_ICONERROR);
			break;
		default:
			MessageBox(NULL,TEXT("The connection attempt failed"),TEXT("Connection Manager"),MB_ICONERROR);
			break;
		}
#endif
	}
#endif

	return hConnection;
}

