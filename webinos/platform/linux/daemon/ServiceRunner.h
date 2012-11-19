/*
 * ServiceRunner.h
 *
 *  Created on: 10 Oct 2012
 *      Author: toby
 */

#ifndef SERVICERUNNER_H_
#define SERVICERUNNER_H_

#include "ServiceManager.h"

class CServiceRunner
{
private:
  CUserParameters m_user;
  CServiceParameters m_parameters;
  bool m_exiting;
  bool m_forceRestart;
  pid_t m_pid;
  bool m_autoRestart;

  unsigned long m_restartAttempts;

  void DoRun(void);
  int StartProcess(void);

  friend void* MonitorThread(void * param);

public:
  CServiceRunner(std::string serviceName);

  void Run();
  bool IsExiting() { return m_exiting; }
  void ForceRestart();


  const CServiceParameters& GetParameters() { return m_parameters; }
  const CUserParameters& GetUser() { return m_user; }
};


#endif /* SERVICERUNNER_H_ */
