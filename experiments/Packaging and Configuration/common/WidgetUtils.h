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

#ifndef WIDGET_UTILS_H
#define WIDGET_UTILS_H

#include "shellapi.h"
#include "shlobj.h"
#include <time.h>
#include "stdio.h"

/**
* COM method implementation template.
*/
#if 0
	
	HRESULT hRes = S_OK;

	try
	{
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

#endif

/**
* General helper funcs.
*/
class WidgetUtils
{
public:	
	static BOOL validatePositiveInteger(_bstr_t& inp)
	{
		BOOL numeric = TRUE;

		int idx = inp.length();
		
		if (idx == 0)
			return false;

		while (--idx >= 0 && numeric)
			numeric = isdigit(inp.GetBSTR()[idx]) != 0;

		return numeric;
	}

	static BOOL validateVersion(_bstr_t& inp)
	{
		BOOL valid = TRUE;

		int idx = inp.length();
		while (--idx >= 0 && valid)
			valid = isalnum(inp.GetBSTR()[idx]) != 0 || inp.GetBSTR()[idx] == '.';

		return valid;
	}

	/*
	* @param createdPath receives the full new path, must be at least MAX_PATH in length.
	*/
	static void GetAppFolder(HWND hWnd, TCHAR* createdPath, int folderId=CSIDL_PROGRAM_FILES, TCHAR* folderName=NULL) 
	{
		if (folderName == NULL)
			folderName = _T("Bondi");

		// Get the special folder.
		TCHAR appDataPath[MAX_PATH];		
		BOOL res = SHGetSpecialFolderPath(hWnd, appDataPath, folderId, FALSE);

		// See if everything will fit in output string
		if (res && lstrlen(appDataPath) + lstrlen(folderName) < MAX_PATH)
		{
			// Build full path.
			lstrcpy(createdPath, appDataPath);
			lstrcat(createdPath, _T("\\"));
			lstrcat(createdPath, folderName);

			// See if directory exists.
			if (GetFileAttributes(createdPath) == 0xffffffff) 
			{
				DWORD err = GetLastError();
				
				if (err == ERROR_PATH_NOT_FOUND || err == ERROR_FILE_NOT_FOUND)
				{
					// Wasn't there, create the directory
					if (!CreateDirectory(createdPath, NULL))
						res = FALSE;
				} 
				else 
				{
					res = FALSE;  // Dir created but unaccessible
				}
			} 
		}

		if (!res)
			BONDI_RAISE_ERROR_EX(E_BONDI_FILE_ACCESS,_T("failed to get special folder"),GUID_NULL);
	}

	static BOOL DeleteDirectory(const TCHAR* sPath,bool subFoldersOnly=false) 
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
			return TRUE;
		
		_tcscpy(DirPath,FileName);

		bool bSearch = true;
		while (bSearch) 
		{    
			// Continue until we find an entry.
			if (!IsDots(FindFileData.cFileName)) 
			{		
				_tcscat(FileName,FindFileData.cFileName);

				if ((FindFileData.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY)) 
				{
					// we have found a directory, recurse
					if(!DeleteDirectory(FileName,false)) 
					{
						FindClose(hFind);
						return FALSE;    // directory couldn't be deleted
					}
					
					// remove the empty directory
					RemoveDirectory(FileName);
					_tcscpy(FileName,DirPath);
				}
				else 
				{
					//if(FindFileData.dwFileAttributes &
					//	FILE_ATTRIBUTE_READONLY)
					//	// change read-only file mode
					//	_chmod(FileName, _S_IWRITE);
					if (!subFoldersOnly && !DeleteFile(FileName)) 
					{    
						// delete the file
						FindClose(hFind);
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

		if (subFoldersOnly)
			return true;
		else
			return RemoveDirectory(sPath);     // remove the empty directory
	}

	static BOOL IsDots(const TCHAR* str) 
	{
		if(_tcscmp(str,_T(".")) && _tcscmp(str,_T(".."))) return FALSE;
		return TRUE;
	}

	/**
	* Attempts to inject the bondiLoader.js script into the HTML <head> tag.
	*/
	static void InsertBondiLoader(const TCHAR* path, const TCHAR* root)
	{
		TCHAR bootCode[MAX_PATH];
		
		if (root != NULL)
			swprintf(bootCode,_T("<script type=\"text/javascript\" src=\"%sbondiLoader.js\"></script>"),root);
		else
			_tcscpy(bootCode,_T("<script type=\"text/javascript\" src=\"bondiLoader.js\"></script>"));

		HANDLE hfHeader = ::CreateFile(path,GENERIC_READ,0,NULL,OPEN_EXISTING,FILE_ATTRIBUTE_NORMAL,NULL);
		if (hfHeader == INVALID_HANDLE_VALUE)
			BONDI_RAISE_ERROR_EX(E_BONDI_FILE_NOT_FOUND,_T("InsertBondiLoader - Can't find file ") + CString(path),GUID_NULL);
	 
		DWORD fileSize = ::GetFileSize(hfHeader,NULL);
		BYTE* buff = new BYTE[fileSize+1];

		DWORD read;
		::ReadFile(hfHeader,buff,fileSize,&read,NULL);

		::CloseHandle(hfHeader);

		buff[fileSize] = 0;
		CString header(buff);
		delete[] buff;

		if (header.Find(bootCode) == -1)
		{
			bool foundHead = true;
			CString match("<head>");

			int dot = header.Find(match);
			if (dot == -1)
			{
				// No header found.
				foundHead = false;
				match = _T("<html>");
				dot = header.Find(match);
			}

			if (dot >= 0)
				dot += match.GetLength();
			else
				dot = 0;

			_bstr_t start = header.Mid(0,dot);
			_bstr_t end = header.Mid(dot);

			_bstr_t boot;
			if (foundHead)
				boot = bootCode;
			else
				boot = _T("<head>") + _bstr_t(bootCode) + _T("</head>");

			hfHeader = ::CreateFile(path,GENERIC_WRITE,0,NULL,CREATE_ALWAYS,FILE_ATTRIBUTE_NORMAL,NULL);
			if (hfHeader == INVALID_HANDLE_VALUE)
				BONDI_RAISE_ERROR_EX(E_BONDI_FILE_NOT_FOUND,_T("InsertBondiLoader - Can't create file ") + CString(path),GUID_NULL);

			::WriteFile(hfHeader,(const char*)start,start.length(),&read,NULL);
			::WriteFile(hfHeader,(const char*)boot,boot.length(),&read,NULL);
			::WriteFile(hfHeader,(const char*)end,end.length(),&read,NULL);

			::CloseHandle(hfHeader);
		}
	}
};

#endif
