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
#include "ConfigXMLImpl.h"

// Define SUPPORT_TEST_FEATURE if you need to support the w3c test feature a9bb79c1.
#define SUPPORT_TEST_FEATURE

//
// Class for parsing of w3c config.xml using libxml2.
//
CConfigXMLImpl::CConfigXMLImpl(CPackageLocales& locales) : m_width(0), m_height(0), m_namespaceURI(NULL), m_textContentLevel(0), m_locales(locales), m_invalid(true)
{
	m_widgetLang = L"";
}

CConfigXMLImpl::CConfigXMLImpl(CConfigXMLImpl& cpy) : m_width(0), m_height(0), m_namespaceURI(NULL), m_textContentLevel(0), m_invalid(true)
{
	this->operator=(cpy);
}

CConfigXMLImpl::~CConfigXMLImpl(void)
{
	xmlFree(m_namespaceURI);
}

CConfigXMLImpl& CConfigXMLImpl::operator=(CConfigXMLImpl& cpy)
{
	m_invalid = cpy.m_invalid;
	m_locales = cpy.m_locales;
	m_defaults = cpy.m_defaults;
	m_namespaceURI = xmlStrdup(cpy.m_namespaceURI);
	m_errors = cpy.m_errors;
	m_widgetLang = cpy.m_widgetLang;
	m_id = cpy.m_id;
	m_version = cpy.m_version;
	m_viewModes = cpy.m_viewModes;
	m_width = cpy.m_width;
	m_height = cpy.m_height;
	m_contentSrc = cpy.m_contentSrc;
	m_contentMimeType = cpy.m_contentMimeType;
	m_contentEncoding = cpy.m_contentEncoding;
	m_name = cpy.m_name;
	m_description = cpy.m_description;
	m_author = cpy.m_author;
	m_authorHref = cpy.m_authorHref;
	m_authorEmail = cpy.m_authorEmail;
	m_license = cpy.m_license;
	m_icon = cpy.m_icon;
	m_feature = cpy.m_feature;
	m_preference = cpy.m_preference;

	return *this;
}

//
// Load from file.
bool CConfigXMLImpl::Load(std::wstring filenameIn, std::vector<std::wstring>& faults)
{
	// Bad - copy to char type for libxml2
	std::string filename;
	filename.resize(filenameIn.size());
	std::copy(filenameIn.begin(),filenameIn.end(),filename.begin());

	xmlInitParser();
	xmlTextReaderPtr reader = xmlNewTextReaderFilename(filename.c_str());

	bool loaded = Load(reader);

	xmlFreeTextReader(reader);
	xmlCleanupParser();

	faults.insert(faults.end(),m_errors.begin(), m_errors.end());

	return loaded;
}

//
// Load from XML.
bool CConfigXMLImpl::LoadXML(std::wstring xmlIn, std::vector<std::wstring>& faults)
{	
	// Bad - copy to char type for libxml2
	std::string xml;
	xml.resize(xmlIn.size());
	std::copy(xmlIn.begin(),xmlIn.end(),xml.begin());

	xmlInitParser();
	xmlParserInputBufferPtr buff = xmlParserInputBufferCreateMem(xml.c_str(),xml.length(),xmlCharEncoding::XML_CHAR_ENCODING_NONE);
	xmlTextReaderPtr reader = xmlNewTextReader(buff,NULL);

	bool loaded = Load(reader);

	xmlFreeTextReader(reader);
	xmlFreeParserInputBuffer(buff);
	xmlCleanupParser();

	faults.insert(faults.end(),m_errors.begin(), m_errors.end());

	return loaded;
}

bool CConfigXMLImpl::Load(xmlTextReaderPtr reader)
{
	m_invalid = false;

	m_errors.clear();

	// Substitute entities.
	xmlTextReaderSetParserProp(reader,XML_PARSER_SUBST_ENTITIES,1);

	int ret = xmlTextReaderRead(reader);
	if (ret == 0)
	{
		m_errors.push_back(L"failed to load XML - badly formed?");
		m_invalid = true;
	}
	else
	{
		// Skip to first element.
		int nodeType = xmlTextReaderNodeType(reader);
		while (ret == 1 && nodeType != XML_READER_TYPE_ELEMENT)
		{
			ret = xmlTextReaderRead(reader);
			nodeType = xmlTextReaderNodeType(reader);
		}

		if (ret == 1)
		{
			// Check the namespace of the root element.
			m_namespaceURI = xmlTextReaderNamespaceUri(reader);
			if (xmlStrcmp(m_namespaceURI,BAD_CAST "http://www.w3.org/ns/widgets") != 0)
			{
				m_errors.push_back(L"root element namespace invalid");
				m_invalid = true;
			}
			else
			{
				// Check the root node.is <widget>.
				xmlChar* name = xmlTextReaderLocalName(reader);
				if (xmlStrcmp(name,BAD_CAST "widget") != 0)
				{
					m_errors.push_back(L"root element not widget");
					m_invalid = true;
				}
			}
		}
		else
		{
			m_errors.push_back(L"no root element found");
			m_invalid = true;
		}

		// Now process the nodes.
		while (!m_invalid && ret == 1) 
		{
			ret = processNode(reader);
		}
	}

	return !m_invalid;
}

