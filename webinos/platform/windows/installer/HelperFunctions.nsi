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
		
	StrCpy $0 "webinosNodeServiceUI.exe"
	DetailPrint "Searching for processes called '$0'"
	KillProc::FindProcesses
	StrCmp $1 "-1" wooops2
	Goto UIAppRunning	
	UIAppRunning:
		DetailPrint "-> Found $0 processes running"
		StrCmp $0 "0" UIAppNotRunning
		MessageBox MB_ICONQUESTION|MB_YESNO|MB_DEFBUTTON2 "webinos node service is currently running. $\n$\nDo you want to close it and continue installation?" IDYES KillUIApp
		DetailPrint "Installation aborted"
		Abort	
	KillUIApp:
		StrCpy $0 "webinosNodeServiceUI.exe"
		DetailPrint "Killing all processes called '$0'"
		KillProc::KillProcesses
		StrCmp $1 "-1" wooops2
		DetailPrint "-> Killed $0 processes, failed to kill $1 processes"
		sleep 1500
		Goto UIAppNotRunning		
	wooops2:
		DetailPrint "-> Error: unable to close all running instances of webinos node service. Please close them all manually before installing ${PRODUCT_NAME}."
		Abort	
	UIAppNotRunning:
		DetailPrint "No webinosNodeServiceUI instances found running"
		
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

!define StrRep "!insertmacro StrRep"
!macro StrRep output string old new
    Push "${string}"
    Push "${old}"
    Push "${new}"
    !ifdef __UNINSTALL__
        Call un.StrRep
    !else
        Call StrRep
    !endif
    Pop ${output}
!macroend
 
!macro Func_StrRep un
    Function ${un}StrRep
        Exch $R2 ;new
        Exch 1
        Exch $R1 ;old
        Exch 2
        Exch $R0 ;string
        Push $R3
        Push $R4
        Push $R5
        Push $R6
        Push $R7
        Push $R8
        Push $R9
 
        StrCpy $R3 0
        StrLen $R4 $R1
        StrLen $R6 $R0
        StrLen $R9 $R2
        loop:
            StrCpy $R5 $R0 $R4 $R3
            StrCmp $R5 $R1 found
            StrCmp $R3 $R6 done
            IntOp $R3 $R3 + 1 ;move offset by 1 to check the next character
            Goto loop
        found:
            StrCpy $R5 $R0 $R3
            IntOp $R8 $R3 + $R4
            StrCpy $R7 $R0 "" $R8
            StrCpy $R0 $R5$R2$R7
            StrLen $R6 $R0
            IntOp $R3 $R3 + $R9 ;move offset by length of the replacement string
            Goto loop
        done:
 
        Pop $R9
        Pop $R8
        Pop $R7
        Pop $R6
        Pop $R5
        Pop $R4
        Pop $R3
        Push $R0
        Push $R1
        Pop $R0
        Pop $R1
        Pop $R0
        Pop $R2
        Exch $R1
    FunctionEnd
!macroend
!insertmacro Func_StrRep ""
!insertmacro Func_StrRep "un."
