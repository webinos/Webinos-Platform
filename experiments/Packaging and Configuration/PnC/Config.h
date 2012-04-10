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

#include <string>

//
// Abstract interface representing all W3C packaging and configuration attributes.
//
// Most methods return a bool value to indicate whether the corresponding attribute
// was specified in the configuration. This helps distinguish between empty values
// and NULL (unspecified) data. For example, if GetName returns true and the
// name argument is empty, then an empty name element was present. If GetName returns
// false then no name element was present.
//
class Iw3cConfig
{
public:
	virtual bool GetId(std::wstring& id) = 0;
	virtual bool GetVersion(std::wstring& version) = 0;
	virtual bool GetWidth(size_t& width) = 0;
	virtual bool GetHeight(size_t& height) = 0;
	virtual bool GetViewModes(std::wstring& viewmodes) = 0;

	virtual bool GetName(std::wstring& name) = 0;
	virtual bool GetShortName(std::wstring& name) = 0;
	virtual bool GetDescription(std::wstring& description) = 0;

	virtual bool GetStartFile(std::wstring& name) = 0;
	virtual bool GetStartFileContentType(std::wstring& type) = 0;
	virtual bool GetStartFileEncoding(std::wstring& encoding) = 0;

	virtual bool GetAuthor(std::wstring& author) = 0;
	virtual bool GetAuthorHref(std::wstring& authorHref) = 0;
	virtual bool GetAuthorEmail(std::wstring& authorEmail) = 0;

	virtual bool GetLicense(std::wstring& license) = 0;
	virtual bool GetLicenseHref(std::wstring& licenseHref) = 0;
	virtual bool GetLicenseFile(std::wstring& licenseFile) = 0;

	virtual size_t GetIconCount() = 0;
	virtual bool GetIcon(size_t idx, std::wstring& path, int& width, int& height) = 0;

	virtual size_t GetFeatureCount() = 0;
	virtual bool GetFeature(size_t idx, std::wstring& name, bool& required, size_t& paramCount) = 0;
	virtual bool GetFeatureParam(std::wstring featureName, size_t idx, std::wstring& name, std::wstring& val) = 0;

	virtual size_t GetPreferenceCount() = 0;
	virtual bool GetPreference(size_t idx, std::wstring& name, std::wstring& val, bool& readOnly) = 0;
};