bool CConfigXMLImpl::GetId(std::wstring& id)
{
	if (m_defaults.find(L"id") == m_defaults.end() || m_defaults[L"id"] == false)
		return false;

	id = m_id;
	return true;
}

bool CConfigXMLImpl::GetVersion(std::wstring& version)
{
	if (m_defaults.find(L"version") == m_defaults.end() || m_defaults[L"version"] == false)
		return false;

	version = m_version;
	return true;
}

bool CConfigXMLImpl::GetWidth(size_t& width)
{
	if (m_defaults.find(L"width") == m_defaults.end() || m_defaults[L"width"] == false)
		return false;

	width = m_width;
	return true;
}

bool CConfigXMLImpl::GetHeight(size_t& height)
{
	if (m_defaults.find(L"height") == m_defaults.end() || m_defaults[L"height"] == false)
		return NULL;

	height = m_height;
	return true;
}

bool CConfigXMLImpl::GetViewModes(std::wstring& viewmodes)
{
	if (m_defaults.find(L"viewModes") == m_defaults.end() || m_defaults[L"viewModes"] == false)
		return false;

	viewmodes = m_viewModes;
	return true;
}

// Reduces locales, e.g. en-gb to en.
// ToDo - add validation.
std::wstring CConfigXMLImpl::ReduceLocale(std::wstring& locale)
{
	std::wstring reduced;

	size_t idx = locale.find_last_of('-');
	if (idx != std::wstring::npos)
		reduced = locale.substr(0,idx);

	return reduced;
}

// Get the widget name based on the locale.
bool CConfigXMLImpl::GetName(NameInfo& ni)
{
	bool found = false;

	// Process locales in order of preference.
	for (CPackageLocales::iterator it = m_locales.begin(); !found && it != m_locales.end(); it++)
	{
		std::wstring locale = *it;

		while (!found && locale.length() > 0)
		{
			// Do we have a name for this locale?
			if (m_name.find(locale) == m_name.end())
			{
				// No match - reduce locale length and try again...
				locale = ReduceLocale(locale);
			}
			else
			{
				// Got a match.
				ni = m_name[locale];
				found = true;
			}
		}
	}

	if (!found)
	{
		// Didn't find a localised version - try the widget root.
		if (m_name.find(L"") != m_name.end())
		{
			ni = m_name[L""];
			found = true;
		}
	}

	return found;
}

bool CConfigXMLImpl::GetName(std::wstring& name)
{
	NameInfo ni;
	if (false == GetName(ni))
		return false;

	name = ni.m_name;

	return name.length() > 0;
}

bool CConfigXMLImpl::GetShortName(std::wstring& name)
{
	NameInfo ni;
	if (false == GetName(ni))
		return false;

	name = ni.m_shortName;

	return name.length() > 0;
}

bool CConfigXMLImpl::GetDescription(std::wstring& description)
{
	bool found = false;
	for (CPackageLocales::iterator it = m_locales.begin(); !found && it != m_locales.end(); it++)
	{
		std::wstring locale = *it;
		while (!found && locale.length() > 0)
		{
			if (m_description.find(locale) == m_description.end())
			{
				// Reduce locale length and try again...
				locale = ReduceLocale(locale);
			}
			else
			{
				description = m_description[locale];
				found = true;
			}
		}
	}

	if (!found)
	{
		if (m_description.find(L"") != m_description.end())
		{
			description = m_description[L""];
			found = true;
		}
	}

	return found;
}

bool CConfigXMLImpl::GetStartFile(std::wstring& name)
{
	if (m_defaults.find(L"content") != m_defaults.end())
	{
		name = m_contentSrc;
		return true;
	}
	else
		return false;
}

