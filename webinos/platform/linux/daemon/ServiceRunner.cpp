/*
 * ServiceRunner.cpp
 *
 *  Created on: 10 Oct 2012
 *      Author: toby
 */
#include "ServiceRunner.h"
#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <pthread.h>
#include <syslog.h>
#include <signal.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <sys/wait.h>
#include "StringStuff.h"

#define HEARTBEAT_INTERVAL 4

void* MonitorThread(void * param);

CServiceRunner::CServiceRunner(std::string serviceName) :
    m_forceRestart(false),
    m_exiting(false),
    m_pid(0),
    m_autoRestart(true),
    m_restartAttempts(0)
{
  m_parameters.serviceName = serviceName;
}

void CServiceRunner::Run()
{
  pthread_t t;
  pthread_create(&t,NULL,MonitorThread,this);

  DoRun();

  m_exiting = true;

  pthread_join(t,NULL);
}

void CServiceRunner::DoRun()
{
  m_forceRestart = false;

  while (StartProcess())
  {
    // Is a restart required?
    if (m_autoRestart || m_forceRestart)
    {
      if (!m_forceRestart)
        m_restartAttempts++;

      syslog(LOG_INFO,"Restarting service %s",m_parameters.serviceName.c_str());
    }
    else
    {
      // We don't want a restart, so exit the service here.
      syslog(LOG_INFO,"Exiting service %s",m_parameters.serviceName.c_str());
      break;
    }

    sleep(5);
  }
}

int CServiceRunner::StartProcess(void)
{
  int ret = 0;

  m_forceRestart = false;

  CServiceManager smgr;
  if (!smgr.GetUserParameters(m_user) || m_user.appDataPath.length() == 0 || !smgr.GetServiceParameters(m_user,m_parameters))
  {
    syslog(LOG_ERR,"Failed to start service %s - bad parameters",m_parameters.serviceName.c_str());
    return 1;
  }

  syslog(LOG_INFO, "Changing working directory to %s",m_parameters.workingDirectoryPath.c_str());
  chdir(m_parameters.workingDirectoryPath.c_str());

  // Build process command line with parameters
  char cmd[1024];
  sprintf(cmd, "%s/node", m_parameters.nodePath.c_str());
  syslog(LOG_INFO,"forking to %s %s",cmd,m_parameters.nodeArgs.c_str());

  std::vector<std::string> args = webinos::split(m_parameters.nodeArgs.c_str(),' ');
  char** argList = new char*[args.size()+2];
  argList[0] = cmd;
  int idx = 1;
  for (std::vector<std::string>::iterator it = args.begin(); it != args.end(); it++)
  {
    argList[idx++] = (char*)(*it).c_str();
  }

  argList[idx] = NULL;

  m_pid = fork();

  switch (m_pid)
  {
    case -1:
      perror("fork");
      syslog(LOG_ERR,"Failed to start service %s - fork failed",m_parameters.serviceName.c_str());
      ret = 2;
      break;
    case 0:
    {
      execv(cmd, argList);
      perror("execv");
      ret = 0;
      break;
    }
    default:
    {
      int status;
      syslog(LOG_NOTICE, "%s - waiting for child to exit", m_parameters.serviceName.c_str());
      if (waitpid(m_pid, &status, 0) != -1)
      {
        syslog(LOG_NOTICE,"%s - child has exited", m_parameters.serviceName.c_str());
      }
      else
      {
        syslog(LOG_ERR,"%s - failed in waitpid", m_parameters.serviceName.c_str());
        perror("waitpid");
      }
      ret = 1;
      break;
    }
  }

  delete[] argList;

  return ret;
}

void CServiceRunner::ForceRestart()
{
  m_forceRestart = true;

  // Kill child process.
  if (m_pid != 0)
  {
    syslog(LOG_INFO, "ForceRestart - killing %d",(int)m_pid);
    kill(m_pid,SIGKILL);
  }
}

void CServiceRunner::CheckForLaunchRequests()
{
  std::vector<std::string> files;
  CServiceManager mgr;
  mgr.GetLaunchFiles(m_user, 2, files);

  for (std::vector<std::string>::iterator it = files.begin(); it != files.end(); it++)
  {
    std::string launch = mgr.ReadFile(*it);

    size_t cmdIdx = launch.find_first_of(':');
    if (cmdIdx != std::string::npos)
    {
      std::string launchType = launch.substr(0,cmdIdx);
      std::string appURI = launch.substr(cmdIdx+1);

      char browserPath[256];
      sprintf(browserPath,"%s/wrt/webinosBrowser",m_parameters.nodePath.c_str());
      char browserParams[256];
      if (launchType == "wgt")
        sprintf(browserParams,"--webinos-widget %s",appURI.c_str());
      else
        sprintf(browserParams,"%s",appURI.c_str());

      pid_t pid = fork();
      if (pid == 0)
      {
        // In child fork - launch browser
        if (execl(browserPath, browserPath, browserParams, NULL) < 0)
        {
          // Failed to execute browser.
          exit(-1);
        }
        else
        {
          // Browser is running.
        }
      }
      else if (pid > 0)
      {
        // In parent after forking.
      }
      else
      {
        // Fork failed
      }
    }

    remove((*it).c_str());
  }
}

void* MonitorThread(void * param)
{
  CServiceRunner* runner = reinterpret_cast<CServiceRunner*>(param);

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
        syslog(LOG_INFO, "MonitorThread forcing restart - params have changed");
        runner->ForceRestart();
      }
    }
    else
    {
      // Failed to get settings - restart.
      syslog(LOG_INFO, "MonitorThread forcing restart - failed to get parameters at path '%s'",currentUser.appDataPath.c_str());
      runner->ForceRestart();
    }

    // Indicate the host service is running.
    mgr.WriteServiceHeartbeat(runningParams);

    // Indicate the node process is running.
    if (runner->m_pid != 0)
    {
      mgr.WriteNodeHeartbeat(runningUser, runningParams);
      runner->CheckForLaunchRequests();
    }

    sleep(HEARTBEAT_INTERVAL);
  }

  return 0;
}
