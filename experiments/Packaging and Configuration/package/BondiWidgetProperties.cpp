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
#include "BondiWidgetProperties.h"
#include "ConfigXML.h"
#include "PackageLocales.h"

STDMETHODIMP CBondiWidgetProperties::InterfaceSupportsErrorInfo(REFIID riid)
{
	static const IID* arr[] = 
	{
		&IID_IBondiWidgetProperties
	};

	for (int i=0; i < sizeof(arr) / sizeof(arr[0]); i++)
	{
		if (InlineIsEqualGUID(*arr[i],riid))
			return S_OK;
	}
	return S_FALSE;
}
	
void CBondiWidgetProperties::Load(Iw3cConfig* config)
{
	m_config = config;
}

STDMETHODIMP CBondiWidgetProperties::get_Id(BSTR* pVal)
{
	std::wstring val;
	if (m_config->GetId(val))
		*pVal = _bstr_t(val.c_str()).Detach();
	else
		*pVal = NULL;

	return S_OK;
}

STDMETHODIMP CBondiWidgetProperties::get_Name(BSTR* pVal)
{
	std::wstring val;
	if (m_config->GetName(val))
		*pVal = _bstr_t(val.c_str()).Detach();
	else
		*pVal = NULL;

	return S_OK;
}

STDMETHODIMP CBondiWidgetProperties::get_StartFile(BSTR* pVal)
{
	std::wstring val;
	if (m_config->GetStartFile(val))
		*pVal = _bstr_t(val.c_str()).Detach();
	else
		*pVal = NULL;

	return S_OK;
}

STDMETHODIMP CBondiWidgetProperties::get_AuthorName(BSTR* pVal)
{
	std::wstring val;
	if (m_config->GetAuthor(val))
		*pVal = _bstr_t(val.c_str()).Detach();
	else
		*pVal = NULL;

	return S_OK;
}

STDMETHODIMP CBondiWidgetProperties::get_AuthorEmail(BSTR* pVal)
{
	std::wstring val;
	if (m_config->GetAuthorEmail(val))
		*pVal = _bstr_t(val.c_str()).Detach();
	else
		*pVal = NULL;

	return S_OK;
}

STDMETHODIMP CBondiWidgetProperties::get_AuthorURL(BSTR* pVal)
{
	std::wstring val;
	if (m_config->GetAuthorHref(val))
		*pVal = _bstr_t(val.c_str()).Detach();
	else
		*pVal = NULL;

	return S_OK;
}

STDMETHODIMP CBondiWidgetProperties::get_Description(BSTR* pVal)
{
	std::wstring val;
	if (m_config->GetDescription(val))
		*pVal = _bstr_t(val.c_str()).Detach();
	else
		*pVal = NULL;

	return S_OK;
}

STDMETHODIMP CBondiWidgetProperties::get_License(BSTR* pVal)
{
	std::wstring val;
	if (m_config->GetLicense(val))
		*pVal = _bstr_t(val.c_str()).Detach();
	else
		*pVal = NULL;

	return S_OK;
}

STDMETHODIMP CBondiWidgetProperties::get_Version(BSTR* pVal)
{
	std::wstring val;
	if (m_config->GetVersion(val))
		*pVal = _bstr_t(val.c_str()).Detach();
	else
		*pVal = NULL;

	return S_OK;
}

STDMETHODIMP CBondiWidgetProperties::get_IconCount(USHORT* pVal)
{
	size_t val = m_config->GetIconCount();
	*pVal = val;

	return S_OK;
}

STDMETHODIMP CBondiWidgetProperties::get_Width(ULONG* pVal)
{
	size_t val;
	if (m_config->GetWidth(val))
		*pVal = val;
	else
		*pVal = -1;

	return S_OK;
}

STDMETHODIMP CBondiWidgetProperties::get_Height(ULONG* pVal)
{
	size_t val;
	if (m_config->GetHeight(val))
		*pVal = val;
	else
		*pVal = -1;

	return S_OK;
}

STDMETHODIMP CBondiWidgetProperties::get_ViewModes(BSTR* pVal)
{
	std::wstring val;
	if (m_config->GetViewModes(val))
		*pVal = _bstr_t(val.c_str()).Detach();
	else
		*pVal = NULL;

	return S_OK;
}

STDMETHODIMP CBondiWidgetProperties::get_FeatureCount(ULONG* pVal)
{
	size_t val = m_config->GetFeatureCount();
	*pVal = val;

	return S_OK;
}

STDMETHODIMP CBondiWidgetProperties::get_Feature(ULONG idx, IBondiWidgetFeature** pVal)
{
	HRESULT hRes = S_OK;

	std::wstring name;
	bool required;
	size_t paramCount;

	if (m_config->GetFeature(idx,name,required,paramCount) != false)
	{
		CComObject<CBondiWidgetFeature>* child;
		CComObject<CBondiWidgetFeature>::CreateInstance(&child);
		
		child->put_Name(_bstr_t(name.c_str()));
		child->put_Required(required ? VARIANT_TRUE : VARIANT_FALSE);

		for (size_t pIdx = 0; pIdx < paramCount; pIdx++)
		{
			std::wstring paramName;
			std::wstring paramVal;
			if (m_config->GetFeatureParam(name,pIdx,paramName,paramVal))
			{
				child->AddParam(paramName.c_str(),paramVal.c_str());
			}
		}

		child->AddRef();
		*pVal = child;
	}
	else
		*pVal = NULL;

	return hRes;
}

