#pragma once

#include <string>
#include <vector>

#define WEBINOS_SERVER_EXE "webinosNodeService.exe"

struct CUserParameters
{
	std::string appDataPath;

	int operator==(const CUserParameters& other) const { return appDataPath == other.appDataPath; }
	int operator!=(const CUserParameters& other) const { return !operator==(other); }
};

struct CServiceParameters
{
	std::string serviceName;
	std::string nodePath;
	std::string workingDirectoryPath;
	std::string nodeArgs;
	unsigned long instance;

	int operator==(const CServiceParameters& other) const { return serviceName == other.serviceName && nodePath == other.nodePath && workingDirectoryPath == other.workingDirectoryPath && nodeArgs == other.nodeArgs && instance == other.instance; }
	int operator!=(const CServiceParameters& other) const { return !operator==(other); }
};

class CServiceManager
{
private:
	static const std::string pathToNodeKey;
	static const std::string pathToWorkingDirectoryKey;
	static const std::string pathToAppDataKey;
	static const std::string nodeArgsKey;
	static const std::string instanceKey;
  static const std::string trimChars;
  static const char jsonParamDelim;

	bool GetUserSettingsPath(const CUserParameters& params, std::string& settingsPath);
	bool GetCommonSettingsPath(std::string& ipcPath);
  void WriteJSONKey(std::ofstream& fs, std::string keyName, std::string keyVal, bool final=false);
  unsigned long GetLastWriteTimeElapsed(std::string path);
  bool CreateDirectory(std::string path);
  void CreateSharedFile(std::string path);

public:
	CServiceManager(void);
	~CServiceManager(void);

	bool GetUserParameters(CUserParameters& params);
	bool SetUserParameters(std::string);
	bool SetUserParameters(CUserParameters& params);
	bool GetServiceParameters(CUserParameters&,CServiceParameters&);
	bool SetServiceParameters(CUserParameters&,CServiceParameters&);
	bool ClearUserParameters();
	void WriteServiceHeartbeat(const CServiceParameters& params);
	void WriteNodeHeartbeat(const CUserParameters& user,const CServiceParameters& params);
	unsigned long GetServiceHeartbeatTime(const CServiceParameters& params);
	unsigned long GetNodeHeartbeatTime(const CUserParameters& user,const CServiceParameters& params);
  void GetLaunchFiles(const CUserParameters& user,long allowedTimespan , std::vector<std::string> &out);
  std::string ReadFile(std::string path);
};