bool CConfigXMLImpl::GetStartFileContentType(std::wstring& type)
{
	if (m_contentMimeType.length() == 0)
		type = L"text/html";
	else
		type = m_contentMimeType;

	return type.length() > 0;
}

bool CConfigXMLImpl::GetStartFileEncoding(std::wstring& encoding)
{
	if (m_contentEncoding.length() == 0 || (wcscmp(m_contentEncoding.c_str(),L"UTF-8") !=0 && wcscmp(m_contentEncoding.c_str(),L"ISO-8859-1") != 0 && wcscmp(m_contentEncoding.c_str(),L"Windows-1252") != 0))
		encoding = L"UTF-8";
	else
		encoding = m_contentEncoding;

	return encoding.length() > 0;
}

bool CConfigXMLImpl::GetAuthor(std::wstring& author)
{
	if (m_defaults.find(L"author") == m_defaults.end() || m_defaults[L"author"] == false)
		return false;

	author = m_author;
	return true;
}

bool CConfigXMLImpl::GetAuthorHref(std::wstring& authorHref)
{
	if (m_defaults.find(L"authorHref") == m_defaults.end() || m_defaults[L"authorHref"] == false)
		return false;

	authorHref = m_authorHref;
	return true;
}

bool CConfigXMLImpl::GetAuthorEmail(std::wstring& authorEmail)
{
	if (m_defaults.find(L"authorEmail") == m_defaults.end() || m_defaults[L"authorEmail"] == false)
		return false;

	authorEmail = m_authorEmail;
	return true;
}

bool CConfigXMLImpl::GetLicenseInfo(LicenseInfo& li)
{
	bool found = false;
	for (CPackageLocales::iterator it = m_locales.begin(); !found && it != m_locales.end(); it++)
	{
		std::wstring locale = *it;
		while (!found && locale.length() > 0)
		{
			if (m_license.find(locale) == m_license.end())
			{
				// Reduce locale length and try again...
				locale = ReduceLocale(locale);
			}
			else
			{
				li = m_license[locale];
				found = true;
			}
		}
	}

	if (!found)
	{
		if (m_license.find(L"") != m_license.end())
		{
			li = m_license[L""];
			found = true;
		}
	}

	return found;
}

bool CConfigXMLImpl::GetLicense(std::wstring& license)
{
	license = L"";

	LicenseInfo li;
	if (GetLicenseInfo(li))
		license = li.m_license;

	return license.length() > 0;
}

bool CConfigXMLImpl::GetLicenseHref(std::wstring& licenseHref)
{
	licenseHref = L"";

	LicenseInfo li;
	if (GetLicenseInfo(li))
		licenseHref = li.m_href;

	return licenseHref.length() > 0;
}

bool CConfigXMLImpl::GetLicenseFile(std::wstring& licenseFile)
{
	licenseFile = L"";

	LicenseInfo li;
	if (GetLicenseInfo(li))
		licenseFile = li.m_licenseFile;

	return licenseFile.length() > 0;
}

size_t CConfigXMLImpl::GetIconCount()
{
	return m_icon.size();
}

bool CConfigXMLImpl::GetIcon(size_t idx, std::wstring& path, int& width, int& height)
{
	bool found = true;

	size_t count = 0;
	for (ICON_VEC::iterator it = m_icon.begin(); it != m_icon.end(); it++)
	{
		if (count == idx)
		{
			path = it->second.m_path;
			width = it->second.m_width;
			height = it->second.m_height;
			found = true;
			break;
		}

		count++;
	}

	return found;
}

void CConfigXMLImpl::GetFeature(size_t idx, FeatureInfo& fi)
{
	size_t count = 0;
	for (FEATURE_VEC::iterator it = m_feature.begin(); it != m_feature.end(); it++)
	{
		if (count == idx)
		{
			fi = it->second;
			break;
		}
		count++;
	}
}

size_t CConfigXMLImpl::GetFeatureCount()
{
	return m_feature.size();
}

bool CConfigXMLImpl::GetFeature(size_t idx, std::wstring& name, bool& required, size_t& paramCount)
{
	bool found = true;

	if (idx < m_feature.size())
	{
		FeatureInfo fi;
		GetFeature(idx,fi);
		name = fi.m_name;
		required = fi.m_required;
		paramCount = fi.m_params.size();
	}
	else
		found = false;

	return found;
}

