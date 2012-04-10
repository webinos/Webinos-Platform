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
#include "SettingsFile.h"

const TCHAR* CSettingsFile::m_rootKey = _T("settings.");
const TCHAR* CSettingsFile::m_privateKey = _T("bondi.");
const TCHAR* CSettingsFile::m_preferencesKey = _T("bondi.preferences.");

CSettingsFile::CSettingsFile()
{
	m_root = new CSetting;
}

CSettingsFile::~CSettingsFile(void)
{
}

BOOL CSettingsFile::Load(CString path)
{
	BOOL ok = FALSE;

	// Create an XML document.
	MSXML2::IXMLDOMDocumentPtr doc;
	doc.CreateInstance(__uuidof(MSXML2::DOMDocument));

	DWORD attributes = ::GetFileAttributes(path);
	if (attributes == INVALID_FILE_ATTRIBUTES)
	{
		// Given file doesn't exist.
		ok = TRUE;
	}
	else
	{
		// Load the xml.
		VARIANT_BOOL loaded = doc->load((LPCTSTR)path);

		if (VARIANT_FALSE != loaded)
		{
			// Load succeeded => parse the document.
			MSXML2::IXMLDOMNodePtr root = doc->documentElement;
			m_root->parse(root);

			ok = TRUE;
		}
		else
		{
			// Load failed => probably badly formed XML.
			ok = FALSE;
		}
	}

	return ok;
}

BOOL CSettingsFile::Save(CString path)
{
	BOOL ok = FALSE;

	// Create an XML document.
	MSXML2::IXMLDOMDocumentPtr doc;
	doc.CreateInstance(__uuidof(MSXML2::DOMDocument));
	
	doc->documentElement = doc->createElement("settings");

	m_root->save(doc,doc->documentElement);

	ok = SUCCEEDED(doc->save((LPCTSTR)path));

	return ok;
}

BOOL CSettingsFile::GetSetting(_bstr_t key,char** pValue)
{
	BOOL found = FALSE;

	// Allow everyone access to the preferences key.
	if (_tcsncmp(key,m_preferencesKey,18) == 0)
		found = GetSettingPrivate(key,pValue);
	else if (_tcsncmp(key,m_privateKey,6) != 0)
		found = GetSettingPrivate(key,pValue);

	return found;
}

BOOL CSettingsFile::GetSettingPrivate(_bstr_t key,char** pValue)
{
	BOOL found = FALSE;

	key = m_rootKey + key;
	char* tok = strtok(key,". ");

	CSetting* setting = m_root->find();

	if (setting != NULL && setting->m_value.length() > 0)
	{
		int len = setting->m_value.length();
		*pValue = new char[len+1];
		strcpy(*pValue,(const char*)setting->m_value);

		found = TRUE;
	}

	return found;
}

void CSettingsFile::SetSettingPrivate(_bstr_t key,_bstr_t value,BOOL readOnly)
{
	key = m_rootKey + key;

	char* tokenise = new char[strlen(key)+1];
	strcpy(tokenise,(LPCSTR)key);

	char* tok = strtok(tokenise,". ");

	CSetting* setting = m_root->find();

	delete [] tokenise;

	if (setting == NULL || setting->m_readOnly == FALSE)
	{
		tokenise = new char[strlen(key)+1];
		strcpy(tokenise,(LPCSTR)key);
		tok = strtok(tokenise,". ");
		m_root->add(value,readOnly);
		delete[] tokenise;
	}
}

void CSettingsFile::SetSetting(_bstr_t key,_bstr_t value)
{
	if (_tcsncmp(key,m_preferencesKey,18) == 0)
		SetSettingPrivate(key,value);
	else if (_tcsncmp(key,m_privateKey,6) != 0)
		SetSettingPrivate(key,value);
}

/**********************************************************
* CSettingsFile::CSetting
*
*
**********************************************************/
void CSettingsFile::CSetting::add(_bstr_t value,BOOL readOnly)
{
	char* key = strtok(NULL,". ");

	if (key != NULL)
	{
		NODE_MAP::iterator it = m_nMap.find(key);
		if (it == m_nMap.end())
		{
			CSetting* newSetting = new CSetting;
			m_nMap[key] = newSetting;
		}

		m_nMap[key]->add(value,readOnly);
	}
	else
	{
		m_value = value;
		m_readOnly = readOnly;
	}
}

void CSettingsFile::CSetting::save(MSXML2::IXMLDOMDocumentPtr& doc,MSXML2::IXMLDOMNodePtr node)
{
	if (m_value.length() > 0)
	{
		MSXML2::IXMLDOMNodePtr kidCont = doc->createElement(_T("value")); 

		if (m_readOnly)
		{
			MSXML2::IXMLDOMAttributePtr attrib = doc->createAttribute(_T("readOnly"));
			attrib->value = m_readOnly;
			kidCont->attributes->setNamedItem(attrib);
		}

		MSXML2::IXMLDOMNodePtr kid = doc->createTextNode(m_value);
		kidCont->appendChild(kid);
		node->appendChild(kidCont);
	}

	for (NODE_MAP::iterator it = m_nMap.begin(); it != m_nMap.end(); it++)
	{
		MSXML2::IXMLDOMNodePtr kid = doc->createElement(it->first); 
		it->second->save(doc,node->appendChild(kid));		
	}
}

_bstr_t CSettingsFile::CSetting::parse(MSXML2::IXMLDOMNodePtr root)
{
	MSXML2::IXMLDOMNodePtr attrib = root->attributes->getNamedItem("readOnly");
	if (attrib != NULL)
		m_readOnly = attrib->text == _bstr_t("true");
	else
		m_readOnly = FALSE;

	_bstr_t value;

	MSXML2::IXMLDOMNodeListPtr kids = root->childNodes;
	int kidCount = kids->length;
	_bstr_t nodeName = root->nodeName;

	for (int kidx = 0; kidx < kidCount; kidx++)
	{
		MSXML2::IXMLDOMNodePtr kid = kids->item[kidx];

		int nodeType = kid->nodeType;

		if (nodeName == _bstr_t("value") && nodeType == MSXML2::tagDOMNodeType::NODE_TEXT && kidCount == 1)
		{
			value = root->text;
		}
		else
		{
			_bstr_t kidNodeName =kid->nodeName;

			CSetting* setting = new CSetting;
			value = setting->parse(kid);

			if (kidNodeName == _bstr_t("value") && value.length() > 0)
			{
				m_value = value;
				m_readOnly = setting->m_readOnly;
				delete setting;
				value = "";
			}
			else
				m_nMap[kidNodeName] = setting;
		}
	}

	return value;
}

CSettingsFile::CSetting* CSettingsFile::CSetting::find()
{
	CSetting* match = NULL;

	char* tok = strtok(NULL,". ");
	
	if (tok != NULL)
	{
		NODE_MAP::iterator it = m_nMap.find(tok);

		if (it != m_nMap.end())
		{
			match = it->second->find();
		}
		else
			match = NULL;
	}
	else
		match = this;

	return match;
}
