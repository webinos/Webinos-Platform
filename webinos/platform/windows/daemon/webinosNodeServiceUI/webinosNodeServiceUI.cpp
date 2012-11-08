// webinosNodeServiceUI.cpp : main source file for webinosNodeServiceUI.exe
//

#include "stdafx.h"
#include "resource.h"
#include "WebinosUI.h"
#include "..\webinosNodeServiceManager\ServiceManager.h"

CAppModule _Module;

int Run(LPTSTR /*lpstrCmdLine*/ = NULL, int nCmdShow = SW_SHOWDEFAULT)
{
	CMessageLoop theLoop;
	_Module.AddMessageLoop(&theLoop);

	CWebinosUI dlgMain;

	if(dlgMain.Create(NULL) == NULL)
	{
		ATLTRACE(_T("Main dialog creation failed!\n"));
		return 0;
	}

	dlgMain.ShowWindow(SW_HIDE);

	int nRet = theLoop.Run();

	_Module.RemoveMessageLoop();
	return nRet;
}

int WINAPI _tWinMain(HINSTANCE hInstance, HINSTANCE /*hPrevInstance*/, LPTSTR lpstrCmdLine, int nCmdShow)
{
	int nRet = 0;

	// Prevent multiple instances running in any given user session.
	HANDLE mut = ::CreateMutex(NULL,TRUE,_T("Local\\webinosNodeServiceUI"));
	if (mut != NULL && GetLastError() != ERROR_ALREADY_EXISTS)
	{
		HRESULT hRes = ::CoInitialize(NULL);
		ATLASSERT(SUCCEEDED(hRes));

		// this resolves ATL window thunking problem when Microsoft Layer for Unicode (MSLU) is used
		::DefWindowProc(NULL, 0, 0, 0L);

		AtlInitCommonControls(ICC_BAR_CLASSES);

		hRes = _Module.Init(NULL, hInstance);
		ATLASSERT(SUCCEEDED(hRes));

		nRet = Run(lpstrCmdLine, nCmdShow);

		_Module.Term();
		::CoUninitialize();
	}

	if (mut != NULL)
		::CloseHandle(mut);

	return nRet;
}
