#pragma once

#define MAX_COMMAND_LINE_LENGTH 32768
#define MAX_REG_KEY_LENGTH 255
#define MAX_REG_KEY_VALUE_LENGTH 16383

class CEventLogger
{
private:
	static const int buffSize;
	static CEventLogger* instance;
	unsigned long m_threadStorage;
	CString m_appName;

	CEventLogger(const TCHAR* appName);

public:
	~CEventLogger(void);

	static void Initialise(const TCHAR* appName);
	static CEventLogger& Get() { return *instance; }

	void Log(unsigned short type, unsigned long id, ...);
	TCHAR *LookupError(unsigned long error);
};
