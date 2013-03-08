#if defined(WIN32)
#include "StdAfx.h"
#include "messages.h"
#include <shlobj.h>
#include <ShellAPI.h>
#else
#include <errno.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <syslog.h>
#include <dirent.h>
#endif

#include "ServiceManager.h"
#include <fstream>
#include <streambuf>
#include <cstdlib>
#include <climits>
#include "StringStuff.h"

const std::string CServiceManager::pathToNodeKey = "nodePath";
const std::string CServiceManager::pathToWorkingDirectoryKey = "workingDirectoryPath";
const std::string CServiceManager::pathToAppDataKey = "appDataPath";
const std::string CServiceManager::pzp_nodeArgsKey = "pzp_nodeArgs";
const std::string CServiceManager::pzh_nodeArgsKey = "pzh_nodeArgs";
const std::string CServiceManager::instanceKey = "instance";
const std::string CServiceManager::showOutputKey = "showOutput";
const std::string CServiceManager::enabledKey = "enabled";
const char CServiceManager::jsonParamDelim = ',';
const std::string CServiceManager::trimChars = "\r\n\t \"";

#if defined(WIN32)
const std::string configFolder = "webinos";
const std::string pathSeparator = "\\";
#else
const std::string configFolder = ".webinos";
const std::string pathSeparator = "/";
#endif

CServiceManager::CServiceManager(void)
{
}

CServiceManager::~CServiceManager(void)
{
}

std::string CServiceManager::ReadFile(std::string path)
{
  std::string str;

  std::ifstream t(path.c_str(), std::ifstream::in);
  if (t.is_open())
  {
    str = std::string((std::istreambuf_iterator<char>(t)), std::istreambuf_iterator<char>());
    t.close();
  }
  else
    str = "";

  return str;
}

bool CServiceManager::CreateDirectory(std::string path)
{
#if defined(WIN32)
  return 0 != ::CreateDirectory(path.c_str(),NULL) || ::GetLastError() == ERROR_ALREADY_EXISTS;
#else
  struct stat sb;
  bool res = false;

  if (stat(path.c_str(), &sb) != -1)
  {
    if (sb.st_mode & S_IFDIR)
    {
      res = true;
    }
  }
  else
  {
    res = mkdir(path.c_str(), 0777) == 0 || errno == EEXIST;
  }

  int err = errno;
  return res;
#endif
}

void CServiceManager::CreateSharedFile(std::string path)
{
#if defined(WIN32)
  // For Windows we need to make sure all users can write to this file.
  // We achieve this by setting a security descriptor
  BYTE sd[SECURITY_DESCRIPTOR_MIN_LENGTH];
  SECURITY_ATTRIBUTES sa;

  sa.nLength = sizeof(sa);
  sa.bInheritHandle = TRUE;
  sa.lpSecurityDescriptor = &sd;

  InitializeSecurityDescriptor(&sd, SECURITY_DESCRIPTOR_REVISION);
  SetSecurityDescriptorDacl(&sd, TRUE, NULL, FALSE);

  HANDLE hFile = ::CreateFile(path.c_str(),GENERIC_WRITE,0,&sa,CREATE_ALWAYS,FILE_ATTRIBUTE_NORMAL,NULL);
  if (hFile != INVALID_HANDLE_VALUE)
    ::CloseHandle(hFile);
#else
  // Do nothing - not necessary on Linux
#endif
}

