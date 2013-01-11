#include "StdAfx.h"
#include "EventLogger.h"
#include "ServiceRunner.h"
#include <tlhelp32.h>

#define HEARTBEAT_INTERVAL 2500

CServiceRunner::CServiceRunner(const TCHAR* serviceName) :
	m_processHandle(NULL),
	m_waitHandle(NULL),
	m_pid(0),
	m_autoRestart(true),
	m_exiting(false),
	m_restartAttempts(0),
	m_forceRestart(false),
	m_restartTimer(NULL)
{
	m_parameters.serviceName = serviceName; 
}

CServiceRunner::~CServiceRunner(void)
{
	Exit(0);
}

void CServiceRunner::Run()
{
	// Create a timer used to wait before restarting node process.
	m_restartTimer = CreateWaitableTimer(0, 1, 0);
	if (!m_restartTimer) 
	{
		CEventLogger::Get().Log(EVENTLOG_WARNING_TYPE, WEBINOS_SERVER_EVENT_CREATEWAITABLETIMER_FAILED, m_parameters.serviceName.c_str(), CEventLogger::Get().LookupError(GetLastError()), 0);
	}

	Start();

	DWORD monitorThreadId;
	m_monitorThreadHandle = CreateThread(NULL, 0, MonitorThread, this, 0, &monitorThreadId);   
}

void CServiceRunner::Start()
{
	assert(m_pid == 0);
	assert(m_processHandle == 0);

	m_forceRestart = false;

	bool logged = false;

	while (StartProcess()) 
	{
		// Service failed to start, usually because of a configuration error - wait before retrying.
		if (!logged)
		{
			CEventLogger::Get().Log(EVENTLOG_WARNING_TYPE, WEBINOS_SERVER_EVENT_RESTART_SERVICE_FAILED, m_parameters.serviceName.c_str(), 0);
			logged = true;
		}
		Sleep(5000);
	}
}

int CServiceRunner::StartProcess()
{
	if (m_processHandle) 
		return 0;

	if (m_restartAttempts > 0)
	{
		DWORD restartWait = min(300000,m_restartAttempts * 5000);

		if (m_restartTimer)
		{
			ZeroMemory(&m_restartTime, sizeof(m_restartTime));
			m_restartTime.QuadPart = 0 - (restartWait * 10000LL);
			SetWaitableTimer(m_restartTimer, &m_restartTime, 0, 0, 0, 0);
			::WaitForSingleObject(m_restartTimer, INFINITE);
		}
		else
		{
			::Sleep(restartWait);
		}
	}

	// STARTUPINFO structure for process
	STARTUPINFO si;
	ZeroMemory(&si, sizeof(si));
	si.cb = sizeof(si);

	// PROCESSINFO structure for process
	PROCESS_INFORMATION pi;
	ZeroMemory(&pi, sizeof(pi));

	// Get process parameters
	CServiceManager smgr;
	if (!smgr.GetUserParameters(m_user) || m_user.appDataPath.length() == 0 || !smgr.GetServiceParameters(m_user,m_parameters))
	{
//		CEventLogger::Get().Log(EVENTLOG_ERROR_TYPE, WEBINOS_SERVER_EVENT_GET_PARAMETERS_FAILED, (LPCTSTR)m_parameters.serviceName, 0);
		return 2;
	}

	// Build process command line with parameters
	TCHAR cmd[MAX_COMMAND_LINE_LENGTH];
	if (_stprintf_s(cmd, _countof(cmd), _T("\"%s\\node.exe\" %s"), m_parameters.nodePath.c_str(), m_parameters.nodeArgs.c_str()) < 0) 
	{
		CEventLogger::Get().Log(EVENTLOG_ERROR_TYPE, WEBINOS_SERVER_EVENT_OUT_OF_MEMORY, _T("creating service command"), _T("StartProcess"), 0);
		return 2;
	}

	// Set the AppData environment variable - the process will inherit this value.
	SetEnvironmentVariable(_T("AppData"),m_user.appDataPath.c_str());
	SetEnvironmentVariable(_T("WRT_HOME"),(m_user.appDataPath + "/webinos/wrt/widgetStore").c_str());

  DWORD pathSize = GetEnvironmentVariable(_T("PATH"), NULL, 0);
  TCHAR* currentPath = new TCHAR[pathSize+1];
  GetEnvironmentVariable(_T("PATH"), currentPath, pathSize);
  
  if (_tcsstr(currentPath,m_parameters.nodePath.c_str()) == NULL)
  {
    DWORD newPathSize = pathSize + m_parameters.nodePath.length() + 1;
    TCHAR* newPath = new TCHAR[newPathSize];
    _stprintf_s(newPath,newPathSize,_T("%s;%s"),m_parameters.nodePath.c_str(), currentPath);
    SetEnvironmentVariable(_T("PATH"),newPath);

    GetEnvironmentVariable(_T("PATH"), newPath, pathSize + m_parameters.nodePath.length() + 1);

    delete[] newPath;
  }

  delete[] currentPath;

	DWORD processFlags = m_parameters.showOutput == 0 ? CREATE_NO_WINDOW : 0;
	if (!CreateProcess(0, cmd, 0, 0, false, processFlags, NULL, m_parameters.workingDirectoryPath.c_str(), &si, &pi)) 
	{
		unsigned long error = GetLastError();
		if (error == ERROR_INVALID_PARAMETER) 
			CEventLogger::Get().Log(EVENTLOG_ERROR_TYPE, WEBINOS_SERVER_EVENT_CREATEPROCESS_FAILED_INVALID_ENVIRONMENT, m_parameters.serviceName.c_str(), cmd, _T("environment"), 0);
		else 
			CEventLogger::Get().Log(EVENTLOG_ERROR_TYPE, WEBINOS_SERVER_EVENT_CREATEPROCESS_FAILED, m_parameters.serviceName.c_str(), cmd, CEventLogger::Get().LookupError(error), 0);

		return 3;
	}

	// Process created - cache handles.
	m_processHandle = pi.hProcess;
	m_pid = pi.dwProcessId;

	CEventLogger::Get().Log(EVENTLOG_INFORMATION_TYPE, WEBINOS_SERVER_EVENT_STARTED_SERVICE, m_parameters.serviceName.c_str(), 0);

	// Give process a chance to start
	if (WaitForSingleObject(m_processHandle, 3000) == WAIT_TIMEOUT) 
	{
		// Process is still running after 3 secs, assume it started OK.
		m_restartAttempts = 0;

		// Register to receive notification when the process exits.
		if (!RegisterWaitForSingleObject(&m_waitHandle, m_processHandle, globalServiceEnded, (void *)this, INFINITE, WT_EXECUTEONLYONCE | WT_EXECUTELONGFUNCTION)) 
		{
			CEventLogger::Get().Log(EVENTLOG_WARNING_TYPE, WEBINOS_SERVER_EVENT_REGISTERWAITFORSINGLEOBJECT_FAILED, m_parameters.serviceName.c_str(), m_parameters.nodePath, CEventLogger::Get().LookupError(GetLastError()), 0);
			return 3;
		}
	}
	else
	{
		// Process has ended already.
		return 3;
	}

	return 0;
}

