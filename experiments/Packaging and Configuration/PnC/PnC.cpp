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
#include "PnC.h"
#include "ConfigXML.h"
#include "ArchiveResource.h"
#include <algorithm>
#include "DefaultStartFiles.h"
#include "DefaultIcons.h"
#include "ConfigXMLImpl.h"

CDefaultStartFiles sm_defaultStartFiles;
CDefaultIcons sm_defaultIcons;

CPnC::CPnC() : m_packageResource(NULL), m_config(NULL)
{
}

CPnC::CPnC(CPackageLocales locales) : m_packageResource(NULL), m_locales(locales), m_config(NULL)
{
	// Remove empty and wildcard locale entries.
	CPackageLocales::iterator it = find(m_locales.begin(),m_locales.end(),L"");
	if (it != m_locales.end())
		m_locales.erase(it);

	it = find(m_locales.begin(),m_locales.end(),L"*");
	if (it != m_locales.end())
		m_locales.erase(it);
}

CPnC::~CPnC(void)
{
	delete m_config;
	delete m_packageResource;
}

// Load from a ZIP archive.
bool CPnC::LoadZip(std::wstring filepath, bool validate)
{
	delete m_packageResource;
	m_packageResource = new CArchiveResource(filepath);

	return LoadPackage(validate);
}

// Load from a pre-initialised package resource.
bool CPnC::Load(CPackageResource* resource, bool validate)
{
	// n.b. we take ownership of resource.
	delete m_packageResource;
	m_packageResource = resource;

	return LoadPackage(validate);
}

CPackageResource* CPnC::GetResource(void)
{
	return m_packageResource;
}

bool CPnC::LoadPackage(bool validate)
{
	m_faults.clear();

	if (!m_packageResource->IsOpen())
	{
		m_faults.push_back(L"package not open");
		return false;
	}

	bool ret = true;

	delete m_config;
	m_config = new CConfigXML(m_locales);

	std::wstring configFile;
	if (m_packageResource->GetFile(L"config.xml",configFile))
	{
		if (false == m_config->LoadXML(configFile,m_faults))
		{
			m_faults.push_back(L"failed to load config.xml.");
			return false;
		}
	}
	else
	{
		m_faults.push_back(L"no config.xml file found");
		ret = false;
	}

	return ret && validate ? ValidatePackage() : ret;
}

bool CPnC::ValidatePackage()
{
	bool ret = true;

	std::wstring startFile;
	if (false == GetStartFile(startFile))
	{
		// No content start file found...
		ret = false;
	}

	std::wstring startContentType;
	if (false != GetStartFileContentType(startContentType))
	{
		// We only support HTML at present.
		if (wcscmp(startContentType.c_str(),L"text/html") != 0)
		{
			m_faults.push_back(L"unsupported content-type: " + startContentType);
			ret = false;
		}
	}

	// Try and locate each icon specified in the config.
	size_t iconCount = m_config->GetIconCount();
	for (size_t idx = 0; idx < iconCount; idx++)
	{
		IconInfo ii;
		if (m_config->GetIcon(idx,ii.m_path,ii.m_width,ii.m_height))
		{
			ii.m_path = FindFileInPackage(ii.m_path);
			if (ii.m_path.length() > 0 && m_iconLookup.find(ii.m_path) == m_iconLookup.end() && ValidateImageContentType(ii.m_path))
			{
				m_iconLookup[ii.m_path] = true;
				m_icons.push_back(ii);
			}
			else
				m_faults.push_back(L"missing icon file: " + ii.m_path);
		}
	}

	// Try and locate default icons.
	for (vector<std::wstring>::iterator it = sm_defaultIcons.begin(); it != sm_defaultIcons.end(); it++)
	{
		IconInfo ii;
		ii.m_path = FindFileInPackage(*it);
		if (ii.m_path.length() > 0 && m_iconLookup.find(ii.m_path) == m_iconLookup.end() && ValidateImageContentType(ii.m_path))
		{
			ii.m_width = ii.m_height = -1;
			m_iconLookup[ii.m_path] = true;
			m_icons.push_back(ii);
		}
	}

	return ret;
}

