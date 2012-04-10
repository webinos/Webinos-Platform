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
#include "BondiWidget.h"
#include "BondiWidgetProperties.h"
#include <vector>
#include "DiskResource.h"
#include "common/WidgetUtils.h"
#include <algorithm>
#include "BondiWidgetSignature.h"
#include "BondiWidgetAppConfig.h"
#include "PnC.h"

typedef std::pair<int,CString> sigPair;

const CString CBondiWidget::sigBaseDistributor("signature");
const CString CBondiWidget::sigBaseAuthor("author-signature");

void CBondiWidget::FinalRelease()
{
	delete m_package;

	if (m_config != NULL)
	{
		m_config->Release();
		m_config = NULL;
	}
}

STDMETHODIMP CBondiWidget::InterfaceSupportsErrorInfo(REFIID riid)
{
	static const IID* arr[] = 
	{
		&IID_IBondiWidget
	};

	for (int i=0; i < sizeof(arr) / sizeof(arr[0]); i++)
	{
		if (InlineIsEqualGUID(*arr[i],riid))
			return S_OK;
	}
	return S_FALSE;
}

STDMETHODIMP CBondiWidget::get_Configuration(IBondiWidgetProperties** pVal)
{
	*pVal = (IBondiWidgetProperties*)m_config;
	if (*pVal != NULL)
		(*pVal)->AddRef();

	return S_OK;
}

STDMETHODIMP CBondiWidget::get_InstalledRoot(BSTR* pVal)
{
	*pVal = m_installedRoot.copy();

	return S_OK;
}

STDMETHODIMP CBondiWidget::put_InstalledRoot(BSTR newVal)
{
	m_installedRoot = newVal;

	return S_OK;
}

