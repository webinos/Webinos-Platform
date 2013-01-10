#include "StdAfx.h"
#include "EventLogger.h"
#include "messages.h"

const int CEventLogger::buffSize = 0x4000;
CEventLogger* CEventLogger::instance = NULL;

void CEventLogger::Initialise(const TCHAR* appName)
{
	if (instance == NULL)
	{
		instance = new CEventLogger(appName);
	}
}

CEventLogger::CEventLogger(const TCHAR* appName)
{
	m_appName = appName;

	// Thread storage for error messages.
	m_threadStorage = TlsAlloc();

	TCHAR registryKey[MAX_REG_KEY_LENGTH];
	if (_stprintf_s(registryKey, _countof(registryKey), _T("SYSTEM\\CurrentControlSet\\Services\\EventLog\\Application\\%s"), appName) < 0) 
	{
		Log(EVENTLOG_ERROR_TYPE, WEBINOS_SERVER_EVENT_OUT_OF_MEMORY, _T("creating event log registry"), _T("CEventLogger()"), 0);
	}
	else
	{
		CRegKey key;
		if (ERROR_SUCCESS == key.Create(HKEY_LOCAL_MACHINE, registryKey, 0, REG_OPTION_NON_VOLATILE, KEY_WRITE))
		{
			TCHAR path[MAX_PATH];
			GetModuleFileName(0, path, MAX_PATH);

			// Register for message types.
			RegSetValueEx(key, _T("EventMessageFile"), 0, REG_SZ, (const BYTE*)path, _tcslen(path) + 1);

			unsigned long types = EVENTLOG_INFORMATION_TYPE | EVENTLOG_WARNING_TYPE | EVENTLOG_ERROR_TYPE;
			RegSetValueEx(key, _T("TypesSupported"), 0, REG_DWORD, (PBYTE)&types, sizeof(types));
		}
	}
}

CEventLogger::~CEventLogger(void)
{
	TlsFree(m_threadStorage);
}

void CEventLogger::Log(unsigned short type, unsigned long id, ...) 
{
	HANDLE handle = RegisterEventSource(0, m_appName);
	if (NULL != handle) 
	{
		va_list arg;
		va_start(arg, id);
		
		TCHAR *s;
		TCHAR *strings[6];

		int count = 0;
		while ((s = va_arg(arg, TCHAR *))) 
			strings[count++] = s;

		va_end(arg);
		
		ReportEvent(handle, type, 0, id, 0, count, 0, (const TCHAR **) strings, 0);

		DeregisterEventSource(handle);
	}
}

// Error code to string
TCHAR * CEventLogger::LookupError(unsigned long error) 
{
	// Get thread-safe buffer.
	TCHAR *mess = (TCHAR *)TlsGetValue(m_threadStorage);

	if (!mess) 
	{
		mess = (TCHAR *)LocalAlloc(LPTR, buffSize);
		if (!mess) 
			return _T("!!out of memory creating error message!!");

		TlsSetValue(m_threadStorage, (void *)mess);
	}

	if (!FormatMessage(FORMAT_MESSAGE_FROM_SYSTEM | FORMAT_MESSAGE_IGNORE_INSERTS, 0, error, MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT), (TCHAR *)mess, buffSize, 0)) 
	{	
		if (_stprintf_s(mess, buffSize, _T("Unknown system error %lu"), error) < 0) 
			return 0;
	}

	return mess;
}
