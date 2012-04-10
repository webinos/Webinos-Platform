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

#include "Config.h"
#include <map>
#include "PackageLocales.h"

#include <libxml/tree.h>
#include <libxml/parser.h>
#include <libxml/xpath.h>
#include <libxml/xpathInternals.h>
#include <libxml/xmlreader.h>

// Uses libxml2 to implement config.xml parsing.
//
class CConfigXMLImpl : public Iw3cConfig
{
public:
	CConfigXMLImpl(CPackageLocales& locales);
	CConfigXMLImpl(CConfigXMLImpl& cpy);
	~CConfigXMLImpl(void);
	CConfigXMLImpl& operator=(CConfigXMLImpl& cpy);

	bool Load(std::wstring filename, std::vector<std::wstring>& faults);
	bool LoadXML(std::wstring xml, std::vector<std::wstring>& faults);

	//
	// Iw3cConfig implementation.
	//
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

	
	static std::wstring ReduceLocale(std::wstring& locale);

private:
	bool Load(xmlTextReaderPtr reader);
	bool getAttributeValue(xmlTextReaderPtr reader, const char* attributeName, std::wstring& store);
	bool getAttributeValue(xmlTextReaderPtr reader, const char* attributeName, bool& store);
	std::wstring getLanguage(xmlTextReaderPtr reader);
	bool isNodeFinished(xmlTextReaderPtr reader,const char* name);
	bool isSpace(int ch);
	bool isUnicodeWhiteSpace(int ch);
	xmlChar* normaliseContent(xmlChar* in,bool unicodeWhitespace);
	xmlChar* normaliseContent(xmlTextReaderPtr reader,bool normalise);
	bool getNonNegative(xmlChar* in, int& val);
	bool getNonNegativeAttribute(xmlTextReaderPtr reader, const char* attributeName, int& val);
	xmlChar* getTextContent(xmlTextReaderPtr reader,bool normalise);
	xmlChar* getTextContentEx(xmlTextReaderPtr reader,bool normalise);
	std::wstring toWideChar(xmlChar* inp);
	bool parseURI(std::wstring& inp, std::wstring& scheme, std::wstring& authority, std::wstring& host, std::wstring& path,std::wstring& schemeSep);
	void parseMIMEType(std::wstring& mimeType, std::wstring& encoding);
	std::wstring rationaliseViewMode(std::wstring& mode);
	bool validateURI(std::wstring& inp);
	bool validateViewMode(std::wstring& inp);

	bool m_invalid;

	typedef std::map<std::wstring,bool> DEFAULTS_MAP;
	DEFAULTS_MAP m_defaults;
	xmlChar* m_namespaceURI;
	int m_textContentLevel;

	typedef std::vector<std::wstring> ERROR_VEC;
	ERROR_VEC m_errors;

	CPackageLocales m_locales;

	// Widget
	std::wstring m_widgetLang;
	std::wstring m_id;
	std::wstring m_version;
	std::wstring m_viewModes;
	int m_width;
	int m_height;

	// Content.
	std::wstring m_contentSrc;
	std::wstring m_contentMimeType;
	std::wstring m_contentEncoding;

	// Name.
	class NameInfo
	{
	public:
		std::wstring m_name;
		std::wstring m_shortName;
	};
	typedef std::map<std::wstring,NameInfo> NAME_LANG_MAP;
	NAME_LANG_MAP m_name;

	// Description.
	typedef std::map<std::wstring,std::wstring> STRING_LANG_MAP;
	STRING_LANG_MAP m_description;

	// Author
	std::wstring m_author;
	std::wstring m_authorHref;
	std::wstring m_authorEmail;

	// License.
	class LicenseInfo
	{
	public:
		std::wstring m_license;
		std::wstring m_href;
		std::wstring m_licenseFile;
	};
	typedef std::map<std::wstring,LicenseInfo> LICENSE_LANG_MAP;
	LICENSE_LANG_MAP m_license;

	// Icons.
	class IconInfo
	{
	public:
		std::wstring m_path;
		int m_width;
		int m_height;
	};
	typedef std::map<std::wstring,IconInfo> ICON_VEC;
	ICON_VEC m_icon;

	// FeatureParams.
	class FeatureParamInfo
	{
	public:
		std::wstring m_name;
		std::wstring m_value;
	};

	// Features.
	class FeatureInfo
	{
	public:
		typedef std::vector<FeatureParamInfo> FEATURE_PARAM_VEC;

		std::wstring m_name;
		bool m_required;
		FEATURE_PARAM_VEC m_params;
	};
	typedef std::map<std::wstring,FeatureInfo> FEATURE_VEC;
	FEATURE_VEC m_feature;

	// Preferences.
	class PreferenceInfo
	{
	public:
		std::wstring m_name;
		std::wstring m_value;
		bool m_readOnly;
	};
	typedef std::map<std::wstring,PreferenceInfo> PREFERENCE_VEC;
	PREFERENCE_VEC m_preference;

	// Parsing methods and helpers.
	int processNode(xmlTextReaderPtr reader);
	void processWidget(xmlTextReaderPtr reader);
	void processWidgetName(xmlTextReaderPtr reader);
	void processWidgetDescription(xmlTextReaderPtr reader);
	void processWidgetAuthor(xmlTextReaderPtr reader);
	void processWidgetContent(xmlTextReaderPtr reader);
	void processWidgetLicense(xmlTextReaderPtr reader);
	void processWidgetIcon(xmlTextReaderPtr reader);
	void processWidgetFeature(xmlTextReaderPtr reader);
	bool processFeatureParam(xmlTextReaderPtr reader, FeatureParamInfo& fpi);
	void processWidgetPreference(xmlTextReaderPtr reader);

	bool GetName(NameInfo& ni);
	bool GetLicenseInfo(LicenseInfo& li);
	void GetFeature(size_t idx, FeatureInfo& fi);
	void GetPreference(size_t idx, PreferenceInfo& pi);
};
