#pragma once

#include "..\webinosNodeServiceManager\ServiceManager.h"

class CServiceRunner
{
private:
	SERVICE_STATUS m_status;
	SERVICE_STATUS_HANDLE m_serviceHandler;
	HANDLE m_processHandle;
	HANDLE m_waitHandle;
	HANDLE m_restartTimer;
	unsigned long m_pid;
	bool m_autoRestart;
	HANDLE m_monitorThreadHandle;
	bool m_exiting;
	DWORD m_restartAttempts;
	LARGE_INTEGER m_restartTime;
	bool m_forceRestart;

	void Start();
	int StartProcess();
	int Exit(unsigned long exitcode);
	void KillProcess();
	void KillProcessTree(DWORD procID, DWORD dwTimeout);

	DWORD ControlHandler(unsigned long control, unsigned long event, void *data);
	void ProcessStopped();

	friend DWORD WINAPI globalControlHandler(unsigned long control, unsigned long event, void *data, void *context);
	friend void CALLBACK globalServiceEnded(void* context, BOOLEAN TimerOrWaitFired);
	friend DWORD WINAPI MonitorThread(LPVOID lpParam);
	
	CUserParameters m_user;
	CServiceParameters m_parameters;

public:
	CServiceRunner(const TCHAR* serviceName);
	~CServiceRunner(void);

	void Run();
	bool IsExiting() { return m_exiting; }
	const CServiceParameters& GetParameters() { return m_parameters; }
	const CUserParameters& GetUser() { return m_user; }
	void ForceRestart();
};