bool CServiceManager::GetRuntimeParameters(CRuntimeParameters& params)
{
  bool ok = false;

  // Build the path to the json config file.
  std::string runtimeConfigPath = GetInstalledPath();
  runtimeConfigPath += WEBINOS_INSTALLED_CONFIG;

  std::string parse = ReadFile(runtimeConfigPath);

  // Strip outer object delimiters.
  webinos::trim(parse,std::string("\r\n\t {}"));

  std::vector<std::string> toks = webinos::split(parse.c_str(), jsonParamDelim);
  for (std::vector<std::string>::iterator it = toks.begin(); it != toks.end(); it++)
  {
    std::string& tok = *it;
    if (tok.length() == 0)
      continue;

    webinos::trim(tok,trimChars);

    int kvPos = tok.find_first_of(':');
    std::string tmp = tok.substr(0,kvPos);
    std::string kvTok = webinos::trim(tmp,std::string("\" "));
    if (kvTok == pathToNodeKey)
    {
      tmp = tok.substr(kvPos+1);
      params.nodePath = webinos::trim(tmp,trimChars);

      // Un-escape path separator backslashes.          
      webinos::replace(params.nodePath,std::string("\\\\"),std::string("\\"));
    }

    if (kvTok == pathToWorkingDirectoryKey)
    {
      tmp = tok.substr(kvPos+1);
      params.workingDirectoryPath = webinos::trim(tmp,trimChars);

      // Un-escape path separator backslashes.
      webinos::replace(params.workingDirectoryPath,std::string("\\\\"),std::string("\\"));
    }

    if (kvTok == pzp_nodeArgsKey)
    {
      tmp = tok.substr(kvPos+1);
      params.pzp_nodeArgs = webinos::trim(tmp,trimChars);

      // Un-escape double quotes.
      webinos::replace(params.pzp_nodeArgs,std::string("\\\""),std::string("\""));
      webinos::replace(params.pzp_nodeArgs,std::string("\\"),std::string("\""));
    }

    if (kvTok == pzh_nodeArgsKey)
    {
      tmp = tok.substr(kvPos+1);
      params.pzh_nodeArgs = webinos::trim(tmp,trimChars);

      // Un-escape double quotes.
      webinos::replace(params.pzh_nodeArgs,std::string("\\\""),std::string("\""));
      webinos::replace(params.pzh_nodeArgs,std::string("\\"),std::string("\""));
    }
  }

  return ok;
}

// Read settings from the users configuration file for the service.
// Don't have a full-on json parser so we just do it manually for the time being (apologies).
bool CServiceManager::GetServiceParameters(CUserParameters& user, CServiceParameters& params)
{
  bool ok = false;

  std::string serviceConfigPath;
  if (GetUserSettingsPath(user, params, serviceConfigPath))
  {
    // Build the path to the json config file (made up of the service name).
    serviceConfigPath += pathSeparator + std::string(params.serviceName) + std::string(".json");

    std::string parse = ReadFile(serviceConfigPath);

    // Strip outer object delimiters.
    webinos::trim(parse,std::string("\r\n\t {}"));

    std::vector<std::string> toks = webinos::split(parse.c_str(), jsonParamDelim);
    for (std::vector<std::string>::iterator it = toks.begin(); it != toks.end(); it++)
    {
      std::string& tok = *it;
      if (tok.length() == 0)
        continue;

      webinos::trim(tok,trimChars);

      int kvPos = tok.find_first_of(':');
      std::string tmp = tok.substr(0,kvPos);
      std::string kvTok = webinos::trim(tmp,std::string("\" "));

      if (kvTok == instanceKey)
      {
        tmp = tok.substr(kvPos+1);
        std::string inst = webinos::trim(tmp,trimChars);
        params.instance = atol(inst.c_str());
      }

      if (kvTok == showOutputKey)
      {
        tmp = tok.substr(kvPos+1);
        std::string showOutput = webinos::trim(tmp,trimChars);
        params.showOutput = atol(showOutput.c_str());
      }

      if (kvTok == enabledKey)
      {
        tmp = tok.substr(kvPos+1);
        std::string enabled = webinos::trim(tmp,trimChars);
        params.enabled = atol(enabled.c_str());
      }
    }

    ok = true;
  }
  else
    ok = false;

  return ok;
}

bool CServiceManager::SetServiceParameters(CUserParameters& user,CServiceParameters& params)
{
  bool ok = false;

  std::string serviceConfigPath;
  if (GetUserSettingsPath(user, params, serviceConfigPath))
  {
    serviceConfigPath += pathSeparator + std::string(params.serviceName) + std::string(".json");

    std::ofstream fs(serviceConfigPath.c_str());

    if (fs)
    {
      fs << "{";

      char val[256];
      sprintf(val,"%ld",params.instance);
      WriteJSONKey(fs,instanceKey,val);

      sprintf(val,"%ld",params.showOutput);
      WriteJSONKey(fs,showOutputKey,val);

      sprintf(val,"%ld",params.enabled);
      WriteJSONKey(fs,enabledKey,val,true);

      fs << "}";

      fs.close();

      ok = true;
    }
  }
  else
    ok = false;

  return ok;
}

