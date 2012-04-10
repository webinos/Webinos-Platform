// BondiFeatureParam.cpp : Implementation of CBondiFeatureParam

#include "stdafx.h"
#include "BondiFeatureParam.h"


// CBondiFeatureParam

STDMETHODIMP CBondiFeatureParam::InterfaceSupportsErrorInfo(REFIID riid)
{
	static const IID* arr[] = 
	{
		&IID_IBondiFeatureParam
	};

	for (int i=0; i < sizeof(arr) / sizeof(arr[0]); i++)
	{
		if (InlineIsEqualGUID(*arr[i],riid))
			return S_OK;
	}
	return S_FALSE;
}

STDMETHODIMP CBondiFeatureParam::get_Name(BSTR* pVal)
{
	*pVal = m_name.copy();

	return S_OK;
}

STDMETHODIMP CBondiFeatureParam::put_Name(BSTR newVal)
{
	m_name = newVal;

	return S_OK;
}

STDMETHODIMP CBondiFeatureParam::get_Value(BSTR* pVal)
{
	*pVal = m_value.copy();

	return S_OK;
}

STDMETHODIMP CBondiFeatureParam::put_Value(BSTR newVal)
{
	m_value = newVal;

	return S_OK;
}

void CBondiFeatureParam::parse(MSXML2::IXMLDOMNodePtr paramNode)
{
	MSXML2::IXMLDOMNodePtr attrib = paramNode->attributes->getNamedItem("name");
	if (attrib == NULL)
		BONDI_RAISE_ERROR(E_BONDI_WIDGET_FEATURE_NAME,_T("feature param element - 'name' attribute missing"));
	m_name = attrib->text;

	attrib = paramNode->attributes->getNamedItem("value");
	if (attrib == NULL)
		BONDI_RAISE_ERROR(E_BONDI_WIDGET_FEATURE_NAME,_T("feature param element - 'value' attribute missing"));
	m_value = attrib->text;
}