bool CConfigXMLImpl::GetFeatureParam(std::wstring featureName, size_t idx, std::wstring& name, std::wstring& val)
{
	FEATURE_VEC::iterator it = m_feature.find(featureName);
	if (it == m_feature.end())
		return false;

	FeatureInfo& fi = it->second;
	size_t pCount = 0;
	for (FeatureInfo::FEATURE_PARAM_VEC::iterator pit = fi.m_params.begin(); pit != fi.m_params.end(); pit++)
	{
		if (pCount == idx)
		{
			name = pit->m_name;
			val = pit->m_value;
			break;
		}
		pCount++;
	}

	return true;
}

void CConfigXMLImpl::GetPreference(size_t idx, PreferenceInfo& pi)
{
	size_t count = 0;
	for (PREFERENCE_VEC::iterator it = m_preference.begin(); it != m_preference.end(); it++)
	{
		if (count == idx)
		{
			pi = it->second;
			break;
		}
		count++;
	}
}

size_t CConfigXMLImpl::GetPreferenceCount()
{
	return m_preference.size();
}

bool CConfigXMLImpl::GetPreference(size_t idx, std::wstring& name, std::wstring& val, bool& readOnly)
{
	bool found = true;

	if (idx < m_preference.size())
	{
		PreferenceInfo pi;
		GetPreference(idx,pi);
		name = pi.m_name;
		val = pi.m_value;
		readOnly = pi.m_readOnly;
	}
	else
		found = false;

	return found;
}

int CConfigXMLImpl::processNode(xmlTextReaderPtr reader) 
{
	int ret = 1;

	int nodeType = xmlTextReaderNodeType(reader);
	xmlChar* ns = xmlTextReaderNamespaceUri(reader);

	if (nodeType == XML_READER_TYPE_ELEMENT && xmlStrcmp(ns,BAD_CAST m_namespaceURI) == 0)
	{
		xmlChar* name = xmlTextReaderLocalName(reader);

		if (xmlStrcmp(name,BAD_CAST "widget") == 0)
		{
			processWidget(reader);
		}
		else if (xmlStrcmp(name, BAD_CAST "name") == 0)
		{
			processWidgetName(reader);
		}
		else if (xmlStrcmp(name, BAD_CAST "description") == 0)
		{
			processWidgetDescription(reader);
		}
		else if (xmlStrcmp(name, BAD_CAST "author") == 0)
		{
			processWidgetAuthor(reader);
		}
		else if (xmlStrcmp(name, BAD_CAST "content") == 0)
		{
			processWidgetContent(reader);
		}
		else if (xmlStrcmp(name, BAD_CAST "license") == 0)
		{
			processWidgetLicense(reader);
		}
		else if (xmlStrcmp(name, BAD_CAST "icon") == 0)
		{
			processWidgetIcon(reader);
		}
		else if (xmlStrcmp(name, BAD_CAST "feature") == 0)
		{
			processWidgetFeature(reader);
		}
		else if (xmlStrcmp(name, BAD_CAST "preference") == 0)
		{
			processWidgetPreference(reader);
		}

		xmlFree(name);
	}

	ret = xmlTextReaderRead(reader);

	xmlFree(ns);

	return ret;
}

bool CConfigXMLImpl::validateURI(std::wstring& inp)
{
	std::wstring scheme;
	std::wstring authority;
	std::wstring host;
	std::wstring path;
	std::wstring schemeSep;

	return parseURI(inp,scheme,authority,host,path,schemeSep);
}

bool CConfigXMLImpl::parseURI(std::wstring& inpURI,     
							  std::wstring& scheme,
							  std::wstring& authority,
							  std::wstring& host,
							  std::wstring& path,
							  std::wstring& schemeSep)
{
	std::wstring inp(inpURI);

	//
	// No regex support yet, so apologies for this:
	//
	bool ok = true;

	size_t idx = inp.find_first_of(L":");
	if (idx != std::wstring::npos)
	{
		// cache the scheme.
		scheme = inp.substr(0,idx);

		// Move past the colon.
		inp = inp.substr(idx+1);

		// Move past all immediate '/'
		idx = inp.find_first_not_of(L"/");
		if (idx != std::wstring::npos)
		{
			schemeSep = std::wstring(L":") + inp.substr(0,idx);

			// Move past the separators.
			inp = inp.substr(idx);
		}
		else
			schemeSep = L":";

		idx = inp.find_first_of('/');
		if (idx != std::wstring::npos)
		{
			authority = inp.substr(0,idx);
			path = inp.substr(idx + 1);
		}
		else
			authority = inp;

		idx = authority.find_first_of(':');
		if (idx != std::wstring::npos)
			host = authority.substr(0,idx);
		else
			host = authority;
	}
	else
		ok = false;

	return ok;
}