void CPnC::GetFaults(std::vector<std::wstring>& faults)
{
	faults.clear();
	faults = m_faults;
}

bool CPnC::GetId(std::wstring& id)
{
	return m_config == NULL ? false : m_config->GetId(id);
}

bool CPnC::GetVersion(std::wstring& version)
{
	return m_config == NULL ? false : m_config->GetVersion(version);
}

bool CPnC::GetWidth(size_t& width)
{
	return m_config == NULL ? false : m_config->GetWidth(width);
}

bool CPnC::GetHeight(size_t& height)
{
	return m_config == NULL ? false : m_config->GetHeight(height);
}

bool CPnC::GetViewModes(std::wstring& viewmodes)
{
	return m_config == NULL ? false : m_config->GetViewModes(viewmodes);
}

bool CPnC::GetName(std::wstring& name)
{
	return m_config == NULL ? false : m_config->GetName(name);
}

bool CPnC::GetShortName(std::wstring& name)
{
	return m_config == NULL ? false : m_config->GetShortName(name);
}

bool CPnC::GetDescription(std::wstring& description)
{
	return m_config == NULL ? false : m_config->GetDescription(description);
}

bool CPnC::GetStartFile(std::wstring& filePath)
{
	if (m_config == NULL)
		return false;

	std::wstring startFile;

	// If there is an explicit start file named in the config, try and find it.
	if (m_config->GetStartFile(startFile) && startFile.length() > 0)
	{
		// We have a file name, now try and locate it...
		filePath = FindFileInPackage(startFile);
		if (filePath.length() == 0)
			m_faults.push_back(L"Explicit start file not found: " + startFile);
	}

	if (filePath.length() == 0)
	{
		// No explicitly named start file found, try the defaults.
		for (vector<std::wstring>::iterator it = sm_defaultStartFiles.begin(); it != sm_defaultStartFiles.end(); it++)
		{
			filePath = FindFileInPackage(*it);
			if (filePath.length() > 0)
				break;
		}

		if (filePath.length() == 0)
			m_faults.push_back(L"No explicit start file and no default found");
	}

	return filePath.length() > 0;
}

bool CPnC::GetStartFileContentType(std::wstring& type)
{
	return m_config == NULL ? false : m_config->GetStartFileContentType(type);
}

bool CPnC::GetStartFileEncoding(std::wstring& encoding)
{
	return m_config == NULL ? false : m_config->GetStartFileEncoding(encoding);
}

bool CPnC::GetAuthor(std::wstring& author)
{
	return m_config == NULL ? false : m_config->GetAuthor(author);
}

bool CPnC::GetAuthorHref(std::wstring& authorHref)
{
	return m_config == NULL ? false : m_config->GetAuthorHref(authorHref);
}

bool CPnC::GetAuthorEmail(std::wstring& authorEmail)
{
	return m_config == NULL ? false : m_config->GetAuthorEmail(authorEmail);
}

bool CPnC::GetLicense(std::wstring& license)
{
	return m_config == NULL ? false : m_config->GetLicense(license);
}

bool CPnC::GetLicenseHref(std::wstring& licenseHref)
{
	return m_config == NULL ? false : m_config->GetLicenseHref(licenseHref);
}

bool CPnC::GetLicenseFile(std::wstring& filePath)
{
	if (m_config == NULL)
		return false;

	std::wstring licenseFile;

	// If there is an explicit license file named in the config, try and find it.
	if (m_config->GetLicenseFile(licenseFile))
	{
		if (licenseFile.length() != 0)
		{
			// We have a file name, now try and locate it...
			filePath = FindFileInPackage(licenseFile);
			if (filePath.length() == 0)
				m_faults.push_back(L"Explicit license file not found: " + licenseFile);
		}
	}

	return filePath.length() > 0;
}

size_t CPnC::GetIconCount()
{
	return m_config == NULL ? 0 : m_icons.size();
}

