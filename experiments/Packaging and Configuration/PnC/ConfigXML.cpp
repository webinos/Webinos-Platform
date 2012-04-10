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
#include "ConfigXML.h"
#include "PackageLocales.h"
#include "ConfigXMLImpl.h"

//
// config.xml wrapper => delegate to implementation.
//
CConfigXML::CConfigXML(CPackageLocales& locales) : m_impl(NULL)
{
	m_impl = new CConfigXMLImpl(locales);
}

CConfigXML::CConfigXML(CConfigXML& cpy) : m_impl(NULL)
{
	this->operator=(cpy);
}

CConfigXML::~CConfigXML(void)
{
	delete m_impl;
}

CConfigXML& CConfigXML::operator=(CConfigXML& cpy)
{
	delete m_impl;
	m_impl = new CConfigXMLImpl(*cpy.m_impl);
	return *this;
}

bool CConfigXML::Load(std::wstring filename, vector<std::wstring>& faults)
{
	return m_impl->Load(filename,faults);
}

bool CConfigXML::LoadXML(std::wstring xml, std::vector<std::wstring>& faults)
{
	return m_impl->LoadXML(xml,faults);
}

bool CConfigXML::GetId(std::wstring& id)
{
	return m_impl == NULL ? false : m_impl->GetId(id);
}

bool CConfigXML::GetVersion(std::wstring& version)
{
	return m_impl == NULL ? false : m_impl->GetVersion(version);
}

bool CConfigXML::GetWidth(size_t& width)
{
	return m_impl == NULL ? false : m_impl->GetWidth(width);
}

bool CConfigXML::GetHeight(size_t& height)
{
	return m_impl == NULL ? false : m_impl->GetHeight(height);
}

bool CConfigXML::GetViewModes(std::wstring& viewmodes)
{
	return m_impl == NULL ? false : m_impl->GetViewModes(viewmodes);
}

bool CConfigXML::GetName(std::wstring& name)
{
	return m_impl == NULL ? false : m_impl->GetName(name);
}

bool CConfigXML::GetShortName(std::wstring& name)
{
	return m_impl == NULL ? false : m_impl->GetShortName(name);
}

bool CConfigXML::GetDescription(std::wstring& description)
{
	return m_impl == NULL ? false : m_impl->GetDescription(description);
}

bool CConfigXML::GetStartFile(std::wstring& name)
{
	return m_impl == NULL ? false : m_impl->GetStartFile(name);
}

bool CConfigXML::GetStartFileContentType(std::wstring& type)
{
	return m_impl == NULL ? false : m_impl->GetStartFileContentType(type);
}

bool CConfigXML::GetStartFileEncoding(std::wstring& encoding)
{
	return m_impl == NULL ? false : m_impl->GetStartFileEncoding(encoding);
}

bool CConfigXML::GetAuthor(std::wstring& author)
{
	return m_impl == NULL ? false : m_impl->GetAuthor(author);
}

bool CConfigXML::GetAuthorHref(std::wstring& authorHref)
{
	return m_impl == NULL ? false : m_impl->GetAuthorHref(authorHref);
}

bool CConfigXML::GetAuthorEmail(std::wstring& authorEmail)
{
	return m_impl == NULL ? false : m_impl->GetAuthorEmail(authorEmail);
}

bool CConfigXML::GetLicense(std::wstring& license)
{
	return m_impl == NULL ? false : m_impl->GetLicense(license);
}

bool CConfigXML::GetLicenseHref(std::wstring& licenseHref)
{
	return m_impl == NULL ? false : m_impl->GetLicenseHref(licenseHref);
}

bool CConfigXML::GetLicenseFile(std::wstring& licenseFile)
{
	return m_impl == NULL ? false : m_impl->GetLicenseFile(licenseFile);
}

size_t CConfigXML::GetIconCount()
{
	return m_impl == NULL ? 0 : m_impl->GetIconCount();
}

bool CConfigXML::GetIcon(size_t idx, std::wstring& path, int& width, int& height)
{
	return m_impl == NULL ? false : m_impl->GetIcon(idx,path,width,height);
}

size_t CConfigXML::GetFeatureCount()
{
	return m_impl == NULL ? 0 : m_impl->GetFeatureCount();
}

bool CConfigXML::GetFeature(size_t idx, std::wstring& name, bool& required, size_t& paramCount)
{
	return m_impl == NULL ? false : m_impl->GetFeature(idx,name,required,paramCount);
}

size_t CConfigXML::GetPreferenceCount()
{
	return m_impl == NULL ? 0 : m_impl->GetPreferenceCount();
}

bool CConfigXML::GetPreference(size_t idx, std::wstring& name, std::wstring& val, bool& readOnly)
{
	return m_impl == NULL ? false : m_impl->GetPreference(idx,name,val,readOnly);
}

bool CConfigXML::GetFeatureParam(std::wstring featureName, size_t idx, std::wstring& name, std::wstring& val)
{
	return m_impl == NULL ? false : m_impl->GetFeatureParam(featureName,idx,name,val);
}
