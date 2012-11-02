//
//  Values are 32 bit values laid out as follows:
//
//   3 3 2 2 2 2 2 2 2 2 2 2 1 1 1 1 1 1 1 1 1 1
//   1 0 9 8 7 6 5 4 3 2 1 0 9 8 7 6 5 4 3 2 1 0 9 8 7 6 5 4 3 2 1 0
//  +---+-+-+-----------------------+-------------------------------+
//  |Sev|C|R|     Facility          |               Code            |
//  +---+-+-+-----------------------+-------------------------------+
//
//  where
//
//      Sev - is the severity code
//
//          00 - Success
//          01 - Informational
//          10 - Warning
//          11 - Error
//
//      C - is the Customer code flag
//
//      R - is a reserved bit
//
//      Facility - is the facility code
//
//      Code - is the facility's status code
//
//
// Define the facility codes
//


//
// Define the severity codes
//


//
// MessageId: WEBINOS_SERVER_EVENT_DISPATCHER_FAILED
//
// MessageText:
//
// StartServiceCtrlDispatcher() failed:
// %1
//
#define WEBINOS_SERVER_EVENT_DISPATCHER_FAILED 0xC00003E9L

//
// MessageId: WEBINOS_SERVER_EVENT_OPENSCMANAGER_FAILED
//
// MessageText:
//
// Unable to connect to service manager!
// Perhaps you need to be an administrator...
//
#define WEBINOS_SERVER_EVENT_OPENSCMANAGER_FAILED 0xC00003EAL

//
// MessageId: WEBINOS_SERVER_EVENT_OUT_OF_MEMORY
//
// MessageText:
//
// Out of memory for %1 in %2!
//
#define WEBINOS_SERVER_EVENT_OUT_OF_MEMORY 0xC00003EBL

//
// MessageId: WEBINOS_SERVER_EVENT_GET_PARAMETERS_FAILED
//
// MessageText:
//
// Failed to get startup parameters for service %1.
//
#define WEBINOS_SERVER_EVENT_GET_PARAMETERS_FAILED 0xC00003ECL

//
// MessageId: WEBINOS_SERVER_EVENT_REGISTERSERVICECTRLHANDER_FAILED
//
// MessageText:
//
// RegisterServiceCtrlHandlerEx() failed:
// %1
//
#define WEBINOS_SERVER_EVENT_REGISTERSERVICECTRLHANDER_FAILED 0xC00003EDL

//
// MessageId: WEBINOS_SERVER_EVENT_START_SERVICE_FAILED
//
// MessageText:
//
// Can't start %1 for service %2.
// Error code: %3.
//
#define WEBINOS_SERVER_EVENT_START_SERVICE_FAILED 0xC00003EEL

//
// MessageId: WEBINOS_SERVER_EVENT_RESTART_SERVICE_FAILED
//
// MessageText:
//
// Failed to start %1.
// Sleeping...
//
#define WEBINOS_SERVER_EVENT_RESTART_SERVICE_FAILED 0x800003EFL

//
// MessageId: WEBINOS_SERVER_EVENT_STARTED_SERVICE
//
// MessageText:
//
// Started %1.
//
#define WEBINOS_SERVER_EVENT_STARTED_SERVICE 0x400003F0L

//
// MessageId: WEBINOS_SERVER_EVENT_REGISTERWAITFORSINGLEOBJECT_FAILED
//
// MessageText:
//
// Service %1 may claim to be still running when %2 exits.
// RegisterWaitForSingleObject() failed:
// %3
//
#define WEBINOS_SERVER_EVENT_REGISTERWAITFORSINGLEOBJECT_FAILED 0x800003F1L

//
// MessageId: WEBINOS_SERVER_EVENT_CREATEPROCESS_FAILED
//
// MessageText:
//
// Failed to start service %1.  Program %2 couldn't be launched.
// CreateProcess() failed:
// %3
//
#define WEBINOS_SERVER_EVENT_CREATEPROCESS_FAILED 0xC00003F2L

//
// MessageId: WEBINOS_SERVER_EVENT_TERMINATEPROCESS
//
// MessageText:
//
// Killing process %2 because service %1 is stopping.
//
#define WEBINOS_SERVER_EVENT_TERMINATEPROCESS 0x400003F3L

//
// MessageId: WEBINOS_SERVER_EVENT_PROCESS_ALREADY_STOPPED
//
// MessageText:
//
// Requested stop of service %1.  No action is required as program %2 is not running.
//
#define WEBINOS_SERVER_EVENT_PROCESS_ALREADY_STOPPED 0x400003F4L

