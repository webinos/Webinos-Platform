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
#include "BondiWidgetFeature.h"
#include "BondiFeatureParam.h"


// CBondiWidgetFeature

STDMETHODIMP CBondiWidgetFeature::InterfaceSupportsErrorInfo(REFIID riid)
{
	static const IID* arr[] = 
	{
		&IID_IBondiWidgetFeature
	};

	for (int i=0; i < sizeof(arr) / sizeof(arr[0]); i++)
	{
		if (InlineIsEqualGUID(*arr[i],riid))
			return S_OK;
	}
	return S_FALSE;
}

void CBondiWidgetFeature::parse(MSXML2::IXMLDOMNodePtr featureNode)
{
	MSXML2::IXMLDOMNodePtr attrib = featureNode->attributes->getNamedItem("name");
	if (attrib == NULL)
		BONDI_RAISE_ERROR(E_BONDI_WIDGET_FEATURE_NAME,_T("feature element - 'name' attribute missing"));
	m_name = attrib->text;

	attrib = featureNode->attributes->getNamedItem("required");
	if (attrib != NULL)
	{
		m_required = attrib->text == _bstr_t("true");
	}

	MSXML2::IXMLDOMNodeListPtr kids = featureNode->childNodes;
	for (int kidx = 0; kidx < kids->length; kidx++)
	{
		MSXML2::IXMLDOMNodePtr kid = kids->item[kidx];
		if (kid->nodeName == _bstr_t("param"))
		{
			CComObject<CBondiFeatureParam>* child;
			CComObject<CBondiFeatureParam>::CreateInstance(&child);

			child->parse(kid);

			m_params.push_back(child);
		}
	}
}

void CBondiWidgetFeature::AddParam(_bstr_t name, _bstr_t val)
{
	CComObject<CBondiFeatureParam>* child;
	CComObject<CBondiFeatureParam>::CreateInstance(&child);

	child->put_Name(name);
	child->put_Value(val);

	m_params.push_back(child);
}

STDMETHODIMP CBondiWidgetFeature::get_ParamCount(ULONG* pVal)
{
	*pVal = (ULONG)m_params.size();

	return S_OK;
}

STDMETHODIMP CBondiWidgetFeature::get_Param(ULONG idx, IBondiFeatureParam** pVal)
{
	if (idx >= m_params.size())
		return E_INVALIDARG;

	*pVal = m_params[idx];
	if (*pVal != NULL)
		(*pVal)->AddRef();

	return S_OK;
}

STDMETHODIMP CBondiWidgetFeature::put_Param(ULONG idx, IBondiFeatureParam* newVal)
{
	m_params.push_back(newVal);
	return S_OK;
}

STDMETHODIMP CBondiWidgetFeature::get_Name(BSTR* pVal)
{
	*pVal = m_name.copy();
	return S_OK;
}

STDMETHODIMP CBondiWidgetFeature::put_Name(BSTR newVal)
{
	m_name = newVal;
	return S_OK;
}

STDMETHODIMP CBondiWidgetFeature::get_Required(VARIANT_BOOL* pVal)
{
	*pVal = m_required == FALSE ? VARIANT_FALSE : VARIANT_TRUE;
	return S_OK;
}

STDMETHODIMP CBondiWidgetFeature::put_Required(VARIANT_BOOL newVal)
{
	m_required = newVal == VARIANT_TRUE;
	return S_OK;
}

