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

#include "StdAfx.h"
#include "DiskResource.h"

CDiskResource::CDiskResource(std::wstring path) : CPackageResource(path)
{
	ProcessDirectory(_T(""));
}

CDiskResource::~CDiskResource(void)
{
}

/**
* Recursively processes directory structure, storing the relative path to each file found.
*/
void CDiskResource::ProcessDirectory(std::wstring path)
{
	// Determine the package-relative resource path.
	std::wstring findPath(m_path);
	if (path.length() > 0)
		findPath.append(std::wstring(_T("\\"))).append(path);

	std::wstring search(findPath);
	search.append(_T("\\*"));
	WIN32_FIND_DATA fd;	
	HANDLE ff = FindFirstFile(search.c_str(),&fd);

	if (ff != INVALID_HANDLE_VALUE)
	{
		do
		{
			if (_tcscmp(fd.cFileName,_T(".")) != 0 && _tcscmp(fd.cFileName,_T("..")) != 0 && _tcscmp(fd.cFileName,_T(".svn")) != 0)
			{
				std::wstring foundPath(path);
				if (foundPath.length() > 0)
					foundPath.append(_T("\\")).append(fd.cFileName);
				else
					foundPath = fd.cFileName;

				if ((fd.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY) == FILE_ATTRIBUTE_DIRECTORY)
				{
					// Recurse into this sub-directory.
					ProcessDirectory(foundPath);
				}
				else 
				{
					m_files.push_back(foundPath);
				}
			}
		}
		while (FindNextFile(ff,&fd) != 0);

		FindClose(ff);
	}
}

bool CDiskResource::FileExists(std::wstring path)
{
	std::wstring fullPath(m_path);
	fullPath.append(_T("\\")).append(path);
	return ::GetFileAttributes(fullPath.c_str()) != INVALID_FILE_ATTRIBUTES;
}

bool CDiskResource::IsDirectory(unsigned long idx)
{
	if (idx >= m_files.size())
		return false;

	return (::GetFileAttributes(m_files[idx].c_str()) & FILE_ATTRIBUTE_DIRECTORY) == FILE_ATTRIBUTE_DIRECTORY;
}

bool CDiskResource::GetFile(std::wstring path,unsigned char** buff,unsigned long* len)
{
	bool result = TRUE;

	std::wstring fullPath(m_path);
	fullPath.append(_T("\\")).append(path);

	/// Open the file.
	HANDLE hf = ::CreateFile(fullPath.c_str(),GENERIC_READ,0,NULL,OPEN_EXISTING,FILE_ATTRIBUTE_NORMAL,NULL);

	if (hf != INVALID_HANDLE_VALUE)
	{
		// Allocate a buffer to receive file.
		*len = ::GetFileSize(hf,NULL);
		*buff = new unsigned char[(*len)+1];

		// Load the data.
		unsigned long read;
		::ReadFile(hf,*buff,*len,&read,NULL);
		::CloseHandle(hf);
		ATLASSERT(read == *len);

		(*buff)[*len] = 0;
	}
	else
		result = FALSE;

	return result;
}

unsigned long CDiskResource::GetFileCount()
{
	return m_files.size();
}

std::wstring CDiskResource::GetFilePath(unsigned long idx)
{
	if (idx >= m_files.size())
		return _T("");

	return m_files[idx];
}

bool CDiskResource::Save(std::wstring targetPath)
{
	// TODO: copy to target path?
	return FALSE;
}