STDMETHODIMP CBondiWidget::Install(BSTR resourcePath, BSTR locales,VARIANT_BOOL overwriteExisting,VARIANT_BOOL silent)
{
	HRESULT hRes = S_OK;

	try
	{
		_bstr_t localeList(locales);
		if (localeList.length() == 0)
			localeList = "en";

		// Load the package.
		LoadPackage(resourcePath, localeList);

		// Make sure the install folder is present.
		TCHAR appDataPath[MAX_PATH];
		WidgetUtils::GetAppFolder(NULL,appDataPath);
		_bstr_t targetPath = appDataPath + _bstr_t("\\Install");
		CreateDirectory(targetPath,NULL);

		// Build installation path - use widget id + version.
		_bstr_t fixedID;
		m_config->get_Id(fixedID.GetAddress());
		if (fixedID.length() == 0)
		{
			// No ID - try the short name.
			m_config->get_ShortName(fixedID.GetAddress());
			if (fixedID.length() == 0)
			{
				// No short name - use the long name.
				m_config->get_Name(fixedID.GetAddress());
				if (fixedID.length() == 0)
				{
					// ToDo - create a GUID here?
					fixedID = "unknown";
				}
			}
		}
		
		// Clean the widget ID for use as a path.
		CString fid = (LPCTSTR)fixedID;
		fid.Replace(_T(":"),_T("-"));
		fid.Replace(_T("/"),_T("-"));
		fid.Replace(_T("."),_T("-"));

		targetPath = targetPath + "\\" + fid;
		::CreateDirectory(targetPath,NULL);

		// Create version folder.
		_bstr_t version;
		BONDI_CHECK_ERROR(m_config->get_Version(version.GetAddress()),(IBondiWidgetProperties*)m_config);

		// Default version for installation purposes.
		if (version.length() == 0)
			version = _T("0.0.0");

		targetPath = targetPath + "\\" + version;
		DWORD fileAttributes = ::GetFileAttributes(targetPath);

		// If over-writing, confirm when not running silently.
		_bstr_t name;
		m_config->get_Name(name.GetAddress());

		_bstr_t mess = _T("Version ") + version + _T(" of the widget '") + name + _T("' is already installed.\r\n\r\nDo you want to overwrite it?");

		BOOL exists = fileAttributes != INVALID_FILE_ATTRIBUTES;
		BOOL overwrite = overwriteExisting != VARIANT_FALSE;
		BOOL prompt = silent == VARIANT_FALSE;

		if (!exists || overwrite || (prompt && MessageBox(::GetForegroundWindow(),mess,_T("Confirm overwrite"),MB_YESNO | MB_ICONQUESTION) == IDYES))
		{
			// Remove any existing files.
			WidgetUtils::DeleteDirectory(targetPath);

			// Create the target folders.
			::CreateDirectory(targetPath,NULL);
			::CreateDirectory(targetPath + _T("\\locales"),NULL);

			CPackageResource* packageResource = m_package->GetResource();

			// Install package to each supported locale.
			unsigned long cnt = packageResource->GetFileCount();
			for (unsigned long idx = 0; idx < cnt; idx++)
			{
				if (!packageResource->IsDirectory(idx))
					continue;

				std::wstring path = packageResource->GetFilePath(idx);
				std::wstring langCode = GetFolderLocale(path);
				if (langCode.length() == 0)
					continue;

				std::wstring localePath(targetPath);
				localePath.append(std::wstring(_T("\\locales\\"))).append(langCode);

				// Create the target folder.
				::CreateDirectory(localePath.c_str(),NULL);

				// Extract package to locale folder.
				packageResource->Save(localePath);

				// Remove any locale folder from localised version.
				localePath.append(_T("\\locales"));
				WidgetUtils::DeleteDirectory(localePath.c_str());
			}

			// Save package to installed root folder.
			packageResource->Save((LPCTSTR)targetPath);
			
			if (FixupLoaders(targetPath))
				AddBondiLoaders(targetPath);

			InitialiseAppSettings();

			// First time widget is instantiated => copy preferences from config.xml into app settings.
			ULONG preferenceCount;
			m_config->get_PreferenceCount(&preferenceCount);

			for (ULONG fIdx = 0; fIdx < preferenceCount; fIdx++)
			{
				CComPtr<IBondiWidgetPreference> preference;
				m_config->get_Preference(fIdx,&preference);

				_bstr_t name;
				preference->get_Name(name.GetAddress());

				_bstr_t value;
				preference->get_Value(value.GetAddress());

				VARIANT_BOOL readOnly;
				preference->get_ReadOnly(&readOnly);

				m_appSettings->PutBondiSetting(_bstr_t("bondi.preferences.") + name,value,readOnly);
			}
		}
		else
		{
			// We didn't install the widget.
			hRes = S_FALSE;
		}

		m_installedRoot = targetPath;
	}
	catch (_com_error& err)
	{
		hRes = BONDI_SET_ERROR(err,"CBondiWidget::Install - COM exception");
	}
	catch (...)
	{
		hRes = BONDI_SET_ERROR(E_FAIL,"CBondiWidget::Install - C++ exception");
	}

	return hRes;
}

