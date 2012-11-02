// PZPService.cpp : main source file for PZPService.exe
//

#include "stdafx.h"

#include "EventLogger.h"
#include "ServiceRunner.h"

/* Service initialisation */
void WINAPI serviceMain(unsigned long argc, TCHAR **argv) 
{
#if defined(DEBUG)
	::Sleep(20000);
#endif

	CServiceRunner* svcRunner = new  CServiceRunner(argv[0]);

	try
	{
		svcRunner->Run();
	}
	catch (...)
	{
	}
}

int WINAPI _tWinMain(HINSTANCE hInstance, HINSTANCE /*hPrevInstance*/, LPTSTR lpstrCmdLine, int nCmdShow)
{
	int nRet = 0;

	CEventLogger::Initialise(WEBINOS_SERVER_EXE);

	// Start service
	SERVICE_TABLE_ENTRY serviceInfo[] = { { WEBINOS_SERVER_EXE, serviceMain }, { 0, 0 } };

	if (!StartServiceCtrlDispatcher(serviceInfo)) 
	{
		unsigned long error = GetLastError();
		CEventLogger::Get().Log(EVENTLOG_ERROR_TYPE, WEBINOS_SERVER_EVENT_DISPATCHER_FAILED, CEventLogger::Get().LookupError(error), 0);
	}

	return nRet;
}