// ToDo - fix platform specific code...
std::wstring CConfigXMLImpl::toWideChar(xmlChar* inp)
{
	int targetLen = MultiByteToWideChar(CP_UTF8,0,(LPCSTR)inp,-1,NULL,0);			  
	TCHAR* dest = new TCHAR[targetLen];

	MultiByteToWideChar(CP_UTF8,0,(LPCSTR)inp,-1,dest,targetLen);			  

	std::wstring store(dest);

	delete[] dest;
	xmlFree(inp);

	return store;
}

// Applies rule for getting text attribute value.
bool CConfigXMLImpl::getAttributeValue(xmlTextReaderPtr reader, const char* attributeName, std::wstring& store)
{
	bool found = true;

	xmlChar* attr = xmlTextReaderGetAttribute(reader,BAD_CAST attributeName);
	if (attr == NULL)
		attr = xmlTextReaderGetAttributeNs(reader,BAD_CAST attributeName,m_namespaceURI);

	if (attr != NULL)
	{
		xmlChar* normalised = normaliseContent(attr,false);
		if (normalised != NULL)
			store = toWideChar(normalised);
	}
	else
		found = false;

	xmlFree(attr);

	return found;
}

// Applies rule for getting boolean attribute value.
bool CConfigXMLImpl::getAttributeValue(xmlTextReaderPtr reader, const char* attributeName, bool& store)
{
	bool found = true;

	xmlChar* attr = xmlTextReaderGetAttribute(reader,BAD_CAST attributeName);
	if (attr == NULL)
		attr = xmlTextReaderGetAttributeNs(reader,BAD_CAST attributeName,m_namespaceURI);

	if (attr != NULL)
		store = xmlStrcmp(attr,BAD_CAST "true") == 0;
	else
		found = false;

	xmlFree(attr);

	return found;
}

std::wstring CConfigXMLImpl::getLanguage(xmlTextReaderPtr reader)
{
	std::wstring langStr = m_widgetLang;

	xmlChar* lang = xmlTextReaderXmlLang(reader);
	if (lang != NULL)
		langStr = toWideChar(lang);

	return langStr;
}

void CConfigXMLImpl::processWidget(xmlTextReaderPtr reader) 
{
	m_widgetLang = getLanguage(reader);
	m_defaults[L"id"] = getAttributeValue(reader,"id",m_id);

	// Validate the id uri.
	if (m_defaults[L"id"] && false == validateURI(m_id))
	{
		m_defaults[L"id"] = false;
		m_id.clear();
	}

	m_defaults[L"version"] = getAttributeValue(reader,"version",m_version);
	m_defaults[L"viewModes"] = getAttributeValue(reader,"viewmodes",m_viewModes);
	if (m_defaults[L"viewModes"])
		m_viewModes = rationaliseViewMode(m_viewModes);

	m_defaults[L"width"] = getNonNegativeAttribute(reader,"width",m_width);
	m_defaults[L"height"] = getNonNegativeAttribute(reader,"height",m_height);
}

bool CConfigXMLImpl::isNodeFinished(xmlTextReaderPtr reader, const char* elementName)
{
	xmlChar* name = xmlTextReaderName(reader);
	bool end = xmlTextReaderNodeType(reader) == XML_READER_TYPE_END_ELEMENT && xmlStrcmp(name,BAD_CAST elementName) == 0;
	xmlFree(name);
	return end;
}

void CConfigXMLImpl::processWidgetName(xmlTextReaderPtr reader) 
{
	std::wstring lang = getLanguage(reader);

	// Only process this element if we haven't already processed a name element for the locale.
	if (m_name.find(lang) == m_name.end())
	{
		NameInfo ni;
		xmlChar* normalised = getTextContent(reader,true);
		if (normalised != NULL)
			ni.m_name = toWideChar(normalised);

		getAttributeValue(reader,"short",ni.m_shortName);

		m_name[lang] = ni;
	}
}

void CConfigXMLImpl::processWidgetDescription(xmlTextReaderPtr reader) 
{
	std::wstring lang = getLanguage(reader);

	// Only process this element if we haven't already processed a description element for the locale.
	if (m_description.find(lang) == m_description.end())
	{
		xmlChar* normalised = getTextContent(reader,false);
		if (normalised != NULL)
			m_description[lang] = toWideChar(normalised);
		else
			m_description[lang] = L"";
	}
}	

