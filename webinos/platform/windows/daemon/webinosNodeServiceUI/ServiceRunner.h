#pragma once

#include "..\webinosNodeServiceManager\ServiceManager.h"

class CServiceRunner
{
private:
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

	void ProcessStopped();

	friend void CALLBACK globalServiceEnded(void* context, BOOLEAN TimerOrWaitFired);
	friend DWORD WINAPI MonitorThread(LPVOID lpParam);
	
  CRuntimeParameters m_runtimeParameters;
	CUserParameters m_user;
	CServiceParameters m_parameters;

public:
	CServiceRunner(CRuntimeParameters& runtimeParams, const TCHAR* serviceName, const TCHAR* serviceFolder);
	~CServiceRunner(void);

	void Run();
  bool IsRunning() { return m_processHandle != NULL; }
	bool IsExiting() { return m_exiting; }
	const CServiceParameters& GetParameters() { return m_parameters; }
	const CUserParameters& GetUser() { return m_user; }
	void ForceRestart();
};
