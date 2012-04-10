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

#include "config.h"

// Implementation of Iw3cConfig.
//
class CConfigXML : public Iw3cConfig
{
private:
	class CConfigXMLImpl* m_impl;

public:
	CConfigXML(class CPackageLocales& locales);
	CConfigXML(CConfigXML& cpy);
	~CConfigXML(void);
	CConfigXML& operator=(CConfigXML& cpy);

	bool Load(std::wstring filepath, std::vector<std::wstring>& faults);
	bool LoadXML(std::wstring xml, std::vector<std::wstring>& faults);

	// Iw3cConfig implementation.
	virtual bool GetId(std::wstring& id);
	virtual bool GetVersion(std::wstring& version);
	virtual bool GetWidth(size_t& width);
	virtual bool GetHeight(size_t& height);
	virtual bool GetViewModes(std::wstring& viewmodes);

	virtual bool GetName(std::wstring& name);
	virtual bool GetShortName(std::wstring& name);
	virtual bool GetDescription(std::wstring& description);

	virtual bool GetStartFile(std::wstring& name);
	virtual bool GetStartFileContentType(std::wstring& type);
	virtual bool GetStartFileEncoding(std::wstring& encoding);

	virtual bool GetAuthor(std::wstring& author);
	virtual bool GetAuthorHref(std::wstring& authorHref);
	virtual bool GetAuthorEmail(std::wstring& authorEmail);

	virtual bool GetLicense(std::wstring& license);
	virtual bool GetLicenseHref(std::wstring& licenseHref);
	virtual bool GetLicenseFile(std::wstring& licenseFile);

	virtual size_t GetIconCount();
	virtual bool GetIcon(size_t idx, std::wstring& path, int& width, int& height);

	virtual size_t GetFeatureCount();
	virtual bool GetFeature(size_t idx, std::wstring& name, bool& required, size_t& paramCount);
	virtual bool GetFeatureParam(std::wstring featureName, size_t idx, std::wstring& name, std::wstring& val);

	virtual size_t GetPreferenceCount();
	virtual bool GetPreference(size_t idx, std::wstring& name, std::wstring& val, bool& readOnly);
};