STDMETHODIMP CBondiWidgetProperties::put_InstallURI(BSTR newVal)
{
	m_installURI = newVal;
	return S_OK;
}

STDMETHODIMP CBondiWidgetProperties::get_InstallURI(BSTR* pVal)
{
	*pVal = m_installURI.copy();
	return S_OK;
}

STDMETHODIMP CBondiWidgetProperties::put_DistributorDigSig(IBondiWidgetSignature* signature)
{
	HRESULT hRes = S_OK;

	try
	{
		m_distributorSignature = signature;
	}
	catch (_com_error& err)
	{
		hRes = BONDI_SET_ERROR(err,"CBondiWidgetProperties::put_DistributorDigSig - COM exception");
	}
	catch (...)
	{
		hRes = BONDI_SET_ERROR(E_FAIL,"CBondiWidgetProperties::put_DistributorDigSig - C++ exception");
	}

	return hRes;
}

STDMETHODIMP CBondiWidgetProperties::put_AuthorDigSig(IBondiWidgetSignature* signature)
{
	HRESULT hRes = S_OK;

	try
	{
		m_authorSignature = signature;
	}
	catch (_com_error& err)
	{
		hRes = BONDI_SET_ERROR(err,"CBondiWidgetProperties::put_AuthorDigSig - COM exception");
	}
	catch (...)
	{
		hRes = BONDI_SET_ERROR(E_FAIL,"CBondiWidgetProperties::put_AuthorDigSig - C++ exception");
	}

	return hRes;
}

STDMETHODIMP CBondiWidgetProperties::get_DistributorCommonName(BSTR* pVal)
{
	HRESULT hRes = S_OK;

	try
	{
		if (m_distributorSignature != NULL)
			m_distributorSignature->get_CommonName(pVal);
	}
	catch (_com_error& err)
	{
		hRes = BONDI_SET_ERROR(err,"CBondiWidgetProperties::get_DistributorCommonName - COM exception");
	}
	catch (...)
	{
		hRes = BONDI_SET_ERROR(E_FAIL,"CBondiWidgetProperties::get_DistributorCommonName - C++ exception");
	}

	return hRes;
}

STDMETHODIMP CBondiWidgetProperties::get_DistributorRootCommonName(BSTR* pVal)
{
	HRESULT hRes = S_OK;

	try
	{
		if (m_distributorSignature != NULL)
			m_distributorSignature->get_RootCommonName(pVal);
	}
	catch (_com_error& err)
	{
		hRes = BONDI_SET_ERROR(err,"CBondiWidgetProperties::get_DistributorRootCommonName - COM exception");
	}
	catch (...)
	{
		hRes = BONDI_SET_ERROR(E_FAIL,"CBondiWidgetProperties::get_DistributorRootCommonName - C++ exception");
	}

	return hRes;
}

STDMETHODIMP CBondiWidgetProperties::get_DistributorFingerprint(BSTR* pVal)
{
	HRESULT hRes = S_OK;

	try
	{
		if (m_distributorSignature != NULL)
			m_distributorSignature->get_Fingerprint(pVal);
	}
	catch (_com_error& err)
	{
		hRes = BONDI_SET_ERROR(err,"CBondiWidgetProperties::get_DistributorFingerprint - COM exception");
	}
	catch (...)
	{
		hRes = BONDI_SET_ERROR(E_FAIL,"CBondiWidgetProperties::get_DistributorFingerprint - C++ exception");
	}

	return hRes;
}

STDMETHODIMP CBondiWidgetProperties::get_DistributorRootFingerprint(BSTR* pVal)
{
	HRESULT hRes = S_OK;

	try
	{
		if (m_distributorSignature != NULL)
			m_distributorSignature->get_RootFingerprint(pVal);
	}
	catch (_com_error& err)
	{
		hRes = BONDI_SET_ERROR(err,"CBondiWidgetProperties::get_DistributorRootFingerprint - COM exception");
	}
	catch (...)
	{
		hRes = BONDI_SET_ERROR(E_FAIL,"CBondiWidgetProperties::get_DistributorRootFingerprint - C++ exception");
	}

	return hRes;
}

STDMETHODIMP CBondiWidgetProperties::get_AuthorCommonName(BSTR* pVal)
{
	HRESULT hRes = S_OK;

	try
	{
		if (m_authorSignature != NULL)
			m_authorSignature->get_CommonName(pVal);
	}
	catch (_com_error& err)
	{
		hRes = BONDI_SET_ERROR(err,"CBondiWidgetProperties::get_AuthorCommonName - COM exception");
	}
	catch (...)
	{
		hRes = BONDI_SET_ERROR(E_FAIL,"CBondiWidgetProperties::get_AuthorCommonName - C++ exception");
	}

	return hRes;
}

