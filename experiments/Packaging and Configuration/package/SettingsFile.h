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

#include <vector>
#include <map>

class CSettingsFile
{
private:
	class CSetting
	{
	public:
		typedef std::map<_bstr_t, CSetting*> NODE_MAP;

		NODE_MAP m_nMap;
		_bstr_t m_value;
		BOOL m_readOnly;

		_bstr_t parse(MSXML2::IXMLDOMNodePtr root);
		CSetting* find();
		void add(_bstr_t value,BOOL readOnly=FALSE);
		void save(MSXML2::IXMLDOMDocumentPtr& doc,MSXML2::IXMLDOMNodePtr node);
	};

private:
	static const TCHAR* m_rootKey;
	static const TCHAR* m_privateKey;
	static const TCHAR* m_preferencesKey;
	
	CSetting* m_root;
	
public:
	CSettingsFile();
	~CSettingsFile(void);

	BOOL Load(CString path);
	BOOL Save(CString path);

	BOOL GetSettingPrivate(_bstr_t key,char** pValue);
	void SetSettingPrivate(_bstr_t key,_bstr_t value,BOOL readOnly=FALSE);
	BOOL GetSetting(_bstr_t key,char** pValue);
	void SetSetting(_bstr_t key,_bstr_t value);
};
