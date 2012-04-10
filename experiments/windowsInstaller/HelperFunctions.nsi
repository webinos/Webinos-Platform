!macro CheckAppRunning
  StrCpy $0 "node.exe"
  DetailPrint "Searching for processes called '$0'"
  KillProc::FindProcesses
  StrCmp $1 "-1" wooops
  Goto AppRunning
 
  AppRunning:
    DetailPrint "-> Found $0 processes running"
    StrCmp $0 "0" AppNotRunning
    MessageBox MB_ICONQUESTION|MB_YESNO|MB_DEFBUTTON2 "NodeJs is currently running. $\n$\nDo you want to close it and continue installation?" IDYES KillApp
    DetailPrint "Installation Aborted!"
    Abort
  KillApp:
    StrCpy $0 "node.exe"
    DetailPrint "Killing all processes called '$0'"
    KillProc::KillProcesses
    StrCmp $1 "-1" wooops
    DetailPrint "-> Killed $0 processes, failed to kill $1 processes"
    sleep 1500
    Goto AppNotRunning
  wooops:
    DetailPrint "-> Error: unable to close all running instances of NodeJs. Please close them all before changing ${PRODUCT_NAME}."
    Abort
  AppNotRunning:
    DetailPrint "No Application Instances Found"
!macroend

;------------------------------------------
;Set reboot flag based on tapinstall return

Function CheckReboot
  IntCmp $R0 1 "" noreboot noreboot
  IntOp $R0 0 & 0
  SetRebootFlag true
  DetailPrint "REBOOT flag set"
 noreboot:
FunctionEnd