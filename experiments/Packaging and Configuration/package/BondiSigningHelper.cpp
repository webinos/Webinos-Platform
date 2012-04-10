// BondiSigningHelper.cpp : Implementation of CBondiSigningHelper

#include "stdafx.h"
#include <iostream>
#include <map>
#include "zip.h"
#include "BondiSigningHelper.h"
#include "BondiWidgetSignature.h"
#include "common\WidgetErrorCodes.h"
#include "common\WidgetUtils.h"
#include "BondiWidget.h"

// CBondiSigningHelper

STDMETHODIMP CBondiSigningHelper::InterfaceSupportsErrorInfo(REFIID riid)
{
	static const IID* arr[] = 
	{
		&IID_IBondiSigningHelper
	};

	for (int i=0; i < sizeof(arr) / sizeof(arr[0]); i++)
	{
		if (InlineIsEqualGUID(*arr[i],riid))
			return S_OK;
	}
	return S_FALSE;
}

STDMETHODIMP CBondiSigningHelper::Sign(BSTR sourceDir, BSTR targetWgtFile, BSTR certPath, BSTR certKeyPath)
{
	HRESULT hRes = S_OK;

	try
	{
		_bstr_t zipFolder = sourceDir;
		_bstr_t targetFile = targetWgtFile;
		_bstr_t certificate = certPath;
		_bstr_t key = certKeyPath;

		if (certificate.length() > 0 && key.length() > 0)
		{
			// Inject bondi loader code into HTML before signing.
			CBondiWidget::AddBondiLoaders(zipFolder);

			CComObject<CBondiWidgetSignature>* digSig;
			CComObject<CBondiWidgetSignature>::CreateInstance(&digSig);
			digSig->AddRef();
			digSig->Create(zipFolder,certificate,key);
			digSig->Release();
		}

		HZIP hz = CreateZip(targetFile,"");
		if (hz == 0)
			BONDI_RAISE_ERROR(E_FAIL,_T("Unable to create zip file at: ") + CString((LPCTSTR)targetFile));

		TCHAR baseTarget[MAX_PATH];
		TCHAR baseTargetExt[MAX_PATH];
		_tsplitpath_s(targetFile,NULL,0,NULL,0,baseTarget,MAX_PATH,baseTargetExt,MAX_PATH);

		if (!ZipDirectory(hz,zipFolder,_T(""),CString(baseTarget) + CString(baseTargetExt)))
			BONDI_RAISE_ERROR(E_FAIL,_T("Failed to create package "));

		CloseZip(hz);
	}
	catch (_com_error& err)
	{
		hRes = BONDI_SET_ERROR(err,"CBondiWidget::Load - COM exception");
	}
	catch (...)
	{
		hRes = BONDI_SET_ERROR(E_FAIL,"CBondiWidget::Load - C++ exception");
	}

	return hRes;
}

BOOL CBondiSigningHelper::ZipDirectory(HZIP hz,const TCHAR* sPath, const TCHAR* sSubs, const TCHAR* targetFile) 
{
	HANDLE hFind;    // file handle
	WIN32_FIND_DATA FindFileData;

	TCHAR DirPath[MAX_PATH];
	TCHAR FileName[MAX_PATH];

	_tcscpy(DirPath,sPath);
	_tcscat(DirPath,_T("\\*"));    // searching all files
	_tcscpy(FileName,sPath);
	_tcscat(FileName,_T("\\"));

	// find the first file
	hFind = FindFirstFile(DirPath,&FindFileData);
	if (hFind == INVALID_HANDLE_VALUE) 
		return FALSE;
	
	_tcscpy(DirPath,FileName);

	bool bSearch = true;
	while (bSearch) 
	{    
		// until we find an entry
		if (!WidgetUtils::IsDots(FindFileData.cFileName) && _tcscmp(_T(".svn"),FindFileData.cFileName) != 0) 
		{		
			TCHAR RelPath[MAX_PATH];
			_tcscpy(RelPath,sSubs);
			if (_tcslen(RelPath) > 0)
				_tcscat(RelPath,_T("\\"));
			_tcscat(RelPath,FindFileData.cFileName);

			_tcscat(FileName,FindFileData.cFileName);

			if ((FindFileData.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY)) 
			{
				// we have found a directory
				if (ZR_OK != ZipAddFolder(hz,RelPath))
				{
					return FALSE;
				}
				
				// recurse
				if (!ZipDirectory(hz,FileName,RelPath,targetFile)) 
				{
					FindClose(hFind);
					return FALSE;    
				}
				
				_tcscpy(FileName,DirPath);
			}
			else 
			{
				// A file.
				if (_tcscmp(targetFile,RelPath) != 0 && ZR_OK != ZipAdd(hz,RelPath, FileName))
				{
					return FALSE;
				}

				_tcscpy(FileName,DirPath);
			}
		}

		if (!FindNextFile(hFind,&FindFileData))
		{
			// no more files there
			if(GetLastError() == ERROR_NO_MORE_FILES)
				bSearch = false;
			else 
			{
				// some error occurred; close the handle and return FALSE
				FindClose(hFind);
				return FALSE;
			}
		}
	}

	FindClose(hFind);                  // close the file handle

	return TRUE;
}