void CConfigXMLImpl::processWidgetContent(xmlTextReaderPtr reader) 
{
	// Have we already got a content element?
	if (m_defaults.find(L"content") != m_defaults.end())
		return;

	m_defaults[L"content"] = true;

	if (!getAttributeValue(reader,"src",m_contentSrc))
	{
		m_errors.push_back(L"content element is missing src attribute");
	}
	else
	{
		if (getAttributeValue(reader,"type",m_contentMimeType))
			parseMIMEType(m_contentMimeType,m_contentEncoding);

		getAttributeValue(reader,"encoding",m_contentEncoding);
	}
}

//
// ToDo - implement properly.
void CConfigXMLImpl::parseMIMEType(std::wstring& mimeType, std::wstring& encoding)
{
	size_t idx = mimeType.find_first_of(L";");
	if (idx != std::wstring::npos)
	{
		std::wstring components = mimeType.substr(idx+1);

		// Store mime type part.
		mimeType = mimeType.substr(0,idx);

		// If there is a charset component extract it as the encoding.
		std::wstring charsetLookup(L"charset=");
		idx = components.find(charsetLookup);
		if (idx != std::wstring::npos)
		{
			idx += charsetLookup.length();
			if (idx < components.length())
			{
				encoding = components.substr(idx);
				idx = encoding.find_first_of(L";");
				if (idx != std::wstring::npos)
					encoding = encoding.substr(0,idx);
			}
		}
	}
}

void CConfigXMLImpl::processWidgetAuthor(xmlTextReaderPtr reader) 
{
	if (m_defaults.find(L"author") != m_defaults.end())
		return;

	m_defaults[L"authorEmail"] = getAttributeValue(reader,"email",m_authorEmail);

	m_defaults[L"authorHref"] = getAttributeValue(reader,"href",m_authorHref);

	if (m_defaults[L"authorHref"] && false == validateURI(m_authorHref))
	{
		m_defaults[L"authorHref"] = false;
		m_authorHref.clear();
	}

	xmlChar* val = getTextContent(reader,true);
	if (val != NULL)
		m_author = toWideChar(val);

	m_defaults[L"author"] = val != NULL;
}

void CConfigXMLImpl::processWidgetLicense(xmlTextReaderPtr reader) 
{
	LicenseInfo li;

	std::wstring lang = getLanguage(reader);

	if (getAttributeValue(reader,"href",li.m_href) && false == validateURI(li.m_href))
	{
		li.m_licenseFile = li.m_href;
		li.m_href.clear();
	}

	xmlChar* val = getTextContent(reader,false);
	if (val != NULL)
		li.m_license = toWideChar(val);

	if (m_license.find(lang) == m_license.end())
		m_license[lang] = li;
}

void CConfigXMLImpl::processWidgetIcon(xmlTextReaderPtr reader) 
{
	IconInfo ii;

	if (false == getAttributeValue(reader,"src",ii.m_path))
		return;

	if (!getNonNegativeAttribute(reader,"width",ii.m_width))
		ii.m_width = -1;

	if (!getNonNegativeAttribute(reader,"height",ii.m_height))
		ii.m_height = -1;

	if (m_icon.find(ii.m_path) == m_icon.end())
		m_icon[ii.m_path] = ii;
}

void CConfigXMLImpl::processWidgetFeature(xmlTextReaderPtr reader) 
{
	FeatureInfo fi;

	if (getAttributeValue(reader,"name",fi.m_name) && false == validateURI(fi.m_name))
	{
		m_errors.push_back(L"invalid feature IRI");
		m_invalid = true;
		fi.m_name.clear();
	}

	if (getAttributeValue(reader,"required",fi.m_required) == false)
		fi.m_required = true;

	// Process any feature parameters.
	if (!xmlTextReaderIsEmptyElement(reader))
	{
		do
		{
			if (0 == xmlTextReaderRead(reader))
				break;

			int nodeType = xmlTextReaderNodeType(reader);
			xmlChar* ns = xmlTextReaderNamespaceUri(reader);
			if (nodeType == XML_READER_TYPE_ELEMENT && xmlStrcmp(ns,m_namespaceURI) == 0)
			{
				xmlChar* name = xmlTextReaderLocalName(reader);
				if (xmlStrcmp(name,BAD_CAST "param") == 0)
				{
					FeatureParamInfo fpi;
					if (processFeatureParam(reader,fpi))
					{
						if (fpi.m_name.length() > 0)
							fi.m_params.push_back(fpi);
					}
				}
				else
					break;

				xmlFree(name);
			}

			xmlFree(ns);
		}
		while (false == isNodeFinished(reader,"feature"));
	}

	if (fi.m_name.length() > 0 && m_feature.find(fi.m_name) == m_feature.end())
	{
		bool featureOK;

#if defined(SUPPORT_TEST_FEATURE) && defined(WIN32)
		// If this build is to test w3c compliance, we must suppport the a9bb79c1 feature.
		featureOK = wcscmp(fi.m_name.c_str(),L"feature:a9bb79c1") == 0;
#else
		featureOK = fi.m_name.find(L"http://bondi.omtp.org/api/") == 0;
#endif
		if (!featureOK && fi.m_required)
		{
			m_errors.push_back(L"unknown feature required: " + fi.m_name);
			m_invalid = true;
		}
		else if (featureOK)
			m_feature[fi.m_name] = fi;
	}
}