STDMETHODIMP CBondiWidgetProperties::get_AuthorRootCommonName(BSTR* pVal)
{
	HRESULT hRes = S_OK;

	try
	{
		if (m_authorSignature != NULL)
			m_authorSignature->get_RootCommonName(pVal);
	}
	catch (_com_error& err)
	{
		hRes = BONDI_SET_ERROR(err,"CBondiWidgetProperties::get_AuthorRootCommonName - COM exception");
	}
	catch (...)
	{
		hRes = BONDI_SET_ERROR(E_FAIL,"CBondiWidgetProperties::get_AuthorRootCommonName - C++ exception");
	}

	return hRes;
}

STDMETHODIMP CBondiWidgetProperties::get_AuthorFingerprint(BSTR* pVal)
{
	HRESULT hRes = S_OK;

	try
	{
		if (m_authorSignature != NULL)
			m_authorSignature->get_Fingerprint(pVal);
	}
	catch (_com_error& err)
	{
		hRes = BONDI_SET_ERROR(err,"CBondiWidgetProperties::get_AuthorFingerprint - COM exception");
	}
	catch (...)
	{
		hRes = BONDI_SET_ERROR(E_FAIL,"CBondiWidgetProperties::get_AuthorFingerprint - C++ exception");
	}

	return hRes;
}

STDMETHODIMP CBondiWidgetProperties::get_AuthorRootFingerprint(BSTR* pVal)
{
	HRESULT hRes = S_OK;

	try
	{
		if (m_authorSignature != NULL)
			m_authorSignature->get_RootFingerprint(pVal);
	}
	catch (_com_error& err)
	{
		hRes = BONDI_SET_ERROR(err,"CBondiWidgetProperties::get_AuthorRootFingerprint - COM exception");
	}
	catch (...)
	{
		hRes = BONDI_SET_ERROR(E_FAIL,"CBondiWidgetProperties::get_AuthorRootFingerprint - C++ exception");
	}

	return hRes;
}

STDMETHODIMP CBondiWidgetProperties::get_PreferenceCount(ULONG* pVal)
{
	size_t val = m_config->GetPreferenceCount();
	*pVal = val;

	return S_OK;
}

STDMETHODIMP CBondiWidgetProperties::get_Preference(ULONG idx, IBondiWidgetPreference** pVal)
{
	std::wstring name;
	std::wstring val;
	bool readOnly;

	if (m_config->GetPreference(idx,name,val,readOnly) != false)
	{
		CComObject<CBondiWidgetPreference>* child;
		CComObject<CBondiWidgetPreference>::CreateInstance(&child);
		child->put_Name(_bstr_t(name.c_str()));
		child->put_Value(_bstr_t(val.c_str()));
		child->put_ReadOnly(readOnly ? VARIANT_TRUE : VARIANT_FALSE);
		child->AddRef();

		*pVal = child;
	}
	else
		*pVal = NULL;

	return S_OK;
}

STDMETHODIMP CBondiWidgetProperties::get_ShortName(BSTR* pVal)
{
	std::wstring val;
	if (m_config->GetShortName(val))
		*pVal = _bstr_t(val.c_str()).Detach();
	else
		*pVal = NULL;

	return S_OK;
}

STDMETHODIMP CBondiWidgetProperties::get_StartFileEncoding(BSTR* pVal)
{
	std::wstring val;
	if (m_config->GetStartFileEncoding(val))
		*pVal = _bstr_t(val.c_str()).Detach();
	else
		*pVal = NULL;

	return S_OK;
}

STDMETHODIMP CBondiWidgetProperties::get_StartFileContentType(BSTR* pVal)
{
	std::wstring val;
	if (m_config->GetStartFileContentType(val))
		*pVal = _bstr_t(val.c_str()).Detach();
	else
		*pVal = NULL;

	return S_OK;
}

STDMETHODIMP CBondiWidgetProperties::get_LicenseHref(BSTR* pVal)
{
	std::wstring val;
	if (m_config->GetLicenseHref(val))
		*pVal = _bstr_t(val.c_str()).Detach();
	else
		*pVal = NULL;

	return S_OK;
}

STDMETHODIMP CBondiWidgetProperties::get_LicenseFile(BSTR* pVal)
{
	std::wstring val;
	if (m_config->GetLicenseFile(val))
		*pVal = _bstr_t(val.c_str()).Detach();
	else
		*pVal = NULL;

	return S_OK;
}

STDMETHODIMP CBondiWidgetProperties::GetIcon(ULONG idx, BSTR* pVal, ULONG* widthOut, ULONG* heightOut)
{
	HRESULT hRes = S_OK;

	std::wstring name;
	int width;
	int height;

	if (m_config->GetIcon(idx,name,width,height) != false)
	{
		*pVal = _bstr_t(name.c_str()).Detach();
		*widthOut = width;
		*heightOut = height;
	}
	else
		*pVal = NULL;

	return hRes;
}