/**
* Creates the bondiLoader.js script for the required <feature> elements.
*/
ULONG CBondiWidget::FixupLoaders(BSTR resourcePath)
{
	// Use this flag to switch off automatic insertion of the UserInteraction feature.
	BOOL autoAddUserInteraction = TRUE;

	ULONG featureCount;
	m_config->get_FeatureCount(&featureCount);

	// Check there is actually something to do.
	if (!autoAddUserInteraction && featureCount == 0)
		return featureCount;

	// Load the basic webvm loader javascript.
	TCHAR modulePath[_MAX_PATH];
	::GetModuleFileName(NULL,modulePath,_MAX_PATH);

	TCHAR fname[_MAX_FNAME];		
	_tsplitpath_s(modulePath, NULL, 0, fname, _MAX_FNAME, NULL, 0, NULL, 0); 

	CString path = fname + CString("bootstrapHeader.js");
	HANDLE hfHeader = ::CreateFile(path,GENERIC_READ,0,NULL,OPEN_EXISTING,FILE_ATTRIBUTE_NORMAL,NULL);
	if (hfHeader == INVALID_HANDLE_VALUE)
		BONDI_RAISE_ERROR(E_BONDI_WIDGET_BOOTSCRIPT_MISSING,_T("FixupLoader - Can't find file ") + path);
 
	DWORD fileSize = ::GetFileSize(hfHeader,NULL);
	BYTE* buff = new BYTE[fileSize+1];

	DWORD read;
	::ReadFile(hfHeader,buff,fileSize,&read,NULL);
	::CloseHandle(hfHeader);

	buff[fileSize] = 0;

	_bstr_t header;
	header = (char *)buff;
	delete[] buff;

	// Get the template for the loader script for each module.
	path = fname + CString("bootstrapTemplate.js");
	hfHeader = ::CreateFile(path,GENERIC_READ,0,NULL,OPEN_EXISTING,FILE_ATTRIBUTE_NORMAL,NULL);
	if (hfHeader == INVALID_HANDLE_VALUE)
		BONDI_RAISE_ERROR(E_BONDI_WIDGET_BOOTSCRIPT_MISSING,_T("FixupLoader - Can't find file ") + path);
 
	fileSize = ::GetFileSize(hfHeader,NULL);
	buff = new BYTE[fileSize+1];

	::ReadFile(hfHeader,buff,fileSize,&read,NULL);
	::CloseHandle(hfHeader);

	buff[fileSize] = 0;

	CString templ;
	templ = buff;
	delete[] buff;

	_bstr_t widgetLoader;

	TCHAR loaderCode[1024];
	std::map<CString,BOOL> addedMap;

	for (ULONG fIdx = 0; fIdx < featureCount; fIdx++)
	{
		CComPtr<IBondiWidgetFeature> feature;
		m_config->get_Feature(fIdx,&feature);

		_bstr_t name;
		feature->get_Name(name.GetAddress());

		CString interfaceName((LPCTSTR)name);

		if (addedMap.find(interfaceName) == addedMap.end())
		{
			addedMap[interfaceName] = TRUE;
			swprintf(loaderCode,(LPCTSTR)templ,(LPCTSTR)interfaceName,(LPCTSTR)interfaceName,(LPCTSTR)interfaceName,(LPCTSTR)interfaceName);
			widgetLoader += _bstr_t(loaderCode);
		}
	}

	// Automatically add the UserInteraction feature if it isn't explicitly requested.
	CString userInteraction(_T("http://bondi.omtp.org/api/ui"));
	if (autoAddUserInteraction && addedMap.find(userInteraction) == addedMap.end())
	{
		featureCount++;

		// Add userInteraction interface.
		swprintf(loaderCode,(LPCTSTR)templ,(LPCTSTR)userInteraction,(LPCTSTR)userInteraction,(LPCTSTR)userInteraction,(LPCTSTR)userInteraction);
		widgetLoader += _bstr_t(loaderCode);
	}

	// Format the entire loader code.
	fileSize = header.length() + widgetLoader.length();
	TCHAR* loader = new TCHAR[fileSize+1];
	_stprintf(loader,(LPCTSTR)header,(LPCTSTR)widgetLoader);
	widgetLoader = loader;
	delete[] loader;

	// Write to the widget bootstrap js file.
	path = resourcePath + CString("\\bondiLoader.js");
	hfHeader = ::CreateFile(path,GENERIC_WRITE,0,NULL,CREATE_ALWAYS,FILE_ATTRIBUTE_NORMAL,NULL);
	if (hfHeader == INVALID_HANDLE_VALUE)
		BONDI_RAISE_ERROR(E_BONDI_WIDGET_BOOTSCRIPT_MISSING,_T("FixupLoader - Can't create loader file ") + path);

	::WriteFile(hfHeader,(char*)widgetLoader,widgetLoader.length(),&read,NULL);
	::CloseHandle(hfHeader);

	return featureCount;
}