bool CConfigXMLImpl::processFeatureParam(xmlTextReaderPtr reader, CConfigXMLImpl::FeatureParamInfo& fpi) 
{
	bool processed = true;

	processed &= getAttributeValue(reader,"name",fpi.m_name);
	processed &= getAttributeValue(reader,"value",fpi.m_value);

	return processed;
}

void CConfigXMLImpl::processWidgetPreference(xmlTextReaderPtr reader) 
{
	PreferenceInfo pi;

	getAttributeValue(reader,"name",pi.m_name);
	getAttributeValue(reader,"value",pi.m_value);
	if (!getAttributeValue(reader,"readonly",pi.m_readOnly))
		pi.m_readOnly = false;

	if (pi.m_name.length() > 0 && m_preference.find(pi.m_name) == m_preference.end())
		m_preference[pi.m_name] = pi;
}

bool CConfigXMLImpl::isSpace(int ch)
{
	// space characters
	return ch == 0x0020 || ch == 0x0009 || ch == 0x000A || ch == 0x000B || ch == 0x000C || ch == 0x000D;
}

bool CConfigXMLImpl::isUnicodeWhiteSpace(int ch)
{
	return 
		// space characters
		isSpace(ch) || \
		// unicode white-space
		ch == 0x0085 || ch == 0x00a0 || ch == 0x1680 || ch == 0x180e || \
		(ch >= 0x2000 && ch <= 0x200a) || \
		ch == 0x2028 || \
		ch == 0x2029 || ch == 0x202f || ch == 0x205f || ch == 0x3000;
}

xmlChar* CConfigXMLImpl::normaliseContent(xmlTextReaderPtr reader,bool normalise)
{
	xmlChar* val = xmlTextReaderValue(reader);
	xmlChar* clean = normaliseContent(val,normalise);
	xmlFree(val);
	return clean;
}

xmlChar* CConfigXMLImpl::normaliseContent(xmlChar* in,bool unicodeWhitespace)
{
	xmlChar* cpy = NULL; 

	bool eatSpace = true;
	int len = xmlStrlen(in);
	int cpyIdx = 0;
	int idx = 0;
	int lastNonWhitespace = 0;
	while (idx < len)
	{
		int move = len-idx;
		int codePoint = xmlGetUTF8Char(&in[idx],&move);

		if ((unicodeWhitespace && isUnicodeWhiteSpace(codePoint)) || isSpace(codePoint))
		{
			if (!eatSpace)
			{
				cpy = xmlStrcat(cpy,BAD_CAST " ");
				cpyIdx += 1;
				eatSpace = true;
			}
			else
			{
				// Ignore it.
			}
		}
		else
		{
			eatSpace = false;
			cpy = xmlStrncat(cpy,&in[idx],move);
			cpyIdx += move;
			lastNonWhitespace = cpyIdx;
		}

		idx += move;
	}

	if (eatSpace && lastNonWhitespace < cpyIdx)
		cpy[lastNonWhitespace] = 0;

	return cpy;
}

//
// Entry to getTextContentEx
//
xmlChar* CConfigXMLImpl::getTextContent(xmlTextReaderPtr reader,bool normalise)
{
	m_textContentLevel = 0;
	return getTextContentEx(reader,normalise);
}