// Get the path to the current users' configuration folder.
bool CServiceManager::GetUserParameters(CUserParameters& params)
{
  bool ok = false;

  // Get the current AppData folder for the webinos PZP service to reflect the current user name.
  TCHAR appData[MAX_PATH];
  if (0 != ::GetEnvironmentVariable(_T("AppData"), appData, _countof(appData)))
  {
    params.appDataPath = appData;
    ok = true;
  }

  return ok;
}

void CServiceManager::WriteJSONKey(std::ofstream& fs, std::string keyName, std::string keyVal, bool final)
{
  fs << "\"" << keyName << "\" : \"" << keyVal << "\"";

  if (!final)
    fs << ",";
}

std::string CServiceManager::GetInstalledPath()
{
  HMODULE hModule = GetModuleHandle(NULL);

  char path[MAX_PATH];
  GetModuleFileName(hModule, path, MAX_PATH);

  char drive[_MAX_DRIVE];
  char directory[MAX_PATH];
  _splitpath(path,drive,directory,NULL,NULL);

  sprintf(path,"%s%s",drive,directory);

  return path;
}

//
// Get the path to the users webinos wrt configuration folder.
// This is currently of the form %APPDATA%/webinos/wrt
//
bool CServiceManager::GetUserSettingsPath(const CUserParameters& params, const CServiceParameters& serviceParams, std::string& settingsPath, bool getWRTFolder)
{
  settingsPath.clear();

  // Make sure the webinos sub-folder exists.
  std::string path = params.appDataPath + pathSeparator + serviceParams.serviceFolder;

  if (CreateDirectory(path))
  {
    settingsPath = path;

    // Make sure the wrt sub-folder exists.
    path = path + pathSeparator + std::string("wrt");
    if (CreateDirectory(path))
    {
      if (getWRTFolder)
        settingsPath = path;
    }
  }

  return settingsPath.length() > 0;
}

void CServiceManager::WriteServiceHeartbeat(const CUserParameters& user, const CServiceParameters& params)
{
  std::string serviceConfigPath;
  if (GetUserSettingsPath(user,params,serviceConfigPath))
  {
    serviceConfigPath += pathSeparator + params.serviceName + std::string(".server.hb");

    CreateSharedFile(serviceConfigPath.c_str());

    std::ofstream fs(serviceConfigPath.c_str());
    if (fs)
    {
      fs << "x";
      fs.close();

    }
  }
}

void CServiceManager::WriteNodeHeartbeat(const CUserParameters& user,const CServiceParameters& params)
{
  std::string settingsPath;
  if (GetUserSettingsPath(user,params, settingsPath))
  {
    settingsPath += pathSeparator + params.serviceName + std::string(".hb");

    std::ofstream fs(settingsPath.c_str());
    if (fs)
    {
      fs << "x";
      fs.close();

    }
  }
}

unsigned long CServiceManager::GetLastWriteTimeElapsed(std::string path)
{
  unsigned long elapsed = ULONG_MAX;

#if defined(WIN32)
  HANDLE hFile = ::CreateFile(path.c_str(),GENERIC_READ,0,NULL,OPEN_EXISTING,FILE_ATTRIBUTE_NORMAL,NULL);
  if (hFile != INVALID_HANDLE_VALUE)
  {
    union timeunion
    {
      FILETIME fileTime;
      ULARGE_INTEGER ul;
    } ;

    // Retrieve the file times for the file.
    timeunion ftCreate, ftAccess, ftWrite;
    if (GetFileTime(hFile, &ftCreate.fileTime, &ftAccess.fileTime, &ftWrite.fileTime))
    {
      // Get current time.
      SYSTEMTIME utcNow;
      GetSystemTime(&utcNow);

      timeunion ftNow;
      SystemTimeToFileTime(&utcNow, &ftNow.fileTime);

      elapsed = (ftNow.ul.QuadPart - ftWrite.ul.QuadPart) / 10000000;
    }

    ::CloseHandle(hFile);
  }
#else
  struct stat sb;

  if (stat(path.c_str(), &sb) != -1)
  {
    elapsed = sb.st_atime;
  }
#endif

  return elapsed;
}

unsigned long  CServiceManager::GetServiceHeartbeatTime(const CUserParameters& user, const CServiceParameters& params)
{
  unsigned long  ret = ULONG_MAX;

  std::string serviceConfigPath;
  if (GetUserSettingsPath(user,params,serviceConfigPath))
  {
    serviceConfigPath += pathSeparator + params.serviceName + std::string(".server.hb");
    ret = GetLastWriteTimeElapsed(serviceConfigPath);
  }

  return ret;
}