void CBondiWidget::LoadPackage(BSTR path, BSTR localesIn, BOOL requireChain)
{
	DWORD attributes = ::GetFileAttributes(path);
	if (attributes == INVALID_FILE_ATTRIBUTES)
	{
		// Given file/directory doesn't exist.
		BONDI_RAISE_ERROR(E_BONDI_FILE_NOT_FOUND,CString("can't find file ") + path);
	}

	CPackageLocales locales((LPCTSTR)localesIn);

	m_package = new CPnC(locales);

	bool packageLoaded = false;

	_bstr_t conv(path);
	if ((attributes & FILE_ATTRIBUTE_DIRECTORY) != FILE_ATTRIBUTE_DIRECTORY)
	{
		// A file => attempt to load an archive.
		packageLoaded = m_package->LoadZip((LPCTSTR)conv);
	}
	else
	{
		// A directory => attempt to load the widget from disk.
		CPackageResource* resource = new CDiskResource((LPCTSTR)conv);
		packageLoaded = m_package->Load(resource);
	}

	if (!packageLoaded)
	{
		std::vector<std::wstring> faults;
		m_package->GetFaults(faults);

		_bstr_t faultList;
		for (std::vector<std::wstring>::iterator it = faults.begin(); it != faults.end(); it++)
		{
			faultList += _bstr_t(it->c_str()) + _bstr_t("<br />");
		}

		LPCTSTR f = (LPCTSTR)faultList;
		BONDI_RAISE_ERROR(E_BONDI_CONFIG,f);	
	}

	try
	{
		if (m_config != NULL)
		{
			m_config->Release();
			m_config = NULL;
		}

		// Create a configuration object.
		BONDI_CHECK_ERROR(CComObject<CBondiWidgetProperties>::CreateInstance(&m_config),(IBondiWidget*)this);
		m_config->AddRef();

		//if (FALSE == ProcessSignatures(m_package->GetResource(),requireChain))
		//{
		//	BONDI_RAISE_ERROR(E_BONDI_SIGNATURE,_T("Failed to verify digital signature."));
		//}

		//// Set the digital signatures.
		//m_config->put_DistributorDigSig(m_distributorSignature);
		//m_config->put_AuthorDigSig(m_authorSignature);

		m_config->Load(m_package);
	}
	catch (_com_error& err)
	{
		throw err;
	}
}

void CBondiWidget::InitialiseAppSettings()
{
	// Set the install URL.
	if (m_appSettings == NULL)
	{
		CComPtr<IBondiWidgetAppConfig> appConfig;
		BONDI_CHECK_ERROR(get_AppSettings(&appConfig),(IBondiWidget*)this);
	}

	if (m_appSettings != NULL)
	{
		// Get the installed URI if it's available.
		_bstr_t installUri;
		_bstr_t key("bondi.installUri");
		BONDI_CHECK_ERROR(m_appSettings->GetBondiSetting(key,installUri.GetAddress()),(IBondiWidgetAppConfig*)m_appSettings);

		m_config->put_InstallURI(installUri);
	}
}

/**
* Load a widget from the given resource path.
* @param path the path to the widget resource.
*/
STDMETHODIMP CBondiWidget::Load(BSTR path, BSTR locales, VARIANT_BOOL requireChain, BSTR* msg)
{	
	HRESULT hRes = S_OK;

	try
	{
		_bstr_t localeList(locales);
		if (localeList.length() == 0)
			localeList = "en";

		// Cache the installed root.
		m_installedRoot = path;			

		// Load the widget.
		LoadPackage(path, localeList, requireChain != VARIANT_FALSE);

		// Initialise settings.
		InitialiseAppSettings();
	}
	catch (_com_error& err)
	{
		_bstr_t msgCopy = err.Description();
		*msg = msgCopy.Detach();
//		hRes = BONDI_SET_ERROR(err,"CBondiWidget::Load - COM exception");
		hRes = S_OK;
	}
	catch (...)
	{
		_bstr_t msgCopy("C++ exception");
		*msg = msgCopy.Detach();
		hRes = S_OK;
//		hRes = BONDI_SET_ERROR(E_FAIL,"CBondiWidget::Load - C++ exception");
	}

	return hRes;
}

