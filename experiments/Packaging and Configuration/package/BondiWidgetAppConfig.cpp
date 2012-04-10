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

#include "stdafx.h"
#include "BondiWidgetAppConfig.h"
#include "common/WidgetErrorCodes.h"

// CBondiWidgetAppConfig

STDMETHODIMP CBondiWidgetAppConfig::InterfaceSupportsErrorInfo(REFIID riid)
{
	static const IID* arr[] = 
	{
		&IID_IBondiWidgetAppConfig
	};

	for (int i=0; i < sizeof(arr) / sizeof(arr[0]); i++)
	{
		if (InlineIsEqualGUID(*arr[i],riid))
			return S_OK;
	}
	return S_FALSE;
}

STDMETHODIMP CBondiWidgetAppConfig::Load(BSTR path)
{
	HRESULT hRes = S_OK;

	try
	{
		delete m_settings;

		m_settings = new CSettingsFile();
		
		m_settingsFile = path;

		if (FALSE == m_settings->Load(m_settingsFile))
		{
			delete m_settings;
			m_settings = NULL;
			BONDI_RAISE_ERROR(E_BONDI_APP_CONFIG,_T("Failed to load app config"));
		}
	}
	catch (_com_error& err)
	{
		hRes = BONDI_SET_ERROR(err,"CBondiWidgetAppConfig::Load - COM exception");
	}
	catch (...)
	{
		hRes = BONDI_SET_ERROR(E_FAIL,"CBondiWidgetAppConfig::Load - C++ exception");
	}

	return hRes;
}

STDMETHODIMP CBondiWidgetAppConfig::GetSetting(BSTR key, BSTR* val)
{
	HRESULT hRes = S_OK;

	try
	{
		_bstr_t conv(_T(""));

		if (m_settings == NULL)
			BONDI_RAISE_ERROR(E_BONDI_APP_CONFIG,_T("App config not loaded"));

		char* valCh;
		if (FALSE != m_settings->GetSetting(key,&valCh))
		{
			conv = valCh;
			delete[] valCh;
		}
		else
			hRes = S_FALSE;

		*val = conv.Detach();
	}
	catch (_com_error& err)
	{
		hRes = BONDI_SET_ERROR(err,"CBondiWidget::Load - COM exception");
	}
	catch (...)
	{
		hRes = BONDI_SET_ERROR(E_FAIL,"CBondiWidget::Load - C++ exception");
	}

	return hRes;
}

STDMETHODIMP CBondiWidgetAppConfig::PutSetting(BSTR key, BSTR val)
{
	HRESULT hRes = S_OK;

	try
	{
		if (m_settings == NULL)
			BONDI_RAISE_ERROR(E_BONDI_APP_CONFIG,_T("App config not loaded"));

		m_settings->SetSetting(key,val);
		m_settings->Save(m_settingsFile);
	}
	catch (_com_error& err)
	{
		hRes = BONDI_SET_ERROR(err,"CBondiWidget::Load - COM exception");
	}
	catch (...)
	{
		hRes = BONDI_SET_ERROR(E_FAIL,"CBondiWidget::Load - C++ exception");
	}

	return hRes;
}

STDMETHODIMP CBondiWidgetAppConfig::GetBondiSetting(BSTR key, BSTR* val)
{
	HRESULT hRes = S_OK;

	try
	{
		if (m_settings == NULL)
			BONDI_RAISE_ERROR(E_BONDI_APP_CONFIG,_T("App config not loaded"));

		char* valCh;
		if (FALSE != m_settings->GetSettingPrivate(key,&valCh))
		{
			_bstr_t conv(valCh);
			*val = conv.Detach();
			delete[] valCh;
		}
		else
			hRes = S_FALSE;
	}
	catch (_com_error& err)
	{
		hRes = BONDI_SET_ERROR(err,"CBondiWidget::Load - COM exception");
	}
	catch (...)
	{
		hRes = BONDI_SET_ERROR(E_FAIL,"CBondiWidget::Load - C++ exception");
	}

	return hRes;
}

STDMETHODIMP CBondiWidgetAppConfig::PutBondiSetting(BSTR key, BSTR val,VARIANT_BOOL readOnly)
{
	HRESULT hRes = S_OK;

	try
	{
		if (m_settings == NULL)
			BONDI_RAISE_ERROR(E_BONDI_APP_CONFIG,_T("App config not loaded"));

		m_settings->SetSettingPrivate(key,val,readOnly != VARIANT_FALSE);
		m_settings->Save(m_settingsFile);
	}
	catch (_com_error& err)
	{
		hRes = BONDI_SET_ERROR(err,"CBondiWidget::Load - COM exception");
	}
	catch (...)
	{
		hRes = BONDI_SET_ERROR(E_FAIL,"CBondiWidget::Load - C++ exception");
	}

	return hRes;
}