//
// Processes the current node and it's descendants, extracting text content.
//
// Implements http://www.w3.org/TR/widgets/#rule-for-getting-text-content
// Implements http://www.w3.org/TR/widgets/#rule-for-getting-text-content-with-norma
//
// n.b. recursive
//
xmlChar* CConfigXMLImpl::getTextContentEx(xmlTextReaderPtr reader,bool normalise)
{
	// ToDo - remove this. Necessary at the moment as the reader sometimes seems
	// to accept invalid XML and then gets stuck.
	if (m_textContentLevel > 1000)
		return NULL;

	m_textContentLevel++;

	xmlChar* txtContent = NULL;

	if (!xmlTextReaderIsEmptyElement(reader) && 0 != xmlTextReaderRead(reader))
	{
		int nodeType = xmlTextReaderNodeType(reader);
		while (nodeType != XML_READER_TYPE_END_ELEMENT || m_textContentLevel > 1)
		{
			if (nodeType == XML_READER_TYPE_TEXT || nodeType == XML_READER_TYPE_CDATA)
			{
				xmlChar* val = xmlTextReaderValue(reader);
				txtContent = xmlStrcat(txtContent,val);
				xmlFree(val);
			}
			else if (nodeType == XML_READER_TYPE_ELEMENT)
			{
				// Recurse.
				xmlChar* sub = getTextContentEx(reader,normalise);
				txtContent = xmlStrcat(txtContent,sub);
				xmlFree(sub);
			}
			else if (nodeType == XML_READER_TYPE_END_ELEMENT)
			{
				break;
			}

			if (0 == xmlTextReaderRead(reader))
				break;

			nodeType = xmlTextReaderNodeType(reader);
		}
	}

	if (normalise)
	{
		xmlChar* normalised = normaliseContent(txtContent,true);
		xmlFree(txtContent);
		txtContent = normalised;
	}

	m_textContentLevel--;

	return txtContent;
}

bool CConfigXMLImpl::getNonNegativeAttribute(xmlTextReaderPtr reader, const char* attributeName, int& val)
{
	bool found = true;

	xmlChar* attr = xmlTextReaderGetAttribute(reader,BAD_CAST attributeName);
	if (attr == NULL)
		attr = xmlTextReaderGetAttributeNs(reader,BAD_CAST attributeName,m_namespaceURI);

	if (attr != NULL)
	{
		// If there is a non-negative value returned it means there was data but it was invalid (as opposed to no data at all).
		found = getNonNegative(attr,val) ? true : val == -1;
	}
	else
		found = false;

	xmlFree(attr);

	return found;
}

bool CConfigXMLImpl::getNonNegative(xmlChar* in, int& val)
{
	val = 0;

	bool parsed = false;

	// Move past whitespace.
	int idx = 0;
	int len = xmlStrlen(in);
	while (idx < len)
	{
		int move = len-idx;
		int codePoint = xmlGetUTF8Char(&in[idx],&move);

		if (isSpace(codePoint))
			idx += move;
		else
			break;
	}

	if (idx < len)
	{
		// We have encountered a non-whitespace character.
		parsed = true;

		while (idx < len)
		{
			int move = len-idx;
			int codePoint = xmlGetUTF8Char(&in[idx],&move);

			if (codePoint < 0x0030 || codePoint > 0x0039)
			{
				// Non-digits cause parsing to stop.
				break;
			}
			else
			{
				val *= 10;
				val += (codePoint - 0x0030);
			}

			idx += move;
		}
	}

	// Return true if we encountered something other than whitespace.
	return parsed;
}

std::wstring CConfigXMLImpl::rationaliseViewMode(std::wstring& mode)
{
	// Viewmodes can be separated by space characters - tokenise and ignore unrecognised
	// modes and duplicates.
	TCHAR* tokenise = new TCHAR[mode.length()+1];
	wcscpy(tokenise,mode.c_str());

	map<std::wstring,bool> modeMap;
	vector<std::wstring> preferenceList;

	TCHAR* tok = wcstok(tokenise,L" ");
	while (tok != NULL)
	{
		std::wstring vm(tok);
		if (validateViewMode(vm) && modeMap.find(vm) == modeMap.end())
		{
			modeMap[vm] = true;
			preferenceList.push_back(vm);
		}

		tok = wcstok(NULL,L" ");
	}

	delete[] tokenise;

	// Now re-constitute the list.
	std::wstring list;
	for (vector<std::wstring>::iterator it = preferenceList.begin(); it != preferenceList.end(); it++)
	{
		if (list.length() > 0)
			list += L" " + *it;
		else
			list = *it;
	}

	return list;
}

bool CConfigXMLImpl::validateViewMode(std::wstring& inp)
{
	return !wcscmp(inp.c_str(),L"all") || !wcscmp(inp.c_str(),L"application") || !wcscmp(inp.c_str(),L"fullscreen") || !wcscmp(inp.c_str(),L"floating") || !wcscmp(inp.c_str(),L"mini") || !wcscmp(inp.c_str(),L"widget");
}