int CServiceRunner::Exit(unsigned long exitcode) 
{
	m_exiting = true;

	// Clean up.
	if (m_pid)
	{
		KillProcessTree(m_pid, 0);
		m_processHandle = 0;
		m_pid = 0;
	}

	WaitForSingleObject(m_monitorThreadHandle, INFINITE);

	return exitcode;
}

// This is called when the service process exits.
void CServiceRunner::ProcessStopped()
{
	// If we are exiting then ignore this notification.
	if (m_exiting) 
		return;

	// Get the exit code.
	unsigned long exitcode = 0;
	GetExitCodeProcess(m_processHandle, &exitcode);

	// Clean up.
	KillProcess();

	// Is a restart required?
	if (m_autoRestart || m_forceRestart)
	{
		if (!m_forceRestart)
			m_restartAttempts++;

		CEventLogger::Get().Log(EVENTLOG_INFORMATION_TYPE, WEBINOS_SERVER_EVENT_EXIT_RESTART, m_parameters.serviceName.c_str(), 0);

		Start();
	}
	else
	{
		// The process has exited and we don't want a restart, so exit the service here.
		CEventLogger::Get().Log(EVENTLOG_INFORMATION_TYPE, WEBINOS_SERVER_EVENT_EXIT_REALLY, m_parameters.serviceName.c_str(), 0);
		Exit(exitcode);
	}
}

void CServiceRunner::KillProcess()
{
	if (m_pid != 0)
	{
		KillProcessTree(m_pid, 0);

		m_processHandle = 0;
		m_pid = 0;
	}
}

// Helper
// n.b. recursive
void CServiceRunner::KillProcessTree(DWORD myprocID, DWORD dwTimeout)
{
	PROCESSENTRY32 pe;

	memset(&pe, 0, sizeof(PROCESSENTRY32));
	pe.dwSize = sizeof(PROCESSENTRY32);

	HANDLE hSnap = :: CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);

	if (::Process32First(hSnap, &pe))
	{
		BOOL bContinue = TRUE;

		// kill child processes
		while (bContinue)
		{
			if (pe.th32ParentProcessID == myprocID)
			{
				// Recurse
				KillProcessTree(pe.th32ProcessID, dwTimeout);
			}

			bContinue = ::Process32Next(hSnap, &pe);
		}

		// kill the main process
		HANDLE hProc = ::OpenProcess(PROCESS_ALL_ACCESS, FALSE, myprocID);
		if (hProc)
		{
			::TerminateProcess(hProc, 1);
			::CloseHandle(hProc);
		}
	}
}

void CServiceRunner::ForceRestart()
{
	m_forceRestart = true;

	// Kill Process and wait for ProcessStopped to be called.
	KillProcess();
}

void CALLBACK globalServiceEnded(void* context, BOOLEAN TimerOrWaitFired)
{
	// Wait is infinite so should never have timed out.
	assert(TimerOrWaitFired == FALSE);

	CServiceRunner* runner = reinterpret_cast<CServiceRunner*>(context);
	runner->ProcessStopped();
}

DWORD WINAPI MonitorThread(LPVOID lpParam)
{
	CServiceRunner* runner = reinterpret_cast<CServiceRunner*>(lpParam);

	while (!runner->IsExiting())
	{
		// Get the settings that are currently active.
		const CUserParameters& runningUser = runner->GetUser();
		const CServiceParameters& runningParams = runner->GetParameters();

		// Get the settings as stored in the service manager.
		CUserParameters currentUser;
		CServiceParameters currentParams;
		currentParams.serviceName = runningParams.serviceName;

		CServiceManager mgr;
		if (mgr.GetUserParameters(currentUser) && mgr.GetServiceParameters(currentUser,currentParams))
		{
			// If any of the settings have changed restart the node process.
			if (runningUser != currentUser || runningParams != currentParams)
			{
				runner->ForceRestart();
			}
		}
		else
		{
			// Failed to get settings - restart.
			runner->ForceRestart();
		}

		// Indicate the host service is running.
		mgr.WriteServiceHeartbeat(runningParams);

		// Indicate the node process is running.
		if (runner->m_processHandle != NULL)
			mgr.WriteNodeHeartbeat(runningUser, runningParams);

		::Sleep(HEARTBEAT_INTERVAL);
	}

	return 0;
}