BOOL CBondiWidget::ProcessSignatures(CPackageResource* resource,BOOL requireChain)
{
	BOOL verified = TRUE;

	// Get all paths to signature???.xml files.
	std::vector<CString> distributorSignatureFiles;
	std::vector<CString> authorSignatureFiles;
	GetSignatures(resource,distributorSignatureFiles,authorSignatureFiles);

	// Vectors to store the signature objects.
	SIG_VEC distributorSignatures;
	SIG_VEC authorSignatures;

	// Attempt to verify each distributor signature xml file.
	// If any one signature fails, the entire widget is invalid.
	for (std::vector<CString>::iterator it = distributorSignatureFiles.begin(); it != distributorSignatureFiles.end() && verified; it++)
	{
		CComObject<CBondiWidgetSignature>* sigVerify = NULL;

		if (CComObject<CBondiWidgetSignature>::CreateInstance(&sigVerify) == S_OK)
		{
			sigVerify->AddRef();
			verified = sigVerify->Verify(resource,_bstr_t(*it),requireChain ? VARIANT_TRUE : VARIANT_FALSE);
			distributorSignatures.push_back(sigVerify);

			sigVerify->Release();
		}
	}

	// Attempt to verify each author signature xml file.
	// If any one signature fails, the entire widget is invalid.
	for (std::vector<CString>::iterator it = authorSignatureFiles.begin(); it != authorSignatureFiles.end() && verified; it++)
	{
		CComObject<CBondiWidgetSignature>* sigVerify = NULL;

		if (CComObject<CBondiWidgetSignature>::CreateInstance(&sigVerify) == S_OK)
		{
			sigVerify->AddRef();
			verified = sigVerify->Verify(resource,_bstr_t(*it),requireChain ? VARIANT_TRUE : VARIANT_FALSE);
			authorSignatures.push_back(sigVerify);

			sigVerify->Release();
		}
	}

	if (verified)
	{
		// All signatures verified => now decide which one to use for policy.
		if (distributorSignatures.size() > 0)
			m_distributorSignature = ChooseSignature(distributorSignatures);

		if (authorSignatures.size() > 0)
			m_authorSignature = ChooseSignature(authorSignatures);
	}

	return verified;
}

IBondiWidgetSignature* CBondiWidget::ChooseSignature(SIG_VEC& list)
{
	// TODO: implement algorithm to decide which of the verified signatures should be used for the policy.
	return list[0];
}

BOOL sigSorter(sigPair first,sigPair second)
{
	return first.first < second.first;
}

int CBondiWidget::IsSignatureFile(CString sigBase,CString& path)
{
	int sigIdx = -1;

	// Get the base name and extension of the file.
	TCHAR fname[_MAX_FNAME];		
	TCHAR ext[_MAX_EXT];
	_tsplitpath_s(path, NULL, 0, NULL, 0, fname, _MAX_FNAME, ext, _MAX_EXT); 

	// Must have an xml extension.
	if (_tcscmp(ext,_T(".xml")) == 0)
	{
		CString name(fname);

		// Check if the base name begins with 'signature'.
		int idx = name.Find(sigBase,0);
		if (idx == 0)
		{
			// Determine the index.
			CString rem = name.Mid(sigBase.GetLength());
			
			BOOL digits = TRUE;
			for (int remIdx = 0; remIdx < rem.GetLength() && digits; remIdx++)
			{
				// Disallow a zero as the first digit.
				if (remIdx == 0 && rem[0] == '0')
					digits = false;
				else
					digits = isdigit(rem[remIdx]);
			}

			if (digits)
			{
				sigIdx = wcstol(rem,NULL,10);
			}
		}
	}

	return sigIdx;
}

