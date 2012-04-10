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

#include "common.h"
#include "ArchiveResource.h"

CArchiveResource::CArchiveResource(std::wstring path) : CPackageResource(path)
{
	m_hz = OpenZip(path.c_str(),0);
}

CArchiveResource::~CArchiveResource(void)
{	
	CloseZip(m_hz);
}

bool CArchiveResource::IsOpen(void) 
{ 
	return m_hz != 0; 
}

void CArchiveResource::Replace(std::wstring& str, const std::wstring& old, const std::wstring& rep)
{
  size_t pos = 0;
  while((pos = str.find(old, pos)) != std::wstring::npos)
  {
     str.replace(pos, old.length(), rep);
     pos += rep.length();
  }
}

bool CArchiveResource::FileExists(std::wstring path, int& findIdx, ZIPENTRY& findEntry)
{
	Replace(path,L"\\",L"/");
	FindZipItem(m_hz,path.c_str(),false,&findIdx,&findEntry);
	return findIdx >= 0;
}

bool CArchiveResource::FileExists(std::wstring path)
{
	int findIdx;
	ZIPENTRY findEntry;
	return FileExists(path,findIdx,findEntry);
}

bool CArchiveResource::GetFile(std::wstring path,unsigned char** buff,unsigned long* len)
{
	bool gotIt = false;

	int findIdx;
	ZIPENTRY findEntry;
	if (FileExists(path,findIdx,findEntry))
	{
		// Found file.
		*len = findEntry.unc_size;
		*buff = new unsigned char[(*len)+1];
		UnzipItem(m_hz,findIdx,*buff,*len);
		(*buff)[(*len)] = 0;

		gotIt = true;
	}

	return gotIt;
}

unsigned long CArchiveResource::GetFileCount()
{
	ZIPENTRY ze; 
	GetZipItem(m_hz,-1,&ze); 

	return ze.index;
}

std::wstring CArchiveResource::GetFilePath(unsigned long idx)
{
	ZIPENTRY ze; 
	GetZipItem(m_hz,idx,&ze);

	return ze.name;
}

bool CArchiveResource::IsDirectory(unsigned long idx)
{
	Reset();

	ZIPENTRY ze; 
	GetZipItem(m_hz,idx,&ze);

	return (ze.attr & FILE_ATTRIBUTE_DIRECTORY) == FILE_ATTRIBUTE_DIRECTORY;
}

bool CArchiveResource::Save(std::wstring targetPath)
{
	Reset();

	SetUnzipBaseDir(m_hz,targetPath.c_str());
	
	int numitems = GetFileCount();
	for (int i = 0; i < numitems; i++)
	{ 
		ZIPENTRY ze; 
		GetZipItem(m_hz,i,&ze);
	
		UnzipItem(m_hz,i,ze.name);
	}

	return true;
}

void CArchiveResource::Reset()
{
	// Workaround - the zip appears to get corrupted sometimes during
	// processing. Closing and re-opening solves this.
	CloseZip(m_hz);
	m_hz = OpenZip(m_path.c_str(),0);
}