unsigned long CServiceManager::GetNodeHeartbeatTime(const CUserParameters& user, const CServiceParameters& params)
{
  unsigned long  ret = ULONG_MAX;

  std::string serviceConfigPath;
  if (GetUserSettingsPath(user,params,serviceConfigPath))
  {
    serviceConfigPath += pathSeparator + params.serviceName + std::string(".hb");
    ret = GetLastWriteTimeElapsed(serviceConfigPath);
  }

  return ret;
}

bool CServiceManager::DeleteServiceFolder(const CUserParameters& user, const CServiceParameters& params)
{
  std::string path;
  bool ok = false;

  if (GetUserSettingsPath(user,params,path,false))
  {
    SHFILEOPSTRUCT fos = {0};
    char dir[MAX_PATH+1];

    strcpy(dir,path.c_str());

    // Need to add addtional terminator for SHFileOperation.
    dir[path.length() + 1] = 0;

    // Delete the folder completely.
    fos.wFunc = FO_DELETE;
    fos.pFrom = dir;
    fos.fFlags = FOF_NO_UI;
    ok = SHFileOperation( &fos );  
  }

  return ok;
}

void CServiceManager::GetLaunchFiles(const CUserParameters& user, const CServiceParameters& params, long allowedTimespan, std::vector<std::string> &out)
{
  std::string directory;
  GetUserSettingsPath(user,params,directory);

#if defined(WIN32)
  SYSTEMTIME timeNow;
  GetSystemTime(&timeNow);
  FILETIME fileTimeNow;
  SystemTimeToFileTime(&timeNow,&fileTimeNow);
  ULONGLONG timeNowLong = (((ULONGLONG)fileTimeNow.dwHighDateTime) << 32) + fileTimeNow.dwLowDateTime;

  HANDLE dir;
  WIN32_FIND_DATA file_data;

  if ((dir = FindFirstFile((directory + "\\*.launch").c_str(), &file_data)) == INVALID_HANDLE_VALUE)
    return; /* No files found */

  do 
  {
    const bool is_directory = (file_data.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY) != 0;

    if (is_directory)
      continue;

    const std::string file_name = file_data.cFileName;
    const std::string full_file_name = directory + "/" + file_name;
    const std::string failed_file_name = full_file_name + ".failed";

    ULONGLONG fileTimeLong = (((ULONGLONG)file_data.ftCreationTime.dwHighDateTime) << 32) + file_data.ftCreationTime.dwLowDateTime;

    if (timeNowLong < fileTimeLong)
    {
      // File creation time invalid (in the future).
      ::MoveFile(full_file_name.c_str(),failed_file_name.c_str());
    }
    else if (timeNowLong - fileTimeLong > (allowedTimespan * 100000000))
    {
      // File too old.
      ::MoveFile(full_file_name.c_str(),failed_file_name.c_str());
    }
    else
    {
      out.push_back(full_file_name);
    }
  } 
  while (FindNextFile(dir, &file_data));

  FindClose(dir);
#else
  DIR *dir;
  class dirent *ent;
  class stat st;
  time_t currentTime = time(NULL);

  dir = opendir(directory.c_str());
  while ((ent = readdir(dir)) != NULL) 
  {
    const std::string file_name = ent->d_name;
    const std::string full_file_name = directory + "/" + file_name;
    const std::string failed_file_name = full_file_name + ".failed";

    if (stat(full_file_name.c_str(), &st) == -1)
      continue;

    const bool is_directory = (st.st_mode & S_IFDIR) != 0;
    if (is_directory)
      continue;

    size_t extIdx = file_name.find_last_of('.');
    if (extIdx == std::string::npos || file_name.substr(extIdx+1) != std::string("launch"))
      continue;

    if (currentTime < st.st_ctime)
    {
      // File creation time invalid (in the future).
      rename(full_file_name.c_str(), failed_file_name.c_str());
    }
    else if (currentTime - st.st_ctime > allowedTimespan)
    {
      // File too old.
      rename(full_file_name.c_str(), failed_file_name.c_str());
    }
    else
    {
      out.push_back(full_file_name);
    }
  }
  closedir(dir);
#endif
}
