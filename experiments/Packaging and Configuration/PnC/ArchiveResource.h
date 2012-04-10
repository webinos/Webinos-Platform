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
#pragma once

#include "packageresource.h"
#include "unzip.h"

//
// This class encapsulates a ZIP archive as a CPackageResource.
//
class CArchiveResource : public CPackageResource
{
private:
	HZIP m_hz;
	bool FileExists(std::wstring path, int& findIdx, ZIPENTRY& findEntry);
	void Replace(std::wstring& str, const std::wstring& old, const std::wstring& rep);
	void Reset(void);

public:
	CArchiveResource(std::wstring path);
	~CArchiveResource(void);

	virtual bool IsOpen(void);
	virtual bool IsDirectory(unsigned long idx);
	virtual bool FileExists(std::wstring path);
	virtual bool GetFile(std::wstring path,unsigned char** buff,unsigned long* len);
	virtual unsigned long GetFileCount();
	virtual std::wstring GetFilePath(unsigned long idx);
	virtual bool Save(std::wstring targetPath);
};
