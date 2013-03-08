#pragma once

#include <string>
#include <vector>

#define WEBINOS_SERVER_EXE "webinosNodeService.exe"
#define WEBINOS_INSTALLED_CONFIG "wrt_config.json"

struct CUserParameters
{
  std::string appDataPath;

  int operator==(const CUserParameters& other) const { return appDataPath == other.appDataPath; }
  int operator!=(const CUserParameters& other) const { return !operator==(other); }
};

struct CRuntimeParameters
{
  CRuntimeParameters()
  {
  }

  std::string serviceName;
  std::string nodePath;
  std::string workingDirectoryPath;
  std::string pzp_nodeArgs;
  std::string pzh_nodeArgs;

  int operator==(const CRuntimeParameters& other) const { return serviceName == other.serviceName && nodePath == other.nodePath && workingDirectoryPath == other.workingDirectoryPath && pzp_nodeArgs == other.pzp_nodeArgs && pzh_nodeArgs == other.pzh_nodeArgs; }
  int operator!=(const CRuntimeParameters& other) const { return !operator==(other); }
};

struct CServiceParameters
{
  CServiceParameters()
  {
    instance = 0;
    showOutput = 0;
    enabled = 0;
  }

  std::string serviceName;
  std::string serviceFolder;
  unsigned long instance;
  unsigned long showOutput;
  unsigned long enabled;

  int operator==(const CServiceParameters& other) const { return serviceName == other.serviceName && instance == other.instance && showOutput == other.showOutput && enabled == other.enabled && serviceFolder == other.serviceFolder; }
  int operator!=(const CServiceParameters& other) const { return !operator==(other); }
};

class CServiceManager
{
private:
  static const std::string pathToNodeKey;
  static const std::string pathToWorkingDirectoryKey;
  static const std::string pathToAppDataKey;
  static const std::string pzp_nodeArgsKey;
  static const std::string pzh_nodeArgsKey;
  static const std::string instanceKey;
  static const std::string showOutputKey;
  static const std::string enabledKey;
  static const std::string trimChars;
  static const char jsonParamDelim;

  bool GetUserSettingsPath(const CUserParameters& params, const CServiceParameters& serviceParams, std::string& settingsPath, bool getWRTFolder=true);
  void WriteJSONKey(std::ofstream& fs, std::string keyName, std::string keyVal, bool final=false);
  unsigned long GetLastWriteTimeElapsed(std::string path);
  bool CreateDirectory(std::string path);
  void CreateSharedFile(std::string path);
  std::string GetInstalledPath();

public:
  CServiceManager(void);
  ~CServiceManager(void);
  
  bool GetRuntimeParameters(CRuntimeParameters& params);
  bool GetUserParameters(CUserParameters& params);
  bool GetServiceParameters(CUserParameters&,CServiceParameters&);
  bool SetServiceParameters(CUserParameters&,CServiceParameters&);
  void WriteServiceHeartbeat(const CUserParameters& user,const CServiceParameters& params);
  void WriteNodeHeartbeat(const CUserParameters& user,const CServiceParameters& params);
  unsigned long GetServiceHeartbeatTime(const CUserParameters& user, const CServiceParameters& params);
  unsigned long GetNodeHeartbeatTime(const CUserParameters& user,const CServiceParameters& params);
  void GetLaunchFiles(const CUserParameters& user,const CServiceParameters& params, long allowedTimespan , std::vector<std::string> &out);
  std::string ReadFile(std::string path);
  bool DeleteServiceFolder(const CUserParameters& user, const CServiceParameters& params);
};