/**
* Find all files in the resource matching the digital signature pattern 
* signature" *[0..9] ".xml.
*/
void CBondiWidget::GetSignatures(CPackageResource* resource, std::vector<CString>& distributor, std::vector<CString>& author)
{
	std::vector<sigPair> distributorSignatures;
	std::vector<sigPair> authorSignatures;
	
	// Iterate over all files in the resource.
	int numitems = resource->GetFileCount();
	for (int i=0; i < numitems; i++)
	{ 
		std::wstring resPath = resource->GetFilePath(i);
		_bstr_t conv(resPath.c_str());
		CString path((LPCTSTR)conv);

		// Check for a distributor signature.
		int num = IsSignatureFile((LPCTSTR)sigBaseDistributor,path);
		if (num >= 0)
		{
			sigPair newP(num,path);
			distributorSignatures.push_back(newP);
		}
		else 
		{
			// Check for an author signature.
			num = IsSignatureFile((LPCTSTR)sigBaseAuthor,path);
			if (num >= 0)
			{
				sigPair newP(num,path);
				authorSignatures.push_back(newP);
			}
		}
	}

	// Sort all signature files into ascending order.
	std::sort(distributorSignatures.begin(),distributorSignatures.end(),sigSorter);
	std::sort(authorSignatures.begin(),authorSignatures.end(),sigSorter);

	// Now reduce to a simple ordered file name list.
	distributor.clear();
	for (std::vector<sigPair>::iterator it = distributorSignatures.begin(); it != distributorSignatures.end(); it++)
	{	
		distributor.push_back((*it).second);
	}

	author.clear();
	for (std::vector<sigPair>::iterator it = authorSignatures.begin(); it != authorSignatures.end(); it++)
	{	
		author.push_back((*it).second);
	}
}

STDMETHODIMP CBondiWidget::get_RuntimeId(LONG* pVal)
{
	// TODO: generate proper id.
	*pVal = (LONG)(IBondiWidget*)this;

	return S_OK;
}

STDMETHODIMP CBondiWidget::put_RuntimeId(LONG newVal)
{
	// TODO: Add your implementation code here

	return E_NOTIMPL;
}

STDMETHODIMP CBondiWidget::get_AppSettings(IBondiWidgetAppConfig** pVal)
{
	HRESULT hRes = S_OK;

	try
	{
		if (m_appSettings == NULL && m_installedRoot.length() > 0)
		{
			BONDI_CHECK_ERROR(CComObject<CBondiWidgetAppConfig>::CreateInstance(&m_appSettings),(IBondiWidget*)this);
			m_appSettings->AddRef();
			BONDI_CHECK_ERROR(m_appSettings->Load(m_installedRoot + "\\settings.xml"),(IBondiWidgetAppConfig*)m_appSettings);
		}

		*pVal = m_appSettings;

		if (*pVal != NULL)
			(*pVal)->AddRef();
	}
	catch (_com_error& err)
	{
		hRes = BONDI_SET_ERROR(err,"CBondiWidget::get_AppSettings - COM exception");
		m_appSettings = NULL;
	}
	catch (...)
	{
		hRes = BONDI_SET_ERROR(E_FAIL,"CBondiWidget::get_AppSettings - C++ exception");
		m_appSettings = NULL;
	}

	return hRes;
}

STDMETHODIMP CBondiWidget::get_DistributorDigitalSignature(IBondiWidgetSignature** pVal)
{
	HRESULT hRes = S_OK;

	try
	{
		*pVal = m_distributorSignature;

		if (*pVal != NULL)
			(*pVal)->AddRef();
	}
	catch (_com_error& err)
	{
		hRes = BONDI_SET_ERROR(err,"CBondiWidget::get_DistributorDigitalSignature - COM exception");
		m_appSettings = NULL;
	}
	catch (...)
	{
		hRes = BONDI_SET_ERROR(E_FAIL,"CBondiWidget::get_DistributorDigitalSignature - C++ exception");
		m_appSettings = NULL;
	}

	return hRes;
}