bool CPnC::GetIcon(size_t idxIn, std::wstring& pathOut, int& widthOut, int& heightOut)
{
	if (m_config == NULL || idxIn >= m_icons.size())
		return false;

	pathOut = m_icons[idxIn].m_path;
	widthOut = m_icons[idxIn].m_width;
	heightOut = m_icons[idxIn].m_height;

	return pathOut.length() > 0;
}

size_t CPnC::GetFeatureCount()
{
	return m_config == NULL ? 0 : m_config->GetFeatureCount();
}

bool CPnC::GetFeature(size_t idx, std::wstring& name, bool& required, size_t& paramCount)
{
	return m_config == NULL ? false : m_config->GetFeature(idx,name,required,paramCount);
}

size_t CPnC::GetPreferenceCount()
{
	return m_config == NULL ? 0 : m_config->GetPreferenceCount();
}

bool CPnC::GetPreference(size_t idx, std::wstring& name, std::wstring& val, bool& readOnly)
{
	return m_config == NULL ? false : m_config->GetPreference(idx,name,val,readOnly);
}

bool CPnC::GetFeatureParam(std::wstring featureName, size_t idx, std::wstring& name, std::wstring& val)
{
	return m_config == NULL ? false : m_config->GetFeatureParam(featureName,idx,name,val);
}

//
// Locate a file in the package, starting in the given locale folder.
// Reduce the language code if necessary.
//
std::wstring CPnC::FindLocaleFile(std::wstring langCode, std::wstring findPath)
{
	bool foundFile = false;
	std::wstring localePath;

	while (!foundFile && langCode.length() > 0)
	{
		localePath = std::wstring(L"locales/") + langCode + std::wstring(L"/") + findPath;
		foundFile = m_packageResource->FileExists(localePath);
		
		langCode = CConfigXMLImpl::ReduceLocale(langCode);
	}

	return foundFile ? localePath : L"";
}

//
// Locate a file in the package. 
// Search in each of the supported locales. 
//
// \see http://dev.w3.org/2006/waf/widgets/#rule-for-finding-a-file-within-a-widget-0
//
std::wstring CPnC::FindFileInPackage(std::wstring findPath)
{
	// Start looking in the most preferred locale folder.
	std::wstring localePath;
	for (CPackageLocales::iterator it = m_locales.begin(); localePath.length() == 0 && it != m_locales.end(); it++)
	{
		localePath = FindLocaleFile(*it,findPath);
	}

	if (localePath.length() == 0)
	{
		// Check the root.
		if (m_packageResource->FileExists(findPath))
			localePath = findPath;
	}

	return localePath;
}
bool CPnC::ValidateImageContentType(std::wstring& filePath)
{
	static unsigned char gif87[] =	{ '\x47', '\x49', '\x46', '\x38', '\x37', '\x61'};
	static unsigned char gif89[] =	{ '\x47', '\x49', '\x46', '\x38', '\x39', '\x61'};
	static unsigned char png[] =	{ '\x89', '\x50', '\x4E', '\x47', '\x0D', '\x0A', '\x1A', '\x0A'};
	static unsigned char jpg[] =	{ '\xFF', '\xD8', '\xFF'};
	static unsigned char bmp[] =	{ '\x42', '\x4D'};
	static unsigned char vnd[] =	{ '\x00', '\x00', '\x01','\x00'};
	static unsigned char xrar[] =	{ '\x52', '\x61', '\x72', '\x20', '\x1A', '\x07'};
	bool match = false;

	unsigned long len;
	unsigned char* contents;
	if (m_packageResource->GetFile(filePath,&contents,&len))
	{
		match = memcmp(gif87,contents, 6) == 0 ||
				memcmp(gif89,contents, 6) == 0 ||
				memcmp(png,contents, 8) == 0 ||
				memcmp(jpg,contents, 3) == 0 ||
				memcmp(bmp,contents, 2) == 0 ||
				memcmp(vnd,contents, 4) == 0 ||
				memcmp(xrar,contents, 6) == 0;

		delete[] contents;
	}

	return match;
}