//
// MessageId: WEBINOS_SERVER_EVENT_ENDED_SERVICE
//
// MessageText:
//
// Program %1 for service %2 exited with return code %3.
//
#define WEBINOS_SERVER_EVENT_ENDED_SERVICE 0x400003F5L

//
// MessageId: WEBINOS_SERVER_EVENT_EXIT_RESTART
//
// MessageText:
//
// Restarting service %1.
//
#define WEBINOS_SERVER_EVENT_EXIT_RESTART 0x400003F6L

//
// MessageId: WEBINOS_SERVER_EVENT_EXIT_IGNORE
//
// MessageText:
//
// Service %1 action for exit code %2 is %3.
// No action will be taken to restart %4.
//
#define WEBINOS_SERVER_EVENT_EXIT_IGNORE 0x400003F7L

//
// MessageId: WEBINOS_SERVER_EVENT_EXIT_REALLY
//
// MessageText:
//
// Service %1 is exiting.
//
#define WEBINOS_SERVER_EVENT_EXIT_REALLY 0x400003F8L

//
// MessageId: WEBINOS_SERVER_EVENT_OPENKEY_FAILED
//
// MessageText:
//
// Failed to open registry key HKLM\%1:
// %2
//
#define WEBINOS_SERVER_EVENT_OPENKEY_FAILED 0xC00003F9L

//
// MessageId: WEBINOS_SERVER_EVENT_QUERYVALUE_FAILED
//
// MessageText:
//
// Failed to read registry value %1:
// %2
//
#define WEBINOS_SERVER_EVENT_QUERYVALUE_FAILED 0xC00003FAL

//
// MessageId: WEBINOS_SERVER_EVENT_SETVALUE_FAILED
//
// MessageText:
//
// Failed to write registry value %1:
// %2
//
#define WEBINOS_SERVER_EVENT_SETVALUE_FAILED 0xC00003FBL

//
// MessageId: WEBINOS_SERVER_EVENT_EXIT_UNCLEAN
//
// MessageText:
//
// Service %1 action for exit code %2 is %3.
// Exiting.
//
#define WEBINOS_SERVER_EVENT_EXIT_UNCLEAN 0x400003FCL

//
// MessageId: WEBINOS_SERVER_EVENT_GRACEFUL_SUICIDE
//
// MessageText:
//
// Service %1 application %2 exited with exit code 0 but the default exit action is %3.
// Honouring the %4 action would result in the service being flagged as failed and subject to recovery actions.
// The service will instead be stopped gracefully.  To suppress this message, explicitly configure the exit action for exit code 0 to either %5 or %6.
//
#define WEBINOS_SERVER_EVENT_GRACEFUL_SUICIDE 0x400003FDL

//
// MessageId: WEBINOS_SERVER_EVENT_EXPANDENVIRONMENTSTRINGS_FAILED
//
// MessageText:
//
// Failed to expand registry value %1:
// %2
//
#define WEBINOS_SERVER_EVENT_EXPANDENVIRONMENTSTRINGS_FAILED 0xC00003FEL

//
// MessageId: WEBINOS_SERVER_EVENT_KILLING
//
// MessageText:
//
// Killing process tree of process %2 for service %1 with exit code %3
//
#define WEBINOS_SERVER_EVENT_KILLING     0x400003FFL

//
// MessageId: WEBINOS_SERVER_EVENT_CREATETOOLHELP32SNAPSHOT_PROCESS_FAILED
//
// MessageText:
//
// Failed to create snapshot of running processes when terminating service %1:
// %2
//
#define WEBINOS_SERVER_EVENT_CREATETOOLHELP32SNAPSHOT_PROCESS_FAILED 0xC0000400L

//
// MessageId: WEBINOS_SERVER_EVENT_PROCESS_ENUMERATE_FAILED
//
// MessageText:
//
// Failed to enumerate running processes when terminating service %1:
// %2
//
#define WEBINOS_SERVER_EVENT_PROCESS_ENUMERATE_FAILED 0xC0000401L

//
// MessageId: WEBINOS_SERVER_EVENT_OPENPROCESS_FAILED
//
// MessageText:
//
// Failed to open process handle for process with PID %1 when terminating service %2:
// %3
//
#define WEBINOS_SERVER_EVENT_OPENPROCESS_FAILED 0xC0000402L

//
// MessageId: WEBINOS_SERVER_EVENT_KILL_PROCESS_TREE
//
// MessageText:
//
// Killing PID %1 in process tree of PID %2 because service %3 is stopping.
//
#define WEBINOS_SERVER_EVENT_KILL_PROCESS_TREE 0x40000403L