STDMETHODIMP CBondiWidget::get_AuthorDigitalSignature(IBondiWidgetSignature** pVal)
{
	HRESULT hRes = S_OK;

	try
	{
		*pVal = m_authorSignature;

		if (*pVal != NULL)
			(*pVal)->AddRef();
	}
	catch (_com_error& err)
	{
		hRes = BONDI_SET_ERROR(err,"CBondiWidget::get_AuthorDigitalSignature - COM exception");
		m_appSettings = NULL;
	}
	catch (...)
	{
		hRes = BONDI_SET_ERROR(E_FAIL,"CBondiWidget::get_AuthorDigitalSignature - C++ exception");
		m_appSettings = NULL;
	}

	return hRes;
}


std::wstring CBondiWidget::GetFolderLocale(std::wstring& findPath)
{
	std::wstring langCode;

	size_t len = findPath.size()+1;
	TCHAR* cpy = new TCHAR[len];
	_tcscpy(cpy,findPath.c_str());

	TCHAR* tok = _tcstok(cpy,_T("/"));

	std::vector<std::wstring> components;
	while (tok != NULL)
	{
		components.push_back(tok);
		tok = _tcstok(NULL,_T("/"));
	}

	delete[] cpy;

	if (components.size() >= 2 && components[0] == _T("locales") && ValidateLanguageCode(components[1]))
		langCode = components[1];

	return langCode;
}

bool CBondiWidget::ValidateLanguageCode(std::wstring& langCode)
{
	bool valid = false;

	size_t len = langCode.size()+1;
	TCHAR* cpy = new TCHAR[len];
	_tcscpy(cpy,langCode.c_str());

	TCHAR* tok = _tcstok(cpy,_T("-"));

	if (tok != NULL)
	{
		valid = true;

		while (valid && tok != NULL)
		{
			std::wstring component(tok);
			valid = component.find_first_not_of(_T("abcdefghijklmnopqrstuvwxyz")) == std::wstring::npos;

			tok = _tcstok(NULL,_T("-"));
		}
	}

	delete[] cpy;

	return valid;
}

void CBondiWidget::AddBondiLoaders(const TCHAR* sPath, const TCHAR* rootIn) 
{
	HANDLE hFind;    // file handle
	WIN32_FIND_DATA FindFileData;

	TCHAR DirPath[MAX_PATH];
	TCHAR FileName[MAX_PATH];
	TCHAR root[MAX_PATH];

	if (rootIn != NULL)
		_tcscpy(root,rootIn);
	else
		root[0] = 0;

	_tcscat(root,_T("..\\"));

	_tcscpy(DirPath,sPath);
	_tcscat(DirPath,_T("\\*"));    // searching all files
	_tcscpy(FileName,sPath);
	_tcscat(FileName,_T("\\"));

	// find the first file
	hFind = FindFirstFile(DirPath,&FindFileData);
	if (hFind == INVALID_HANDLE_VALUE) 
		return;
	
	_tcscpy(DirPath,FileName);

	bool bSearch = true;
	while (bSearch) 
	{    
		// until we find an entry
		if (!WidgetUtils::IsDots(FindFileData.cFileName) && _tcscmp(_T(".svn"),FindFileData.cFileName) != 0) 
		{		
			_tcscat(FileName,FindFileData.cFileName);

			if ((FindFileData.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY)) 
			{
				// recurse
				AddBondiLoaders(FileName,root);
				_tcscpy(FileName,DirPath);
			}
			else 
			{
				TCHAR ext[MAX_PATH];
				_tsplitpath_s(FileName,NULL,0,NULL,0,NULL,0,ext,MAX_PATH);

				_tcslwr(ext);

				if (_tcscmp(ext,_T(".htm")) == 0 || _tcscmp(ext,_T(".html")) == 0)
					WidgetUtils::InsertBondiLoader(FileName,rootIn);

				_tcscpy(FileName,DirPath);
			}
		}

		if (!FindNextFile(hFind,&FindFileData))
		{
			// no more files there
			if(GetLastError() == ERROR_NO_MORE_FILES)
				bSearch = false;
			else 
			{
				// some error occurred; close the handle and return FALSE
				FindClose(hFind);
				return;
			}
		}
	}

	FindClose(hFind);                  // close the file handle

	return;
}
