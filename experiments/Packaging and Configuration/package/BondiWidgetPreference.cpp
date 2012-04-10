// BondiWidgetPreference.cpp : Implementation of CBondiWidgetPreference
#include "stdafx.h"
#include "BondiWidgetPreference.h"


// CBondiWidgetPreference

STDMETHODIMP CBondiWidgetPreference::InterfaceSupportsErrorInfo(REFIID riid)
{
	static const IID* arr[] = 
	{
		&IID_IBondiWidgetPreference
	};

	for (int i=0; i < sizeof(arr) / sizeof(arr[0]); i++)
	{
		if (InlineIsEqualGUID(*arr[i],riid))
			return S_OK;
	}
	return S_FALSE;
}

STDMETHODIMP CBondiWidgetPreference::get_Name(BSTR* pVal)
{
	*pVal = m_name.copy();
	return S_OK;
}

STDMETHODIMP CBondiWidgetPreference::put_Name(BSTR newVal)
{
	m_name = newVal;
	return S_OK;
}

STDMETHODIMP CBondiWidgetPreference::get_Value(BSTR* pVal)
{
	*pVal = m_value.copy();
	return S_OK;
}

STDMETHODIMP CBondiWidgetPreference::put_Value(BSTR newVal)
{
	m_value = newVal;
	return S_OK;
}

STDMETHODIMP CBondiWidgetPreference::get_ReadOnly(VARIANT_BOOL* pVal)
{
	*pVal = m_readOnly == FALSE ? VARIANT_FALSE : VARIANT_TRUE;
	return S_OK;
}

STDMETHODIMP CBondiWidgetPreference::put_ReadOnly(VARIANT_BOOL newVal)
{
	m_readOnly = newVal == VARIANT_FALSE ? FALSE : TRUE;
	return S_OK;
}

void CBondiWidgetPreference::parse(MSXML2::IXMLDOMNodePtr paramNode)
{
	MSXML2::IXMLDOMNodePtr attrib = paramNode->attributes->getNamedItem("name");
	if (attrib == NULL)
		BONDI_RAISE_ERROR(E_BONDI_WIDGET_FEATURE_NAME,_T("preference element - 'name' attribute missing"));
	m_name = attrib->text;

	attrib = paramNode->attributes->getNamedItem("value");
	if (attrib != NULL)
		m_value = attrib->text;

	attrib = paramNode->attributes->getNamedItem("readonly");
	if (attrib != NULL)
		m_readOnly = attrib->text == _bstr_t("true");
}