//
// MessageId: WEBINOS_SERVER_EVENT_TERMINATEPROCESS_FAILED
//
// MessageText:
//
// Failed to terminate process with PID %1 for service %2:
// %3
//
#define WEBINOS_SERVER_EVENT_TERMINATEPROCESS_FAILED 0xC0000404L

//
// MessageId: WEBINOS_SERVER_EVENT_NO_FLAGS
//
// MessageText:
//
// Registry key %1 is unset for service %2.
// No flags will be passed to %3 when it starts.
//
#define WEBINOS_SERVER_EVENT_NO_FLAGS    0x80000405L

//
// MessageId: WEBINOS_SERVER_EVENT_NO_DIR
//
// MessageText:
//
// Registry key %1 is unset for service %2.
// Assuming startup directory %3.
//
#define WEBINOS_SERVER_EVENT_NO_DIR      0x80000406L

//
// MessageId: WEBINOS_SERVER_EVENT_NO_DIR_AND_NO_FALLBACK
//
// MessageText:
//
// Registry key %1 is unset for service %2.
// Additionally, ExpandEnvironmentStrings("%%SYSTEMROOT%%") failed when trying to choose a fallback startup directory.
//
#define WEBINOS_SERVER_EVENT_NO_DIR_AND_NO_FALLBACK 0xC0000407L

//
// MessageId: WEBINOS_SERVER_EVENT_CREATETOOLHELP32SNAPSHOT_THREAD_FAILED
//
// MessageText:
//
// Failed to create snapshot of running threads when terminating service %1:
// %2
//
#define WEBINOS_SERVER_EVENT_CREATETOOLHELP32SNAPSHOT_THREAD_FAILED 0xC0000408L

//
// MessageId: WEBINOS_SERVER_EVENT_THREAD_ENUMERATE_FAILED
//
// MessageText:
//
// Failed to enumerate running threads when terminating service %1:
// %2
//
#define WEBINOS_SERVER_EVENT_THREAD_ENUMERATE_FAILED 0xC0000409L

//
// MessageId: WEBINOS_SERVER_EVENT_THROTTLED
//
// MessageText:
//
// Service %1 ran for less than %2 milliseconds.
// Restart will be delayed by %3 milliseconds.
//
#define WEBINOS_SERVER_EVENT_THROTTLED   0x8000040AL

//
// MessageId: WEBINOS_SERVER_EVENT_RESET_THROTTLE
//
// MessageText:
//
// Request to resume service %1.  Throttling of restart attempts will be reset.
//
#define WEBINOS_SERVER_EVENT_RESET_THROTTLE 0x4000040BL

//
// MessageId: WEBINOS_SERVER_EVENT_BOGUS_THROTTLE
//
// MessageText:
//
// The registry value %2, used to specify the minimum number of milliseconds which must elapse before service %1 is considered to have started successfully, was not of type REG_DWORD.  The default time of %3 milliseconds will be used.
//
#define WEBINOS_SERVER_EVENT_BOGUS_THROTTLE 0x8000040CL

//
// MessageId: WEBINOS_SERVER_EVENT_CREATEWAITABLETIMER_FAILED
//
// MessageText:
//
// Failed to create waitable timer for service %1:
// %2
// Throttled restarts will not be interruptible.
//
#define WEBINOS_SERVER_EVENT_CREATEWAITABLETIMER_FAILED 0x8000040DL

//
// MessageId: WEBINOS_SERVER_EVENT_CREATEPROCESS_FAILED_INVALID_ENVIRONMENT
//
// MessageText:
//
// Failed to start service %1.  Program %2 couldn't be launched.
// CreateProcess() failed with ERROR_INVALID_PARAMETER and a process environment was set in the %3 registry value.  It is likely that the environment was incorrectly specified.  %3 should be a REG_MULTI_SZ value comprising strings of the form KEY=VALUE.
//
#define WEBINOS_SERVER_EVENT_CREATEPROCESS_FAILED_INVALID_ENVIRONMENT 0xC000040EL

//
// MessageId: WEBINOS_SERVER_EVENT_INVALID_ENVIRONMENT_STRING_TYPE
//
// MessageText:
//
// Environment declaration %1 for service %2 is not of type REG_MULTI_SZ and will be ignored.
//
#define WEBINOS_SERVER_EVENT_INVALID_ENVIRONMENT_STRING_TYPE 0x8000040FL

//
// MessageId: WEBINOS_SERVER_EVENT_PARAMETERS_UPDATED
//
// MessageText:
//
// PZP Parameters updated successfully.
//
#define WEBINOS_SERVER_EVENT_PARAMETERS_UPDATED 0x40000410L

